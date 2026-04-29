import type { Behavior } from '../types.ts'

export const BEHAVIORS: Behavior[] = [
  { id: 'discovery', name: 'Discovery Depth', short: 'discovery' },
  { id: 'objection', name: 'Objection Acknowledgement', short: 'objection' },
  { id: 'value',     name: 'Value Framing', short: 'value' },
  { id: 'multi',     name: 'Multithreading', short: 'multi' },
  { id: 'next',      name: 'Next-Step Specificity', short: 'next' },
  { id: 'tlr',       name: 'Talk:Listen Ratio', short: 'tlr' },
]

export const INDUSTRIES = [
  { id: 'saas',       label: 'SaaS' },
  { id: 'fintech',    label: 'FinTech' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'realestate', label: 'Real Estate' },
] as const

export const TITLES = [
  { id: 'vpsales',     label: 'VP Sales' },
  { id: 'cfo',         label: 'CFO' },
  { id: 'procurement', label: 'Procurement Mgr' },
  { id: 'it',          label: 'IT Director' },
] as const

export const OBJECTIONS = [
  { id: 'price',      label: 'Price-focused' },
  { id: 'competitor', label: 'Competitor-loyal' },
  { id: 'timing',     label: 'Timing / budget' },
  { id: 'feature',    label: 'Feature gaps' },
] as const
