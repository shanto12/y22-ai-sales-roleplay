// Tab: Demo Guide
function DemoGuide() {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 49px)' }}>
      <aside className="guide-side">
        <div className="label">On this page</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
          <div className="guide-item active"><span className="num">01</span> System status</div>
          <div className="guide-item"><span className="num">02</span> Recommended walkthrough</div>
          <div className="guide-item"><span className="num">03</span> Configuration cheatsheet</div>
          <div className="guide-item"><span className="num">04</span> Talk-track shortcuts</div>
        </div>
        <div style={{ padding: 12, border: '1px solid var(--hairline)', borderRadius: 6, fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          <div style={{ color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, marginBottom: 6 }}>// for recruiters</div>
          This page is plain on purpose. Open it cold and you should be able to demo Y22 in under 10 minutes.
        </div>
      </aside>

      <main style={{ flex: 1, padding: '24px 32px', maxWidth: 880 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Demo Guide</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 28 }}>Built so a recruiter can press play and see what good looks like. No login, no setup, no API key needed for the canned path.</div>

        <section style={{ marginBottom: 32 }}>
          <div className="row-head"><div className="title"><span className="num">01</span> System status</div></div>
          <div className="panel">
            <div className="health-row">
              <div>
                <div style={{ fontWeight: 600 }}>Voice loop</div>
                <div className="mono-mute" style={{ fontSize: 11 }}>POST /api/voice/turn · grok-voice-think-fast-1.0</div>
              </div>
              <div className="health-status ok"><span className="dot" /> 200 OK · 320ms p50</div>
            </div>
            <div className="health-row">
              <div>
                <div style={{ fontWeight: 600 }}>Behavior scoring</div>
                <div className="mono-mute" style={{ fontSize: 11 }}>POST /api/score · 6-tile rubric · LLM-judge</div>
              </div>
              <div className="health-status ok"><span className="dot" /> 200 OK · 480ms p50</div>
            </div>
            <div className="health-row">
              <div>
                <div style={{ fontWeight: 600 }}>Persona generation</div>
                <div className="mono-mute" style={{ fontSize: 11 }}>POST /api/persona · from custom-buyer form</div>
              </div>
              <div className="health-status warn"><span className="dot" /> 200 OK · cold-start 1.4s</div>
            </div>
            <div className="health-row">
              <div>
                <div style={{ fontWeight: 600 }}>Synthetic fallback</div>
                <div className="mono-mute" style={{ fontSize: 11 }}>5 canned roleplays loaded · used when XAI_API_KEY missing</div>
              </div>
              <div className="health-status ok"><span className="dot" /> ready</div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <div className="row-head"><div className="title"><span className="num">02</span> Recommended walkthrough</div></div>
          <ol style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { t: 'Pick the CFO preset', s: 'Hardest persona. Shows objection handling, not happy-path discovery.' },
              { t: 'Click Start Roleplay', s: 'Mic calibrates for 1.5s, then live waveform engages.' },
              { t: 'Watch the 6-tile scorecard fill in', s: 'Each tile updates every 8–12s with a one-line LLM-judge rationale.' },
              { t: 'Reframe the “we already have a vendor” objection', s: 'This is the moment the demo turns. Whisper coaches you in real time.' },
              { t: 'End call → land on Scorecard', s: 'See the “moment the deal turned” clip + 3 coaching bullets.' },
              { t: 'Open Prompt Lab', s: 'Show that personas are versioned + evaluated, not vibe-prompted.' }
            ].map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 14, padding: 12, border: '1px solid var(--hairline)', borderRadius: 6, background: 'var(--card)' }}>
                <div className="mono" style={{ fontSize: 12, color: 'var(--green)', width: 28 }}>0{i+1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{s.s}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section style={{ marginBottom: 32 }}>
          <div className="row-head"><div className="title"><span className="num">03</span> Configuration cheatsheet</div></div>
          <div className="cheatsheet">
{`# .env.local
`}<span className="cmt">{`# Required for live voice. Without it, Y22 falls back to canned mode.
`}</span><span className="var">XAI_API_KEY</span>={`            `}<span className="val">sk-xai-***</span>{`
`}<span className="var">GROK_VOICE_MODEL</span>={`       `}<span className="val">grok-voice-think-fast-1.0</span>{`
`}<span className="var">GROK_VOICE_TEMPERATURE</span>={` `}<span className="val">0.7</span>{`
`}<span className="var">SCORING_MODEL</span>={`          `}<span className="val">grok-3</span>{`
`}<span className="var">SCORING_RUBRIC</span>={`         `}<span className="val">y22/rubric.v6.yaml</span>{`

`}<span className="cmt">{`# Optional`}</span>{`
`}<span className="var">WHISPER_LATENCY_MS</span>={`    `}<span className="val">800</span>{`
`}<span className="var">DEMO_MODE</span>={`              `}<span className="val">false</span>{`   `}<span className="cmt">{`# force canned`}</span>
          </div>
        </section>

        <section>
          <div className="row-head"><div className="title"><span className="num">04</span> Talk-track shortcuts</div></div>
          <div className="shortcuts">
            <div className="track">
              <div className="dur">90s</div>
              <div className="meta">
                <div className="t">Lightning demo</div>
                <div className="s">Hero screen → 1 reframe → scorecard.</div>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-mute)' }}/>
            </div>
            <div className="track">
              <div className="dur">5m</div>
              <div className="meta">
                <div className="t">Hiring-manager pitch</div>
                <div className="s">Full call + Prompt Lab regression story.</div>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-mute)' }}/>
            </div>
            <div className="track">
              <div className="dur">15m</div>
              <div className="meta">
                <div className="t">Engineering deep-dive</div>
                <div className="s">Rubric YAML → LLM-judge prompts → evals.</div>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-mute)' }}/>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

window.DemoGuide = DemoGuide;
