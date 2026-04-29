/**
 * Deterministic pseudo-random for waveform bar heights.
 * The same seed always produces the same bars — important for testing.
 */
export function makeWaveBars(count: number, seed = 1): number[] {
  const out: number[] = []
  let s = seed
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280
    out.push(0.18 + (s / 233280) * 0.82)
  }
  return out
}
