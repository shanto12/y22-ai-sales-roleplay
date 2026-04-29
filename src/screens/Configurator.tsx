import { Sparkles, Copy, ArrowRight } from 'lucide-react'
import { PRESETS } from '../data/presets.ts'
import { INDUSTRIES, TITLES, OBJECTIONS } from '../data/behaviors.ts'
import { buildPersona } from '../data/persona-builder.ts'
import { PersonaPreview } from '../components/shared/PersonaPreview.tsx'
import type { CustomConfig, DifficultyId, IndustryId, ObjectionId, TitleId } from '../types.ts'

const INDUSTRY_LABEL: Record<IndustryId, string> = {
  saas: 'saas',
  fintech: 'fintech',
  healthcare: 'healthcare',
  realestate: 'real estate',
}

export function Configurator({
  selectedPreset, setSelectedPreset,
  custom, setCustom, onStart,
}: {
  selectedPreset: string
  setSelectedPreset: (id: string) => void
  custom: CustomConfig
  setCustom: (c: CustomConfig) => void
  onStart: () => void
}) {
  const persona = buildPersona(custom)

  return (
    <div className="config-shell">
      <div>
        <div className="row-head">
          <div className="title"><span className="num">01</span> Preset buyers</div>
          <span className="mono-mute" style={{ fontSize: 10 }}>3 saved</span>
        </div>
        <div className="preset-rail">
          {PRESETS.map((p) => (
            <button key={p.id} className={`preset ${selectedPreset === p.id ? 'active' : ''}`} onClick={() => setSelectedPreset(p.id)}>
              <div className="avatar">{p.monogram}</div>
              <div className="body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div className="name">{p.name}</div>
                  <span className={`diff-pill ${p.difficulty}`}>{p.difficulty.toUpperCase()}</span>
                </div>
                <div className="profile">{p.profile}</div>
                <div style={{ display: 'flex', gap: 6, fontSize: 10, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <span>{INDUSTRY_LABEL[p.industry]}</span>
                  <span>·</span>
                  <span>{p.title.toLowerCase()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, padding: 12, border: '1px dashed var(--hairline-2)', borderRadius: 6, fontSize: 12, color: 'var(--text-dim)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Sparkles size={14} style={{ color: 'var(--green)', marginTop: 2 }} />
          <div>
            <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}>Or build a buyer below</div>
            Custom personas are saved to your library after the first call.
          </div>
        </div>
      </div>

      <div className="custom-panel">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="row-head" style={{ margin: 0 }}>
              <div className="title"><span className="num">02</span> Custom buyer</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6 }}>
              Compose a persona by behavior, not by adjective. Each field shifts the buyer’s priorities, language, and objection script.
            </div>
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} type="button"><Copy size={13} /> Duplicate from preset</button>
        </div>

        <div className="form-row">
          <div className="label">Industry</div>
          <div className="select" role="radiogroup" aria-label="Industry">
            {INDUSTRIES.map((i) => (
              <button key={i.id} className={`select-opt ${custom.industry === i.id ? 'active' : ''}`} onClick={() => setCustom({ ...custom, industry: i.id as IndustryId })}>
                <span className="dot" /> {i.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="label">Buyer title</div>
          <div className="select" role="radiogroup" aria-label="Buyer title">
            {TITLES.map((t) => (
              <button key={t.id} className={`select-opt ${custom.title === t.id ? 'active' : ''}`} onClick={() => setCustom({ ...custom, title: t.id as TitleId })}>
                <span className="dot" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
          <div>
            <div className="label">Difficulty</div>
            <div className="seg diff" role="radiogroup" aria-label="Difficulty">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button key={d} className={custom.difficulty === d ? `active ${d}` : ''} onClick={() => setCustom({ ...custom, difficulty: d as DifficultyId })}>
                  {d.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="tick-row">
              <span>concedes faster</span>
              <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
              <span>holds line</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="label">Objection style</div>
            <div className="select" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }} role="radiogroup" aria-label="Objection style">
              {OBJECTIONS.map((o) => (
                <button key={o.id} className={`select-opt ${custom.objection === o.id ? 'active' : ''}`} onClick={() => setCustom({ ...custom, objection: o.id as ObjectionId })}>
                  <span className="dot" /> {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PersonaPreview persona={persona} />

        <button className="btn btn-primary" onClick={onStart} style={{ padding: 14, fontSize: 14, fontWeight: 700, letterSpacing: '0.01em' }}>
          Start Roleplay <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
