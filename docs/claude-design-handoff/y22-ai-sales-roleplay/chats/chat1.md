# Y22 Roleplay

_Started 2026-04-29 22:09 UTC_

---

## User

Design a high-fidelity, dark-mode web app called **Y22 Roleplay** — an in-browser voice-driven AI sales-roleplay cockpit. The audience is a sales-training founder (former rep, manager mindset, vocabulary is "behaviors / what top performers do / the moment the deal turned", NOT "AI / LLM / model"). The aesthetic is the manager-cockpit feel of Gong / Salesloft / Outreach: dense, dark, telemetry-rich, professional. Not Linear-clean, not Vercel-glassy.

## Visual system
- Background `#0B0F14`. Panel `#121821`. Card `#1A2230`. 1px hairline borders `#222C3A`, never drop-shadows.
- Single accent: electric green `#3DDC84` for live indicators, primary CTA, score-high tiles.
- Amber `#F5A524` for score-mid + Whisper coaching. Coral red `#F25C66` for score-low.
- Typography: Inter for UI, JetBrains Mono for transcripts. 14px base. High density.
- Iconography: Lucide, stroke 1.5, rounded-md (6px) corners — never rounded-3xl.
- Motion: restrained 200ms ease tile fills. No springs, no page transitions. Only the live waveform animates continuously.

## Top app chrome
- Left: Y22 wordmark (small) + "Roleplay" tab, "Prompt Lab" tab, "Demo Guide" tab.
- Right: a small live-status chip — green dot + "Live · grok-voice-think-fast-1.0" — and a "Synthetic data — demo only" pill.

## Screen 1 — Configurator (the landing screen)
Left third = tall left rail with three preset cards stacked vertically. Each preset card shows: title (e.g. "Skeptical mid-market CFO"), one-line behavioral profile ("data-driven, ROI-obsessed, won't agree without numbers"), a difficulty pill (Easy / Medium / Hard), and a tiny avatar monogram. Selected card has a subtle electric-green left border.

Right two-thirds = "Custom buyer" panel — four dense form rows: Industry (SaaS / FinTech / Healthcare / Real Estate), Buyer Title (VP Sales / CFO / Procurement Manager / IT Director), Difficulty (3-position segmented control), Objection Style (Price-focused / Competitor-loyal / Timing-budget / Feature-gaps). Below the form: a live "Persona preview" card that updates as the form changes, showing the buyer's name, title, top 3 pain points, and a one-line objection signature — like a CRM record. Big primary CTA at bottom: **"Start Roleplay →"** electric-green, full width of the right panel.

## Screen 2 — Live Call (takes over viewport once roleplay starts)
Header bar: "Speaking with **Sarah Chen, VP of Sales · Northwind FinTech**" + an "End call" pill (coral red).

Main area is a 3-row stack:

Row A: Two opposing waveform halos — left = user mic (green when speaking, dim otherwise) with a small "you" label; right = AI buyer (amber when speaking) with a "Sarah" label and a tiny voice tag chip ("voice: Eve · grok-voice-think-fast-1.0"). Between them, a live elapsed-time counter "01:24 / ~05:00".

Row B: **Behavior Scorecard**, the single most important visual element. SIX TILES in a 3×2 grid:
1. Discovery Depth
2. Objection Acknowledgement
3. Value Framing
4. Multithreading
5. Next-Step Specificity
6. Talk:Listen Ratio

Each tile shows: behavior name, a 1–5 number that fills in over the call, a tiny one-line LLM-judge rationale streaming below, and a colored side-stripe (green/amber/coral) reflecting current score. As the call progresses, tiles light up in real time — show the second screenshot variant with two green, two amber, two coral. Use a thin pulsing border on the tile that just updated.

Row C: Two columns side by side. Left = live transcript, JetBrains Mono, "user" lines in plain text and "buyer" lines indented + amber accent. Right = **Whisper Coaching** ribbon: a single tactical line of mid-call advice with an amber dot ("Try: ask what changed in their budget cycle") and a small "Use" / "Dismiss" pair of pills. Empty state when nothing to whisper.

## Screen 3 — Scorecard (after call ends)
Top: a horizontal hero strip — "Total **22 / 30** · Grade **B+**" on the left, and on the right a "Moment the deal turned" card with a 30-second waveform clip preview, a play-button, and a one-line caption ("00:52 — when she said 'we already have a vendor', you reframed instead of discounting").

Middle: the same 6 behavior tiles from the call, now with final scores, expanded to show 2-line LLM-judge rationale per tile + a small "Compare to top 10%" delta chip on each (e.g. "+0.4 vs. top reps").

Bottom: three coaching bullets in plain language ("When she challenged ROI, lead with the 90-day payback line before any discount") — each with a "save to playbook" bookmark icon. Below, a collapsed "Full transcript" disclosure with a small chevron. Two trailing CTAs: secondary "Try same persona, harder" and primary "Run another roleplay".

## Tab 2 — Prompt Lab (separate sub-screen, accessed via top nav)
A 3-column layout: each column shows a different version of the persona system prompt (`v1.2 baseline`, `v1.3 +objection script`, `v1.4 +personality`). Each column has the prompt body in monospace (truncated with "expand"), a small chip strip showing eval scores against a "golden objection set" (8 mini bars: Discovery / Objection / Closing etc.), and a regression delta vs. the previous version (e.g. "+12% objection handling, –3% rapport"). Selected version glows green. Demonstrates I treat prompts as software with versioning, evals, and regressions — directly answering the JD's "prompt versioning + temperature optimization" line.

## Tab 3 — Demo Guide
Standard sidebar list: System status (live `/api/health` chips: voice / scoring / persona generation), Recommended walkthrough (numbered list), Configuration cheatsheet (env vars), and 90s / 5min / 15min talk-track shortcuts. Plain and informational — this is for recruiters opening the link cold.

## Empty states / details to design
- A "calibrating mic..." state for first-time users (1.5s).
- A "synthetic mode" banner that appears across the top in red-amber when `XAI_API_KEY` is missing, saying "Live voice unavailable — playing canned roleplay. Add `XAI_API_KEY` to enable Grok."
- The waveform should look real (50+ vertical bars, not 8).
- Score tiles should never have empty placeholder values — show a thin baseline bar at 0 instead.

## Don'ts
- No emoji in primary UI.
- No "AI is thinking" spinners — show streamed tokens or skeleton tiles.
- No gradients on the hero.
- No "AI", "LLM", "model" in the primary copy outside the live-status chip and Demo Guide.
- No drop-shadows.

Generate the full hi-fi prototype with all three tabs and the three call states (configurator → live call mid-roleplay → scorecard). Make Screen 2 (Live Call mid-roleplay with the 6-tile scorecard lighting up) the hero / featured screen.

## Assistant

I'll build this as a single hi-fi prototype with the three call states exposed as Tweaks, plus the two sub-tabs. Screen 2 (Live Call) will be the default hero view.

_[tool: update_todos]_

_[tool: copy_starter_component]_

I'll commit to the brief's exact aesthetic — Inter + JetBrains Mono, the specified hex palette, dense telemetry feel, no gradients, no shadows, hairline borders only. Let me build this in modular JSX files.

_[tool: write_file]_

_[tool: write_file]_

Now let me build the data model and the live call hero screen.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

## Assistant

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Built **Y22 Roleplay** — hi-fi dark-mode cockpit with all three call states + Prompt Lab + Demo Guide.

**Default view: Screen 2 (Live Call hero)** — speaking with Sarah Chen, dual 56-bar waveforms (buyer animating amber), 3×2 behavior scorecard with the requested 2 green / 2 amber / 2 coral split + one tile pulsing on update, mono transcript with indented amber buyer lines, whisper coaching ribbon with Use/Dismiss.

**Tweaks panel** (toolbar toggle) switches between:
- Configure / Live / Scorecard
- Roleplay / Prompt Lab / Demo Guide tabs
- User/buyer speaking, whisper visibility, calibrating overlay, synthetic-mode banner

Built per spec: `#0B0F14` / `#121821` / `#1A2230`, hairlines only (no shadows), single electric-green accent, Inter + JetBrains Mono, Lucide stroke 1.5, no emoji, no gradients, no "AI/LLM" copy outside the live chip and Demo Guide.

## User

Verifier agent check completed

## Assistant

_[tool: snip]_

_[tool: read_file]_

Confirmed — `useTweaks` returns a tuple. Fixing app.jsx.

_[tool: write_file]_

_[tool: snip]_

_[tool: done]_

Fixed — `useTweaks` is a tuple, swapped to `const [tweaks, setTweak] = useTweaks(...)` and updated all reads/writes accordingly. All three tabs and three call states render now.

## User

Two iteration passes — please apply both:

## Pass 1 — Fix unicode escapes (BLOCKING)
Right now strings like `Live · grok-voice-think-fast-1.0`, `SYNTHETIC DATA — DEMO ONLY`, `YOU · MIC`, `input · 48 kHz · –11.2 dB`, `BEHAVIOR SCORECARD · LIVE`, and `Sarah Chen, VP of Finance · Northwind FinTech` are rendering with the literal escape codes visible. The escapes were embedded as plain text inside JSX string children rather than as actual code points.

Fix by **replacing every `·` / `·` with the literal Unicode character `·` (U+00B7), every `—` with `—` (U+2014), and every `–` with `–` (U+2013) directly inside the JSX**. Do this across all 7 screens — `screen-config.jsx`, `screen-live.jsx`, `screen-scorecard.jsx`, `screen-promptlab.jsx`, `screen-guide.jsx`, `app.jsx`, and `tweaks-panel.jsx`. After the change, no `\u` escape should appear anywhere except inside actual JS string-literal contexts (where they're real escape sequences). Verify by re-rendering and confirming the header reads `Sarah Chen, VP of Finance · Northwind FinTech`.

## Pass 2 — Density and hierarchy polish

Three small but high-leverage changes:

1. **Header status chip is too tall and wraps onto multiple lines** ("Live · grok-voice-think-fast-1.0" wrapping). After unicode fix, also: shrink the chip to one line at 12px, single-line text, no line break. Same for the "SYNTHETIC DATA — DEMO ONLY" pill — should be one line.

2. **Behavior tile rationale text is truncating** ("Acknowledged her ROI doubt; di…" cut off). Increase the tile minimum width or allow a 2-line wrap so the rationale fully reads. The tile rationale is the most important coaching surface — never truncate it.

3. **Live elapsed-time counter** ("01:24 / ~0…") is also being cut off on the right edge. Keep the counter visible without horizontal overflow — pin it inside the call card with proper right padding rather than letting it hang off the edge.

Don't change colors, layout structure, or fonts. Just unicode → glyph substitution + the three density fixes. Keep all 3 call states (Configure / Live / Scorecard) and all 3 top-nav tabs (Roleplay / Prompt Lab / Demo Guide) intact.

## Assistant

_[tool: snip]_

_[tool: grep]_

The issue: JSX text children like `\u00b7` are interpreted as the literal 6-character sequence, not a code point. I'll do a sweep replacing every escape with the actual glyph across all files using run_script.

_[tool: run_script]_

_[tool: snip]_

Now Pass 2 — density fixes for the chip, tile rationale, and timer.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Both passes applied:

**Pass 1** — All `\u00b7`, `\u2014`, `\u2013`, `\u2026`, `\u2019`, `\u201c`, `\u201d`, `\u2192` escapes across all 7 JSX/data files replaced with their actual Unicode glyphs. Header now reads `Sarah Chen, VP of Finance · Northwind FinTech` correctly.

**Pass 2**:
1. Live-status chip pinned to `height: 26px`, `white-space: nowrap`, JetBrains Mono, single line. Synthetic pill matched at the same height/baseline.
2. Tile rationale: `min-height: 32px`, `word-break: break-word`, `white-space: normal` — no more truncation.
3. Timer pill flex-shrink locked, call-row padding bumped to 24px so it doesn't clip the right edge.

