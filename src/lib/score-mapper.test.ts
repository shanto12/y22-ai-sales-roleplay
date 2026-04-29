import { describe, expect, it } from 'vitest'
import { bandFor } from './score-mapper.ts'

describe('bandFor', () => {
  it.each([
    [0, 'coral'],
    [1, 'coral'],
    [2, 'coral'],
    [3, 'amber'],
    [4, 'green'],
    [5, 'green'],
  ])('score %i → %s', (score, band) => {
    expect(bandFor(score)).toBe(band)
  })
})
