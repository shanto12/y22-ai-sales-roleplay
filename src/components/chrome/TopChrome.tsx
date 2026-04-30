import { useState } from 'react'
import { Phone, Beaker, Book, Settings, HelpCircle } from 'lucide-react'
import type { AppTab, HealthResponse } from '../../types.ts'
import { SettingsPopover } from './SettingsPopover.tsx'

export function TopChrome({
  tab, setTab, health, onOpenHelp,
}: {
  tab: AppTab
  setTab: (t: AppTab) => void
  health: HealthResponse
  onOpenHelp: () => void
}) {
  const isLive = health.mode === 'live' && health.capabilities.voice.live
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className="chrome" role="banner">
      <div className="wordmark">
        <span className="y22-mark">Y22</span>
        <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>roleplay</span>
      </div>
      <nav className="tabs" role="tablist" aria-label="Sections">
        <button
          className={`tab ${tab === 'roleplay' ? 'active' : ''}`}
          onClick={() => setTab('roleplay')}
          role="tab"
          aria-selected={tab === 'roleplay'}
        >
          <Phone size={13} /> <span>Roleplay</span>
        </button>
        <button
          className={`tab ${tab === 'prompt' ? 'active' : ''}`}
          onClick={() => setTab('prompt')}
          role="tab"
          aria-selected={tab === 'prompt'}
        >
          <Beaker size={13} /> <span>Prompt Lab</span>
        </button>
        <button
          className={`tab ${tab === 'guide' ? 'active' : ''}`}
          onClick={() => setTab('guide')}
          role="tab"
          aria-selected={tab === 'guide'}
        >
          <Book size={13} /> <span>Demo Guide</span>
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
        <button
          className="btn icon-btn"
          onClick={onOpenHelp}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (press ?)"
        >
          <HelpCircle size={13} />
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="btn icon-btn"
            onClick={() => setSettingsOpen((s) => !s)}
            aria-label="Settings"
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
          >
            <Settings size={13} />
          </button>
          <SettingsPopover
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            onOpenHelp={onOpenHelp}
            onGoToGuide={() => setTab('guide')}
          />
        </div>
      </div>
    </header>
  )
}
