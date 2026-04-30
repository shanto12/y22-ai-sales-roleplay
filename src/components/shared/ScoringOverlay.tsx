/**
 * Visible during the brief end-call → scorecard transition. The behavior
 * tiles continue to update in real time as Grok-3 streams scores back, so
 * the user sees the rubric refilling rather than a blank loading screen.
 */
export function ScoringOverlay({ live }: { live: boolean }) {
  return (
    <div className="calibrating">
      <div className="box">
        <div className="ring" />
        <div style={{ fontSize: 14, fontWeight: 600 }}>Scoring your call…</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
          {live ? (
            <>Grok-3 is judging the transcript against the 6-tile rubric.</>
          ) : (
            <>Grading against the canned scorecard.</>
          )}
        </div>
      </div>
    </div>
  )
}
