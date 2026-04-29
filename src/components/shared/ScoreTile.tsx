import type { Behavior, Score } from '../../types.ts'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function ScoreTile({ b, score }: { b: Behavior; score: Score }) {
  const pulseCls = score.updated ? 'pulse' : ''
  const bandCls = `s-${score.band}`
  const dim = score.score === 0
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
          {[0, 1, 2, 3, 4].map((i) => <span key={i} />)}
        </div>
      ) : (
        <div className="tile-meter" style={{ color: `var(--${score.band})` }}>
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className={i < score.score ? 'on' : undefined} />)}
        </div>
      )}
      <div className="tile-rationale">{score.rationale || 'Awaiting first signal…'}</div>
    </div>
  )
}

export function ScoreTileFinal({ b, score }: { b: Behavior; score: Score }) {
  const isUp = !!score.delta?.startsWith('+')
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
        {score.delta && (
          <div className={`delta-chip ${isUp ? 'up' : 'down'}`} title="Compare to top 10%">
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {score.delta}
            <span style={{ color: 'var(--text-mute)', marginLeft: 2 }}>vs top 10%</span>
          </div>
        )}
      </div>
      <div className="tile-meter" style={{ color: `var(--${score.band})` }}>
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className={i < score.score ? 'on' : undefined} />)}
      </div>
      <div className="tile-rationale exp">{score.rationale}</div>
    </div>
  )
}
