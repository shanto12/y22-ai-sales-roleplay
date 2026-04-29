import { useState } from 'react'
import { Sparkles, Copy, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react'
import { PRESETS } from '../data/presets.ts'
import { INDUSTRIES, TITLES, OBJECTIONS } from '../data/behaviors.ts'
import { buildPersona } from '../data/persona-builder.ts'
import { PersonaPreview } from '../components/shared/PersonaPreview.tsx'
import { IntroCard } from '../components/chrome/IntroCard.tsx'
import type { CustomConfig, DifficultyId, IndustryId, ObjectionId, Persona, TitleId } from '../types.ts'

const INDUSTRY_LABEL: Record<IndustryId, string> = {
  saas: 'saas',
  fintech: 'fintech',
  healthcare: 'healthcare',
  realestate: 'real estate',
}

const INTRO_DISMISSED_KEY = 'y22.introDismissed.v1'

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
  const [introDismissed, setIntroDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    try { return localStorage.getItem(INTRO_DISMISSED_KEY) === '1' } catch { return false }
  })
  const [customExpanded, setCustomExpanded] = useState(false)

  const dismissIntro = () => {
    setIntroDismissed(true)
    try { localStorage.setItem(INTRO_DISMISSED_KEY, '1') } catch { /* no-op */ }
  }

  const persona = buildPersona(custom)

  const duplicateFromPreset = () => {
    const p = PRESETS.find((x) => x.id === selectedPreset) ?? PRESETS[0]
    setCustom({
      industry: p.industry,
      title: p.title_key,
      difficulty: p.difficulty,
      objection: p.objection,
    })
    setCustomExpanded(true)
  }

  return (
    <>
      {!introDismissed && <IntroCard onDismiss={dismissIntro} />}
      <div className={`config-shell ${customExpanded ? 'config-expanded' : 'config-presets-only'}`}>
        <div className="preset-column">
          <div className="row-head">
            <div className="title"><span className="num">01</span> Preset buyers</div>
            <span className="mono-mute" style={{ fontSize: 10 }}>3 saved</span>
          </div>
          <div className="preset-rail">
            {PRESETS.map((p) => (
              <PresetCard
                key={p.id}
                preset={p}
                active={selectedPreset === p.id}
                onSelect={() => setSelectedPreset(p.id)}
                onStart={onStart}
              />
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={onStart}
            style={{ width: '100%', marginTop: 14, padding: 14, fontSize: 14, fontWeight: 700, letterSpacing: '0.01em' }}
            data-testid="start-roleplay-cta"
          >
            Start Roleplay <ArrowRight size={16} />
          </button>

          <button
            className="custom-toggle"
            onClick={() => setCustomExpanded((s) => !s)}
            aria-expanded={customExpanded}
            aria-controls="custom-buyer-panel"
            data-testid="custom-toggle"
          >
            {customExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>{customExpanded ? 'Hide custom buyer' : 'Or build a custom buyer'}</span>
            <Sparkles size={12} style={{ color: 'var(--green)', marginLeft: 'auto' }} />
          </button>
        </div>

        {customExpanded && (
          <div className="custom-panel" id="custom-buyer-panel">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div className="row-head" style={{ margin: 0 }}>
                  <div className="title"><span className="num">02</span> Custom buyer</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6 }}>
                  Compose a persona by behavior, not by adjective. Each field shifts the buyer's priorities, language, and objection script.
                </div>
              </div>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} type="button" onClick={duplicateFromPreset}>
                <Copy size={13} /> Duplicate from preset
              </button>
            </div>

            <div className="form-row">
              <div className="label">Industry</div>
              <div className="select" role="radiogroup" aria-label="Industry">
                {INDUSTRIES.map((i) => (
                  <button
                    key={i.id}
                    className={`select-opt ${custom.industry === i.id ? 'active' : ''}`}
                    onClick={() => setCustom({ ...custom, industry: i.id as IndustryId })}
                    role="radio"
                    aria-checked={custom.industry === i.id}
                  >
                    <span className="dot" /> {i.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="label">Buyer title</div>
              <div className="select" role="radiogroup" aria-label="Buyer title">
                {TITLES.map((t) => (
                  <button
                    key={t.id}
                    className={`select-opt ${custom.title === t.id ? 'active' : ''}`}
                    onClick={() => setCustom({ ...custom, title: t.id as TitleId })}
                    role="radio"
                    aria-checked={custom.title === t.id}
                  >
                    <span className="dot" /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row form-row-split">
              <div>
                <div className="label">Difficulty</div>
                <div className="seg diff" role="radiogroup" aria-label="Difficulty">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      className={custom.difficulty === d ? `active ${d}` : ''}
                      onClick={() => setCustom({ ...custom, difficulty: d as DifficultyId })}
                      role="radio"
                      aria-checked={custom.difficulty === d}
                    >
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
                    <button
                      key={o.id}
                      className={`select-opt ${custom.objection === o.id ? 'active' : ''}`}
                      onClick={() => setCustom({ ...custom, objection: o.id as ObjectionId })}
                      role="radio"
                      aria-checked={custom.objection === o.id}
                    >
                      <span className="dot" /> {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <PersonaPreview persona={persona} />

            <button
              className="btn btn-primary"
              onClick={onStart}
              style={{ padding: 14, fontSize: 14, fontWeight: 700, letterSpacing: '0.01em' }}
              data-testid="start-roleplay-custom"
            >
              Start with this buyer <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function PresetCard({ preset, active, onSelect, onStart }: { preset: Persona; active: boolean; onSelect: () => void; onStart: () => void }) {
  return (
    <div
      className={`preset ${active ? 'active' : ''}`}
      role="button"
      tabIndex={0}
      data-testid={`preset-${preset.id}`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
    >
      <div className="avatar">{preset.monogram}</div>
      <div className="body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div className="name">{preset.name}</div>
          <span className={`diff-pill ${preset.difficulty}`}>{preset.difficulty.toUpperCase()}</span>
        </div>
        <div className="profile">{preset.profile}</div>
        <div className="preset-meta">
          <span>{INDUSTRY_LABEL[preset.industry]}</span>
          <span>·</span>
          <span>{preset.title.toLowerCase()}</span>
          {active && (
            <button
              className="preset-start"
              onClick={(e) => { e.stopPropagation(); onStart() }}
              aria-label={`Start roleplay with ${preset.full_name}`}
            >
              Start <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
