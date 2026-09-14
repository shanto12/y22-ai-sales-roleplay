// POST /api/score — score a roleplay transcript against the 6-tile rubric.
//
// Streams SSE:
//   event: start    { mode, final }
//   event: tile     { id, score: { score, band, rationale, delta } }   ← per behavior
//   event: moment   { time, text }                                     ← deal-turning moment
//   event: coaching { bullets: string[] }                              ← 3 coaching bullets
//   event: result   { scores: ScoreMap, moment, coaching }             ← full payload
//   event: done     {}
//
// Self-contained per AGENTS.md.

const BEHAVIORS = [
  { id: 'discovery', name: 'Discovery Depth' },
  { id: 'objection', name: 'Objection Acknowledgement' },
  { id: 'value',     name: 'Value Framing' },
  { id: 'multi',     name: 'Multithreading' },
  { id: 'next',      name: 'Next-Step Specificity' },
  { id: 'tlr',       name: 'Talk:Listen Ratio' },
]

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405 })
  }

  let body = {}
  try { body = await req.json() } catch { /* keep empty */ }
  const transcript = Array.isArray(body.transcript) ? body.transcript.slice(0, 200) : []
  const persona = body.persona && typeof body.persona === 'object' ? body.persona : { name: 'Buyer', title: '—', difficulty: 'hard' }
  const isFinal = !!body.final

  const apiKey = Netlify.env.get('XAI_API_KEY')
  const baseUrl = Netlify.env.get('XAI_API_BASE_URL') || 'https://api.x.ai/v1'
  const model = Netlify.env.get('SCORING_MODEL') || 'grok-3'

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
        if (!apiKey) throw new Error('Live scoring is not configured')

        if (!transcript.some(line => line.who === 'user' && typeof line.text === 'string' && line.text.trim())) throw new Error('No rep speech captured')

        const sys = [
          'You score sales-rep performance on six behaviors using a 0-5 rubric:',
          '1. discovery (Discovery Depth) - did the rep ask what changed and quantify?',
          '2. objection (Objection Acknowledgement) - did the rep restate and reframe before defending?',
          '3. value (Value Framing) - did the rep tie features to the buyer\'s stated metric?',
          '4. multi (Multithreading) - did the rep ask for or name another stakeholder?',
          '5. next (Next-Step Specificity) - calendar hold + named attendee + agenda?',
          '6. tlr (Talk:Listen Ratio) - estimate balance from transcript words only; do not invent audio timings.',
          'Never invent prior calls, team averages, benchmark deltas or statements missing from the transcript. Set delta to null.',
          '',
          'Return ONLY a JSON object with this exact shape:',
          '{',
          '  "scores": {',
          '    "discovery": { "score": 0..5, "band": "green"|"amber"|"coral", "rationale": "<one short sentence>", "delta": "+0.3"|"-0.2"|null },',
          '    "objection": { ... }, "value": { ... }, "multi": { ... }, "next": { ... }, "tlr": { ... }',
          '  },',
          '  "moment": { "time": "MM:SS from the transcript", "text": "<one short sentence describing the moment the call turned, good or bad>" },',
          '  "coaching": [',
          '    "<one specific coaching bullet, ≤22 words. Use **markdown bold** to emphasize the verb or insight.>",',
          '    "<bullet 2>",',
          '    "<bullet 3>"',
          '  ]',
          '}',
          'Bands: 4-5 green, 3 amber, 0-2 coral. Coaching bullets must be specific, actionable, and concrete - never generic. If the transcript is too short to identify a clear moment, set moment to {"time":"00:00","text":"Call too short to identify a turning point."}.',
        ].join('\n')

        const userText = [
          `Persona: ${persona.name} - difficulty=${persona.difficulty}.`,
          'Transcript:',
          ...transcript.map((l) => `[${l.t || '00:00'}] ${l.who === 'user' ? 'REP' : 'BUYER'}: ${l.text}`),
        ].join('\n')

        const r = await fetch(`${baseUrl}/responses`, {
          method: 'POST',
          signal: AbortSignal.timeout(45000),
          headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            model,
            input: [
              { role: 'system', content: sys },
              { role: 'user', content: userText },
            ],
            text: { format: { type: 'json_object' } },
          }),
        })

        if (!r.ok) {
          send('error', { message: `upstream_${r.status}` })
          send('done', {})
          return
        }

        const data = await r.json()
        const text = extractText(data)
        const parsed = safeParseJSON(text)

        if (!parsed || !parsed.scores) {
          throw new Error('Scoring returned an invalid response')
        }

        for (const b of BEHAVIORS) {
          const raw = parsed.scores[b.id]
          if (!raw || !Number.isFinite(raw.score) || typeof raw.rationale !== 'string') throw new Error('Scoring returned incomplete behavior evidence')
        }
        const normalized = {}
        for (const b of BEHAVIORS) {
          const raw = parsed.scores[b.id] ?? parsed[b.id]
          const score = clampScore(raw?.score)
          const band = bandFor(score)
          normalized[b.id] = {
            score,
            band,
            rationale: typeof raw?.rationale === 'string' ? raw.rationale : '-',
            delta: typeof raw?.delta === 'string' ? raw.delta : null,
          }
          send('tile', { id: b.id, score: normalized[b.id] })
        }

        const moment = (parsed.moment && typeof parsed.moment.time === 'string' && typeof parsed.moment.text === 'string')
          ? { time: parsed.moment.time.slice(0, 8), text: parsed.moment.text.slice(0, 240) }
          : { time: '—', text: 'No turning point was identified in this conversation.' }
        send('moment', moment)

        const coaching = Array.isArray(parsed.coaching)
          ? parsed.coaching.filter((s) => typeof s === 'string' && s.trim().length > 0).slice(0, 3).map((s) => s.slice(0, 280))
          : []
        const coachingFinal = coaching
        send('coaching', { bullets: coachingFinal })

        send('result', { scores: normalized, moment, coaching: coachingFinal })
        send('done', {})
      } catch (err) {
        send('error', { message: err && err.message ? err.message : 'unknown' })
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
