// Screen 1 - Configurator
function Configurator({ selectedPreset, setSelectedPreset, custom, setCustom, onStart }) {
  const buildPersona = () => {
    const ind = INDUSTRIES.find(i => i.id === custom.industry);
    const ttl = TITLES.find(t => t.id === custom.title);
    const obj = OBJECTIONS.find(o => o.id === custom.objection);
    // synthesize a name + pains from selections
    const NAMES = {
      vpsales: { name: 'Maya Rodriguez', mono: 'MR' },
      cfo:     { name: 'Sarah Chen', mono: 'SC' },
      procurement: { name: 'Daniel Tran', mono: 'DT' },
      it:      { name: 'Priya Iyer', mono: 'PI' }
    };
    const COMPANIES = { saas: 'Vector Labs', fintech: 'Northwind FinTech', healthcare: 'Helix Health', realestate: 'Lattice Realty Group' };
    const PAINS = {
      'cfo-price':    ['CAC payback creeping past 18 months','Board wants 30% efficiency this year','Already cut 2 vendors this quarter'],
      'cfo-competitor':['Locked into a 3-year vendor contract','Switching costs blocked last review','CFO peers say competitor is plateauing'],
      'cfo-timing':   ['Q3 board review pulled forward','Hiring freeze in effect','Budget reset doesn’t close until Sept'],
      'cfo-feature':  ['Reporting layer can’t roll up to board','No SOC 2 = no signature','Forecast accuracy below 65%'],
      'vpsales-price':['Quota raised 22% YoY','Tools budget under attack','Churn on the rep desk'],
      'vpsales-competitor':['Already using Gong + Salesloft','Two pilots failed last year','Reps refuse another login'],
      'vpsales-timing':['New AE class lands in 6 weeks','Mid-quarter, no QBR slot','Revops team understaffed'],
      'vpsales-feature':['Forecast call still done in spreadsheets','Conversation intel doesn’t map to stages','No multi-thread tracking'],
      'procurement-price':['Three competing bids required','Q4 spend freeze','Legal flagged auto-renew clause'],
      'procurement-competitor':['Incumbent has master MSA already','Switching cost > $40k','No exec sponsor for change'],
      'procurement-timing':['New vendor process takes 9 weeks','Security review backlogged','SOC 2 Type II missing'],
      'procurement-feature':['No SSO = no review','Data residency in EU required','Per-seat pricing model is a non-starter'],
      'it-price':    ['Capex frozen, opex only','Per-seat licensing math doesn’t scale','Existing seat licenses underutilized'],
      'it-competitor':['Single-vendor mandate from CIO','Heavy investment in incumbent stack','Past failed migrations'],
      'it-timing':   ['Mid-replatform on identity','Roadmap locked through Q2','No bandwidth for pilot'],
      'it-feature':  ['SCIM provisioning required','Audit log retention < 1 yr is a no','API rate limit too low']
    };
    const OBJ_LINES = {
      'cfo-price': 'Show me the 90-day payback or I’m not signing.',
      'cfo-competitor': 'We already evaluated this category two years ago.',
      'cfo-timing': 'Come back when the Q3 review closes.',
      'cfo-feature': 'Without board-grade reporting this is a no.',
      'vpsales-price': 'My reps don’t need another tool with a per-seat price tag.',
      'vpsales-competitor': 'We tried Gong. Reps stopped opening it after week 3.',
      'vpsales-timing': 'Ask me again after the new class ramps.',
      'vpsales-feature': 'I need it to write the forecast call, not just record it.',
      'procurement-price': 'Bring me a redlined MSA and a 20% discount.',
      'procurement-competitor': 'Our master MSA blocks adding new tier-2 vendors.',
      'procurement-timing': 'Vendor process is nine weeks. We’re not starting today.',
      'procurement-feature': 'No SOC 2 Type II, no signature.',
      'it-price': 'Capex is frozen — sell me on opex math.',
      'it-competitor': 'CIO has mandated single-vendor for this stack.',
      'it-timing': 'We’re mid-replatform on identity. Not now.',
      'it-feature': 'Without SCIM and SSO this is dead on arrival.'
    };
    const key = `${custom.title}-${custom.objection}`;
    const np = NAMES[custom.title];
    return {
      monogram: np.mono,
      name: np.name,
      title: ttl.label + ' · ' + COMPANIES[custom.industry],
      pains: PAINS[key] || PAINS['cfo-price'],
      objection: OBJ_LINES[key] || OBJ_LINES['cfo-price'],
      industryLabel: ind.label,
      objectionLabel: obj.label
    };
  };
  const persona = buildPersona();

  return (
    <div className="config-shell">
      {/* Left rail: presets */}
      <div>
        <div className="row-head">
          <div className="title"><span className="num">01</span> Preset buyers</div>
          <span className="mono-mute" style={{ fontSize: 10 }}>3 saved</span>
        </div>
        <div className="preset-rail">
          {PRESETS.map(p => (
            <button key={p.id} className={`preset ${selectedPreset === p.id ? 'active' : ''}`} onClick={() => setSelectedPreset(p.id)}>
              <div className="avatar">{p.monogram}</div>
              <div className="body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div className="name">{p.name}</div>
                  <span className={`diff-pill ${p.difficulty}`}>{p.difficulty.toUpperCase()}</span>
                </div>
                <div className="profile">{p.profile}</div>
                <div style={{ display: 'flex', gap: 6, fontSize: 10, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <span>{p.industry === 'fintech' ? 'fintech' : p.industry === 'healthcare' ? 'healthcare' : 'real estate'}</span>
                  <span>·</span>
                  <span>{p.title.toLowerCase()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, padding: 12, border: '1px dashed var(--hairline-2)', borderRadius: 6, fontSize: 12, color: 'var(--text-dim)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Sparkles size={14} style={{ color: 'var(--green)', marginTop: 2 }}/>
          <div>
            <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}>Or build a buyer below</div>
            Custom personas are saved to your library after the first call.
          </div>
        </div>
      </div>

      {/* Right: custom buyer */}
      <div className="custom-panel">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="row-head" style={{ margin: 0 }}>
              <div className="title"><span className="num">02</span> Custom buyer</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6 }}>Compose a persona by behavior, not by adjective. Each field shifts the buyer’s priorities, language, and objection script.</div>
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 12 }}><Copy size={13}/> Duplicate from preset</button>
        </div>

        <div className="form-row">
          <div className="label">Industry</div>
          <div className="select">
            {INDUSTRIES.map(i => (
              <button key={i.id} className={`select-opt ${custom.industry === i.id ? 'active' : ''}`} onClick={() => setCustom({...custom, industry: i.id})}>
                <span className="dot" />{i.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="label">Buyer title</div>
          <div className="select">
            {TITLES.map(t => (
              <button key={t.id} className={`select-opt ${custom.title === t.id ? 'active' : ''}`} onClick={() => setCustom({...custom, title: t.id})}>
                <span className="dot" />{t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
          <div>
            <div className="label">Difficulty</div>
            <div className="seg diff">
              {['easy','medium','hard'].map(d => (
                <button key={d} className={`${custom.difficulty === d ? `active ${d}` : ''}`} onClick={() => setCustom({...custom, difficulty: d})}>{d.toUpperCase()}</button>
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
            <div className="select" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {OBJECTIONS.map(o => (
                <button key={o.id} className={`select-opt ${custom.objection === o.id ? 'active' : ''}`} onClick={() => setCustom({...custom, objection: o.id})}>
                  <span className="dot" />{o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* persona preview */}
        <div>
          <div className="label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Persona preview · live</span>
            <span className="mono-mute" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>generated from form · {persona.industryLabel.toLowerCase()} · {persona.objectionLabel.toLowerCase()}</span>
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

        <button className="btn btn-primary" onClick={onStart} style={{ padding: '14px', fontSize: 14, fontWeight: 700, letterSpacing: '0.01em' }}>
          Start Roleplay <ArrowRight size={16}/>
        </button>
      </div>
    </div>
  );
}

window.Configurator = Configurator;
