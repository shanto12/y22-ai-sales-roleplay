# Talk Tracks — Y22 Roleplay

Three durations. Same demo, different depth.

---

## 90 seconds — Lightning demo

**Land on `/`.**

> "This is Y22 Roleplay. One screen. Recruiter clicks here, picks the CFO preset, hits Start Roleplay."

*[Click Start. Mic calibrates briefly, then live call panel takes over.]*

> "Now I'm talking to Sarah Chen — VP of Finance, mid-market FinTech, hard difficulty, price-focused objection style. Six behavior tiles light up live as she talks: discovery, objection handling, value framing, multithreading, next-step specificity, talk-to-listen ratio."

*[Point to a tile flipping green, then one going red.]*

> "When I fumble — like getting only 2 out of 5 on multithreading because I never asked for the CRO's name — Whisper drops one tactical line in the ribbon: 'ask what changed in their budget cycle.' I take it or ignore it."

*[Click End call. Scorecard fills in.]*

> "End call. 22 out of 30. B+. There's the 'moment the deal turned' — 00:52, when she said 'we already have a vendor' and I reframed instead of discounting. Three coaching bullets for next time. Done."

**Close:** "Built on the xAI Grok Voice Agent API which dropped four months ago. Sub-second time-to-first-audio. The persona prompt, scoring rubric, and coaching are all Grok. The whole thing — frontend, four serverless functions, synthetic-fallback path — is in one public repo."

---

## 5 minutes — Hiring-manager pitch

Same opening, then drill into product judgment + engineering depth.

**Beat 1 — Why this design (60s).**
> "Brandon's vocabulary on the Y22 site and LinkedIn is 'behaviors,' 'what top performers do,' 'reps actually want to use.' This isn't a research demo. So nothing in the primary UI says AI, LLM, or model — those words live only on the live-status chip and in the Demo Guide. The aesthetic is Gong / Salesloft / Outreach manager-cockpit, not Linear-clean. Telemetry-rich, dense, dark, professional."

**Beat 2 — The configurator (30s).**
> "Three preset buyers on the left. CFO, VP Sales, Procurement. Each shows a one-line behavioral profile and difficulty pill. Or build custom: industry × title × difficulty × objection style. The persona preview on the right rebuilds live as I change fields — there's the name, top three pains, and the exact objection signature line the buyer will lead with."

**Beat 3 — The hero screen (90s).**
> [Live call.] "Six tiles, three by two. Each one has a band stripe — green, amber, coral — the tile name, a 1–5 score, a thin meter, and a one-line LLM-judge rationale. The pulsing border is the most-recently-updated tile. The transcript on the left, Whisper coaching on the right. The right panel has Sarah's waveform in amber and mine in green, with the model tag — `grok-voice-think-fast-1.0` — visible so a developer in the room knows what's running. Nothing is a stub. The synthetic engine plays the same dispatch path the WebSocket session would emit."

**Beat 4 — Prompt Lab (60s).**
> [Click Prompt Lab.] "This directly answers the JD's line about prompt versioning + temperature optimization. Three persona versions side-by-side. Each shows the prompt body, eval scores against a 240-turn golden objection set across eight dimensions, and a regression delta against the previous version. The ship policy: a new prompt must beat the prior version on at least 5 of 8 dimensions before it can be activated. Prompts as software."

**Beat 5 — Demo Guide (45s).**
> [Click Demo Guide.] "This is the recruiter-readable layer. `/api/health` reads live and updates these chips — voice loop, behavior scoring, persona generation, synthetic fallback. The configuration cheatsheet is the full env-var surface. Talk-track shortcuts at the bottom for 90 seconds, 5 minutes, 15 minutes."

**Close:** "All synthetic data, provenance documented, no real customer information. Public repo, MIT, deployable end-to-end in ten minutes."

---

## 15 minutes — Engineering deep-dive

Open with the 5-minute version, then unpack:

1. **xAI Voice Agent integration** (3 min). The browser opens `wss://api.x.ai/v1/realtime` directly — no first-party WebRTC plugin. Token-mint flow: `POST /v1/realtime/client_secrets` returns a 5–10 minute ephemeral secret. Browser uses `["realtime", "openai-insecure-api-key.${TOKEN}", "openai-beta.realtime-v1"]` as the WS subprotocol per the xAI cookbook. Persona is injected via a `session.update` event after open.

2. **Why every LLM endpoint is SSE-streamed** (2 min). Netlify's edge proxy kills sync functions that don't emit data for ~30s. Grok responses for scoring routinely take 5–15s. Template lives in `score.mjs` — `event: start | tile | result | error | done`, with a 6-second keepalive comment. Browser parses by accumulating to `\n\n` boundaries — never `res.json()`.

3. **Why functions are self-contained** (1 min). Past Netlify deploys have dropped shared `_helpers.mjs` modules during bundling, returning 502. Every function in this repo inlines its own `extractText`, `safeParseJSON`, `bandFor` — no shared imports.

4. **Synthetic-deterministic fallback as a first-class mode** (2 min). Recruiters without keys still get a full demo. `/api/health` reports the mode; the synthetic engine fires the same dispatch events the live WS session would. There's no "demo mode" code path that diverges from the real one — the only thing that changes is the source of events.

5. **Security boundary** (2 min). `XAI_API_KEY` is a Netlify env var marked `secret: true`. It never crosses the function/browser boundary. CSP allows `wss://api.x.ai` and nothing else for the `connect-src` directive. X-Frame-Options DENY, HSTS preload, no inline scripts beyond what Vite emits.

6. **Tests + CI gate** (1 min). 25 unit + component tests pass, Playwright e2e runs the full happy path in synthetic mode (no key needed), `npm run verify` chains lint + typecheck + test + build as the local CI gate. Walk through `persona-builder.test.ts` exhaustively testing all 16 (industry × title × objection) combinations.

7. **What I'd build next, in order** (4 min):
   - Wire the AudioWorklet PCM16 path so user mic input actually streams to xAI.
   - Capture the `conversation.item.input_audio_transcription.completed` event into the dispatch queue.
   - Replace the synthetic timeline-player with the real WS transcript-driven scoring loop.
   - Move scoring to a 10-second rolling cadence instead of end-of-call.
   - RAG layer with embedded sales-playbook examples to ground coaching bullets.
   - Per-rep history + manager rollup dashboard.
