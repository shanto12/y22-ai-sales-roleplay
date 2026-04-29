import { useEffect } from 'react'

export interface ShortcutHandlers {
  onStart?: () => void
  onEnd?: () => void
  onTab?: (n: 1 | 2 | 3) => void
  onHelp?: () => void
  onWhisperHold?: () => void
}

/**
 * Wire global keyboard shortcuts. All handlers are optional so each screen
 * can subscribe to the subset that's relevant.
 */
export function useKeyboardShortcuts(h: ShortcutHandlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in inputs or content-editables.
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return

      if ((e.key === '?' || (e.key === '/' && e.shiftKey)) && h.onHelp) {
        e.preventDefault()
        h.onHelp()
        return
      }
      if (e.key === 'Escape' && h.onEnd) { e.preventDefault(); h.onEnd(); return }
      if (e.key === 'Enter' && h.onStart) { e.preventDefault(); h.onStart(); return }
      if (e.key === '1' && h.onTab) { e.preventDefault(); h.onTab(1); return }
      if (e.key === '2' && h.onTab) { e.preventDefault(); h.onTab(2); return }
      if (e.key === '3' && h.onTab) { e.preventDefault(); h.onTab(3); return }
      if ((e.key === 'w' || e.key === 'W') && h.onWhisperHold) { e.preventDefault(); h.onWhisperHold(); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [h])
}
