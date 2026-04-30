import { SCORE_TIMELINE, MID_SCORES, FINAL_SCORES, TRANSCRIPT, WHISPER_NOW } from '../data/synthetic-call.ts'
import type { ScoreMap, TranscriptLine, WhisperPrompt, BehaviorId } from '../types.ts'

export interface SyntheticEvents {
  onScore: (id: BehaviorId, score: ScoreMap[BehaviorId]) => void
  onTranscript: (line: TranscriptLine) => void
  onWhisper: (w: WhisperPrompt | null) => void
  onCallEnd: (final: ScoreMap) => void
}

export interface SyntheticOptions {
  /**
   * When true, the engine does not push transcript lines. Use in live voice
   * mode so the real WS-driven transcript is the only source of truth — the
   * engine still drives the score-tile timeline and whisper drops as the
   * cockpit's visual layer.
   */
  skipTranscript?: boolean
}

export class SyntheticEngine {
  private timers: ReturnType<typeof setTimeout>[] = []
  private alive = true
  // Real-time multiplier — 1 means "real call speed", smaller = faster.
  private readonly speed = 0.25
  private readonly events: SyntheticEvents
  private readonly options: SyntheticOptions

  constructor(events: SyntheticEvents, options: SyntheticOptions = {}) {
    this.events = events
    this.options = options
  }

  start() {
    // Score-tile timeline.
    for (const ev of SCORE_TIMELINE) {
      this.timers.push(
        setTimeout(() => {
          if (!this.alive) return
          this.events.onScore(ev.id as BehaviorId, {
            score: ev.score,
            band: ev.band,
            rationale: ev.rationale,
            updated: ev.updated,
          })
        }, ev.atMs * this.speed),
      )
    }
    // Transcript trickle (only in synthetic-only / sample-playback mode).
    if (!this.options.skipTranscript) {
      TRANSCRIPT.forEach((line, i) => {
        this.timers.push(
          setTimeout(() => {
            if (!this.alive) return
            this.events.onTranscript(line)
          }, (1500 + i * 1800) * this.speed),
        )
      })
    }
    // Whisper drops mid-call.
    this.timers.push(
      setTimeout(() => {
        if (!this.alive) return
        this.events.onWhisper(WHISPER_NOW)
      }, 9000 * this.speed),
    )
    // Auto-finalize after the last timeline event + a beat.
    const lastAt = Math.max(...SCORE_TIMELINE.map(e => e.atMs)) + 4000
    this.timers.push(
      setTimeout(() => {
        if (!this.alive) return
        this.events.onWhisper(null)
      }, lastAt * this.speed),
    )
  }

  /** Force end-call with the synthesized final scorecard. */
  endNow() {
    this.events.onCallEnd(FINAL_SCORES)
  }

  stop() {
    this.alive = false
    for (const t of this.timers) clearTimeout(t)
    this.timers = []
  }
}

export const SYNTHETIC_FINAL = FINAL_SCORES
export const SYNTHETIC_MID = MID_SCORES
