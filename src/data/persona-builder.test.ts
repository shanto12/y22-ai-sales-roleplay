import { describe, expect, it } from 'vitest'
import { buildPersona, buildPersonaSystemPrompt } from './persona-builder.ts'
import { INDUSTRIES, TITLES, OBJECTIONS } from './behaviors.ts'
import type { CustomConfig, DifficultyId } from '../types.ts'

describe('buildPersona', () => {
  it('returns a complete persona for every (industry × title × objection) combination', () => {
    for (const i of INDUSTRIES) {
      for (const t of TITLES) {
        for (const o of OBJECTIONS) {
          const p = buildPersona({ industry: i.id, title: t.id, difficulty: 'medium', objection: o.id } as CustomConfig)
          expect(p.name).toMatch(/\w+/)
          expect(p.title).toContain(t.label)
          expect(p.title).toContain('·')
          expect(p.pains).toHaveLength(3)
          for (const pain of p.pains) expect(typeof pain).toBe('string')
          expect(p.objection.length).toBeGreaterThan(8)
        }
      }
    }
  })

  it('matches Sarah Chen for cfo×fintech×price', () => {
    const p = buildPersona({ industry: 'fintech', title: 'cfo', difficulty: 'hard', objection: 'price' })
    expect(p.name).toBe('Sarah Chen')
    expect(p.title).toBe('CFO · Northwind FinTech')
  })
})

describe('buildPersonaSystemPrompt', () => {
  for (const d of ['easy', 'medium', 'hard'] as DifficultyId[]) {
    it(`encodes difficulty (${d}) into the OBJECTION POLICY block`, () => {
      const text = buildPersonaSystemPrompt({ industry: 'fintech', title: 'cfo', difficulty: d, objection: 'price' })
      expect(text).toContain('## OBJECTION POLICY')
      expect(text).toContain('## CLOSING')
      if (d === 'easy') expect(text).toMatch(/concede after one/i)
      if (d === 'hard') expect(text).toMatch(/push back at least twice/i)
    })
  }

  it('keeps the prompt under 2000 chars', () => {
    const text = buildPersonaSystemPrompt({ industry: 'saas', title: 'it', difficulty: 'hard', objection: 'feature' })
    expect(text.length).toBeLessThan(2000)
  })
})
