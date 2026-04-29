// Main app shell + state machine
function App() {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "callState": "live",
    "tab": "roleplay",
    "showCalibrating": false,
    "showSyntheticBanner": false,
    "userSpeaking": false,
    "aiSpeaking": true,
    "showWhisper": true
  }/*EDITMODE-END*/);

  const [selectedPreset, setSelectedPreset] = React.useState('cfo');
  const [custom, setCustom] = React.useState({ industry: 'fintech', title: 'cfo', difficulty: 'hard', objection: 'price' });

  const persona = PRESETS.find(p => p.id === selectedPreset) || PRESETS[0];

  const handleStart = () => setTweak('callState', 'live');

  return (
    <div className="app">
      {tweaks.showSyntheticBanner && (
        <div className="synthetic-banner">
          <Activity size={14}/>
          <span><strong>Live voice unavailable</strong> — playing canned roleplay. Add <span className="key">XAI_API_KEY</span> to enable Grok.</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono, monospace' }}>fallback · 5 canned scenarios loaded</span>
        </div>
      )}

      <header className="chrome">
        <div className="wordmark">
          <span className="y22-mark">Y22</span>
          <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>roleplay</span>
        </div>
        <nav className="tabs">
          <button className={`tab ${tweaks.tab === 'roleplay' ? 'active' : ''}`} onClick={() => setTweak('tab', 'roleplay')}>
            <Phone size={13} style={{ marginRight: 6, verticalAlign: '-2px' }}/>Roleplay
          </button>
          <button className={`tab ${tweaks.tab === 'prompt' ? 'active' : ''}`} onClick={() => setTweak('tab', 'prompt')}>
            <Beaker size={13} style={{ marginRight: 6, verticalAlign: '-2px' }}/>Prompt Lab
          </button>
          <button className={`tab ${tweaks.tab === 'guide' ? 'active' : ''}`} onClick={() => setTweak('tab', 'guide')}>
            <Book size={13} style={{ marginRight: 6, verticalAlign: '-2px' }}/>Demo Guide
          </button>
        </nav>
        <div className="chrome-right">
          <span className="live-chip">
            <span className="dot" />
            <span>Live</span>
            <span style={{ color: 'var(--hairline-2)' }}>·</span>
            <span className="model">grok-voice-think-fast-1.0</span>
          </span>
          <span className="synthetic-pill">Synthetic data — demo only</span>
          <button className="btn" style={{ padding: '6px 10px' }}><Settings size={13}/></button>
        </div>
      </header>

      <div className="app-body">
        {tweaks.tab === 'roleplay' && tweaks.callState === 'config' && (
          <Configurator
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            custom={custom}
            setCustom={setCustom}
            onStart={handleStart}
          />
        )}
        {tweaks.tab === 'roleplay' && tweaks.callState === 'live' && (
          <LiveCall
            persona={persona}
            userActive={tweaks.userSpeaking}
            aiActive={tweaks.aiSpeaking}
            scores={MID_SCORES}
            showCalibrating={tweaks.showCalibrating}
            whisper={tweaks.showWhisper ? WHISPER_NOW : null}
          />
        )}
        {tweaks.tab === 'roleplay' && tweaks.callState === 'scorecard' && (
          <Scorecard persona={persona} />
        )}
        {tweaks.tab === 'prompt' && <PromptLab />}
        {tweaks.tab === 'guide' && <DemoGuide />}
      </div>

      <TweaksPanel title="Tweaks" defaultOpen={false}>
        <TweakSection title="Screen state">
          <TweakRadio
            label="Call state"
            value={tweaks.callState}
            onChange={v => { setTweak('callState', v); setTweak('tab', 'roleplay'); }}
            options={[
              { value: 'config', label: 'Configure' },
              { value: 'live', label: 'Live call' },
              { value: 'scorecard', label: 'Scorecard' }
            ]}
          />
          <TweakRadio
            label="Top-nav tab"
            value={tweaks.tab}
            onChange={v => setTweak('tab', v)}
            options={[
              { value: 'roleplay', label: 'Roleplay' },
              { value: 'prompt', label: 'Prompt Lab' },
              { value: 'guide', label: 'Demo Guide' }
            ]}
          />
        </TweakSection>

        <TweakSection title="Live call">
          <TweakToggle label="User speaking (mic active)" value={tweaks.userSpeaking} onChange={v => setTweak('userSpeaking', v)} />
          <TweakToggle label="Buyer speaking (Sarah)" value={tweaks.aiSpeaking} onChange={v => setTweak('aiSpeaking', v)} />
          <TweakToggle label="Show whisper coaching" value={tweaks.showWhisper} onChange={v => setTweak('showWhisper', v)} />
          <TweakToggle label="Calibrating mic… overlay" value={tweaks.showCalibrating} onChange={v => setTweak('showCalibrating', v)} />
        </TweakSection>

        <TweakSection title="Environment">
          <TweakToggle label="Synthetic mode banner (no XAI_API_KEY)" value={tweaks.showSyntheticBanner} onChange={v => setTweak('showSyntheticBanner', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
