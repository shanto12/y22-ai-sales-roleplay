// GET /api/health — system status for the Demo Guide and synthetic-mode chip.
//
// Self-contained per AGENTS.md (no shared imports).

export default async () => {
  const hasKey = !!Netlify.env.get('XAI_API_KEY')
  const model = Netlify.env.get('GROK_VOICE_MODEL') || 'grok-voice-think-fast-1.0'
  const scoringModel = Netlify.env.get('SCORING_MODEL') || 'grok-4.20-0309-non-reasoning'
  const version = Netlify.env.get('COMMIT_REF') || Netlify.env.get('NETLIFY_COMMIT') || 'dev'

  const body = {
    mode: hasKey ? 'live' : 'synthetic',
    provider: 'xai',
    model,
    scoringModel,
    capabilities: {
      voice:   { live: hasKey, p50_ms: 0 },
      scoring: { live: hasKey, p50_ms: 0 },
      persona: { live: hasKey, cold_p50_ms: 0 },
    },
    syntheticReady: true,
    statusBasis: 'configuration only; no provider request or latency measurement',
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
