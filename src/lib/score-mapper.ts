import type { ScoreBand } from '../types.ts'

/**
 * Map a 0–5 score to a green/amber/coral band.
 *  4–5 → green
 *  3   → amber
 *  0–2 → coral
 */
export function bandFor(score: number): ScoreBand {
  if (score >= 4) return 'green'
  if (score >= 3) return 'amber'
  return 'coral'
}
