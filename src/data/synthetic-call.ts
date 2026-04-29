import type { ScoreMap, TranscriptLine, WhisperPrompt } from '../types.ts'

// Mid-call snapshot: 2 green, 2 amber, 2 coral, with one tile pulsing as recently-updated.
export const MID_SCORES: ScoreMap = {
  discovery: { score: 4, band: 'green', rationale: 'Asked about budget cycle changes early.', updated: false },
  objection: { score: 3, band: 'amber', rationale: 'Acknowledged her ROI doubt; didn’t restate it.', updated: true },
  value:     { score: 4, band: 'green', rationale: 'Tied feature to her CAC payback target.', updated: false },
  multi:     { score: 2, band: 'coral', rationale: 'No mention of CRO or ops yet.', updated: false },
  next:      { score: 3, band: 'amber', rationale: 'Proposed a follow-up; no specific calendar hold.', updated: false },
  tlr:       { score: 1, band: 'coral', rationale: 'You at 71% talk — buyer hasn’t had room.', updated: false },
}

// Final scorecard at end-of-call.
export const FINAL_SCORES: ScoreMap = {
  discovery: { score: 4, band: 'green', rationale: 'Strong open: asked what changed in budget cycle and who else owns the number. Surfaced 2 of 3 stated pains.', delta: '+0.4' },
  objection: { score: 4, band: 'green', rationale: 'On the ROI pushback you reframed (90-day payback) before discounting. Did not flinch on price.', delta: '+0.7' },
  value:     { score: 4, band: 'green', rationale: 'Mapped the workflow back to her stated 30% efficiency target. Used her words.', delta: '+0.3' },
  multi:     { score: 3, band: 'amber', rationale: 'Got CRO name late. Never asked for an intro to ops or finance.', delta: '–0.6' },
  next:      { score: 4, band: 'green', rationale: 'Closed with a Wed 2pm hold + agenda + pre-read. Specific.', delta: '+0.5' },
  tlr:       { score: 3, band: 'amber', rationale: 'Final ratio 58/42. Improved after minute 2 once you started asking.', delta: '–0.2' },
}

export const TRANSCRIPT: TranscriptLine[] = [
  { t: '00:08', who: 'user',  text: 'Sarah, thanks for grabbing 5 minutes. Before I show you anything — what changed in your budget cycle this quarter that made you take this call?' },
  { t: '00:18', who: 'buyer', text: 'Honestly? Board pulled forward the efficiency review. We have to show 30% by Q3 or we’re cutting headcount before tools.' },
  { t: '00:31', who: 'user',  text: 'Got it — 30% by Q3. And when you say efficiency, are you measuring rep ramp, deal velocity, or CAC payback? They lead to very different conversations.' },
  { t: '00:44', who: 'buyer', text: 'CAC payback. Ours is at 22 months and it needs to be under 14. That’s the number I have to defend to the board.' },
  { t: '00:58', who: 'user',  text: 'Okay. The reps I work with usually shave 4 to 6 months off CAC payback in the first 90 days because new AEs stop wasting calls on objections they’ve never seen before. Want me to show you the before-and-after from a comp like Northwind?' },
  { t: '01:12', who: 'buyer', text: 'Look, we already have a vendor for this. We tried Gong. Reps stopped opening it.' },
  { t: '01:24', who: 'user',  text: 'That’s fair. The reason it shelf-warmed — was it the workflow, the cost, or that the coaching wasn’t actually changing what reps did on the next call?' },
]

export const WHISPER_HISTORY = [
  '00:32 — Used: clarified what “efficiency” meant.',
  '00:55 — Dismissed: “mention case study”.',
]

export const WHISPER_NOW: WhisperPrompt = {
  text: 'Try: ask what changed in their budget cycle.',
  reason: 'Buyer just said “already have a vendor” — redirect to discovery.',
}

/**
 * The score timeline that the synthetic engine plays through during a fake live call.
 * Each entry says "at this elapsed time, behavior X moves to score Y with rationale Z".
 */
export const SCORE_TIMELINE = [
  { atMs: 800,  id: 'discovery', score: 2, band: 'amber' as const, rationale: 'First question landed; not yet specific.', updated: true },
  { atMs: 2400, id: 'tlr',       score: 1, band: 'coral' as const, rationale: 'You at 71% talk — buyer hasn’t had room.', updated: true },
  { atMs: 4200, id: 'discovery', score: 4, band: 'green' as const, rationale: 'Asked about budget cycle changes early.', updated: true },
  { atMs: 6000, id: 'value',     score: 3, band: 'amber' as const, rationale: 'Tied to CAC, but missed the board-pressure context.', updated: true },
  { atMs: 8200, id: 'objection', score: 3, band: 'amber' as const, rationale: 'Acknowledged her ROI doubt; didn’t restate it.', updated: true },
  { atMs: 9800, id: 'value',     score: 4, band: 'green' as const, rationale: 'Tied feature to her CAC payback target.', updated: true },
  { atMs: 12000,id: 'multi',     score: 2, band: 'coral' as const, rationale: 'No mention of CRO or ops yet.', updated: true },
  { atMs: 14500,id: 'next',      score: 3, band: 'amber' as const, rationale: 'Proposed a follow-up; no specific calendar hold.', updated: true },
]
