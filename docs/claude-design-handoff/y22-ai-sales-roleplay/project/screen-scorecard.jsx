// Screen 3 - Scorecard (post-call)
function Scorecard({ persona }) {
  const total = Object.values(FINAL_SCORES).reduce((s, v) => s + v.score, 0);
  // 4+4+4+3+4+3 = 22 / 30
  const clipBars = makeWaveBars(72, 7);
  const playedThru = 0.4;

  const coaching = [
    { em: 'When she challenged ROI', text: ', lead with the 90-day payback line ', emEnd: 'before any discount.' },
    { em: 'Multithread earlier', text: ' — ask for the CRO’s name in the discovery turn, not the close.' },
    { em: 'Cut your talk:listen', text: ' to 50/50 before minute 2. Ask, then count to three.' }
  ];

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hero strip */}
      <div className="hero-strip">
        <div className="hero-total">
          <div className="l">Final score · Sarah Chen · 04:58</div>
          <div className="v">
            <span><span className="n">{total}</span> <span className="max">/ 30</span></span>
            <span style={{ width: 1, height: 36, background: 'var(--hairline-2)' }} />
            <span className="grade-letter">B+</span>
          </div>
          <div className="grade">
            <span style={{ color: 'var(--text-mute)' }}>top-10% threshold</span>
            <span className="mono" style={{ color: 'var(--text)' }}>26 / 30</span>
            <span style={{ color: 'var(--text-mute)' }}>· you’re 4 behaviors away</span>
          </div>
        </div>

        <div className="moment-card">
          <button className="play-btn"><Play size={16}/></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)' }}>Moment the deal turned</div>
              <div className="mono-mute" style={{ fontSize: 10 }}>00:52 → 01:22 · 30s clip</div>
            </div>
            <div className="clip-wave">
              {clipBars.map((b, i) => (
                <div key={i} className={`b ${i / clipBars.length < playedThru ? 'played' : ''}`} style={{ height: Math.max(3, b * 28) + 'px' }} />
              ))}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.4 }}>
              <span className="mono" style={{ color: 'var(--green)' }}>00:52</span> — when she said “we already have a vendor”, you reframed instead of discounting.
            </div>
          </div>
        </div>
      </div>

      {/* Tiles */}
      <div>
        <div className="row-head">
          <div className="title"><span className="num">01</span> Final behavior breakdown</div>
          <span className="mono-mute" style={{ fontSize: 11 }}>baseline = avg of last 200 calls in your team’s library</span>
        </div>
        <div className="tiles-grid">
          {BEHAVIORS.map(b => <ScoreTileFinal key={b.id} b={b} score={FINAL_SCORES[b.id]} />)}
        </div>
      </div>

      {/* Coaching */}
      <div>
        <div className="row-head">
          <div className="title"><span className="num">02</span> Coaching for the next call</div>
          <span className="mono-mute" style={{ fontSize: 11 }}>3 actions · ranked by score lift</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {coaching.map((c, i) => (
            <div key={i} className="coach-bullet">
              <div className="idx">0{i+1}</div>
              <div className="body"><span className="em">{c.em}</span>{c.text}<span className="em" style={{ color: 'var(--text)' }}>{c.emEnd || ''}</span></div>
              <button className="save" title="Save to playbook"><Bookmark size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="disclosure">
        <div className="disclosure-head">
          <ChevronRight size={14} className="chev"/>
          <span style={{ color: 'var(--text)' }}>Full transcript</span>
          <span style={{ marginLeft: 'auto' }} className="mono-mute">04:58 · 18 turns · 1,243 words</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button className="btn">Try same persona, harder</button>
        <button className="btn btn-primary">Run another roleplay <ArrowRight size={14}/></button>
      </div>
    </div>
  );
}

window.Scorecard = Scorecard;
