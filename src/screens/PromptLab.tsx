import { Hash, Sparkles, Check, Beaker } from 'lucide-react'
import { PROMPT_VERSIONS } from '../data/prompt-versions.ts'

export function PromptLab() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-mute)', fontWeight: 700, marginBottom: 4 }}>Prompt Lab</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Persona: Skeptical mid-market CFO</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
            Versioned prompts · evaluated against the golden objection set (240 turns) · regression-checked vs. last release.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn"><Hash size={13} /> Diff v1.3 → v1.4</button>
          <button className="btn btn-primary"><Sparkles size={13} /> New version</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {PROMPT_VERSIONS.map((p, i) => (
          <div key={p.ver} className={`prompt-col ${p.selected ? 'selected' : ''}`}>
            <div className="head">
              <div>
                <div className="ver">{p.ver}</div>
                <div className="mono-mute" style={{ fontSize: 10, marginTop: 2 }}>shipped {p.date} · temp 0.7</div>
              </div>
              {p.selected ? (
                <span className="diff-pill easy"><Check size={10} /> ACTIVE</span>
              ) : (
                <button className="pill-btn">Activate</button>
              )}
            </div>
            <pre className="body-code">{p.body}</pre>
            <button className="expand-link">expand prompt →</button>

            <div className="evals">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span className="label" style={{ margin: 0 }}>Eval vs. golden set</span>
                <span className="mono-mute" style={{ fontSize: 10 }}>n=240</span>
              </div>
              <div className="eval-bars">
                {p.bars.map((b, j) => (
                  <div key={j} className={`eval-bar ${b.band}`}>
                    <div className="fill" style={{ height: `${b.v * 100}%` }} />
                    <div className="lbl">{Math.round(b.v * 100)}</div>
                  </div>
                ))}
              </div>
              <div className="eval-legend">
                {p.bars.map((b, j) => <div key={j}>{b.lbl}</div>)}
              </div>
            </div>

            <div className="regression">
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-mute)', fontWeight: 700, marginBottom: 4 }}>
                Regression vs. {i === 0 ? 'baseline' : PROMPT_VERSIONS[i - 1].ver.split(' ')[0]}
              </div>
              {!p.delta ? (
                <div className="reg-line"><span className="mono-mute">— baseline —</span></div>
              ) : (
                Object.entries(p.delta).map(([k, v]) => {
                  const up = v.startsWith('+')
                  return (
                    <div key={k} className="reg-line">
                      <span className="mono-mute">{k}</span>
                      <span className={`v ${up ? 'fg-green' : 'fg-coral'}`}>{v}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: 14, border: '1px dashed var(--hairline-2)', borderRadius: 6, display: 'flex', gap: 14, alignItems: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
        <Beaker size={16} style={{ color: 'var(--green)' }} />
        <div style={{ flex: 1 }}>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>Prompts as software.</span> Every persona ships a version, an eval, and a regression delta. New prompts must beat the prior version on ≥5 of 8 dimensions before they’re activated.
        </div>
        <span className="mono-mute" style={{ fontSize: 11 }}>policy.md</span>
      </div>
    </div>
  )
}
