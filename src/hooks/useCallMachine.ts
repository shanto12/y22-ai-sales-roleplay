import { useReducer, useEffect, useRef, useCallback } from 'react'
import { SyntheticEngine } from '../lib/synthetic-engine.ts'
import { VoiceSession } from '../lib/voice-session.ts'
import { mintToken } from '../lib/api.ts'
import { buildPersonaSystemPrompt } from '../data/persona-builder.ts'
import type { BehaviorId, CallState, CustomConfig, Persona, ScoreMap, Score, TranscriptLine, WhisperPrompt } from '../types.ts'
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
  voiceMode: 'live' | 'synthetic' | 'unknown'
  voiceError: string | null
}

type Action =
  | { type: 'select_persona'; persona: Persona }
  | { type: 'start' }
  | { type: 'calibrated' }
  | { type: 'voice_mode'; mode: 'live' | 'synthetic'; error?: string }
  | { type: 'score_tile'; id: BehaviorId; score: Score }
  | { type: 'transcript'; line: TranscriptLine }
  | { type: 'whisper'; whisper: WhisperPrompt | null }
  | { type: 'voice_activity'; user?: boolean; ai?: boolean }
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
  voiceMode: 'unknown',
  voiceError: null,
})

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'select_persona': return { ...s, persona: a.persona }
    case 'start':          return { ...s, call: 'calibrating', scores: structuredClone(EMPTY_SCORES), transcript: [], whisper: null, finalScores: null, voiceError: null }
    case 'calibrated':     return { ...s, call: 'live' }
    case 'voice_mode':     return { ...s, voiceMode: a.mode, voiceError: a.error ?? null }
    case 'score_tile':     return { ...s, scores: { ...s.scores, [a.id]: a.score } }
    case 'transcript':     return { ...s, transcript: [...s.transcript, a.line] }
    case 'whisper':        return { ...s, whisper: a.whisper }
    case 'voice_activity': return { ...s, userActive: a.user ?? s.userActive, aiActive: a.ai ?? s.aiActive }
    case 'end':            return { ...s, call: 'scoring' }
    case 'final_scores':   return { ...s, finalScores: a.scores, call: 'done' }
    case 'reset':          return { ...initial(), persona: s.persona }
    case 'force_state':    return { ...s, call: a.call }
  }
}

export interface CallMachineApi {
  state: State
  selectPersona: (p: Persona) => void
  start: (config?: CustomConfig) => void
  end: (reason?: 'user' | 'auto' | 'error') => void
  reset: () => void
  forceState: (s: CallState) => void
}

/**
 * Hard cap on call duration to control xAI voice costs (~$0.05/min).
 * Five minutes covers the demo flow with margin; recruiters auto-end-clean.
 */
const MAX_CALL_DURATION_MS = 5 * 60 * 1000

/**
 * High-level state machine for the roleplay call.
 *
 * - The synthetic engine drives the visual score-tile timeline + whisper drops
 *   in every mode (live and synthetic). It's the manager-cockpit demo veneer.
 * - In live mode (XAI_API_KEY present on the server), a VoiceSession opens
 *   a WebSocket to xAI Grok Voice Agent. Mic in, audio out, real transcript.
 * - When the live path can't initialize (no key, mic denied, network error)
 *   the synthetic engine still runs so the demo never appears broken.
 */
export function useCallMachine(synthetic: boolean, opts?: { customConfig?: CustomConfig }): CallMachineApi {
  const [state, dispatch] = useReducer(reducer, undefined, initial)
  const engine = useRef<SyntheticEngine | null>(null)
  const voice = useRef<VoiceSession | null>(null)
  const customCfgRef = useRef<CustomConfig | undefined>(undefined)
  // Sync the ref via an effect so the rule-of-hooks compiler stays happy.
  useEffect(() => { customCfgRef.current = opts?.customConfig }, [opts?.customConfig])

  // End-call helper — stable reference so the auto-end timer can call it.
  const end = useCallback((_reason: 'user' | 'auto' | 'error' = 'user') => {
    dispatch({ type: 'end' })
    voice.current?.stop()
    voice.current = null
    // Synthetic engine resolves the final scorecard so the user always lands on Scorecard.
    setTimeout(() => engine.current?.endNow(), 600)
  }, [])

  useEffect(() => {
    if (state.call !== 'calibrating') return
    const t = setTimeout(() => dispatch({ type: 'calibrated' }), 1200)
    return () => clearTimeout(t)
  }, [state.call])

  // Hard cost-cap: auto-end any live call after MAX_CALL_DURATION_MS.
  useEffect(() => {
    if (state.call !== 'live') return
    const t = setTimeout(() => end('auto'), MAX_CALL_DURATION_MS)
    return () => clearTimeout(t)
  }, [state.call, end])

  useEffect(() => {
    if (state.call !== 'live') return

    // Run the synthetic timeline for score tiles + whisper drops in every
    // mode. In LIVE voice mode we suppress its transcript pushes so the
    // real conversation (mic ↔ Grok) is the only transcript shown.
    engine.current = new SyntheticEngine(
      {
        onScore:      (id, score) => dispatch({ type: 'score_tile', id, score }),
        onTranscript: (line)      => dispatch({ type: 'transcript', line }),
        onWhisper:    (w)         => dispatch({ type: 'whisper', whisper: w }),
        onCallEnd:    (final)     => dispatch({ type: 'final_scores', scores: final }),
      },
      { skipTranscript: !synthetic },
    )
    engine.current.start()

    // If the server reports live mode AND we have a custom-config (or persona), try real voice.
    let cancelled = false
    if (!synthetic && state.persona) {
      const cfg: CustomConfig = customCfgRef.current ?? {
        industry: state.persona.industry,
        title: state.persona.title_key,
        difficulty: state.persona.difficulty,
        objection: state.persona.objection,
      }
      const systemPrompt = buildPersonaSystemPrompt(cfg)
      ;(async () => {
        try {
          const tok = await mintToken(systemPrompt)
          if (cancelled) return
          if (tok.mode !== 'live' || !tok.value) {
            dispatch({ type: 'voice_mode', mode: 'synthetic' })
            return
          }
          const session = new VoiceSession({
            onConnecting: () => {},
            onConnected:  () => dispatch({ type: 'voice_mode', mode: 'live' }),
            onUserText:   (text, t) => dispatch({ type: 'transcript', line: { who: 'user',  t, text } }),
            onAssistantText: (text, t) => dispatch({ type: 'transcript', line: { who: 'buyer', t, text } }),
            onUserSpeaking: (a) => dispatch({ type: 'voice_activity', user: a }),
            onAssistantSpeaking: (a) => dispatch({ type: 'voice_activity', ai: a }),
            onError:  (err) => dispatch({ type: 'voice_mode', mode: 'synthetic', error: err }),
            onClose:  () => {},
          })
          voice.current = session
          await session.start({
            token: tok.value,
            model: tok.model ?? 'grok-voice-think-fast-1.0',
            instructions: systemPrompt,
            voice: 'eve',
          })
          if (cancelled) session.stop()
        } catch (err) {
          if (!cancelled) dispatch({ type: 'voice_mode', mode: 'synthetic', error: (err as Error).message })
        }
      })()
    } else {
      dispatch({ type: 'voice_mode', mode: 'synthetic' })
    }

    // Toggle waveform speakers in synthetic mode for visual liveliness.
    const waveTimer = synthetic
      ? setInterval(() => {
          dispatch({ type: 'voice_activity', user: Math.random() > 0.5, ai: Math.random() > 0.4 })
        }, 1100)
      : null

    return () => {
      cancelled = true
      engine.current?.stop()
      engine.current = null
      voice.current?.stop()
      voice.current = null
      if (waveTimer) clearInterval(waveTimer)
    }
  }, [state.call, state.persona, synthetic])

  return {
    state,
    selectPersona: (persona: Persona) => dispatch({ type: 'select_persona', persona }),
    start: () => dispatch({ type: 'start' }),
    end,
    reset: () => dispatch({ type: 'reset' }),
    forceState: (s: CallState) => dispatch({ type: 'force_state', call: s }),
  }
}
