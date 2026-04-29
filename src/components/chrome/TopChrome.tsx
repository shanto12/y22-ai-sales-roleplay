import { Phone, Beaker, Book, Settings } from 'lucide-react'
import type { AppTab, HealthResponse } from '../../types.ts'

export function TopChrome({
  tab, setTab, health,
}: {
  tab: AppTab
  setTab: (t: AppTab) => void
  health: HealthResponse
}) {
  const isLive = health.mode === 'live' && health.capabilities.voice.live
  return (
    <header className="chrome">
      <div className="wordmark">
        <span className="y22-mark">Y22</span>
        <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>roleplay</span>
      </div>
      <nav className="tabs">
        <button className={`tab ${tab === 'roleplay' ? 'active' : ''}`} onClick={() => setTab('roleplay')}>
          <Phone size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} /> Roleplay
        </button>
        <button className={`tab ${tab === 'prompt' ? 'active' : ''}`} onClick={() => setTab('prompt')}>
          <Beaker size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} /> Prompt Lab
        </button>
        <button className={`tab ${tab === 'guide' ? 'active' : ''}`} onClick={() => setTab('guide')}>
          <Book size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} /> Demo Guide
        </button>
      </nav>
      <div className="chrome-right">
        <span className="live-chip" title={isLive ? 'Live xAI Voice Agent connected' : 'Synthetic mode — XAI_API_KEY not set on server'}>
          <span className="dot" style={!isLive ? { background: 'var(--amber)', boxShadow: '0 0 0 2px rgba(245,165,36,0.18)' } : undefined} />
          <span>{isLive ? 'Live' : 'Synthetic'}</span>
          <span style={{ color: 'var(--hairline-2)' }}>·</span>
          <span className="model">{health.model}</span>
        </span>
        <span className="synthetic-pill">Synthetic data — demo only</span>
        <button className="btn" style={{ padding: '6px 10px' }} aria-label="Settings"><Settings size={13} /></button>
      </div>
    </header>
  )
}
