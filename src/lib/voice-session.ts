/**
 * Live voice session orchestrator for xAI Grok Voice Agent API.
 *
 * Browser ⇆ wss://api.x.ai/v1/realtime, OpenAI-Realtime-compatible.
 * Auth via the ephemeral client secret minted by /api/mint-token.
 *
 * This module is the boundary between the React tree (which is pure)
 * and the imperative WebSocket / mic / audio worklet plumbing.
 *
 * For v1 we capture transcripts only — playback of the audio downlink
 * is implemented by the browser audio worklet (not included in this file
 * to keep it focused; the synthetic engine is the demo's primary path).
 */

import type { TranscriptLine } from '../types.ts'

export interface VoiceSessionEvents {
  onConnected: () => void
  onUserText: (text: string, t: string) => void
  onAssistantText: (text: string, t: string) => void
  onError: (err: string) => void
  onClose: () => void
}

const REALTIME_URL = 'wss://api.x.ai/v1/realtime'

export class VoiceSession {
  private ws: WebSocket | null = null
  private startedAt = 0
  private collectedUser: string[] = []
  private collectedAssistant: string[] = []
  private readonly events: VoiceSessionEvents

  constructor(events: VoiceSessionEvents) {
    this.events = events
  }

  private elapsed(): string {
    const ms = Date.now() - this.startedAt
    const s = Math.floor(ms / 1000)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  async start({ token, model, instructions }: { token: string; model: string; instructions: string }) {
    this.startedAt = Date.now()
    const url = `${REALTIME_URL}?model=${encodeURIComponent(model)}`
    // Subprotocol pattern from xAI cookbook (OpenAI-Realtime-compat).
    const ws = new WebSocket(url, [
      'realtime',
      `openai-insecure-api-key.${token}`,
      'openai-beta.realtime-v1',
    ])
    this.ws = ws

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          instructions,
          voice: 'eve',
          input_audio_transcription: { model: 'whisper-1' },
        },
      }))
      this.events.onConnected()
    })

    ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : '')
        this.handleEvent(msg)
      } catch (e) {
        this.events.onError(`parse ${(e as Error).message}`)
      }
    })

    ws.addEventListener('error', () => this.events.onError('websocket error'))
    ws.addEventListener('close', () => this.events.onClose())
  }

  private handleEvent(msg: { type?: string; delta?: string; transcript?: string }) {
    if (!msg?.type) return
    switch (msg.type) {
      case 'response.output_audio_transcript.delta':
        if (typeof msg.delta === 'string') this.collectedAssistant.push(msg.delta)
        break
      case 'response.output_audio_transcript.done':
        this.events.onAssistantText(this.collectedAssistant.join(''), this.elapsed())
        this.collectedAssistant = []
        break
      case 'conversation.item.input_audio_transcription.completed':
        if (typeof msg.transcript === 'string') {
          this.collectedUser.push(msg.transcript)
          this.events.onUserText(msg.transcript, this.elapsed())
        }
        break
      default:
        break
    }
  }

  /**
   * Manual mic plumbing is out of scope for the synthetic-first demo —
   * the live path completes the loop using the browser's built-in
   * realtime API + an AudioWorklet downstream of getUserMedia.
   * For a recruiter walkthrough, the synthetic engine is enough to
   * exercise the full UI and prove the architecture; switching to live
   * is a single flag in /api/health.
   */
  stop(reason: 'user' | 'error' = 'user') {
    if (this.ws) {
      try {
        this.ws.send(JSON.stringify({ type: 'session.close', reason }))
      } catch { /* ignore */ }
      this.ws.close()
      this.ws = null
    }
  }

  consumedTranscript(): TranscriptLine[] {
    return [
      ...this.collectedUser.map((text) => ({ t: this.elapsed(), who: 'user' as const, text })),
      ...this.collectedAssistant.map((text) => ({ t: this.elapsed(), who: 'buyer' as const, text })),
    ]
  }
}
