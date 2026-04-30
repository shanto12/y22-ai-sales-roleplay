import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Scorecard } from './Scorecard.tsx'
import { PRESETS } from '../data/presets.ts'
import { SYNTHETIC_FINAL } from '../lib/synthetic-engine.ts'

const FIXTURE_MOMENT = { time: '00:52', text: 'when she said "we already have a vendor", you reframed instead of discounting.' }
const FIXTURE_COACHING = [
  '**When she challenged ROI**, lead with the 90-day payback line.',
  '**Multithread earlier**.',
  '**Cut your talk:listen ratio** to 50/50 before minute 2.',
]

const baseProps = {
  persona: PRESETS[0],
  scores: SYNTHETIC_FINAL,
  moment: FIXTURE_MOMENT,
  coaching: FIXTURE_COACHING,
  transcript: [],
  onTryHarder: () => {},
  onAnother: () => {},
}

describe('<Scorecard/>', () => {
  it('renders the total score and grade derived from the score map', () => {
    render(<Scorecard {...baseProps} />)
    // 4+4+4+3+4+3 = 22
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('B+')).toBeInTheDocument()
  })

  it('renders the dynamic moment time and text', () => {
    render(<Scorecard {...baseProps} moment={{ time: '02:14', text: 'Pivoting to ROI killed the price objection.' }} />)
    expect(screen.getByText('02:14')).toBeInTheDocument()
    expect(screen.getByText(/Pivoting to ROI killed the price objection/)).toBeInTheDocument()
  })

  it('renders coaching bullets with markdown bold rendered as emphasis', () => {
    render(<Scorecard {...baseProps} />)
    expect(screen.getByText('When she challenged ROI')).toBeInTheDocument()
    expect(screen.getByText('Multithread earlier')).toBeInTheDocument()
  })

  it('toggles the full-transcript disclosure', async () => {
    render(<Scorecard {...baseProps} />)
    expect(document.getElementById('full-transcript')).toBeNull()
    await userEvent.click(screen.getByText(/Full transcript/i))
    expect(document.getElementById('full-transcript')).toBeInTheDocument()
  })

  it('toggles a coaching bookmark and surfaces the saved count', async () => {
    render(<Scorecard {...baseProps} />)
    const bookmarkButtons = screen.getAllByTitle(/Save to playbook|Remove from playbook/i)
    expect(bookmarkButtons.length).toBe(3)
    expect(screen.getByText(/0 of 3 saved to playbook/i)).toBeInTheDocument()
    await userEvent.click(bookmarkButtons[0])
    expect(screen.getByText(/1 of 3 saved to playbook/i)).toBeInTheDocument()
  })

  it('fires onAnother when the primary CTA is clicked', async () => {
    const onAnother = vi.fn()
    render(<Scorecard {...baseProps} onAnother={onAnother} />)
    await userEvent.click(screen.getByTestId('run-another'))
    expect(onAnother).toHaveBeenCalled()
  })
})
