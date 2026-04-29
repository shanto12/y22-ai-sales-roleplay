import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { HealthResponse } from '../types.ts'

const SECTIONS = [
  { id: 'system-status', label: 'System status' },
  { id: 'walkthrough', label: 'Recommended walkthrough' },
  { id: 'cheatsheet', label: 'Configuration cheatsheet' },
  { id: 'shortcuts', label: 'Talk-track shortcuts' },
] as const

export function DemoGuide({ health, onOpenHelp }: { health: HealthResponse; onOpenHelp?: () => void }) {
  const voice = health.capabilities.voice.live
  const score = health.capabilities.scoring.live
  const persona = health.capabilities.persona.live
  const synth = health.syntheticReady

  const [activeSection, setActiveSection] = useState<string>('system-status')

  const goTo = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="demo-guide-shell">
      <aside className="guide-side" aria-label="Demo guide navigation">
        <div className="label">On this page</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              className={`guide-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => goTo(s.id)}
              aria-current={activeSection === s.id ? 'true' : undefined}
            >
              <span className="num">0{i + 1}</span> {s.label}
            </button>
          ))}
        </div>
        <div style={{ padding: 12, border: '1px solid var(--hairline)', borderRadius: 6, fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          <div style={{ color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, marginBottom: 6 }}>// for recruiters</div>
          This page is plain on purpose. Open it cold and you should be able to demo Y22 in under 10 minutes.
        </div>
      </aside>

      <main className="guide-main">
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Demo Guide</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 28 }}>
          Built so a recruiter can press play and see what good looks like. No login, no setup, no API key needed for the canned path.
        </div>

        <section id="system-status" style={{ marginBottom: 32 }}>
          <div className="row-head"><div className="title"><span className="num">01</span> System status</div></div>
          <div className="panel">
            <HealthRow
              title="Voice loop"
              meta={`POST /api/mint-token + WSS /v1/realtime · ${health.model}`}
              status={voice ? 'ok' : 'warn'}
              text={voice ? `200 OK · ${health.capabilities.voice.p50_ms}ms p50` : 'synthetic — no XAI_API_KEY'}
            />
            <HealthRow
              title="Behavior scoring"
              meta={`POST /api/score · 6-tile rubric · ${health.scoringModel}`}
              status={score ? 'ok' : 'warn'}
              text={score ? `200 OK · ${health.capabilities.scoring.p50_ms}ms p50` : 'synthetic timeline'}
            />
            <HealthRow
              title="Persona generation"
              meta="POST /api/persona · from custom-buyer form"
              status={persona ? 'ok' : 'warn'}
              text={persona ? `200 OK · cold-start ${health.capabilities.persona.cold_p50_ms}ms` : 'local builder'}
            />
            <HealthRow
              title="Synthetic fallback"
              meta="canned roleplay · used when XAI_API_KEY missing"
              status={synth ? 'ok' : 'down'}
              text={synth ? 'ready' : 'unavailable'}
            />
          </div>
        </section>

        <section id="walkthrough" style={{ marginBottom: 32 }}>
          <div className="row-head"><div className="title"><span className="num">02</span> Recommended walkthrough</div></div>
          <ol style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { t: 'Pick the CFO preset', s: 'Hardest persona. Shows objection handling, not happy-path discovery.' },
              { t: 'Click Start Roleplay (or press Enter)', s: 'Mic calibrates for 1.2s, then live waveform engages.' },
              { t: 'Watch the 6-tile scorecard fill in', s: 'Each tile updates with a one-line LLM-judge rationale.' },
              { t: 'Use, dismiss, or hold the Whisper coaching', s: 'The pill that lights amber is your real-time copilot.' },
              { t: 'End call → land on Scorecard', s: 'Press Esc, or click End call. See the moment the deal turned and 3 coaching bullets.' },
              { t: 'Open Prompt Lab', s: 'Show that personas are versioned + evaluated, not vibe-prompted.' },
            ].map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 14, padding: 12, border: '1px solid var(--hairline)', borderRadius: 6, background: 'var(--card)' }}>
                <div className="mono" style={{ fontSize: 12, color: 'var(--green)', width: 28 }}>0{i + 1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{s.s}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="cheatsheet" style={{ marginBottom: 32 }}>
          <div className="row-head"><div className="title"><span className="num">03</span> Configuration cheatsheet</div></div>
          <pre className="cheatsheet">
{`# .env.local
`}<span className="cmt">{`# Required for live voice. Without it, Y22 falls back to canned mode.
`}</span><span className="var">XAI_API_KEY</span>={`            `}<span className="val">sk-xai-***</span>{`
`}<span className="var">GROK_VOICE_MODEL</span>={`       `}<span className="val">grok-voice-think-fast-1.0</span>{`
`}<span className="var">SCORING_MODEL</span>={`          `}<span className="val">grok-3</span>{`

`}<span className="cmt">{`# Optional`}</span>{`
`}<span className="var">XAI_API_BASE_URL</span>={`     `}<span className="val">https://api.x.ai/v1</span>
          </pre>
        </section>

        <section id="shortcuts" style={{ marginBottom: 32 }}>
          <div className="row-head">
            <div className="title"><span className="num">04</span> Talk-track shortcuts</div>
            {onOpenHelp && (
              <button className="mono-mute" style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer' }} onClick={onOpenHelp}>
                see all keyboard shortcuts →
              </button>
            )}
          </div>
          <div className="shortcuts">
            <div className="track">
              <div className="dur">90s</div>
              <div className="meta"><div className="t">Lightning demo</div><div className="s">Hero screen → 1 reframe → scorecard.</div></div>
              <ChevronRight size={14} style={{ color: 'var(--text-mute)' }} />
            </div>
            <div className="track">
              <div className="dur">5m</div>
              <div className="meta"><div className="t">Hiring-manager pitch</div><div className="s">Full call + Prompt Lab regression story.</div></div>
              <ChevronRight size={14} style={{ color: 'var(--text-mute)' }} />
            </div>
            <div className="track">
              <div className="dur">15m</div>
              <div className="meta"><div className="t">Engineering deep-dive</div><div className="s">Rubric → LLM-judge prompts → evals → CSP + secret boundary.</div></div>
              <ChevronRight size={14} style={{ color: 'var(--text-mute)' }} />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function HealthRow({ title, meta, status, text }: { title: string; meta: string; status: 'ok' | 'warn' | 'down'; text: string }) {
  return (
    <div className="health-row">
      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div className="mono-mute" style={{ fontSize: 11 }}>{meta}</div>
      </div>
      <div className={`health-status ${status}`}><span className="dot" /> {text}</div>
    </div>
  )
}
