import { useEffect, useRef } from 'react'
import { Book, Code, Keyboard, ExternalLink } from 'lucide-react'

export function SettingsPopover({
  open, onClose, onOpenHelp, onGoToGuide,
}: {
  open: boolean
  onClose: () => void
  onOpenHelp: () => void
  onGoToGuide: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    // Defer attaching the click handler so the click that opened the popover
    // doesn't immediately close it.
    const t = setTimeout(() => window.addEventListener('mousedown', onClick), 0)
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div ref={ref} className="settings-popover" role="menu">
      <button className="popover-item" onClick={() => { onClose(); onOpenHelp() }} role="menuitem">
        <Keyboard size={14} />
        <span>Keyboard shortcuts</span>
        <span className="kbd" style={{ marginLeft: 'auto' }}>?</span>
      </button>
      <button className="popover-item" onClick={() => { onClose(); onGoToGuide() }} role="menuitem">
        <Book size={14} />
        <span>Open Demo Guide</span>
        <span className="kbd" style={{ marginLeft: 'auto' }}>3</span>
      </button>
      <a className="popover-item" href="https://github.com/shanto12/y22-ai-sales-roleplay" target="_blank" rel="noreferrer" role="menuitem">
        <Code size={14} />
        <span>View source on GitHub</span>
        <ExternalLink size={11} style={{ marginLeft: 'auto', color: 'var(--text-mute)' }} />
      </a>
      <div className="popover-divider" />
      <div className="popover-meta">
        <div>Y22 Roleplay · synthetic-data demo</div>
        <div className="mono-mute" style={{ fontSize: 10 }}>built on xAI Grok Voice Agent API</div>
      </div>
    </div>
  )
}
