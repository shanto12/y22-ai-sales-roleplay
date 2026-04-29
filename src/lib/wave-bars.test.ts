import { describe, expect, it } from 'vitest'
import { makeWaveBars } from './wave-bars.ts'

describe('makeWaveBars', () => {
  it('returns the requested count', () => {
    expect(makeWaveBars(56).length).toBe(56)
    expect(makeWaveBars(8).length).toBe(8)
  })

  it('keeps every value within the documented [0.18, 1.0) range', () => {
    const bars = makeWaveBars(200, 42)
    for (const b of bars) {
      expect(b).toBeGreaterThanOrEqual(0.18)
      expect(b).toBeLessThan(1)
    }
  })

  it('is deterministic on the same seed', () => {
    expect(makeWaveBars(20, 7)).toEqual(makeWaveBars(20, 7))
  })

  it('changes output with different seeds', () => {
    expect(makeWaveBars(20, 7)).not.toEqual(makeWaveBars(20, 8))
  })
})
