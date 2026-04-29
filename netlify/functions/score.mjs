// POST /api/score — score a roleplay transcript against the 6-tile rubric.
//
// Streams SSE: `tile` events as scores resolve, `result` with the full ScoreMap, `done` to close.
// Self-contained per AGENTS.md.

const BEHAVIORS = [
  { id: 'discovery', name: 'Discovery Depth' },
  { id: 'objection', name: 'Objection Acknowledgement' },
  { id: 'value',     name: 'Value Framing' },
  { id: 'multi',     name: 'Multithreading' },
  { id: 'next',      name: 'Next-Step Specificity' },
  { id: 'tlr',       name: 'Talk:Listen Ratio' },
]

const SYNTHETIC_FINAL = {
  discovery: { score: 4, band: 'green', rationale: 'Strong open: asked what changed in budget cycle and who else owns the number.', delta: '+0.4' },
  objection: { score: 4, band: 'green', rationale: 'On the ROI pushback you reframed (90-day payback) before discounting.', delta: '+0.7' },
  value:     { score: 4, band: 'green', rationale: 'Mapped the workflow back to her stated 30% efficiency target.', delta: '+0.3' },
  multi:     { score: 3, band: 'amber', rationale: 'Got CRO name late. Never asked for an intro to ops or finance.', delta: '–0.6' },
  next:      { score: 4, band: 'green', rationale: 'Closed with a Wed 2pm hold + agenda + pre-read. Specific.', delta: '+0.5' },
  tlr:       { score: 3, band: 'amber', rationale: 'Final ratio 58/42. Improved after minute 2 once you started asking.', delta: '–0.2' },
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405 })
  }

  let body = {}
  try { body = await req.json() } catch { /* keep empty */ }
  const transcript = Array.isArray(body.transcript) ? body.transcript.slice(0, 200) : []
  const persona = body.persona && typeof body.persona === 'object' ? body.persona : { name: 'Buyer', title: '—', difficulty: 'hard' }
  const isFinal = !!body.final

  const apiKey = process.env.XAI_API_KEY
  const baseUrl = process.env.XAI_API_BASE_URL || 'https://api.x.ai/v1'
  const model = process.env.SCORING_MODEL || 'grok-3'

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event, data) =>
        controller.enqueue(new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))

      send('start', { mode: apiKey ? 'live' : 'synthetic', final: isFinal })

      const heartbeat = setInterval(
        () => controller.enqueue(new TextEncoder().encode(': keepalive\n\n')),
        6000,
      )

      try {
        if (!apiKey || transcript.length === 0) {
          // Drip the synthetic scorecard tile-by-tile for visual realism.
          for (const b of BEHAVIORS) {
            send('tile', { id: b.id, score: SYNTHETIC_FINAL[b.id] })
          }
          send('result', SYNTHETIC_FINAL)
          send('done', {})
          return
        }

        const sys = [
          'You score sales-rep performance on six behaviors using a 0–5 rubric:',
          '1. discovery (Discovery Depth) — did the rep ask what changed and quantify?',
          '2. objection (Objection Acknowledgement) — did the rep restate and reframe before defending?',
          '3. value (Value Framing) — did the rep tie features to the buyer’s stated metric?',
          '4. multi (Multithreading) — did the rep ask for or name another stakeholder?',
          '5. next (Next-Step Specificity) — calendar hold + named attendee + agenda?',
          '6. tlr (Talk:Listen Ratio) — was the rep ≤55% talk by minute 2?',
          '',
          'Return ONLY a JSON object keyed by id. Each value: { "score": 0..5, "band": "green"|"amber"|"coral", "rationale": "<one short sentence>", "delta": "+0.3"|"-0.2"|null }. Bands: 4-5 green, 3 amber, 0-2 coral.',
        ].join('\n')

        const userText = [
          `Persona: ${persona.name} — difficulty=${persona.difficulty}.`,
          'Transcript:',
          ...transcript.map((l) => `[${l.t || '00:00'}] ${l.who === 'user' ? 'REP' : 'BUYER'}: ${l.text}`),
        ].join('\n')

        const r = await fetch(`${baseUrl}/responses`, {
          method: 'POST',
          headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            model,
            input: [
              { role: 'system', content: sys },
              { role: 'user', content: userText },
            ],
            response_format: { type: 'json_object' },
          }),
        })

        if (!r.ok) {
          for (const b of BEHAVIORS) send('tile', { id: b.id, score: SYNTHETIC_FINAL[b.id] })
          send('result', SYNTHETIC_FINAL)
          send('error', { message: `upstream_${r.status}` })
          send('done', {})
          return
        }

        const data = await r.json()
        const text = extractText(data)
        const parsed = safeParseJSON(text)

        if (!parsed) {
          for (const b of BEHAVIORS) send('tile', { id: b.id, score: SYNTHETIC_FINAL[b.id] })
          send('result', SYNTHETIC_FINAL)
          send('done', {})
          return
        }

        const normalized = {}
        for (const b of BEHAVIORS) {
          const raw = parsed[b.id]
          const score = clampScore(raw?.score)
          const band = bandFor(score)
          normalized[b.id] = {
            score,
            band,
            rationale: typeof raw?.rationale === 'string' ? raw.rationale : '—',
            delta: typeof raw?.delta === 'string' ? raw.delta : null,
          }
          send('tile', { id: b.id, score: normalized[b.id] })
        }
        send('result', normalized)
        send('done', {})
      } catch (err) {
        send('error', { message: err && err.message ? err.message : 'unknown' })
        for (const b of BEHAVIORS) send('tile', { id: b.id, score: SYNTHETIC_FINAL[b.id] })
        send('result', SYNTHETIC_FINAL)
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

function clampScore(n) {
  const i = Number.isFinite(n) ? Math.round(n) : 0
  return Math.max(0, Math.min(5, i))
}
function bandFor(s) {
  if (s >= 4) return 'green'
  if (s >= 3) return 'amber'
  return 'coral'
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
  const cleaned = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try { return JSON.parse(cleaned) } catch { /* try alt */ }
  const m = cleaned.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

export const config = { path: '/api/score' }
