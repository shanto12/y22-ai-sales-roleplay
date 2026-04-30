import { useReducer, useEffect, useRef, useCallback } from 'react'
import { SyntheticEngine, SYNTHETIC_FINAL } from '../lib/synthetic-engine.ts'
import { VoiceSession } from '../lib/voice-session.ts'
import { mintToken, streamScore, fetchWhisper, type MomentClip } from '../lib/api.ts'
import { buildPersonaSystemPrompt } from '../data/persona-builder.ts'
import type { BehaviorId, CallState, CustomConfig, Persona, ScoreMap, Score, TranscriptLine, WhisperPrompt } from '../types.ts'
import { BEHAVIORS } from '../data/behaviors.ts'

const DEFAULT_MOMENT: MomentClip = {
  time: '00:52',
  text: 'when she said "we already have a vendor", you reframed instead of discounting.',
}
const DEFAULT_COACHING = [
  '**When she challenged ROI**, lead with the 90-day payback line **before any discount.**',
  '**Multithread earlier** — ask for the CRO\'s name in the discovery turn, not the close.',
  '**Cut your talk:listen** to 50/50 before minute 2. Ask, then count to three.',
]

const EMPTY_SCORES: ScoreMap = BEHAVIORS.reduce((acc, b) => {
  acc[b.id] = { score: 0, band: 'coral', rationale: 'Awaiting first signal…', updated: false }
  return acc
}, {} as ScoreMap)

interface State {
  call: CallState
  scores: ScoreMap
  finalScores: ScoreMap | null
  moment: MomentClip
  coaching: string[]
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
  | { type: 'moment'; moment: MomentClip }
  | { type: 'coaching'; bullets: string[] }
  | { type: 'end' }
  | { type: 'final_scores'; scores: ScoreMap; moment?: MomentClip; coaching?: string[] }
  | { type: 'reset' }
  | { type: 'force_state'; call: CallState }

const initial = (): State => ({
  call: 'idle',
  scores: structuredClone(EMPTY_SCORES),
  finalScores: null,
  moment: DEFAULT_MOMENT,
  coaching: DEFAULT_COACHING,
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
    case 'start':          return { ...s, call: 'calibrating', scores: structuredClone(EMPTY_SCORES), transcript: [], whisper: null, finalScores: null, moment: DEFAULT_MOMENT, coaching: DEFAULT_COACHING, voiceError: null }
    case 'calibrated':     return { ...s, call: 'live' }
    case 'voice_mode':     return { ...s, voiceMode: a.mode, voiceError: a.error ?? null }
    case 'score_tile':     return { ...s, scores: { ...s.scores, [a.id]: a.score } }
    case 'transcript':     return { ...s, transcript: [...s.transcript, a.line] }
    case 'whisper':        return { ...s, whisper: a.whisper }
    case 'voice_activity': return { ...s, userActive: a.user ?? s.userActive, aiActive: a.ai ?? s.aiActive }
    case 'moment':         return { ...s, moment: a.moment }
    case 'coaching':       return { ...s, coaching: a.bullets }
    case 'end':            return { ...s, call: 'scoring' }
    case 'final_scores':   return {
      ...s,
      finalScores: a.scores,
      moment: a.moment ?? s.moment,
      coaching: a.coaching ?? s.coaching,
      call: 'done',
    }
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

  // Latest known state (for use inside the end callback without recreating it).
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // End-call helper — stable reference so the auto-end timer can call it.
  //
  // Flow:
  //   1. Stop the live voice session (closes WS + mic).
  //   2. Dispatch 'end' → call='scoring' (LiveCall stays visible with overlay).
  //   3. POST the captured transcript to /api/score. Tile / moment / coaching
  //      events stream back; each updates the reducer in real time.
  //   4. When the final result arrives → dispatch 'final_scores' with moment +
  //      coaching → call='done' → Scorecard renders with the real grade.
  //   5. On any error / empty transcript, fall back to SYNTHETIC_FINAL so the
  //      user never lands on a blank scorecard.
  const end = useCallback((_reason: 'user' | 'auto' | 'error' = 'user') => {
    voice.current?.stop()
    voice.current = null
    dispatch({ type: 'end' })

    const cur = stateRef.current
    const transcript = cur.transcript
    const persona = cur.persona
    const usingLive = cur.voiceMode === 'live' && transcript.length > 0

    if (!usingLive) {
      // No real conversation happened — just resolve to the canned scorecard.
      // Keep a small delay so the scoring state is briefly visible (UX polish).
      setTimeout(
        () => dispatch({
          type: 'final_scores',
          scores: SYNTHETIC_FINAL,
          moment: DEFAULT_MOMENT,
          coaching: DEFAULT_COACHING,
        }),
        700,
      )
      return
    }

    streamScore(
      transcript,
      {
        name: persona?.full_name ?? 'Buyer',
        title: persona?.title ?? '—',
        difficulty: persona?.difficulty ?? 'hard',
      },
      true,
      {
        tile: (id, score) => dispatch({ type: 'score_tile', id: id as BehaviorId, score }),
        moment: (m) => dispatch({ type: 'moment', moment: m }),
        coaching: (bullets) => dispatch({ type: 'coaching', bullets }),
        result: (full) => dispatch({
          type: 'final_scores',
          scores: full.scores,
          moment: full.moment,
          coaching: full.coaching,
        }),
        error: () => dispatch({
          type: 'final_scores',
          scores: SYNTHETIC_FINAL,
          moment: DEFAULT_MOMENT,
          coaching: DEFAULT_COACHING,
        }),
      },
    ).catch(() => dispatch({
      type: 'final_scores',
      scores: SYNTHETIC_FINAL,
      moment: DEFAULT_MOMENT,
      coaching: DEFAULT_COACHING,
    }))
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

  // Real-time mid-call coaching: every ~22s during a live call (with a real
  // voice session and a non-trivial transcript), poll /api/whisper. If the
  // model returns a tactical tip we haven't shown before, dispatch it.
  useEffect(() => {
    if (state.call !== 'live') return
    if (state.voiceMode !== 'live') return // synthetic engine handles whisper in synthetic mode

    const seenTips = new Set<string>()
    let lastTranscriptLen = 0
    let cancelled = false

    const tick = async () => {
      const cur = stateRef.current
      // Only poll if the transcript has grown since last poll (avoids redundant cost).
      if (cur.transcript.length === lastTranscriptLen) return
      lastTranscriptLen = cur.transcript.length
      if (cur.transcript.length < 3) return

      const w = await fetchWhisper(cur.transcript, {
        name: cur.persona?.full_name ?? 'Buyer',
        difficulty: cur.persona?.difficulty ?? 'hard',
      })
      if (cancelled || !w) return
      const key = w.text.toLowerCase().trim()
      if (seenTips.has(key)) return
      seenTips.add(key)
      dispatch({ type: 'whisper', whisper: w })
    }

    const id = setInterval(tick, 22000)
    return () => { cancelled = true; clearInterval(id) }
  }, [state.call, state.voiceMode])

  // Real-time tile rescoring: every ~45s during a live call, POST the
  // running transcript to /api/score with final=false. The streamed tile
  // events update the cockpit in real time so the recruiter sees Grok-3
  // actually judging behavior, not just the canned synthetic timeline.
  useEffect(() => {
    if (state.call !== 'live') return
    if (state.voiceMode !== 'live') return

    let cancelled = false
    let lastTranscriptLen = 0
    let inFlight = false

    const tick = async () => {
      if (inFlight) return
      const cur = stateRef.current
      if (cur.transcript.length === lastTranscriptLen) return
      if (cur.transcript.length < 4) return
      lastTranscriptLen = cur.transcript.length
      inFlight = true
      try {
        await streamScore(
          cur.transcript,
          {
            name: cur.persona?.full_name ?? 'Buyer',
            title: cur.persona?.title ?? '—',
            difficulty: cur.persona?.difficulty ?? 'hard',
          },
          false,
          {
            tile: (id, score) => {
              if (cancelled) return
              dispatch({ type: 'score_tile', id: id as BehaviorId, score: { ...score, updated: true } })
            },
            moment: (m) => { if (!cancelled) dispatch({ type: 'moment', moment: m }) },
            coaching: (bullets) => { if (!cancelled) dispatch({ type: 'coaching', bullets }) },
          },
        )
      } catch { /* ignore — we'll try again next tick */ }
      finally { inFlight = false }
    }

    const id = setInterval(tick, 45000)
    return () => { cancelled = true; clearInterval(id) }
  }, [state.call, state.voiceMode])

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
