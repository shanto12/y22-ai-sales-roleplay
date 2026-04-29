# Y22 Roleplay — voice-driven AI sales-roleplay cockpit

Live voice-driven AI buyer simulator with a real-time **6-tile behavior scorecard**, mid-call **Whisper coaching**, and a post-call replay clip pinpointing the moment the deal turned. Built on the [xAI Grok Voice Agent API](https://x.ai/news/grok-voice-agent-api) (sub-1s time-to-first-audio, OpenAI Realtime-compatible).

> Demo for the **Y22 AI** Founding AI Engineer (Part-Time) role.
> The audience is a sales-training founder, not an ML researcher — the UI talks behaviors, calls, and reps, not tokens.

## Live demo

- App: https://y22-ai-sales-roleplay.netlify.app
- Source: this repo

## Highlights

- **Live voice roleplay** in the browser, no phone setup. WebSocket → `wss://api.x.ai/v1/realtime`, ephemeral client-secret minted server-side.
- **6 behavior tiles** light up live: Discovery Depth · Objection Acknowledgement · Value Framing · Multithreading · Next-Step Specificity · Talk:Listen Ratio.
- **Whisper coaching** drops a single tactical line mid-call when the buyer triggers a known objection pattern.
- **Post-call scorecard** with a "moment the deal turned" replay, 3 coaching bullets, and a delta vs. top-10% baseline.
- **Prompt Lab** showing 3 versioned persona prompts with eval scores against a golden objection set and regression deltas — directly answers the JD’s "prompt versioning + temperature optimization" line.
- **Synthetic-deterministic fallback** so a recruiter without keys still gets the full demo.

## Architecture

```
┌────────────────────┐                      ┌─────────────────────────┐
│ Browser (React/TS) │ ── WS realtime ────▶ │  xAI Grok Voice Agent   │
│  Configurator      │                      │  grok-voice-think-fast  │
│  LiveCall + tiles  │ ◀── audio + text ─── │                         │
│  Whisper / Score   │                      └─────────────────────────┘
│  Scorecard / Lab   │
└─────────┬──────────┘
          │ /api/mint-token  /api/persona  /api/score  /api/health
          ▼
┌──────────────────────────────────┐
│  Netlify Functions (Node ESM)    │
│  - mint-token: ephemeral secret  │
│  - persona: SSE Grok responses   │
│  - score: SSE 6-tile rubric      │
│  - health: mode + capabilities   │
└──────────────────────────────────┘
```

### Why this design
- **Server-side secret boundary.** `XAI_API_KEY` never leaves the Netlify Function. The browser only ever sees a 5–10 minute ephemeral client secret.
- **All LLM-backed endpoints stream SSE** — Netlify’s edge proxy kills sync functions that don’t emit data for ~30s; Grok responses for scoring routinely take 5–15s.
- **Self-contained function files** (no shared `_*.mjs` imports) per a known Netlify-bundler pitfall.
- **Synthetic mode is first-class.** When `XAI_API_KEY` is absent, every Function returns `mode: synthetic` with HTTP 200 and the frontend plays a canned timeline — recruiters can demo without keys.

## Local dev

```bash
npm install
cp .env.example .env
# add your xAI key in .env, then:
npm run dev          # Vite at http://localhost:5173
npx netlify dev      # serves both Vite + the Netlify Functions on :8888
```

`npm run verify` runs `lint + typecheck + test + build` — all four must pass before deploy.

## Project layout

```
src/
  App.tsx               state machine + routing
  data/                 personas, behaviors, prompt versions, synthetic timeline
  lib/                  voice-session, synthetic-engine, score-mapper, api client
  hooks/                useHealth, useDeepLink, useCallMachine
  components/           Waveform, ScoreTile, TopChrome, SyntheticBanner, …
  screens/              Configurator, LiveCall, Scorecard, PromptLab, DemoGuide
netlify/functions/
  health.mjs  mint-token.mjs  persona.mjs  score.mjs
e2e/golden.spec.ts      Playwright happy-path
```

## Synthetic data

All transcripts, personas, scores, and prompt versions are synthetic. Provenance is documented in `src/data/sources.ts`. No real call recordings, customer names, or PII are anywhere in this codebase.

## License

MIT.
