// Screen 2 - Live Call (HERO)
function LiveCall({ persona, userActive, aiActive, scores, showCalibrating, whisper }) {
  return (
    <div className="panel" style={{ position: 'relative', margin: 16, overflow: 'hidden' }}>
      {showCalibrating && (
        <div className="calibrating">
          <div className="box">
            <div className="ring" />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Calibrating mic…</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>Speak normally for a moment.</div>
          </div>
        </div>
      )}

      <div className="call-header">
        <div>
          <div className="title">
            Speaking with <strong>{persona.full_name}, {persona.title} · {persona.company}</strong>
          </div>
          <div className="meta">
            <span className="diff-pill hard" style={{ marginRight: 10 }}>HARD</span>
            Persona profile: {persona.profile}
          </div>
        </div>
        <button className="btn btn-coral">
          <PhoneOff size={14}/> End call
        </button>
      </div>

      {/* Row A - waveforms */}
      <div className="call-row-a">
        <div className="wave-side l">
          <div className="who"><span className="dot" /> You · mic</div>
          <Waveform side="l" active={userActive} count={56} />
          <div className="voice-tag">input · 48 kHz · –11.2 dB</div>
        </div>

        <div className="timer-pill">
          <span className="now">01:24</span> <span style={{ color: 'var(--text-mute)' }}>/ ~05:00</span>
        </div>

        <div className="wave-side r">
          <div className="who" style={{ flexDirection: 'row-reverse' }}><span className="dot" /> {persona.full_name.split(' ')[0]} · buyer</div>
          <Waveform side="r" active={aiActive} count={56} seedOffset={42} />
          <div className="voice-tag">voice: Eve · grok-voice-think-fast-1.0</div>
        </div>
      </div>

      {/* Row B - scorecard */}
      <div className="call-row-b">
        <div className="row-head">
          <div className="title"><span className="num">01</span> Behavior Scorecard · live</div>
          <div className="mono-mute" style={{ fontSize: 11 }}>updated 0.4s ago · 6 of 6 behaviors</div>
        </div>
        <div className="tiles-grid">
          {BEHAVIORS.map(b => <ScoreTile key={b.id} b={b} score={scores[b.id]} />)}
        </div>
      </div>

      {/* Row C - transcript + whisper */}
      <div className="call-row-c">
        <div className="call-col">
          <div className="col-head">
            <span><span className="num" style={{ display: 'inline-grid', placeItems: 'center', width: 18, height: 18, border: '1px solid var(--hairline)', borderRadius: 4, background: 'var(--card)', color: 'var(--text-dim)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', marginRight: 8 }}>02</span>Live transcript</span>
            <span className="mono-mute" style={{ fontSize: 10 }}>auto-scroll on</span>
          </div>
          <div className="transcript">
            {TRANSCRIPT.map((line, i) => (
              <div key={i} className={`line ${line.who}`}>
                <span className="timestamp">{line.t}</span>
                <span className="speaker">{line.who === 'user' ? 'you' : 'sarah'}</span>
                {line.text}
              </div>
            ))}
            <div className="line user" style={{ color: 'var(--text-mute)' }}>
              <span className="timestamp">01:24</span>
              <span className="speaker">you</span>
              <span style={{ borderRight: '2px solid var(--green)', paddingRight: 2 }}>That’s fair. The reason it shelf-warmed — was it the workflow, the cost, or that the coaching wasn’t actually changing</span>
            </div>
          </div>
        </div>

        <div className="call-col">
          <div className="col-head">
            <span><span className="num" style={{ display: 'inline-grid', placeItems: 'center', width: 18, height: 18, border: '1px solid var(--hairline)', borderRadius: 4, background: 'var(--card)', color: 'var(--text-dim)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', marginRight: 8 }}>03</span>Whisper coaching</span>
            <span className="mono-mute" style={{ fontSize: 10 }}>2 used · 1 dismissed</span>
          </div>
          <div className="whisper">
            {whisper ? (
              <div className="whisper-card">
                <div className="dot" />
                <div className="body">
                  <div className="label">MID-CALL TIP · 01:24</div>
                  <div className="text">{whisper.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>// {whisper.reason}</div>
                  <div className="actions">
                    <button className="pill-btn use">Use</button>
                    <button className="pill-btn">Dismiss</button>
                    <button className="pill-btn" style={{ marginLeft: 'auto' }}>Hold <span className="kbd" style={{ marginLeft: 4 }}>W</span></button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', placeItems: 'center', flex: 1, color: 'var(--text-mute)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', border: '1px dashed var(--hairline-2)', borderRadius: 6, padding: 20 }}>
                no whisper queued — keep going
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
              <div className="label" style={{ marginBottom: 0 }}>Earlier this call</div>
              {WHISPER_HISTORY.map((h, i) => (
                <div key={i} className="whisper-history-item">{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LiveCall = LiveCall;
