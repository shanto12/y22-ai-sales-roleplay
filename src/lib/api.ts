import type { CustomConfig, HealthResponse, ScoreMap, TranscriptLine } from '../types.ts'

export interface MintTokenResponse {
  value: string | null
  expires_at?: number
  model?: string
  mode: 'live' | 'synthetic'
}

export interface PersonaResponse {
  system_prompt: string
  name: string
  title: string
  company: string
  pains: string[]
  objection_line: string
}

export async function fetchHealth(): Promise<HealthResponse> {
  const r = await fetch('/api/health', { headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error(`health ${r.status}`)
  return r.json()
}

export async function mintToken(systemPrompt: string, ttl = 600): Promise<MintTokenResponse> {
  const r = await fetch('/api/mint-token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ persona_system_prompt: systemPrompt, ttl }),
  })
  if (!r.ok) throw new Error(`mint-token ${r.status}`)
  return r.json()
}

/**
 * Stream the persona generation. Returns the parsed result event.
 * Uses the factory SSE pattern.
 */
export async function streamPersona(custom: CustomConfig, onDelta?: (text: string) => void): Promise<PersonaResponse> {
  const r = await fetch('/api/persona', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(custom),
  })
  if (!r.ok || !r.body) throw new Error(`persona ${r.status}`)
  return parseSSE<PersonaResponse>(r.body, onDelta)
}

export interface ScoreEvent {
  type: 'tile' | 'result' | 'error'
  data: unknown
}

/**
 * Stream the scoring call. The caller handles per-tile deltas and the final result.
 */
export async function streamScore(
  transcript: TranscriptLine[],
  persona: { name: string; title: string; difficulty: string },
  final: boolean,
  on: { tile?: (id: string, score: ScoreMap[keyof ScoreMap]) => void; result?: (m: ScoreMap) => void; error?: (e: string) => void },
): Promise<void> {
  const r = await fetch('/api/score', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ transcript, persona, final }),
  })
  if (!r.ok || !r.body) throw new Error(`score ${r.status}`)
  await parseSSEEvents(r.body, (event, data) => {
    if (event === 'tile' && on.tile) {
      const d = data as { id: string; score: ScoreMap[keyof ScoreMap] }
      on.tile(d.id, d.score)
    } else if (event === 'result' && on.result) {
      on.result(data as ScoreMap)
    } else if (event === 'error' && on.error) {
      const d = data as { message?: string }
      on.error(d?.message ?? 'unknown')
    }
  })
}

async function parseSSE<T>(stream: ReadableStream<Uint8Array>, onDelta?: (t: string) => void): Promise<T> {
  let result: T | null = null
  await parseSSEEvents(stream, (event, data) => {
    if (event === 'delta' && onDelta) onDelta((data as { text?: string }).text ?? '')
    if (event === 'result') result = data as T
  })
  if (!result) throw new Error('no result event')
  return result
}

async function parseSSEEvents(stream: ReadableStream<Uint8Array>, on: (event: string, data: unknown) => void): Promise<void> {
  const reader = stream.getReader()
  const dec = new TextDecoder()
  let buf = ''
  // Read until done
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let nl = buf.indexOf('\n\n')
    while (nl !== -1) {
      const frame = buf.slice(0, nl)
      buf = buf.slice(nl + 2)
      const lines = frame.split('\n')
      let event = 'message'
      let dataStr = ''
      for (const ln of lines) {
        if (ln.startsWith('event:')) event = ln.slice(6).trim()
        else if (ln.startsWith('data:')) dataStr += ln.slice(5).trim()
      }
      if (dataStr) {
        try { on(event, JSON.parse(dataStr)) } catch { /* ignore parse errors */ }
      }
      nl = buf.indexOf('\n\n')
    }
  }
}

/**
 * Send a final transcript on tab-close using sendBeacon (no-await).
 */
export function beaconFinalTranscript(payload: { transcript: TranscriptLine[]; persona: unknown }): boolean {
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return false
  const body = new Blob([JSON.stringify({ ...payload, final: true })], { type: 'application/json' })
  return navigator.sendBeacon('/api/score', body)
}
