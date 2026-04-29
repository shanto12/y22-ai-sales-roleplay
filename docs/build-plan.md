# Build Plan — Y22 AI Sales Roleplay

**Source-of-truth inputs:** `jd-source.md`, `research.md`, `xai-voice-reference.md`, `design-brief.md`, `claude-design-handoff/`.
**Target:** Live on Netlify, public repo on GitHub, recruiter-ready in one click.

---

## Tech stack (matches existing factory demos)
- Vite 8 + React 19 + TypeScript 6 (mirrors `vapi-pilot-command-center`).
- `lucide-react` for icons (drop the inline-SVG `icons.jsx` — keep palette identical).
- Vitest + Testing Library for unit; Playwright for e2e; eslint-config carried over.
- Netlify Functions (Node, ESM `.mjs`), one self-contained file per route per the AGENTS.md rule.
- `@netlify/blobs` for the optional **call-result store** if/when we move to async scoring; the synchronous path needs no storage.
- No global state library — `useReducer` for the call state machine, `URLSearchParams` for deep-link state (`?screen=live` for screenshot scripts).

## Repo layout

```
apps/y22-ai-sales-roleplay/
├── README.md                      ← public-facing repo readme (slim)
├── package.json
├── tsconfig.json / .app / .node
├── vite.config.ts
├── eslint.config.js
├── playwright.config.ts
├── netlify.toml
├── index.html
├── public/
│   └── icon-mark.svg              ← Y22 wordmark mark
├── src/
│   ├── main.tsx                   ← bootstraps <App/>
│   ├── App.tsx                    ← top chrome + tab routing + state machine
│   ├── index.css                  ← styles.css ported verbatim (kept readable)
│   ├── types.ts                   ← Persona, Score, BehaviorId, Transcript types
│   ├── data/
│   │   ├── presets.ts             ← 3 preset buyers (CFO / VP Sales / Procurement)
│   │   ├── behaviors.ts           ← 6-tile rubric definitions
│   │   ├── persona-builder.ts     ← (industry × title × objection) → persona
│   │   ├── prompt-versions.ts     ← Prompt Lab data
│   │   ├── synthetic-call.ts      ← canned transcript + scores for fallback path
│   │   └── sources.ts             ← provenance (synthetic / no real customer data)
│   ├── lib/
│   │   ├── voice-session.ts       ← xAI WebSocket session + transcript capture
│   │   ├── score-mapper.ts        ← raw rubric → green/amber/coral band
│   │   ├── api.ts                 ← thin fetch wrappers + types for Functions
│   │   └── synthetic-engine.ts    ← timeline player when no XAI_API_KEY
│   ├── hooks/
│   │   ├── useHealth.ts           ← polls /api/health on mount
│   │   ├── useCallMachine.ts      ← reducer for {idle | calibrating | live | scoring | done}
│   │   └── useDeepLink.ts         ← URL ?screen= shortcut for screenshots
│   ├── components/
│   │   ├── chrome/TopChrome.tsx
│   │   ├── chrome/SyntheticBanner.tsx
│   │   ├── shared/Waveform.tsx
│   │   ├── shared/ScoreTile.tsx
│   │   ├── shared/ScoreTileFinal.tsx
│   │   ├── shared/PersonaPreview.tsx
│   │   └── shared/CalibratingOverlay.tsx
│   └── screens/
│       ├── Configurator.tsx
│       ├── LiveCall.tsx
│       ├── Scorecard.tsx
│       ├── PromptLab.tsx
│       └── DemoGuide.tsx
└── netlify/
    └── functions/
        ├── health.mjs              ← GET /api/health  → mode + provider + capabilities
        ├── mint-token.mjs          ← POST /api/mint-token  → ephemeral xAI client_secret
        ├── persona.mjs             ← POST /api/persona  → Grok-authored system prompt
        └── score.mjs               ← POST /api/score  → 6-tile rubric JSON (SSE-streamed)
```

## State machine

```
idle (Configurator)
  └─ Start roleplay  →  calibrating (1.2s overlay)
                          └─  live (LiveCall)
                                ├─  scoreUpdate(behavior, score)   ← from voice loop / synthetic timeline
                                ├─  whisper(text)                  ← when buyer triggers a known phrase
                                └─  End call  →  scoring (briefly)
                                                  └─  done (Scorecard)
                                                        ├─  Try harder  →  calibrating (same persona, +difficulty)
                                                        └─  Run another →  idle
```

Reducer lives in `useCallMachine`. Side effects (mic getUserMedia, WS connect, transcript capture, score-call POST) live in `voice-session.ts` and are commanded by the reducer via a thin imperative API surface — keeps the React tree pure.

## Voice loop (per `xai-voice-reference.md`)

1. UI clicks **Start Roleplay** → `/api/mint-token` returns `{ value, expires_at }`.
2. `voice-session.ts` opens `wss://api.x.ai/v1/realtime?model=grok-voice-think-fast-1.0` with subprotocol `["realtime", "openai-insecure-api-key.${TOKEN}", "openai-beta.realtime-v1"]`.
3. On open: send `session.update` with the persona system prompt (built locally from preset, or fetched via `/api/persona` for custom personas).
4. Get mic via `navigator.mediaDevices.getUserMedia({ audio: true })`, pipe through an `AudioWorkletNode` to PCM16, send as `input_audio_buffer.append` events.
5. Capture events:
   - `response.output_audio.delta` → buffered AudioWorklet for playback.
   - `response.output_audio_transcript.delta` (assistant) and `conversation.item.input_audio_transcription.completed` (user) → append to transcript array.
6. Every ~10s while live, the transcript-so-far is POST-ed to `/api/score` with `Connection: keep-alive` and SSE-streamed scores update individual tiles. (Score function is also called once on End-call for the final card.)
7. **Tab-close / End-call:** flush final transcript via `navigator.sendBeacon` to `/api/score` with `final: true`.

If `/api/health` returns `mode: synthetic`, `voice-session.ts` is bypassed and `synthetic-engine.ts` plays a canned transcript at realistic timing, emitting the same events into the reducer. Demo Guide shows the "synthetic" health pill so it's never silent.

## Netlify Functions

All four are self-contained `.mjs` files (no shared imports — Netlify's bundler has dropped helper modules in past builds; one file per route avoids it). Common pattern:

```js
const required = (k) => process.env[k] || null;
const isLive = !!required('XAI_API_KEY');
```

### `/api/health` (sync)
Returns:
```json
{
  "mode": "live" | "synthetic",
  "provider": "xai",
  "model": "grok-voice-think-fast-1.0",
  "scoringModel": "grok-3",
  "capabilities": {
    "voice":  { "live": true, "p50_ms": 320 },
    "scoring":{ "live": true, "p50_ms": 480 },
    "persona":{ "live": true, "cold_p50_ms": 1400 }
  },
  "syntheticReady": true,
  "version": "<git-sha>"
}
```

### `/api/mint-token` (sync, ~200ms)
- Body: `{ persona_system_prompt: string, ttl?: number }`
- Calls `POST https://api.x.ai/v1/realtime/client_secrets` with `Authorization: Bearer ${XAI_API_KEY}`, body `{ session: { type: "realtime", model: "grok-voice-think-fast-1.0", instructions: "<persona>" }, expires_after: { seconds: ttl ?? 600 } }` (instructions baked in if accepted; otherwise we send `session.update` over WS).
- Returns `{ value, expires_at, model }`.
- **Synthetic mode** returns `{ value: null, mode: "synthetic" }` with HTTP 200 — frontend branches on this.

### `/api/persona` (SSE-streamed — Grok responses API can take 2–8s)
- Body: `{ industry, title, difficulty, objection }`
- Streams `event: start / delta / result / done` per the factory pattern.
- `result` event payload: `{ system_prompt: string, name, title, company, pains: string[], objection_line }`.
- Synthetic mode: returns the local `persona-builder.ts` output.

### `/api/score` (SSE-streamed)
- Body: `{ transcript: TranscriptLine[], persona, final: boolean }`
- Calls Grok responses API with the rubric in the system prompt + transcript as user message + `response_format: json`.
- Streams `event: tile` per behavior as scores resolve, then `event: result` with the full scorecard, then `event: done`.
- Synthetic mode: walks through the canned `MID_SCORES` → `FINAL_SCORES` over a synthetic timeline.

## Design port checklist

- [ ] Port `styles.css` verbatim into `src/index.css` (already 1067 lines, has every token).
- [ ] Replace `Object.assign(window, ...)` exposure with proper ES module exports.
- [ ] Replace inline lucide-style icons with `lucide-react` imports (same names exist).
- [ ] `useTweaks` (design-time toggle) → real state from reducer + URL deep-link.
- [ ] EDITMODE markers stripped.
- [ ] Type every prop. `Persona`, `Score`, `BehaviorId`, `TranscriptLine`, `WhisperPrompt`, `PromptVersion` types live in `src/types.ts`.
- [ ] Replace `String.prototype.repeat`-style demo data with proper synthetic fixtures with provenance.

## Deterministic-synthetic mode (mandatory per factory protocol)

When `process.env.XAI_API_KEY` is missing on the server, every Function returns `mode: "synthetic"` and the frontend:
- Shows the `SyntheticBanner` at top.
- Demo Guide health pills go amber (still "ready" for synthetic-fallback row).
- `Start Roleplay` plays the canned 4:58 transcript at realistic 110ms tick rate.
- Score tiles fill from the canned `MID_SCORES` → `FINAL_SCORES` timeline.
- Whisper drops at 01:24 with the "ask what changed" line.
- Scorecard renders with the static "moment the deal turned" clip.

This is the path a recruiter without keys will hit. It must be **as good** as the live path visually.

## Tests

- **Unit** (`*.test.ts`): `persona-builder.ts` (every industry × title × objection combo returns a persona), `score-mapper.ts` (band thresholds), `synthetic-engine.ts` (timeline plays in expected order).
- **Component** (`*.test.tsx`): `ScoreTile` (band class + meter on/off), `Waveform` (count of bars + `live` class only when active), `Configurator` (preset selection updates state).
- **Playwright e2e** (`e2e/golden.spec.ts`): land → pick preset → start → wait for first tile fill → end call → scorecard rendered → "Try Again" returns to configurator. All in synthetic mode (no key needed).
- **Accessibility smoke**: `axe` against the three main screens.

## Verify before deploy

```bash
npm run verify  # = lint + typecheck + test + build
```

Must be green. CI is unmanaged (no GitHub Actions yet) — verify is the gate.

## Public repo + Netlify deploy

- Push only `apps/y22-ai-sales-roleplay/` contents to `github.com/shanto12/y22-ai-sales-roleplay` (public, MIT). Run a secret-audit subagent before the first commit.
- Site already exists at Netlify (id `8c4d20c4-061d-469a-86d2-d2611da0f7f0`). User will paste a separate `XAI_API_KEY` directly into the Netlify env. We set defaults via the plugin: `GROK_VOICE_MODEL`, `SCORING_MODEL`, `XAI_API_BASE_URL`.
- Deploy via plugin's `deploy-site` → run the returned `npx @netlify/mcp@latest` command from the app directory.
- Live verification: `curl /api/health` (mode = live), `curl /api/score -d ...` (200 + first SSE chunk in <1s), browse to `?screen=live` and confirm the prototype renders correctly.

## What's intentionally cut for v1
- Real RAG over a sales-playbook corpus (fake the panel; cite as Phase 2).
- Auth / multi-tenant / org dashboard.
- LMS integrations.
- A "compare to top 10%" deltas computed from real call data — they're hardcoded against the canned transcript for now.

These are surfaced in the Demo Guide "Roadmap" section so Brandon sees the full product mental model.
