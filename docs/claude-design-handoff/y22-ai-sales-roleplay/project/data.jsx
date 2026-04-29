// Shared data + state + utility hooks for Y22 Roleplay

const PRESETS = [
  {
    id: 'cfo',
    name: 'Skeptical mid-market CFO',
    profile: 'Data-driven, ROI-obsessed, won’t agree without numbers.',
    difficulty: 'hard',
    monogram: 'SC',
    full_name: 'Sarah Chen',
    title: 'VP of Finance',
    company: 'Northwind FinTech',
    industry: 'fintech',
    title_key: 'cfo',
    objection: 'price',
    pains: [
      'CAC payback creeping past 18 months',
      'Board wants 30% efficiency this year',
      'Already cut 2 vendors this quarter'
    ],
    objection_line: 'Show me the 90-day payback or I’m not signing.'
  },
  {
    id: 'vpsales',
    name: 'Friendly-but-firm VP Sales',
    profile: 'Pattern-matches against tools she’s seen burn out reps.',
    difficulty: 'medium',
    monogram: 'MR',
    full_name: 'Maya Rodriguez',
    title: 'VP of Sales',
    company: 'Helix Health',
    industry: 'healthcare',
    title_key: 'vpsales',
    objection: 'competitor',
    pains: [
      'Reps drowning in call review backlog',
      'New AE ramp time is 6 months',
      'Two pilots failed last year'
    ],
    objection_line: 'We tried Gong. The reps stopped opening it after week 3.'
  },
  {
    id: 'procure',
    name: 'Procurement gatekeeper',
    profile: 'Wants legal redlines and a third bid before any call.',
    difficulty: 'easy',
    monogram: 'DT',
    full_name: 'Daniel Tran',
    title: 'Procurement Manager',
    company: 'Lattice Realty Group',
    industry: 'realestate',
    title_key: 'procurement',
    objection: 'timing',
    pains: [
      'Q4 spend freeze in effect',
      'No SOC 2 = no signature',
      'Three competing bids required'
    ],
    objection_line: 'Bring me a redlined MSA and a discount or there’s no Q1 slot.'
  }
];

const INDUSTRIES = [
  { id: 'saas', label: 'SaaS' },
  { id: 'fintech', label: 'FinTech' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'realestate', label: 'Real Estate' }
];
const TITLES = [
  { id: 'vpsales', label: 'VP Sales' },
  { id: 'cfo', label: 'CFO' },
  { id: 'procurement', label: 'Procurement Mgr' },
  { id: 'it', label: 'IT Director' }
];
const OBJECTIONS = [
  { id: 'price', label: 'Price-focused' },
  { id: 'competitor', label: 'Competitor-loyal' },
  { id: 'timing', label: 'Timing / budget' },
  { id: 'feature', label: 'Feature gaps' }
];

const BEHAVIORS = [
  { id: 'discovery', name: 'Discovery Depth', short: 'discovery' },
  { id: 'objection', name: 'Objection Acknowledgement', short: 'objection' },
  { id: 'value', name: 'Value Framing', short: 'value' },
  { id: 'multi', name: 'Multithreading', short: 'multi' },
  { id: 'next', name: 'Next-Step Specificity', short: 'next' },
  { id: 'tlr', name: 'Talk:Listen Ratio', short: 'tlr' }
];

// Mid-call snapshot of scorecard (per the brief: 2 green, 2 amber, 2 coral)
const MID_SCORES = {
  discovery: { score: 4, band: 'green', rationale: 'Asked about budget cycle changes early.', updated: false },
  objection: { score: 3, band: 'amber', rationale: 'Acknowledged her ROI doubt; didn’t restate it.', updated: true },
  value:     { score: 4, band: 'green', rationale: 'Tied feature to her CAC payback target.', updated: false },
  multi:     { score: 2, band: 'coral', rationale: 'No mention of CRO or ops yet.', updated: false },
  next:      { score: 3, band: 'amber', rationale: 'Proposed a follow-up; no specific calendar hold.', updated: false },
  tlr:       { score: 1, band: 'coral', rationale: 'You at 71% talk — buyer hasn’t had room.', updated: false }
};

// Final scorecard
const FINAL_SCORES = {
  discovery: { score: 4, band: 'green', rationale: 'Strong open: asked what changed in budget cycle and who else owns the number. Surfaced 2 of 3 stated pains.', delta: '+0.4' },
  objection: { score: 4, band: 'green', rationale: 'On the ROI pushback you reframed (90-day payback) before discounting. Did not flinch on price.', delta: '+0.7' },
  value:     { score: 4, band: 'green', rationale: 'Mapped the workflow back to her stated 30% efficiency target. Used her words.', delta: '+0.3' },
  multi:     { score: 3, band: 'amber', rationale: 'Got CRO name late. Never asked for an intro to ops or finance.', delta: '–0.6' },
  next:      { score: 4, band: 'green', rationale: 'Closed with a Wed 2pm hold + agenda + pre-read. Specific.', delta: '+0.5' },
  tlr:       { score: 3, band: 'amber', rationale: 'Final ratio 58/42. Improved after minute 2 once you started asking.', delta: '–0.2' }
};

const TRANSCRIPT = [
  { t: '00:08', who: 'user',  text: 'Sarah, thanks for grabbing 5 minutes. Before I show you anything — what changed in your budget cycle this quarter that made you take this call?' },
  { t: '00:18', who: 'buyer', text: 'Honestly? Board pulled forward the efficiency review. We have to show 30% by Q3 or we’re cutting headcount before tools.' },
  { t: '00:31', who: 'user',  text: 'Got it — 30% by Q3. And when you say efficiency, are you measuring rep ramp, deal velocity, or CAC payback? They lead to very different conversations.' },
  { t: '00:44', who: 'buyer', text: 'CAC payback. Ours is at 22 months and it needs to be under 14. That’s the number I have to defend to the board.' },
  { t: '00:58', who: 'user',  text: 'Okay. The reps I work with usually shave 4 to 6 months off CAC payback in the first 90 days because new AEs stop wasting calls on objections they’ve never seen before. Want me to show you the before-and-after from a comp like Northwind?' },
  { t: '01:12', who: 'buyer', text: 'Look, we already have a vendor for this. We tried Gong. Reps stopped opening it.' },
  { t: '01:24', who: 'user',  text: 'That’s fair. The reason it shelf-warmed — was it the workflow, the cost, or that the coaching wasn’t actually changing what reps did on the next call?' }
];

// Whisper history
const WHISPER_HISTORY = [
  '00:32 — Used: clarified what “efficiency” meant.',
  '00:55 — Dismissed: “mention case study”.'
];

// Active whisper (mid-call)
const WHISPER_NOW = {
  text: 'Try: ask what changed in their budget cycle.',
  reason: 'Buyer just said “already have a vendor” — redirect to discovery.'
};

const PROMPT_VERSIONS = [
  {
    ver: 'v1.2 baseline',
    date: 'Apr 18',
    selected: false,
    body: `# PERSONA: Sarah Chen, VP Finance
You are a skeptical, data-driven CFO at a
mid-market FinTech (300–700 employees).

## VOICE
- Brief sentences. No hedging.
- Asks for numbers, never accepts feel-good answers.

## OBJECTION POLICY
- If rep mentions ROI, push back once.
- Concede only when given a specific
  payback window in months.

## CLOSING
- Refuse first ask for next meeting.
- Accept only with a named exec
  attendee + agenda.
`,
    bars: [
      { lbl: 'DISC', v: 0.62, band: '' },
      { lbl: 'OBJ',  v: 0.48, band: 'amber' },
      { lbl: 'VAL',  v: 0.71, band: '' },
      { lbl: 'MULT', v: 0.40, band: 'coral' },
      { lbl: 'NEXT', v: 0.66, band: '' },
      { lbl: 'T:L',  v: 0.55, band: 'amber' },
      { lbl: 'RAP',  v: 0.74, band: '' },
      { lbl: 'CLOS', v: 0.51, band: 'amber' }
    ],
    delta: null
  },
  {
    ver: 'v1.3 +objection script',
    date: 'Apr 22',
    selected: false,
    body: `# PERSONA: Sarah Chen, VP Finance
You are a skeptical, data-driven CFO at a
mid-market FinTech (300–700 employees).

## VOICE
- Brief sentences. No hedging.

## OBJECTION POLICY  ## NEW
- ROI: push back twice, second time
  cite a competitor by name.
- Price: never lead with discount;
  always ask for ROI proof first.
- Timing: cite Q3 board review;
  refuse generic urgency.

## CLOSING
- Concede only with named attendee +
  agenda + pre-read attached.
`,
    bars: [
      { lbl: 'DISC', v: 0.60, band: 'amber' },
      { lbl: 'OBJ',  v: 0.78, band: '' },
      { lbl: 'VAL',  v: 0.72, band: '' },
      { lbl: 'MULT', v: 0.42, band: 'coral' },
      { lbl: 'NEXT', v: 0.68, band: '' },
      { lbl: 'T:L',  v: 0.56, band: 'amber' },
      { lbl: 'RAP',  v: 0.71, band: '' },
      { lbl: 'CLOS', v: 0.62, band: 'amber' }
    ],
    delta: { obj: '+12%', rap: '–3%' }
  },
  {
    ver: 'v1.4 +personality',
    date: 'Apr 27',
    selected: true,
    body: `# PERSONA: Sarah Chen, VP Finance
You are a skeptical, data-driven CFO at a
mid-market FinTech (300–700 employees).

## VOICE  ## REWRITTEN
- Dry humor. One-line interjections.
- Sentences under 14 words 80% of time.
- Fillers banned: “totally”, “absolutely”.

## OBJECTION POLICY
- ROI: push back twice + name competitor.
- Price: never lead w/ discount.
- Timing: cite Q3 board review.

## CLOSING
- Concede only w/ exec + agenda + pre-read.

## TEMP / SAMPLING  ## NEW
- temperature: 0.7
- top_p: 0.92
- penalize repeated objection phrasing.
`,
    bars: [
      { lbl: 'DISC', v: 0.74, band: '' },
      { lbl: 'OBJ',  v: 0.81, band: '' },
      { lbl: 'VAL',  v: 0.79, band: '' },
      { lbl: 'MULT', v: 0.55, band: 'amber' },
      { lbl: 'NEXT', v: 0.72, band: '' },
      { lbl: 'T:L',  v: 0.69, band: '' },
      { lbl: 'RAP',  v: 0.84, band: '' },
      { lbl: 'CLOS', v: 0.71, band: '' }
    ],
    delta: { rap: '+18%', mult: '+13%', t_l: '+13%' }
  }
];

// Utility - generate stable bars for waveform
function makeWaveBars(count, seed = 1) {
  // simple deterministic pseudo-random
  const out = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(0.18 + (s / 233280) * 0.82);
  }
  return out;
}

Object.assign(window, {
  PRESETS, INDUSTRIES, TITLES, OBJECTIONS, BEHAVIORS,
  MID_SCORES, FINAL_SCORES, TRANSCRIPT, WHISPER_NOW, WHISPER_HISTORY,
  PROMPT_VERSIONS, makeWaveBars
});
