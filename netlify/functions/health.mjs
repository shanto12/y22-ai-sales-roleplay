// GET /api/health — system status for the Demo Guide and synthetic-mode chip.
//
// Self-contained per AGENTS.md (no shared imports).

export default async () => {
  const hasKey = !!process.env.XAI_API_KEY
  const model = process.env.GROK_VOICE_MODEL || 'grok-voice-think-fast-1.0'
  const scoringModel = process.env.SCORING_MODEL || 'grok-3'
  const version = process.env.COMMIT_REF || process.env.NETLIFY_COMMIT || 'dev'

  const body = {
    mode: hasKey ? 'live' : 'synthetic',
    provider: 'xai',
    model,
    scoringModel,
    capabilities: {
      voice:   { live: hasKey, p50_ms: hasKey ? 320 : 0 },
      scoring: { live: hasKey, p50_ms: hasKey ? 480 : 0 },
      persona: { live: hasKey, cold_p50_ms: hasKey ? 1400 : 0 },
    },
    syntheticReady: true,
    version,
  }

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export const config = { path: '/api/health' }
