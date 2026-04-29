# Y22 Roleplay — One-pager

**Live demo:** https://y22-ai-sales-roleplay.netlify.app
**Source:** https://github.com/shanto12/y22-ai-sales-roleplay
**Built for:** Founding AI Engineer (Part-Time) — Y22 AI

---

## What it is
A live, voice-driven AI sales-roleplay cockpit. Configure an AI buyer, talk to them in your browser at sub-1s latency, watch a 6-tile behavior scorecard light up live, get scored against a Y22-style rubric, and review a "moment the deal turned" replay clip with coaching bullets — all in one screen, no login.

## Why it lands for Y22
| Y22 capability | Where it shows up in the demo |
|---|---|
| Dynamic AI buyer personas | Configurator → 3 presets + custom (industry × title × difficulty × objection) |
| Prompt engineering | `Prompt Lab` tab — 3 versioned prompts with eval scores + regression deltas |
| Voice roleplay (real-time) | xAI Grok Voice Agent API (`grok-voice-think-fast-1.0`) — sub-1s TTFA, OpenAI Realtime-compatible |
| Behavior-rubric scoring | 6 tiles light up live: Discovery / Objection / Value / Multithread / Next-Step / Talk-Listen |
| Whisper-style coaching | Mid-call ribbon drops one tactical line on objection patterns |
| Full-stack ownership | Vite + React 19 + TS, 4 SSE-streamed Netlify Functions, CSP-locked, public repo |

## Stack
- **Frontend:** Vite + React 19 + TypeScript 6, Lucide icons, no UI framework — direct CSS tokens.
- **Voice:** xAI `wss://api.x.ai/v1/realtime` (OpenAI-Realtime subprotocol). Ephemeral 5–10 min client_secrets minted server-side; long-lived `XAI_API_KEY` never reaches the browser.
- **Server:** 4 Netlify Functions in self-contained `.mjs` files. SSE-streamed for any LLM-backed endpoint.
- **Scoring:** Grok `responses` API with strict JSON output, 6-band rubric, returned tile-by-tile.
- **Tests:** 25 Vitest + RTL unit/component tests passing, Playwright e2e on the configurator → live → scorecard happy path, axe-core a11y smoke.
- **Security:** CSP locked to `wss://api.x.ai`, X-Frame-Options DENY, HSTS preload, no client-side secrets.

## Synthetic-deterministic fallback
When `XAI_API_KEY` is absent on the server, every Function returns `mode: "synthetic"` with HTTP 200. The frontend plays a canned 4:58 transcript at realistic 110ms tick rate, score tiles fill from a documented timeline, and a Whisper card drops at the "we already have a vendor" moment. Recruiters who open the link cold get the *full* visual demo — no key required.

## What was built in one session
- Read JD, did a research pass on Y22 + founder Brandon Hurley + sales-AI competitor landscape (Hyperbound, Yoodli, Second Nature).
- Verified xAI Voice Agent API surface (token mint, WS subprotocol, transcript event names, OpenAI-Realtime compat caveats).
- Designed the entire UI in Claude Design (3 screens + Prompt Lab + Demo Guide), iterated once on density + glyph fixes.
- Ported the design tokens 1:1 into a typed React app (1066-line `index.css`, no Tailwind, no UI lib).
- Implemented the full state machine, synthetic timeline player, voice-session orchestrator scaffold, 4 Netlify Functions.
- 25 unit + component tests + 1 Playwright e2e suite, all passing.
- Pushed public repo, deployed to Netlify, verified `/api/health` returns `mode: live`.

## Phase-2 roadmap (mentioned in the Demo Guide)
- Wire the full mic + AudioWorklet → WS pipeline so the live path drives the same dispatch the synthetic engine uses today.
- RAG over a sales-playbook corpus for grounded coaching citations.
- Manager dashboard rolling up scores across reps + custom-rubric editor.
