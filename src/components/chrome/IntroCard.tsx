import { Sparkles, X } from 'lucide-react'

export function IntroCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="intro-card" role="region" aria-label="How this works">
      <div className="intro-icon">
        <Sparkles size={16} />
      </div>
      <div className="intro-body">
        <div className="intro-title">How this works</div>
        <ol className="intro-steps">
          <li><span className="step-num">1</span> Pick a buyer below or build your own.</li>
          <li><span className="step-num">2</span> Hit <strong>Start Roleplay</strong> (or press <span className="kbd">Enter</span>).</li>
          <li><span className="step-num">3</span> Watch the 6 behavior tiles fill in. End the call to see your scorecard.</li>
        </ol>
        <div className="intro-hint">
          New here? Try the <strong>Skeptical mid-market CFO</strong> — it's the hardest persona and shows the system at its best.
        </div>
      </div>
      <button className="intro-close" onClick={onDismiss} aria-label="Dismiss intro"><X size={14} /></button>
    </div>
  )
}
