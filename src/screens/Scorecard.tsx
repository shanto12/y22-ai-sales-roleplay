import { useEffect, useState } from 'react'
import { Play, Pause, Bookmark, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react'
import { ScoreTileFinal } from '../components/shared/ScoreTile.tsx'
import { BEHAVIORS } from '../data/behaviors.ts'
import { makeWaveBars } from '../lib/wave-bars.ts'
import { TRANSCRIPT } from '../data/synthetic-call.ts'
import type { Persona, ScoreMap } from '../types.ts'

export function Scorecard({
  persona, scores, onTryHarder, onAnother,
}: {
  persona: Persona
  scores: ScoreMap
  onTryHarder: () => void
  onAnother: () => void
}) {
  const total = Object.values(scores).reduce((s, v) => s + v.score, 0)
  const grade = total >= 26 ? 'A' : total >= 22 ? 'B+' : total >= 18 ? 'B' : total >= 14 ? 'C' : 'D'
  const clipBars = makeWaveBars(72, 7)

  const [playing, setPlaying] = useState(false)
  const [played, setPlayed] = useState(0.4)
  const [savedBullets, setSavedBullets] = useState<Set<number>>(new Set())
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  // Animate the played-through ratio when the user clicks Play.
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setPlayed((p) => {
        const next = p + 0.04
        if (next >= 1) {
          setPlaying(false)
          return 1
        }
        return next
      })
    }, 240)
    return () => clearInterval(id)
  }, [playing])

  const toggleBullet = (i: number) => {
    setSavedBullets((s) => {
      const next = new Set(s)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const handlePlay = () => {
    if (played >= 1) setPlayed(0)
    setPlaying((p) => !p)
  }

  const coaching = [
    { em: 'When she challenged ROI', text: ', lead with the 90-day payback line ', emEnd: 'before any discount.' },
    { em: 'Multithread earlier', text: ' — ask for the CRO’s name in the discovery turn, not the close.', emEnd: '' },
    { em: 'Cut your talk:listen', text: ' to 50/50 before minute 2. Ask, then count to three.', emEnd: '' },
  ]

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }} role="region" aria-label="Call scorecard">
      <div className="hero-strip">
        <div className="hero-total">
          <div className="l">Final score · {persona.full_name} · 04:58</div>
          <div className="v">
            <span><span className="n">{total}</span> <span className="max">/ 30</span></span>
            <span style={{ width: 1, height: 36, background: 'var(--hairline-2)' }} />
            <span className="grade-letter">{grade}</span>
          </div>
          <div className="grade">
            <span style={{ color: 'var(--text-mute)' }}>top-10% threshold</span>
            <span className="mono" style={{ color: 'var(--text)' }}>26 / 30</span>
            <span style={{ color: 'var(--text-mute)' }}>· you’re {Math.max(0, 26 - total)} behaviors away</span>
          </div>
        </div>

        <div className="moment-card">
          <button className="play-btn" onClick={handlePlay} aria-label={playing ? 'Pause replay' : 'Play replay'} data-testid="moment-play">
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)' }}>
                Moment the deal turned
              </div>
              <div className="mono-mute" style={{ fontSize: 10 }}>00:52 → 01:22 · {Math.round(played * 30)}s of 30s</div>
            </div>
            <div className="clip-wave">
              {clipBars.map((b, i) => (
                <div key={i} className={`b ${i / clipBars.length < played ? 'played' : ''}`} style={{ height: `${Math.max(3, b * 28)}px` }} />
              ))}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.4 }}>
              <span className="mono" style={{ color: 'var(--green)' }}>00:52</span> — when she said “we already have a vendor”, you reframed instead of discounting.
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="row-head">
          <div className="title"><span className="num">01</span> Final behavior breakdown</div>
          <span className="mono-mute" style={{ fontSize: 11 }}>baseline = avg of last 200 calls in your team’s library</span>
        </div>
        <div className="tiles-grid">
          {BEHAVIORS.map((b) => <ScoreTileFinal key={b.id} b={b} score={scores[b.id]} />)}
        </div>
      </div>

      <div>
        <div className="row-head">
          <div className="title"><span className="num">02</span> Coaching for the next call</div>
          <span className="mono-mute" style={{ fontSize: 11 }}>{savedBullets.size} of 3 saved to playbook</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {coaching.map((c, i) => (
            <div key={i} className="coach-bullet">
              <div className="idx">0{i + 1}</div>
              <div className="body"><span className="em">{c.em}</span>{c.text}<span className="em" style={{ color: 'var(--text)' }}>{c.emEnd}</span></div>
              <button
                className={`save ${savedBullets.has(i) ? 'saved' : ''}`}
                onClick={() => toggleBullet(i)}
                title={savedBullets.has(i) ? 'Remove from playbook' : 'Save to playbook'}
                aria-pressed={savedBullets.has(i)}
              >
                <Bookmark size={14} fill={savedBullets.has(i) ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="disclosure">
        <button
          className="disclosure-head disclosure-toggle"
          onClick={() => setTranscriptOpen((s) => !s)}
          aria-expanded={transcriptOpen}
          aria-controls="full-transcript"
        >
          {transcriptOpen ? <ChevronDown size={14} className="chev" /> : <ChevronRight size={14} className="chev" />}
          <span style={{ color: 'var(--text)' }}>Full transcript</span>
          <span style={{ marginLeft: 'auto' }} className="mono-mute">04:58 · {TRANSCRIPT.length} turns · 1,243 words</span>
        </button>
        {transcriptOpen && (
          <div id="full-transcript" className="disclosure-body">
            <div className="transcript" style={{ height: 'auto', maxHeight: 360 }}>
              {TRANSCRIPT.map((line, i) => (
                <div key={i} className={`line ${line.who}`}>
                  <span className="timestamp">{line.t}</span>
                  <span className="speaker">{line.who === 'user' ? 'you' : persona.full_name.split(' ')[0].toLowerCase()}</span>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button className="btn" onClick={onTryHarder}>Try same persona, harder</button>
        <button className="btn btn-primary" onClick={onAnother} data-testid="run-another">
          Run another roleplay <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
