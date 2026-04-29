import { Activity } from 'lucide-react'

export function SyntheticBanner() {
  return (
    <div className="synthetic-banner" role="status">
      <Activity size={14} />
      <span>
        <strong>Live voice unavailable</strong> — playing canned roleplay. Add{' '}
        <span className="key">XAI_API_KEY</span> to enable Grok.
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono, monospace' }}>
        fallback · 5 canned scenarios loaded
      </span>
    </div>
  )
}
