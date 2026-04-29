import { useEffect, useState } from 'react'
import { fetchHealth } from '../lib/api.ts'
import type { HealthResponse } from '../types.ts'

const FALLBACK: HealthResponse = {
  mode: 'synthetic',
  provider: 'xai',
  model: 'grok-voice-think-fast-1.0',
  scoringModel: 'grok-3',
  capabilities: {
    voice:   { live: false, p50_ms: 0 },
    scoring: { live: false, p50_ms: 0 },
    persona: { live: false, cold_p50_ms: 0 },
  },
  syntheticReady: true,
  version: 'unknown',
}

export function useHealth(): HealthResponse {
  const [h, setH] = useState<HealthResponse>(FALLBACK)

  useEffect(() => {
    let cancel = false
    fetchHealth()
      .then((r) => { if (!cancel) setH(r) })
      .catch(() => { /* keep fallback */ })
    return () => { cancel = true }
  }, [])

  return h
}
