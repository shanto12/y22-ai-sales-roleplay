// POST /api/persona — generate a buyer-persona system prompt from form input.
//
// Streams SSE per the factory pattern (`event: start | delta | result | done`).
// Self-contained per AGENTS.md.

const VALID_INDUSTRY = new Set(['saas', 'fintech', 'healthcare', 'realestate'])
const VALID_TITLE = new Set(['vpsales', 'cfo', 'procurement', 'it'])
const VALID_DIFFICULTY = new Set(['easy', 'medium', 'hard'])
const VALID_OBJECTION = new Set(['price', 'competitor', 'timing', 'feature'])

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405 })
  }

  let body = {}
  try { body = await req.json() } catch { /* fall through */ }
  const industry   = VALID_INDUSTRY.has(body.industry) ? body.industry : 'fintech'
  const title      = VALID_TITLE.has(body.title) ? body.title : 'cfo'
  const difficulty = VALID_DIFFICULTY.has(body.difficulty) ? body.difficulty : 'hard'
  const objection  = VALID_OBJECTION.has(body.objection) ? body.objection : 'price'

  const apiKey = process.env.XAI_API_KEY
  const baseUrl = process.env.XAI_API_BASE_URL || 'https://api.x.ai/v1'
  const responsesModel = process.env.SCORING_MODEL || 'grok-3'

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event, data) =>
        controller.enqueue(new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))

      send('start', { industry, title, difficulty, objection, mode: apiKey ? 'live' : 'synthetic' })

      const heartbeat = setInterval(
        () => controller.enqueue(new TextEncoder().encode(': keepalive\n\n')),
        6000,
      )

      try {
        if (!apiKey) {
          send('result', synthesizePersona({ industry, title, difficulty, objection }))
          send('done', {})
          return
        }

        const upstreamBody = {
          model: responsesModel,
          input: [
            {
              role: 'system',
              content:
                'You author tight, behavior-driven sales-buyer personas for AI roleplay. Output ONLY a JSON object with these keys: name, title, company, pains (array of 3 concise strings), objection_line (one short sentence in the buyer’s voice), system_prompt (the full system prompt to drop into a voice agent). The system_prompt must be under 1500 characters, use markdown headings (## VOICE, ## OBJECTION POLICY, ## CLOSING), and reflect the requested difficulty.',
            },
            {
              role: 'user',
              content: `Industry=${industry}; Buyer title=${title}; Difficulty=${difficulty}; Objection style=${objection}. Return JSON only.`,
            },
          ],
          response_format: { type: 'json_object' },
        }

        const r = await fetch(`${baseUrl}/responses`, {
          method: 'POST',
          headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
          body: JSON.stringify(upstreamBody),
        })

        if (!r.ok) {
          const t = await r.text().catch(() => '')
          send('error', { message: `upstream_${r.status}`, detail: t.slice(0, 300) })
          send('result', synthesizePersona({ industry, title, difficulty, objection }))
          send('done', {})
          return
        }

        const data = await r.json()
        const text = extractText(data)
        const parsed = safeParseJSON(text) || synthesizePersona({ industry, title, difficulty, objection })
        send('delta', { text: '' })
        send('result', parsed)
        send('done', {})
      } catch (err) {
        send('error', { message: err && err.message ? err.message : 'unknown' })
        send('result', synthesizePersona({ industry, title, difficulty, objection }))
        send('done', {})
      } finally {
        clearInterval(heartbeat)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      connection: 'keep-alive',
    },
  })
}

function synthesizePersona({ industry, title, difficulty, objection }) {
  const NAMES = {
    vpsales: 'Maya Rodriguez', cfo: 'Sarah Chen', procurement: 'Daniel Tran', it: 'Priya Iyer',
  }
  const COMPANIES = {
    saas: 'Vector Labs', fintech: 'Northwind FinTech', healthcare: 'Helix Health', realestate: 'Lattice Realty Group',
  }
  const TITLES = {
    vpsales: 'VP of Sales', cfo: 'VP of Finance', procurement: 'Procurement Manager', it: 'IT Director',
  }
  const PAINS = {
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
  const OBJ_LINES = {
    'cfo-price': 'Show me the 90-day payback or I’m not signing.',
    'cfo-competitor': 'We already evaluated this category two years ago.',
    'cfo-timing': 'Come back when the Q3 review closes.',
    'cfo-feature': 'Without board-grade reporting this is a no.',
    'vpsales-price': 'My reps don’t need another tool with a per-seat price tag.',
    'vpsales-competitor': 'We tried Gong. Reps stopped opening it after week 3.',
    'vpsales-timing': 'Ask me again after the new class ramps.',
    'vpsales-feature': 'I need it to write the forecast call, not just record it.',
    'procurement-price': 'Bring me a redlined MSA and a 20% discount.',
    'procurement-competitor': 'Our master MSA blocks adding new tier-2 vendors.',
    'procurement-timing': 'Vendor process is nine weeks. We’re not starting today.',
    'procurement-feature': 'No SOC 2 Type II, no signature.',
    'it-price': 'Capex is frozen — sell me on opex math.',
    'it-competitor': 'CIO has mandated single-vendor for this stack.',
    'it-timing': 'We’re mid-replatform on identity. Not now.',
    'it-feature': 'Without SCIM and SSO this is dead on arrival.',
  }
  const key = `${title}-${objection}`
  const name = NAMES[title]
  const company = COMPANIES[industry]
  const role = TITLES[title]
  const pains = PAINS[key] || PAINS['cfo-price']
  const objectionLine = OBJ_LINES[key] || OBJ_LINES['cfo-price']
  const diffNote = {
    easy:   'You concede after one well-formed objection.',
    medium: 'You hold the line through one push-back. Concede only when the rep cites a specific number or dependency.',
    hard:   'You push back at least twice. Concede only when the rep gives a specific quantified commitment with named exec attendees.',
  }[difficulty]
  const systemPrompt = [
    `# PERSONA: ${name}`,
    `You are ${name}, ${role} at ${company}.`,
    '',
    '## VOICE',
    '- Brief sentences. No hedging. Dry, direct.',
    '',
    '## TOP PAINS',
    ...pains.map((p) => `- ${p}`),
    '',
    '## OBJECTION POLICY',
    `- Lead with: "${objectionLine}"`,
    `- ${diffNote}`,
    '',
    '## CLOSING',
    '- Refuse the first ask for a follow-up. Concede only with a named exec attendee + agenda.',
  ].join('\n')

  return { name, title: role, company, pains, objection_line: objectionLine, system_prompt: systemPrompt }
}

function extractText(data) {
  if (!data) return ''
  if (typeof data.output_text === 'string') return data.output_text
  if (Array.isArray(data.output)) {
    for (const part of data.output) {
      if (Array.isArray(part?.content)) {
        for (const c of part.content) {
          if (typeof c?.text === 'string') return c.text
        }
      }
    }
  }
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content
  return ''
}

function safeParseJSON(s) {
  if (!s) return null
  // Strip ```json fences if present.
  const cleaned = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try { return JSON.parse(cleaned) } catch { /* try to find first {...} */ }
  const m = cleaned.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

export const config = { path: '/api/persona' }
