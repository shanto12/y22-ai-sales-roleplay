export function CalibratingOverlay() {
  return (
    <div className="calibrating">
      <div className="box">
        <div className="ring" />
        <div style={{ fontSize: 14, fontWeight: 600 }}>Calibrating mic…</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>Speak normally for a moment.</div>
      </div>
    </div>
  )
}
