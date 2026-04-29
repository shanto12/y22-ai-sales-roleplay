import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LiveCall } from './LiveCall.tsx'
import { PRESETS } from '../data/presets.ts'
import { MID_SCORES, WHISPER_NOW } from '../data/synthetic-call.ts'

describe('<LiveCall/>', () => {
  it('shows the persona header and timer pill', () => {
    render(
      <LiveCall
        persona={PRESETS[0]}
        userActive
        aiActive={false}
        scores={MID_SCORES}
        transcript={[]}
        whisper={null}
        calibrating={false}
        onEnd={() => {}}
        elapsed="01:24"
      />,
    )
    expect(screen.getByText(/Sarah Chen/)).toBeInTheDocument()
    expect(screen.getByText('01:24')).toBeInTheDocument()
  })

  it('Whisper Use action moves card into the resolved state and adds a history entry', async () => {
    render(
      <LiveCall
        persona={PRESETS[0]}
        userActive={false}
        aiActive
        scores={MID_SCORES}
        transcript={[]}
        whisper={WHISPER_NOW}
        calibrating={false}
        onEnd={() => {}}
        elapsed="01:24"
      />,
    )
    await userEvent.click(screen.getByTestId('whisper-use'))
    expect(screen.getByText(/Whisper used/i)).toBeInTheDocument()
  })

  it('End call fires onEnd', async () => {
    const onEnd = vi.fn()
    render(
      <LiveCall
        persona={PRESETS[0]}
        userActive={false}
        aiActive
        scores={MID_SCORES}
        transcript={[]}
        whisper={null}
        calibrating={false}
        onEnd={onEnd}
        elapsed="01:24"
      />,
    )
    await userEvent.click(screen.getByTestId('end-call'))
    expect(onEnd).toHaveBeenCalledTimes(1)
  })
})
