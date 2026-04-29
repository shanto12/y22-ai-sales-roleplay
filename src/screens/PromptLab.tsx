import { useState } from 'react'
import { Hash, Sparkles, Check, Beaker, ChevronDown, ChevronRight } from 'lucide-react'
import { PROMPT_VERSIONS } from '../data/prompt-versions.ts'
import { Modal } from '../components/shared/Modal.tsx'

export function PromptLab() {
  const [activeVer, setActiveVer] = useState(
    PROMPT_VERSIONS.find((p) => p.selected)?.ver ?? PROMPT_VERSIONS[PROMPT_VERSIONS.length - 1].ver,
  )
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [diffOpen, setDiffOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  const toggleExpand = (ver: string) => setExpanded((s) => ({ ...s, [ver]: !s[ver] }))

  const v3 = PROMPT_VERSIONS.find((p) => p.ver.startsWith('v1.3'))
  const v4 = PROMPT_VERSIONS.find((p) => p.ver.startsWith('v1.4'))

  return (
    <div style={{ padding: 20 }}>
      <div className="prompt-lab-head">
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-mute)', fontWeight: 700, marginBottom: 4 }}>Prompt Lab</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Persona: Skeptical mid-market CFO</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
            Versioned prompts · evaluated against the golden objection set (240 turns) · regression-checked vs. last release.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setDiffOpen(true)}><Hash size={13} /> Diff v1.3 → v1.4</button>
          <button className="btn btn-primary" onClick={() => setNewOpen(true)}><Sparkles size={13} /> New version</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="prompt-grid">
        {PROMPT_VERSIONS.map((p, i) => {
          const isActive = activeVer === p.ver
          const isExpanded = !!expanded[p.ver]
          return (
            <div key={p.ver} className={`prompt-col ${isActive ? 'selected' : ''}`}>
              <div className="head">
                <div>
                  <div className="ver">{p.ver}</div>
                  <div className="mono-mute" style={{ fontSize: 10, marginTop: 2 }}>shipped {p.date} · temp 0.7</div>
                </div>
                {isActive ? (
                  <span className="diff-pill easy"><Check size={10} /> ACTIVE</span>
                ) : (
                  <button className="pill-btn" onClick={() => setActiveVer(p.ver)}>Activate</button>
                )}
              </div>
              <pre className={`body-code ${isExpanded ? 'expanded' : ''}`}>{p.body}</pre>
              <button className="expand-link" onClick={() => toggleExpand(p.ver)} aria-expanded={isExpanded}>
                {isExpanded ? <><ChevronDown size={11} /> collapse prompt</> : <><ChevronRight size={11} /> expand prompt</>}
              </button>

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
          )
        })}
      </div>

      <div style={{ marginTop: 18, padding: 14, border: '1px dashed var(--hairline-2)', borderRadius: 6, display: 'flex', gap: 14, alignItems: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
        <Beaker size={16} style={{ color: 'var(--green)' }} />
        <div style={{ flex: 1 }}>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>Prompts as software.</span> Every persona ships a version, an eval, and a regression delta. New prompts must beat the prior version on ≥5 of 8 dimensions before they’re activated.
        </div>
        <span className="mono-mute" style={{ fontSize: 11 }}>policy.md</span>
      </div>

      <Modal open={diffOpen} onClose={() => setDiffOpen(false)} title="Diff · v1.3 → v1.4" width={780}>
        {v3 && v4 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DiffPane title={v3.ver} body={v3.body} side="before" />
            <DiffPane title={v4.ver} body={v4.body} side="after" />
          </div>
        ) : (
          <div>Versions not found.</div>
        )}
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>
          v1.4 adds dry-humor voice rules, sentence-length cap, banned filler words, and explicit temperature/top_p sampling. Eval shifts: rapport <span className="fg-green">+18%</span>, multithreading <span className="fg-green">+13%</span>, talk:listen <span className="fg-green">+13%</span>.
        </div>
      </Modal>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New persona version" width={520}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.55 }}>
          In production, this opens an editor that:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>Forks the latest prompt as a draft.</li>
            <li>Runs the 240-turn golden objection set against it.</li>
            <li>Blocks activation if it loses on more than 3 of 8 dimensions vs. the prior version.</li>
            <li>Stores the version + eval as <span className="mono">y22/persona/&lt;name&gt;@&lt;sha&gt;.yaml</span>.</li>
          </ul>
          <div style={{ marginTop: 14, padding: 10, border: '1px dashed var(--hairline-2)', borderRadius: 6, fontSize: 12 }}>
            <strong style={{ color: 'var(--green)' }}>Phase 2 in this demo.</strong> The eval harness is already structured for it (see <span className="mono">data/prompt-versions.ts</span>).
          </div>
        </div>
      </Modal>
    </div>
  )
}

function DiffPane({ title, body, side }: { title: string; body: string; side: 'before' | 'after' }) {
  return (
    <div style={{ border: '1px solid var(--hairline)', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--hairline)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: side === 'before' ? 'var(--coral)' : 'var(--green)', fontWeight: 600 }}>
        {side === 'before' ? '−' : '+'} {title}
      </div>
      <pre style={{ margin: 0, padding: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, lineHeight: 1.55, color: 'var(--text-dim)', whiteSpace: 'pre-wrap', maxHeight: 360, overflowY: 'auto', background: 'var(--bg)' }}>{body}</pre>
    </div>
  )
}
