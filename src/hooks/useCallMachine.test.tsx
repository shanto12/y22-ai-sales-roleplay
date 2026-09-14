import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCallMachine } from './useCallMachine.ts'
import { PRESETS } from '../data/presets.ts'

vi.mock('../lib/api.ts', () => ({ mintToken: vi.fn(async () => ({ value: 'test-only', mode: 'live' })), streamScore: vi.fn(async () => {}), fetchWhisper: vi.fn(async () => null) }))
vi.mock('../lib/voice-session.ts', () => ({ VoiceSession: class { events: { onConnected: () => void }; constructor(events: { onConnected: () => void }) { this.events = events } async start() { this.events.onConnected() } stop() {} } }))

describe('live evidence boundary', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())
  it('does not invent scores, transcript or coaching while a live session waits for speech', async () => {
    const { result, unmount } = renderHook(() => useCallMachine(false))
    act(() => result.current.selectPersona(PRESETS[0]))
    act(() => result.current.start())
    await act(async () => { await vi.advanceTimersByTimeAsync(1300) })
    expect(result.current.state.voiceMode).toBe('live')
    await act(async () => { await vi.advanceTimersByTimeAsync(65000) })
    expect(result.current.state.transcript).toHaveLength(0)
    expect(result.current.state.whisper).toBeNull()
    expect(Object.values(result.current.state.scores).every(s => s.score === 0)).toBe(true)
    act(() => result.current.end())
    expect(result.current.state.voiceError).toContain('No conversation was captured')
    expect(Object.values(result.current.state.finalScores!).every(s => s.score === 0)).toBe(true)
    unmount()
  })
})
