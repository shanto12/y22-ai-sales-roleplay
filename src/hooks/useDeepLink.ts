import { useEffect, useState } from 'react'
import type { AppTab, CallState } from '../types.ts'

const VALID_TABS: AppTab[] = ['roleplay', 'prompt', 'guide']
const VALID_CALL: CallState[] = ['idle', 'calibrating', 'live', 'scoring', 'done']

export interface DeepLink {
  tab: AppTab | null
  callState: CallState | null
}

/**
 * Parse `?tab=&screen=` for screenshot scripts and recruiter shortcuts.
 *  - ?tab=prompt        → opens Prompt Lab on load
 *  - ?screen=live       → opens Live Call (with synthetic engine running)
 *  - ?screen=scorecard  → jumps straight to Scorecard
 */
export function useDeepLink(): DeepLink {
  const [link, setLink] = useState<DeepLink>(() => parse())

  useEffect(() => {
    const onPop = () => setLink(parse())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return link
}

function parse(): DeepLink {
  if (typeof window === 'undefined') return { tab: null, callState: null }
  const sp = new URLSearchParams(window.location.search)
  const t = sp.get('tab') as AppTab | null
  const s = sp.get('screen') as CallState | null
  return {
    tab: t && VALID_TABS.includes(t) ? t : null,
    callState: s && VALID_CALL.includes(s) ? s : null,
  }
}
