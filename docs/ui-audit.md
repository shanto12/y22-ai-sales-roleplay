# UI element audit — pre-improvements

State of every interactive element after first deploy. ✅ = wired, ❌ = dead, ⚠️ = partially wired.

## TopChrome
- ✅ Roleplay / Prompt Lab / Demo Guide tabs
- ✅ Live status chip (title tooltip)
- ❌ Settings gear (no handler)

## Configurator
- ✅ Preset cards (3) — select preset
- ✅ Industry / Title / Difficulty / Objection radios — update custom config + persona preview
- ✅ Persona preview re-renders live
- ✅ Start Roleplay primary CTA
- ❌ Duplicate from preset button
- ❌ "Or build a buyer below" callout — purely decorative

## LiveCall
- ✅ End call button
- ✅ Live transcript renders
- ✅ Score tiles render with rationale
- ✅ Waveforms animate
- ❌ Use pill on Whisper card
- ❌ Dismiss pill on Whisper card
- ❌ Hold pill on Whisper card (W shortcut not wired)

## Scorecard
- ✅ Score tiles, hero strip, coaching bullets render
- ✅ "Try same persona, harder" button
- ✅ "Run another roleplay" button
- ❌ Play button on "Moment the deal turned" card
- ❌ Bookmark icons on coaching bullets
- ❌ "Full transcript" disclosure (chevron does nothing)

## Prompt Lab
- ❌ "Diff v1.3 → v1.4" header button
- ❌ "New version" header button
- ❌ "Activate" buttons on each version
- ❌ "expand prompt →" links

## Demo Guide
- ❌ Left-rail sidebar items (no scroll to section)
- ✅ Health pills render live from /api/health
- ✅ Walkthrough list renders
- ✅ Cheatsheet renders

## Synthetic mode banner
- ✅ Renders when /api/health returns synthetic

---

## Missing pieces (UX gaps)

- No "how to use this" first-touch guidance.
- No keyboard shortcuts.
- No mobile-friendly layout (hard 1280px min-width).
- Accessibility: no aria-live on the live-updating score tiles; some focus rings invisible against dark bg.
- No way to inspect prompt body in full (truncated with fade).

## After-state target

Every ❌ above becomes ✅. Every interaction has visible, immediate feedback. Mobile users get a stacked layout. Screen readers hear score updates as they happen.
