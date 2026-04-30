/**
 * Live voice session for xAI Grok Voice Agent API.
 *
 * Connects the browser to wss://api.x.ai/v1/realtime, captures mic audio
 * via an AudioWorklet, encodes to PCM16, and plays back the assistant audio
 * stream returned over the same WebSocket.
 *
 * Auth: ephemeral client-secret minted server-side by /api/mint-token. The
 * long-lived XAI_API_KEY never enters the browser.
 *
 * Compatibility: xAI's realtime API speaks the OpenAI Realtime spec with a
 * few caveats (renamed events, no `conversation.item.retrieve`, etc). The
 * cookbook subprotocol `["realtime", "openai-insecure-api-key.${TOKEN}",
 * "openai-beta.realtime-v1"]` is what xAI's official web sample uses.
 */

import type { TranscriptLine } from '../types.ts'

export interface VoiceSessionEvents {
  onConnecting: () => void
  onConnected: () => void
  onUserText: (text: string, t: string) => void
  onAssistantText: (text: string, t: string) => void
  onUserSpeaking: (active: boolean) => void
  onAssistantSpeaking: (active: boolean) => void
  onError: (err: string) => void
  onClose: () => void
}

const REALTIME_URL = 'wss://api.x.ai/v1/realtime'
const SAMPLE_RATE = 24000
// Worklet served as a static file so we don't need `blob:` in CSP script-src.
const WORKLET_URL = '/audio-worklet.js'

function floatToPCM16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

function int16ToBase64(buf: Int16Array): string {
  const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  let s = ''
  // Chunk to avoid call-stack limits for big payloads.
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)))
  }
  return btoa(s)
}

function base64ToInt16(b64: string): Int16Array {
  const bin = atob(b64)
  const len = bin.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i)
  return new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2)
}

function pcm16ToFloat32(int16: Int16Array): Float32Array {
  const out = new Float32Array(int16.length)
  for (let i = 0; i < int16.length; i++) out[i] = int16[i] / 0x8000
  return out
}

interface SessionOpts {
  token: string
  model: string
  instructions: string
  voice: string // e.g. 'eve'
}

export class VoiceSession {
  private ws: WebSocket | null = null
  private startedAt = 0
  private events: VoiceSessionEvents

  // Audio capture
  private inputCtx: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private workletNode: AudioWorkletNode | null = null

  // Audio playback
  private outputCtx: AudioContext | null = null
  private nextPlaybackTime = 0
  private assistantSpeakingFlag = false
  private assistantSpeakTimer: ReturnType<typeof setTimeout> | null = null

  // Transcript collation
  private currentAssistantTurn = ''

  constructor(events: VoiceSessionEvents) {
    this.events = events
  }

  private elapsed(): string {
    const s = Math.floor((Date.now() - this.startedAt) / 1000)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  /**
   * Mint the WebSocket, set up mic capture and audio playback. Resolves once
   * the WebSocket is open and `session.update` has been sent.
   */
  async start(opts: SessionOpts): Promise<void> {
    this.events.onConnecting()
    this.startedAt = Date.now()

    // 1. Mic permission + AudioContext (must happen on user gesture).
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: SAMPLE_RATE,
        },
      })
    } catch (err) {
      this.events.onError(`Microphone access denied or unavailable. ${(err as Error).message}`)
      throw err
    }

    // Some browsers ignore the sampleRate constraint; create the AudioContext
    // at SAMPLE_RATE so resampling is automatic on read.
    this.inputCtx = new AudioContext({ sampleRate: SAMPLE_RATE })
    await this.inputCtx.audioWorklet.addModule(WORKLET_URL)
    const src = this.inputCtx.createMediaStreamSource(this.mediaStream)
    this.workletNode = new AudioWorkletNode(this.inputCtx, 'pcm16-capture', { numberOfOutputs: 0 })

    this.outputCtx = new AudioContext({ sampleRate: SAMPLE_RATE })
    this.nextPlaybackTime = this.outputCtx.currentTime

    // 2. Open WebSocket with the OpenAI-Realtime-compatible subprotocol.
    const url = `${REALTIME_URL}?model=${encodeURIComponent(opts.model)}`
    const ws = new WebSocket(url, [
      'realtime',
      `openai-insecure-api-key.${opts.token}`,
      'openai-beta.realtime-v1',
    ])
    ws.binaryType = 'arraybuffer'
    this.ws = ws

    await new Promise<void>((resolve, reject) => {
      const onOpen = () => {
        ws.removeEventListener('error', onError)
        resolve()
      }
      const onError = () => {
        ws.removeEventListener('open', onOpen)
        reject(new Error('WebSocket connection failed'))
      }
      ws.addEventListener('open', onOpen, { once: true })
      ws.addEventListener('error', onError, { once: true })
    })

    // 3. Send session.update with persona + audio config.
    //    The persona prompt is wrapped in a stage-direction header so the
    //    model knows it's already on a sales call (not a wrong-number call).
    const stagedInstructions = [
      'STAGE: A sales rep has just dialed your direct line for a 5-minute discovery call you agreed to take.',
      'OPENING: Speak FIRST. Greet the rep briefly and slightly impatiently. One sentence. Then wait.',
      'ROLE: Stay in character at all times. Never break character or admit you are an AI.',
      '',
      opts.instructions,
    ].join('\n')

    ws.send(JSON.stringify({
      type: 'session.update',
      session: {
        modalities: ['audio', 'text'],
        instructions: stagedInstructions,
        voice: opts.voice,
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 200,
          silence_duration_ms: 600,
        },
      },
    }))

    // 3b. Trigger the AI buyer to speak first so the rep hears the opening.
    ws.send(JSON.stringify({
      type: 'response.create',
      response: {
        modalities: ['audio', 'text'],
        instructions: 'Speak your one-sentence impatient greeting now, then stop.',
      },
    }))

    // 4. Wire mic worklet → WebSocket.
    this.workletNode.port.onmessage = (ev: MessageEvent<Float32Array>) => {
      if (ws.readyState !== WebSocket.OPEN) return
      const float = ev.data
      const pcm = floatToPCM16(float)
      const b64 = int16ToBase64(pcm)
      ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: b64 }))
    }
    src.connect(this.workletNode)

    // 5. Wire incoming events.
    ws.addEventListener('message', (ev) => this.handleEvent(ev.data))
    ws.addEventListener('error', () => this.events.onError('WebSocket error during session'))
    ws.addEventListener('close', () => this.events.onClose())

    this.events.onConnected()
  }

  private handleEvent(raw: unknown) {
    if (typeof raw !== 'string') return
    let msg: { type?: string; delta?: string; transcript?: string; audio?: string; item?: { transcript?: string }; error?: { message?: string } }
    try { msg = JSON.parse(raw) } catch { return }
    if (!msg?.type) return

    switch (msg.type) {
      case 'response.output_audio.delta':
      case 'response.audio.delta': {
        if (typeof msg.delta === 'string') this.queueAudio(msg.delta)
        this.markAssistantSpeaking()
        break
      }
      case 'response.output_audio_transcript.delta':
      case 'response.audio_transcript.delta':
      case 'response.text.delta': {
        if (typeof msg.delta === 'string') this.currentAssistantTurn += msg.delta
        break
      }
      case 'response.output_audio_transcript.done':
      case 'response.audio_transcript.done':
      case 'response.text.done':
      case 'response.done': {
        if (this.currentAssistantTurn) {
          this.events.onAssistantText(this.currentAssistantTurn.trim(), this.elapsed())
          this.currentAssistantTurn = ''
        }
        break
      }
      case 'conversation.item.input_audio_transcription.completed': {
        const text = (msg.transcript ?? msg.item?.transcript ?? '').trim()
        if (text) this.events.onUserText(text, this.elapsed())
        break
      }
      case 'input_audio_buffer.speech_started': {
        this.events.onUserSpeaking(true)
        break
      }
      case 'input_audio_buffer.speech_stopped': {
        this.events.onUserSpeaking(false)
        break
      }
      case 'error': {
        this.events.onError(msg.error?.message ?? 'unknown realtime error')
        break
      }
      default:
        break
    }
  }

  private markAssistantSpeaking() {
    if (!this.assistantSpeakingFlag) {
      this.assistantSpeakingFlag = true
      this.events.onAssistantSpeaking(true)
    }
    if (this.assistantSpeakTimer) clearTimeout(this.assistantSpeakTimer)
    this.assistantSpeakTimer = setTimeout(() => {
      this.assistantSpeakingFlag = false
      this.events.onAssistantSpeaking(false)
    }, 350)
  }

  private queueAudio(b64: string) {
    if (!this.outputCtx) return
    const int16 = base64ToInt16(b64)
    if (int16.length === 0) return
    const float = pcm16ToFloat32(int16)
    const buf = this.outputCtx.createBuffer(1, float.length, SAMPLE_RATE)
    // Copy via the channel-data view to avoid TS's ArrayBufferLike vs ArrayBuffer mismatch.
    buf.getChannelData(0).set(float)
    const src = this.outputCtx.createBufferSource()
    src.buffer = buf
    src.connect(this.outputCtx.destination)
    const startAt = Math.max(this.outputCtx.currentTime + 0.02, this.nextPlaybackTime)
    src.start(startAt)
    this.nextPlaybackTime = startAt + buf.duration
  }

  consumedTranscript(): TranscriptLine[] {
    // The session events emit each turn directly; the upstream caller keeps
    // the full transcript in its reducer. Returning [] preserves backwards
    // compat with previous callers that want to flush on close.
    return []
  }

  stop() {
    if (this.assistantSpeakTimer) {
      clearTimeout(this.assistantSpeakTimer)
      this.assistantSpeakTimer = null
    }
    if (this.ws) {
      try { this.ws.close() } catch { /* ignore */ }
      this.ws = null
    }
    if (this.workletNode) {
      try { this.workletNode.disconnect() } catch { /* ignore */ }
      this.workletNode = null
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop())
      this.mediaStream = null
    }
    if (this.inputCtx) {
      this.inputCtx.close().catch(() => {})
      this.inputCtx = null
    }
    if (this.outputCtx) {
      this.outputCtx.close().catch(() => {})
      this.outputCtx = null
    }
  }
}
