import { INDUSTRIES, TITLES, OBJECTIONS } from './behaviors.ts'
import type { BuiltPersona, CustomConfig, IndustryId, TitleId, ObjectionId } from '../types.ts'

const NAMES: Record<TitleId, { name: string; mono: string }> = {
  vpsales:     { name: 'Maya Rodriguez', mono: 'MR' },
  cfo:         { name: 'Sarah Chen',     mono: 'SC' },
  procurement: { name: 'Daniel Tran',    mono: 'DT' },
  it:          { name: 'Priya Iyer',     mono: 'PI' },
}

const COMPANIES: Record<IndustryId, string> = {
  saas:       'Vector Labs',
  fintech:    'Northwind FinTech',
  healthcare: 'Helix Health',
  realestate: 'Lattice Realty Group',
}

type PainKey = `${TitleId}-${ObjectionId}`

const PAINS: Record<PainKey, string[]> = {
  'cfo-price':         ['CAC payback creeping past 18 months', 'Board wants 30% efficiency this year', 'Already cut 2 vendors this quarter'],
  'cfo-competitor':    ['Locked into a 3-year vendor contract', 'Switching costs blocked last review', 'CFO peers say competitor is plateauing'],
  'cfo-timing':        ['Q3 board review pulled forward', 'Hiring freeze in effect', 'Budget reset doesn’t close until Sept'],
  'cfo-feature':       ['Reporting layer can’t roll up to board', 'No SOC 2 = no signature', 'Forecast accuracy below 65%'],
  'vpsales-price':     ['Quota raised 22% YoY', 'Tools budget under attack', 'Churn on the rep desk'],
  'vpsales-competitor':['Already using Gong + Salesloft', 'Two pilots failed last year', 'Reps refuse another login'],
  'vpsales-timing':    ['New AE class lands in 6 weeks', 'Mid-quarter, no QBR slot', 'Revops team understaffed'],
  'vpsales-feature':   ['Forecast call still done in spreadsheets', 'Conversation intel doesn’t map to stages', 'No multi-thread tracking'],
  'procurement-price':     ['Three competing bids required', 'Q4 spend freeze', 'Legal flagged auto-renew clause'],
  'procurement-competitor':['Incumbent has master MSA already', 'Switching cost > $40k', 'No exec sponsor for change'],
  'procurement-timing':    ['New vendor process takes 9 weeks', 'Security review backlogged', 'SOC 2 Type II missing'],
  'procurement-feature':   ['No SSO = no review', 'Data residency in EU required', 'Per-seat pricing model is a non-starter'],
  'it-price':       ['Capex frozen, opex only', 'Per-seat licensing math doesn’t scale', 'Existing seat licenses underutilized'],
  'it-competitor':  ['Single-vendor mandate from CIO', 'Heavy investment in incumbent stack', 'Past failed migrations'],
  'it-timing':      ['Mid-replatform on identity', 'Roadmap locked through Q2', 'No bandwidth for pilot'],
  'it-feature':     ['SCIM provisioning required', 'Audit log retention < 1 yr is a no', 'API rate limit too low'],
}

const OBJ_LINES: Record<PainKey, string> = {
  'cfo-price':         'Show me the 90-day payback or I’m not signing.',
  'cfo-competitor':    'We already evaluated this category two years ago.',
  'cfo-timing':        'Come back when the Q3 review closes.',
  'cfo-feature':       'Without board-grade reporting this is a no.',
  'vpsales-price':     'My reps don’t need another tool with a per-seat price tag.',
  'vpsales-competitor':'We tried Gong. Reps stopped opening it after week 3.',
  'vpsales-timing':    'Ask me again after the new class ramps.',
  'vpsales-feature':   'I need it to write the forecast call, not just record it.',
  'procurement-price':     'Bring me a redlined MSA and a 20% discount.',
  'procurement-competitor':'Our master MSA blocks adding new tier-2 vendors.',
  'procurement-timing':    'Vendor process is nine weeks. We’re not starting today.',
  'procurement-feature':   'No SOC 2 Type II, no signature.',
  'it-price':       'Capex is frozen — sell me on opex math.',
  'it-competitor':  'CIO has mandated single-vendor for this stack.',
  'it-timing':      'We’re mid-replatform on identity. Not now.',
  'it-feature':     'Without SCIM and SSO this is dead on arrival.',
}

export function buildPersona(custom: CustomConfig): BuiltPersona {
  const ind = INDUSTRIES.find(i => i.id === custom.industry)!
  const ttl = TITLES.find(t => t.id === custom.title)!
  const obj = OBJECTIONS.find(o => o.id === custom.objection)!
  const np = NAMES[custom.title]
  const key = `${custom.title}-${custom.objection}` as PainKey
  return {
    monogram: np.mono,
    name: np.name,
    title: `${ttl.label} · ${COMPANIES[custom.industry]}`,
    pains: PAINS[key] ?? PAINS['cfo-price'],
    objection: OBJ_LINES[key] ?? OBJ_LINES['cfo-price'],
    industryLabel: ind.label,
    objectionLabel: obj.label,
  }
}

/**
 * Build the long-form system prompt the live voice agent should use.
 * The synthetic fallback uses this directly; the live path lets the
 * server (`/api/persona`) re-author it via Grok for richer behavior.
 */
export function buildPersonaSystemPrompt(custom: CustomConfig): string {
  const built = buildPersona(custom)
  const diffNote = {
    easy:   'You concede after one well-formed objection.',
    medium: 'You hold the line through one push-back. Concede only when the rep cites a specific number or dependency.',
    hard:   'You push back at least twice. Concede only when the rep gives a specific quantified commitment with named exec attendees.',
  }[custom.difficulty]
  return [
    `# PERSONA: ${built.name}`,
    `You are ${built.name}, ${built.title}.`,
    '',
    '## VOICE',
    '- Brief sentences. No hedging. Dry, direct.',
    '- Use the rep’s name once mid-call.',
    '',
    '## TOP PAINS (your real concerns)',
    ...built.pains.map(p => `- ${p}`),
    '',
    '## OBJECTION POLICY',
    `- Lead with: "${built.objection}"`,
    `- ${diffNote}`,
    '',
    '## CLOSING',
    '- Refuse the first ask for a follow-up. Concede only with a named exec attendee + agenda.',
  ].join('\n')
}
