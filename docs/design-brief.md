# Design Brief — Y22 AI Sales Roleplay Demo

**Target deliverable:** A live deployed web app on Netlify, source on GitHub, that makes Brandon Hurley (founder, Y22 AI) say *"this person gets it"* within 30 seconds of opening it.

**Slug:** `y22-ai-sales-roleplay`

---

## 1. Target interviewer

**Brandon Hurley** — Founder, Y22 AI. Former Penske truck-leasing sales rep → built The Prodigy Group (sales recruiting) → Sales Society (sales talent platform) → now Y22 AI. **Not a prior-exit founder, not an ML person.** Career identity: a manager who watched too many bad reps fail and is productizing what top performers actually do.

His public vocabulary, mirrored in `y22.ai` copy:
- *behaviors that drive deals*
- *winning vs. losing calls*
- *what top performers do differently*
- *reps actually want to use*
- *execute the behaviors*

Personal motto on LinkedIn: **"I will not be outworked."**

What this means for design: **manager-cockpit aesthetic, not ML-research aesthetic.** No "tokens," "embeddings," "prompts," "RAG" surfaced in the UI copy. Use his words: behaviors, calls, reps, coaching, the moment the deal turned. The model name (`grok-voice-think-fast-1.0`) goes in a tooltip / Demo Guide tab, not on the hero.

## 2. The 30-second impress

The single screen that wins this audition: a **live voice roleplay** where Brandon can press one button, talk to a sub-1s-latency AI buyer, and **watch a 6-tile behavior scorecard light up in real time** as he talks — with a Whisper-style coaching ribbon below the call that drops one tactical line when he stumbles. End of call: a 30-second **"moment the deal turned"** clip with a framework citation.

This is the "manager-over-the-shoulder coaching moment" he's been doing manually his whole career, instantiated. It speaks his vocabulary, uses the stack the JD calls out (Grok + structured scoring + voice + eval), and demonstrates the one capability no Y22 competitor has shipped: **expressive, sub-second, multilingual voice roleplay.**

## 3. JD requirements visible on first screen

In priority order — these must be readable without scrolling:

1. **Dynamic AI buyer personas** — config inputs (industry / title / objection style / difficulty) that visibly produce a fresh persona, with the persona card showing pain points + objection scripts the LLM authored.
2. **Voice roleplay, real-time** — call panel with mic indicator, live waveform / VU meter, running transcript.
3. **Behavior-rubric scoring** — 6-tile board lighting up live during the call, mirroring Y22's "28-point framework" public surface.
4. **Whisper-style coaching** — a single-line live coaching strip under the call.
5. **Prompt eval harness (second tab)** — versioned persona prompts, golden objection set, regression scores per version. This answers the JD's "prompt testing, versioning, and temperature optimization" line and signals prompts-as-software.
6. **Full-stack ownership signal** — `/api/health` chip in header showing `live (grok-voice-think-fast-1.0)` or `degraded (synthetic mode)`.

## 4. Product premise (one sentence)

> *Configure a buyer in 10 seconds → talk to them in your browser in <1 second → get scored against a Y22-style behavior rubric live, then a 30-second "moment the deal turned" replay with framework citations.*

## 5. Primary workflow (what the user clicks first)

```
Land on app
  → "Pick a roleplay" panel is the first screen, not a marketing splash
  → Three preset cards visible: "Skeptical mid-market CFO", "Procurement bulldog",
    "Friendly-but-stalling VP Sales" — each shows a one-line difficulty + objection style
  → Click a card OR open "Custom" to use the dropdowns (Industry / Title / Difficulty / Objection)
  → "Start roleplay" button — primary CTA, single click
  → Within 1.5s the call panel takes over the viewport
  → Buyer speaks first (cold, slightly impatient — sets the bar)
  → User talks; live transcript + scorecard tiles + Whisper ribbon update
  → User clicks "End call" OR the buyer ends it after a natural close
  → Scorecard panel takes over: 6 tiles, total + grade, coaching bullets, "moment the deal turned" clip,
    full transcript collapsible, "Try Again (harder)" button
```

Secondary tab in nav: **"Prompt Lab"** — show 3 versions of the persona prompt side-by-side, each with regression scores against a golden objection set. Tertiary tab: **"Demo Guide"** — required by the demo factory protocol; lists `/api/health`, walkthrough, talk tracks, env vars.

## 6. Visual direction

**Aesthetic anchor:** *Gong / Salesloft / Outreach* manager cockpit — dense, dark, professional, telemetry-rich. Not Linear-clean, not Vercel-glassy. Think "this could actually live inside a sales org."

| Token | Direction |
|---|---|
| Mode | Dark by default. Light optional but not first-class. |
| Background | Deep neutral — `#0B0F14`-ish. Not pure black. |
| Surface | Two elevations: panel `#121821`, card `#1A2230`. Subtle 1px hairline borders, never drop-shadows. |
| Accent | One brand accent — a confident **electric green** `#3DDC84`-ish (signals: live, healthy, scoring). Reserve for: live indicators, primary CTA, score-high tiles. |
| Warning / risk | Amber `#F5A524`. Only for score-mid and Whisper-coaching. |
| Failure | Coral red `#F25C66`. Score-low tiles. Used sparingly. |
| Type | UI: Inter (fallback `system-ui`). Monospace for transcripts: JetBrains Mono. |
| Density | High. 14px base. Manager users scan, they don't read. |
| Motion | Restrained. Tiles fill with a 200ms ease, not a spring. No page transitions. The waveform is the only "alive" element. |
| Iconography | Lucide. Stroke 1.5. |

Do **not**:
- Use gradients on the hero.
- Use rounded-3xl bubble cards. Manager cockpits are crisp `rounded-md` (6px).
- Add emoji or playful illustrations.
- Show "AI is thinking..." spinners — show streamed tokens or skeleton tiles.
- Use the words "AI", "LLM", or "model" anywhere in primary UI copy. Use them in the Demo Guide.

## 7. Brand-safety / compliance constraints

- All sample reps, prospects, transcripts are **synthetic**. Add a `Synthetic data — for demo only` chip in the footer. Provenance file at `src/data/sources.ts`.
- No Y22 customer logos used (none are public anyway).
- The xAI Voice Agent docs link goes in the Demo Guide as the "Powered by" credit.
- The repo is public MIT — no employer names from prior confidential engagements anywhere in source.

## 8. Required assets

- 3 preset persona cards (skeptical CFO, procurement bulldog, stalling VP Sales) — short title, one-line objection style, difficulty pill.
- 1 hero waveform component (live mic VU + AI speaking VU, side-by-side).
- 6 behavior-tile icons (Discovery, Objection handling, Value framing, Multithreading, Next-step, Talk-ratio).
- 1 "moment the deal turned" video/audio clip mock — for the synthetic-fallback path it's a static highlighted transcript span.
- 1 architecture diagram for the README + interview pack: Browser ⇆ Netlify Functions ⇆ xAI Voice Agent + xAI Responses API. Single PNG.

## 9. Screenshot / video plan

Three hero screenshots for the README and the resume hero block:
1. **Configurator + presets** — first screen the recruiter sees.
2. **Live call mid-scoring** — 6 tiles, two green / two amber / two red, Whisper ribbon visible, transcript streaming.
3. **Scorecard with "moment the deal turned"** — letter grade, coaching bullets, replay clip card.

One ~30s video clipped from a real local roleplay run, embedded in the README. Captured with the Chrome MCP `gif_creator` after the demo deploys.

## 10. Out-of-scope (call out as Phase 2)

- Real call-recording ingestion + 28-point scoring of past calls.
- Multi-tenant auth / org dashboard.
- LMS integrations (Mindtickle / Lessonly etc.).
- Mobile / native app.
- Manager analytics roll-up across reps.

These belong in the Demo Guide's "Roadmap" section as a credibility signal — Brandon should see I understand the full product surface, not just the slice I built.
