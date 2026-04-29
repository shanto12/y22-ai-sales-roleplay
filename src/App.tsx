import { useEffect, useMemo, useState } from 'react'
import { TopChrome } from './components/chrome/TopChrome.tsx'
import { SyntheticBanner } from './components/chrome/SyntheticBanner.tsx'
import { Configurator } from './screens/Configurator.tsx'
import { LiveCall } from './screens/LiveCall.tsx'
import { Scorecard } from './screens/Scorecard.tsx'
import { PromptLab } from './screens/PromptLab.tsx'
import { DemoGuide } from './screens/DemoGuide.tsx'
import { useHealth } from './hooks/useHealth.ts'
import { useDeepLink } from './hooks/useDeepLink.ts'
import { useCallMachine } from './hooks/useCallMachine.ts'
import { PRESETS } from './data/presets.ts'
import { SYNTHETIC_FINAL } from './lib/synthetic-engine.ts'
import type { AppTab, CustomConfig, Persona } from './types.ts'

function App() {
  const health = useHealth()
  const deepLink = useDeepLink()
  const synthetic = health.mode === 'synthetic'

  const [tab, setTab] = useState<AppTab>(deepLink.tab ?? 'roleplay')
  const [presetId, setPresetId] = useState<string>('cfo')
  const [custom, setCustom] = useState<CustomConfig>({ industry: 'fintech', title: 'cfo', difficulty: 'hard', objection: 'price' })

  const { state, selectPersona, start, end, reset, forceState } = useCallMachine(synthetic)

  const persona: Persona = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId],
  )
  useEffect(() => { selectPersona(persona) }, [persona, selectPersona])

  // Allow ?screen= deep-link to jump to a specific call state for screenshots.
  useEffect(() => {
    if (deepLink.callState && deepLink.callState !== 'idle') {
      forceState(deepLink.callState)
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clock for the live-call timer. The interval callback updates state from
  // outside React (timer fires asynchronously), so setState there is allowed.
  const [elapsed, setElapsed] = useState('00:00')
  useEffect(() => {
    if (state.call !== 'live') return
    const startedAt = Date.now()
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000)
      setElapsed(`${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`)
    }, 500)
    return () => {
      clearInterval(id)
      setElapsed('00:00')
    }
  }, [state.call])

  return (
    <div className="app">
      {synthetic && <SyntheticBanner />}
      <TopChrome tab={tab} setTab={setTab} health={health} />

      <div className="app-body">
        {tab === 'roleplay' && (state.call === 'idle') && (
          <Configurator
            selectedPreset={presetId}
            setSelectedPreset={setPresetId}
            custom={custom}
            setCustom={setCustom}
            onStart={start}
          />
        )}

        {tab === 'roleplay' && (state.call === 'calibrating' || state.call === 'live' || state.call === 'scoring') && (
          <LiveCall
            persona={persona}
            userActive={state.userActive}
            aiActive={state.aiActive}
            scores={state.scores}
            transcript={state.transcript}
            whisper={state.whisper}
            calibrating={state.call === 'calibrating'}
            onEnd={end}
            elapsed={elapsed}
          />
        )}

        {tab === 'roleplay' && state.call === 'done' && (
          <Scorecard
            persona={persona}
            scores={state.finalScores ?? SYNTHETIC_FINAL}
            onTryHarder={() => { setCustom({ ...custom, difficulty: 'hard' }); reset(); start() }}
            onAnother={() => reset()}
          />
        )}

        {tab === 'prompt' && <PromptLab />}
        {tab === 'guide' && <DemoGuide health={health} />}
      </div>
    </div>
  )
}

export default App
