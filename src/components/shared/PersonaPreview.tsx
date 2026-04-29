import type { BuiltPersona } from '../../types.ts'

export function PersonaPreview({ persona }: { persona: BuiltPersona }) {
  return (
    <div>
      <div className="label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Persona preview · live</span>
        <span className="mono-mute" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>
          generated from form · {persona.industryLabel.toLowerCase()} · {persona.objectionLabel.toLowerCase()}
        </span>
      </div>
      <div className="persona-preview">
        <div className="pp-avatar">{persona.monogram}</div>
        <div>
          <div className="pp-name">{persona.name}</div>
          <div className="pp-title">{persona.title}</div>
          <div className="pp-section-label">Top pain points</div>
          <div className="pp-pains">
            {persona.pains.map((p, i) => <div key={i} className="pp-pain">{p}</div>)}
          </div>
          <div className="pp-objection">
            <span className="label-inline">Objection signature</span>
            “{persona.objection}”
          </div>
        </div>
      </div>
    </div>
  )
}
