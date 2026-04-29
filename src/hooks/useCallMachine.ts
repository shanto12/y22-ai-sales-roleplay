import { useReducer, useEffect, useRef } from 'react'
import { SyntheticEngine } from '../lib/synthetic-engine.ts'
import type { BehaviorId, CallState, Persona, ScoreMap, Score, TranscriptLine, WhisperPrompt } from '../types.ts'
import { BEHAVIORS } from '../data/behaviors.ts'

const EMPTY_SCORES: ScoreMap = BEHAVIORS.reduce((acc, b) => {
  acc[b.id] = { score: 0, band: 'coral', rationale: 'Awaiting first signal…', updated: false }
  return acc
}, {} as ScoreMap)

interface State {
  call: CallState
  scores: ScoreMap
  finalScores: ScoreMap | null
  transcript: TranscriptLine[]
  whisper: WhisperPrompt | null
  userActive: boolean
  aiActive: boolean
  persona: Persona | null
}

type Action =
  | { type: 'select_persona'; persona: Persona }
  | { type: 'start' }
  | { type: 'calibrated' }
  | { type: 'score_tile'; id: BehaviorId; score: Score }
  | { type: 'transcript'; line: TranscriptLine }
  | { type: 'whisper'; whisper: WhisperPrompt | null }
  | { type: 'voice_activity'; user: boolean; ai: boolean }
  | { type: 'end' }
  | { type: 'final_scores'; scores: ScoreMap }
  | { type: 'reset' }
  | { type: 'force_state'; call: CallState }

const initial = (): State => ({
  call: 'idle',
  scores: structuredClone(EMPTY_SCORES),
  finalScores: null,
  transcript: [],
  whisper: null,
  userActive: false,
  aiActive: true,
  persona: null,
})

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'select_persona': return { ...s, persona: a.persona }
    case 'start':          return { ...s, call: 'calibrating', scores: structuredClone(EMPTY_SCORES), transcript: [], whisper: null, finalScores: null }
    case 'calibrated':     return { ...s, call: 'live' }
    case 'score_tile':     return { ...s, scores: { ...s.scores, [a.id]: a.score } }
    case 'transcript':     return { ...s, transcript: [...s.transcript, a.line] }
    case 'whisper':        return { ...s, whisper: a.whisper }
    case 'voice_activity': return { ...s, userActive: a.user, aiActive: a.ai }
    case 'end':            return { ...s, call: 'scoring' }
    case 'final_scores':   return { ...s, finalScores: a.scores, call: 'done' }
    case 'reset':          return { ...initial(), persona: s.persona }
    case 'force_state':    return { ...s, call: a.call }
  }
}

/**
 * High-level state machine for the roleplay call. The synthetic engine drives
 * the visual demo timeline (score tiles, transcript, whisper) in every mode.
 * In a future iteration the WebSocket session in voice-session.ts replaces it
 * for end-to-end live audio + transcript capture from xAI Grok Voice.
 */
export function useCallMachine(_synthetic: boolean) {
  const [state, dispatch] = useReducer(reducer, undefined, initial)
  const engine = useRef<SyntheticEngine | null>(null)

  useEffect(() => {
    if (state.call !== 'calibrating') return
    const t = setTimeout(() => dispatch({ type: 'calibrated' }), 1200)
    return () => clearTimeout(t)
  }, [state.call])

  useEffect(() => {
    if (state.call !== 'live') return
    engine.current = new SyntheticEngine({
      onScore:       (id, score) => dispatch({ type: 'score_tile', id, score }),
      onTranscript:  (line)      => dispatch({ type: 'transcript', line }),
      onWhisper:     (w)         => dispatch({ type: 'whisper', whisper: w }),
      onCallEnd:     (final)     => dispatch({ type: 'final_scores', scores: final }),
    })
    engine.current.start()
    const id = setInterval(() => {
      dispatch({ type: 'voice_activity', user: Math.random() > 0.5, ai: Math.random() > 0.4 })
    }, 1100)
    return () => {
      engine.current?.stop()
      engine.current = null
      clearInterval(id)
    }
  }, [state.call])

  return {
    state,
    selectPersona: (persona: Persona) => dispatch({ type: 'select_persona', persona }),
    start:         () => dispatch({ type: 'start' }),
    end:           () => {
      dispatch({ type: 'end' })
      setTimeout(() => engine.current?.endNow(), 600)
    },
    reset:         () => dispatch({ type: 'reset' }),
    forceState:    (s: CallState) => dispatch({ type: 'force_state', call: s }),
  }
}
