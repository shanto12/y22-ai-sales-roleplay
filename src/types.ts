export type IndustryId = 'saas' | 'fintech' | 'healthcare' | 'realestate'
export type TitleId = 'vpsales' | 'cfo' | 'procurement' | 'it'
export type DifficultyId = 'easy' | 'medium' | 'hard'
export type ObjectionId = 'price' | 'competitor' | 'timing' | 'feature'

export type BehaviorId = 'discovery' | 'objection' | 'value' | 'multi' | 'next' | 'tlr'

export interface Behavior {
  id: BehaviorId
  name: string
  short: string
}

export type ScoreBand = 'green' | 'amber' | 'coral'

export interface Score {
  score: number
  band: ScoreBand
  rationale: string
  updated?: boolean
  delta?: string
}

export type ScoreMap = Record<BehaviorId, Score>

export interface Persona {
  id: string
  name: string
  profile: string
  difficulty: DifficultyId
  monogram: string
  full_name: string
  title: string
  company: string
  industry: IndustryId
  title_key: TitleId
  objection: ObjectionId
  pains: string[]
  objection_line: string
}

export interface CustomConfig {
  industry: IndustryId
  title: TitleId
  difficulty: DifficultyId
  objection: ObjectionId
}

export interface BuiltPersona {
  monogram: string
  name: string
  title: string
  pains: string[]
  objection: string
  industryLabel: string
  objectionLabel: string
}

export interface TranscriptLine {
  t: string
  who: 'user' | 'buyer'
  text: string
}

export interface WhisperPrompt {
  text: string
  reason: string
}

export interface PromptVersion {
  ver: string
  date: string
  selected: boolean
  body: string
  bars: { lbl: string; v: number; band: '' | 'amber' | 'coral' }[]
  delta: Record<string, string> | null
}

export type CallState = 'idle' | 'calibrating' | 'live' | 'scoring' | 'done'

export type AppTab = 'roleplay' | 'prompt' | 'guide'

export interface HealthResponse {
  mode: 'live' | 'synthetic'
  provider: string
  model: string
  scoringModel: string
  capabilities: {
    voice: { live: boolean; p50_ms: number }
    scoring: { live: boolean; p50_ms: number }
    persona: { live: boolean; cold_p50_ms: number }
  }
  syntheticReady: boolean
  version: string
}
