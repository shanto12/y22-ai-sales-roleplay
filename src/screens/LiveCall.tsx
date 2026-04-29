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
  return (
    <div className="panel" style={{ position: 'relative', margin: 16, overflow: 'hidden' }}>
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
        <button className="btn btn-coral" onClick={onEnd}>
          <PhoneOff size={14} /> End call
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
        <div className="tiles-grid">
          {BEHAVIORS.map((b) => <ScoreTile key={b.id} b={b} score={scores[b.id]} />)}
        </div>
      </div>

      <div className="call-row-c">
        <div className="call-col">
          <div className="col-head">
            <span>
              <span className="num" style={{ display: 'inline-grid', placeItems: 'center', width: 18, height: 18, border: '1px solid var(--hairline)', borderRadius: 4, background: 'var(--card)', color: 'var(--text-dim)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', marginRight: 8 }}>02</span>
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
              <span className="num" style={{ display: 'inline-grid', placeItems: 'center', width: 18, height: 18, border: '1px solid var(--hairline)', borderRadius: 4, background: 'var(--card)', color: 'var(--text-dim)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', marginRight: 8 }}>03</span>
              Whisper coaching
            </span>
            <span className="mono-mute" style={{ fontSize: 10 }}>2 used · 1 dismissed</span>
          </div>
          <div className="whisper">
            {whisper ? (
              <div className="whisper-card">
                <div className="dot" />
                <div className="body">
                  <div className="label">MID-CALL TIP · {elapsed}</div>
                  <div className="text">{whisper.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>// {whisper.reason}</div>
                  <div className="actions">
                    <button className="pill-btn use">Use</button>
                    <button className="pill-btn">Dismiss</button>
                    <button className="pill-btn" style={{ marginLeft: 'auto' }}>Hold <span className="kbd" style={{ marginLeft: 4 }}>W</span></button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', placeItems: 'center', flex: 1, color: 'var(--text-mute)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', border: '1px dashed var(--hairline-2)', borderRadius: 6, padding: 20 }}>
                no whisper queued — keep going
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
              <div className="label" style={{ marginBottom: 0 }}>Earlier this call</div>
              {WHISPER_HISTORY.map((h, i) => (
                <div key={i} className="whisper-history-item">{h}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
