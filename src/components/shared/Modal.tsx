import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({
  open, onClose, title, children, width = 560,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: number
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      <div className="modal-card" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div id="modal-title" className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={14} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
