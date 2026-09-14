# Y22 Conversation Lab

A browser voice-roleplay studio for practicing discovery, objections, stakeholder alignment, and next steps with a fictional AI buyer.

[Live application](https://y22-ai-sales-roleplay.netlify.app) · [Source](https://github.com/shanto12/y22-ai-sales-roleplay)

![Conversation Lab](docs/portfolio-hero.png)

## What the application does

Choose a preset buyer or configure industry, title, difficulty and objection style. A server-issued ephemeral xAI token connects browser microphone PCM audio to a real-time AI buyer. Captured conversation text drives rolling behavior scoring, optional in-call coaching and a final six-behavior scorecard. Review the transcript and save coaching points for the current session.

The September2026 refresh repairs the provider credential, current Responses API contract, preset/custom consistency, audio-context startup and cumulative transcript handling. Live scores are derived from captured speech; missing credentials, provider errors and incomplete model responses surface as unavailable feedback. They never silently become sample grades.

## Architecture

- React19, TypeScript and Vite for the responsive studio.
- Browser AudioWorklet capture and WebSocket audio transport to xAI; provider keys stay in Netlify Functions.
- Netlify Functions for short-lived voice tokens and streamed scoring/persona requests; scoring uses an explicit nonreasoning model and a bounded timeout.
- In-memory session state and transcript-review UI. This deployment has no account system or persistent customer call storage.
- Unit/component tests and backend failure-path regression tests; CSP, HSTS and restricted browser permissions.

## Evidence and boundaries

Production checks on September14,2026 verified token issuance, genuine two-way provider voice with synthetic microphone input, relevant buyer responses, final AI scoring/coaching, desktop controls and responsive layouts. The release artifact records exact source/deploy IDs and distinguishes automated Chrome from the real-user-profile manual check, which remained pending when that browser connection was unavailable.

The public personas are fictional. A clearly labeled scripted sample is available when voice initialization fails. Prompt Lab is an illustrative comparison of example prompts and sample metrics; it does not run an evaluation harness or change the live voice prompt. Transcript review does not replay recorded audio. Coaching bookmarks last for the session. No external CRM, telephone call, customer messaging, or sales-performance claims are made.

## Development

```bash
npm ci
npm run dev
npm run verify
node --test tests/scoring.test.mjs
npm audit --omit=dev
```

Netlify Functions require server-side `XAI_API_KEY`; `SCORING_MODEL` can select the text model. Use Netlify development tooling for local functions. Browser-only development uses clearly labeled samples when functions are unavailable.

This is an independent demonstration built by Shanto Mathew, not affiliated with or endorsed by Y22 or xAI. No customer data is included.
