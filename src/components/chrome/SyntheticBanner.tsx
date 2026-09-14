import { Activity } from 'lucide-react'

export function SyntheticBanner() {
  return (
    <div className="synthetic-banner" role="status">
      <Activity size={14} />
      <span>
        <strong>Sample mode</strong> — explore a scripted roleplay with illustrative coaching.
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono, monospace' }}>
        No microphone needed
      </span>
    </div>
  )
}
