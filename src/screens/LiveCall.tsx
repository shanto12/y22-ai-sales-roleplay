import { useState } from 'react'
import { PhoneOff } from 'lucide-react'
import { Waveform } from '../components/shared/Waveform.tsx'
import { ScoreTile } from '../components/shared/ScoreTile.tsx'
import { CalibratingOverlay } from '../components/shared/CalibratingOverlay.tsx'
import { BEHAVIORS } from '../data/behaviors.ts'
import { WHISPER_HISTORY } from '../data/synthetic-call.ts'
import type { Persona, ScoreMap, TranscriptLine, WhisperPrompt } from '../types.ts'

export function LiveCall({
  persona, userActive, aiActive, scores, transcript, whisper, calibrating, onEnd, elapsed,
}: {
  persona: Persona
  userActive: boolean
  aiActive: boolean
  scores: ScoreMap
  transcript: TranscriptLine[]
  whisper: WhisperPrompt | null
  calibrating: boolean
  onEnd: () => void
  elapsed: string
}) {
  const [whisperState, setWhisperState] = useState<'visible' | 'used' | 'dismissed' | 'held'>('visible')
  const [history, setHistory] = useState<string[]>(WHISPER_HISTORY)
  const [lastWhisperText, setLastWhisperText] = useState<string | undefined>(undefined)
  const [resolvedText, setResolvedText] = useState<string | undefined>(undefined)

  // Reset whisper interaction state ONLY when a brand-new whisper text arrives.
  // (Clearing to null shouldn't reset the resolved state — that would flash the
  // user's "Used / Dismissed / Held" acknowledgement back to "visible" briefly.)
  if (whisper && whisper.text !== lastWhisperText) {
    setLastWhisperText(whisper.text)
    setWhisperState('visible')
    setResolvedText(undefined)
  }

  const handleUse = () => {
    if (!whisper) return
    setWhisperState('used')
    setResolvedText(whisper.text)
    setHistory((h) => [`${elapsed} — Used: ${whisper.text}`, ...h].slice(0, 6))
  }
  const handleDismiss = () => {
    if (!whisper) return
    setWhisperState('dismissed')
    setResolvedText(whisper.text)
    setHistory((h) => [`${elapsed} — Dismissed: ${whisper.text}`, ...h].slice(0, 6))
  }
  const handleHold = () => {
    if (!whisper) return
    setWhisperState('held')
    setResolvedText(whisper.text)
    setHistory((h) => [`${elapsed} — Held for later: ${whisper.text}`, ...h].slice(0, 6))
  }

  return (
    <div className="panel" style={{ position: 'relative', margin: 16, overflow: 'hidden' }} role="region" aria-label="Live roleplay call">
      {calibrating && <CalibratingOverlay />}

      <div className="call-header">
        <div>
          <div className="title">
            Speaking with <strong>{persona.full_name}, {persona.title} · {persona.company}</strong>
          </div>
          <div className="meta">
            <span className={`diff-pill ${persona.difficulty}`} style={{ marginRight: 10 }}>{persona.difficulty.toUpperCase()}</span>
            Persona profile: {persona.profile}
          </div>
        </div>
        <button className="btn btn-coral" onClick={onEnd} aria-label="End call (Esc)" data-testid="end-call">
          <PhoneOff size={14} /> End call <span className="kbd" style={{ marginLeft: 6 }}>Esc</span>
        </button>
      </div>

      <div className="call-row-a">
        <div className="wave-side l">
          <div className="who"><span className="dot" /> You · mic</div>
          <Waveform side="l" active={userActive} count={56} />
          <div className="voice-tag">input · 48 kHz · –11.2 dB</div>
        </div>

        <div className="timer-pill">
          <span className="now">{elapsed}</span> <span style={{ color: 'var(--text-mute)' }}>/ ~05:00</span>
        </div>

        <div className="wave-side r">
          <div className="who" style={{ flexDirection: 'row-reverse' }}>
            <span className="dot" /> {persona.full_name.split(' ')[0]} · buyer
          </div>
          <Waveform side="r" active={aiActive} count={56} seedOffset={42} />
          <div className="voice-tag">voice: Eve · grok-voice-think-fast-1.0</div>
        </div>
      </div>

      <div className="call-row-b">
        <div className="row-head">
          <div className="title"><span className="num">01</span> Behavior Scorecard · live</div>
          <div className="mono-mute" style={{ fontSize: 11 }}>updated 0.4s ago · 6 of 6 behaviors</div>
        </div>
        <div className="tiles-grid" aria-live="polite">
          {BEHAVIORS.map((b) => <ScoreTile key={b.id} b={b} score={scores[b.id]} />)}
        </div>
      </div>

      <div className="call-row-c">
        <div className="call-col">
          <div className="col-head">
            <span>
              <span className="num">02</span>
              Live transcript
            </span>
            <span className="mono-mute" style={{ fontSize: 10 }}>auto-scroll on</span>
          </div>
          <div className="transcript">
            {transcript.length === 0 ? (
              <div style={{ color: 'var(--text-mute)', fontStyle: 'italic' }}>
                <span className="speaker">…</span>waiting for first turn…
              </div>
            ) : (
              transcript.map((line, i) => (
                <div key={i} className={`line ${line.who}`}>
                  <span className="timestamp">{line.t}</span>
                  <span className="speaker">{line.who === 'user' ? 'you' : persona.full_name.split(' ')[0].toLowerCase()}</span>
                  {line.text}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="call-col">
          <div className="col-head">
            <span>
              <span className="num">03</span>
              Whisper coaching
            </span>
            <span className="mono-mute" style={{ fontSize: 10 }}>{history.length} entries</span>
          </div>
          <div className="whisper">
            {whisper && whisperState === 'visible' ? (
              <div className="whisper-card whisper-enter" key={whisper.text}>
                <div className="dot" />
                <div className="body">
                  <div className="label">MID-CALL TIP · {elapsed}</div>
                  <div className="text">{whisper.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>// {whisper.reason}</div>
                  <div className="actions">
                    <button className="pill-btn use" onClick={handleUse} data-testid="whisper-use">Use</button>
                    <button className="pill-btn" onClick={handleDismiss}>Dismiss</button>
                    <button className="pill-btn" style={{ marginLeft: 'auto' }} onClick={handleHold}>
                      Hold <span className="kbd" style={{ marginLeft: 4 }}>W</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : whisperState !== 'visible' && resolvedText ? (
              <div className="whisper-resolved" data-state={whisperState}>
                <div className="resolved-label">
                  {whisperState === 'used' && '✓ Whisper used — keep going'}
                  {whisperState === 'dismissed' && '✕ Whisper dismissed'}
                  {whisperState === 'held' && '⏸ Held — will surface again at the next pause'}
                </div>
              </div>
            ) : (
              <div className="whisper-empty">no whisper queued — keep going</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
              <div className="label" style={{ marginBottom: 0 }}>This call</div>
              {history.map((h, i) => (
                <div key={i} className="whisper-history-item">{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
