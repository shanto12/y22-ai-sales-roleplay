// Live waveform component - 50+ bars, only animates when active
function Waveform({ side = 'l', active = false, count = 56, seedOffset = 0 }) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick(t => (t + 1) % 1000), 110);
    return () => clearInterval(id);
  }, [active]);

  const bars = React.useMemo(() => {
    return makeWaveBars(count, 1 + seedOffset + (active ? tick : 0));
  }, [count, seedOffset, active, tick]);

  // when inactive, show muted low bars
  return (
    <div className={`wave ${active ? `live ${side === 'l' ? 'user' : 'ai'}` : 'dim'}`} style={{ flexDirection: side === 'r' ? 'row-reverse' : 'row' }}>
      {bars.map((b, i) => {
        const h = active ? Math.max(4, b * 64) : 4 + ((i * 13) % 8);
        return <div key={i} className="bar" style={{ height: h + 'px' }} />;
      })}
    </div>
  );
}

// Score tile
function ScoreTile({ b, score }) {
  const pulseCls = score.updated ? 'pulse' : '';
  const bandCls = `s-${score.band}`;
  const dim = score.score === 0;
  return (
    <div className={`tile ${bandCls} ${pulseCls}`}>
      <div className="stripe" />
      <div className="tile-row">
        <div className="tile-name">{b.name}</div>
        <div className={`tile-score fg-${score.band}`} style={{ opacity: dim ? 0.4 : 1 }}>
          {score.score}<span className="max">/5</span>
        </div>
      </div>
      {dim ? (
        <div className="tile-meter" style={{ color: 'var(--text-mute)' }}>
          {[0,1,2,3,4].map(i => <span key={i} />)}
        </div>
      ) : (
        <div className="tile-meter" style={{ color: `var(--${score.band})` }}>
          {[0,1,2,3,4].map(i => <span key={i} className={i < score.score ? 'on' : ''} />)}
        </div>
      )}
      <div className="tile-rationale">{score.rationale || 'Awaiting first signal\u2026'}</div>
    </div>
  );
}

// Expanded scorecard tile (for screen 3)
function ScoreTileFinal({ b, score }) {
  const isUp = score.delta && score.delta.startsWith('+');
  return (
    <div className={`tile s-${score.band} expanded`}>
      <div className="stripe" />
      <div className="tile-row">
        <div>
          <div className="tile-name">{b.name}</div>
          <div className={`tile-score fg-${score.band}`} style={{ marginTop: 6 }}>
            {score.score}<span className="max">/5</span>
          </div>
        </div>
        <div className={`delta-chip ${isUp ? 'up' : 'down'}`} title="Compare to top 10%">
          {isUp ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
          {score.delta}
          <span style={{ color: 'var(--text-mute)', marginLeft: 2 }}>vs top 10%</span>
        </div>
      </div>
      <div className="tile-meter" style={{ color: `var(--${score.band})` }}>
        {[0,1,2,3,4].map(i => <span key={i} className={i < score.score ? 'on' : ''} />)}
      </div>
      <div className="tile-rationale exp">{score.rationale}</div>
    </div>
  );
}

Object.assign(window, { Waveform, ScoreTile, ScoreTileFinal });
