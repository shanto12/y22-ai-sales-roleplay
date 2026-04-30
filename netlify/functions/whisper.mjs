// POST /api/whisper — mid-call coaching tip generated from the rolling transcript.
//
// Body: { transcript: TranscriptLine[], persona: { name, difficulty } }
// Returns JSON: { whisper: { text, reason } | null }
//
// Returns null when there's no high-confidence coaching opportunity, so the
// frontend doesn't show a card unless we have something specific to offer.
// Self-contained per AGENTS.md.

export default async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  let body = {}
  try { body = await req.json() } catch { /* keep empty */ }
  const transcript = Array.isArray(body.transcript) ? body.transcript.slice(-12) : []
  const persona = body.persona && typeof body.persona === 'object' ? body.persona : {}

  // Don't waste tokens on tiny transcripts.
  if (transcript.length < 3) {
    return jsonResponse({ whisper: null, reason: 'too_short' })
  }

  const apiKey = process.env.XAI_API_KEY
  const baseUrl = process.env.XAI_API_BASE_URL || 'https://api.x.ai/v1'
  const model = process.env.SCORING_MODEL || 'grok-3'

  if (!apiKey) {
    return jsonResponse({ whisper: null, mode: 'synthetic' })
  }

  const sys = [
    'You are a real-time sales coach. The rep is mid-call. Look at the most recent buyer + rep turns and decide if there\'s a SPECIFIC, IMMEDIATELY ACTIONABLE coaching tip the rep should try in their next turn.',
    'Examples of valid tips:',
    '  - "Try: ask what changed in their budget cycle."',
    '  - "Try: name the CFO peer who switched from Gong to compete."',
    '  - "Try: restate the buyer\'s objection before answering it."',
    '',
    'Return JSON ONLY:',
    '{ "whisper": { "text": "<one tactical sentence, ≤14 words, starts with \\"Try:\\" or an imperative verb>", "reason": "<one short clause: what the buyer just said that triggered this tip>" } }',
    '',
    'If no clear coaching opportunity exists right now (rep is doing fine, or there\'s not enough signal), return:',
    '{ "whisper": null }',
    '',
    'NEVER coach generic advice. NEVER repeat tips already given (assume the rep is iterating). NEVER coach the buyer\'s side.',
  ].join('\n')

  const userText = [
    `Persona: ${persona.name || 'Buyer'} (difficulty=${persona.difficulty || 'hard'}).`,
    'Recent turns (oldest → newest):',
    ...transcript.map((l) => `[${l.t || '00:00'}] ${l.who === 'user' ? 'REP' : 'BUYER'}: ${l.text}`),
  ].join('\n')

  try {
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
      return jsonResponse({ whisper: null, error: `upstream_${r.status}` })
    }

    const data = await r.json()
    const text = extractText(data)
    const parsed = safeParseJSON(text)

    if (!parsed) return jsonResponse({ whisper: null })

    const w = parsed.whisper
    if (!w || typeof w.text !== 'string' || w.text.trim().length === 0) {
      return jsonResponse({ whisper: null })
    }

    const cleanText = w.text.trim().slice(0, 200)
    const cleanReason = typeof w.reason === 'string' ? w.reason.trim().slice(0, 200) : ''
    return jsonResponse({ whisper: { text: cleanText, reason: cleanReason } })
  } catch (err) {
    return jsonResponse({ whisper: null, error: err && err.message ? err.message : 'unknown' })
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
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

export const config = { path: '/api/whisper' }
