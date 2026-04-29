// POST /api/mint-token — exchange the long-lived XAI_API_KEY for a short-lived
// realtime client_secret. Returned token is sent to the browser, which uses
// it as the WebSocket subprotocol to wss://api.x.ai/v1/realtime.
//
// Body: { persona_system_prompt: string, ttl?: number }
// Response: { value, expires_at, model, mode }
//
// Self-contained per AGENTS.md (no shared imports).

const DEFAULT_TTL_SECONDS = 600
const MIN_TTL = 60
const MAX_TTL = 3600

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: jsonHeaders() })
  }

  const apiKey = process.env.XAI_API_KEY
  const baseUrl = process.env.XAI_API_BASE_URL || 'https://api.x.ai/v1'
  const model = process.env.GROK_VOICE_MODEL || 'grok-voice-think-fast-1.0'

  if (!apiKey) {
    // Synthetic mode — frontend reads `mode: synthetic` and skips WS connect.
    return new Response(
      JSON.stringify({ value: null, expires_at: 0, model, mode: 'synthetic' }),
      { status: 200, headers: jsonHeaders() },
    )
  }

  let body = {}
  try { body = await req.json() } catch { /* fall through to validation */ }

  const personaSystemPrompt = typeof body.persona_system_prompt === 'string' && body.persona_system_prompt.length < 8000
    ? body.persona_system_prompt
    : ''
  const ttl = clampInt(body.ttl, MIN_TTL, MAX_TTL, DEFAULT_TTL_SECONDS)

  const upstream = await fetch(`${baseUrl}/realtime/client_secrets`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      session: {
        type: 'realtime',
        model,
        voice: 'eve',
        ...(personaSystemPrompt ? { instructions: personaSystemPrompt } : {}),
      },
      expires_after: { seconds: ttl },
    }),
  })

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '')
    return new Response(
      JSON.stringify({ error: 'upstream_failed', status: upstream.status, detail: text.slice(0, 400) }),
      { status: 502, headers: jsonHeaders() },
    )
  }

  const data = await upstream.json()
  return new Response(
    JSON.stringify({ value: data.value ?? null, expires_at: data.expires_at ?? 0, model, mode: 'live' }),
    { status: 200, headers: jsonHeaders() },
  )
}

function clampInt(v, lo, hi, fallback) {
  const n = Number.isInteger(v) ? v : fallback
  return Math.max(lo, Math.min(hi, n))
}

function jsonHeaders() {
  return { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
}

export const config = { path: '/api/mint-token' }
