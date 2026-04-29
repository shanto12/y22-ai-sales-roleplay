import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Scorecard } from './Scorecard.tsx'
import { PRESETS } from '../data/presets.ts'
import { SYNTHETIC_FINAL } from '../lib/synthetic-engine.ts'

describe('<Scorecard/>', () => {
  it('renders the total score and grade derived from the score map', () => {
    render(<Scorecard persona={PRESETS[0]} scores={SYNTHETIC_FINAL} onTryHarder={() => {}} onAnother={() => {}} />)
    // 4+4+4+3+4+3 = 22
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('B+')).toBeInTheDocument()
  })

  it('toggles the full-transcript disclosure', async () => {
    render(<Scorecard persona={PRESETS[0]} scores={SYNTHETIC_FINAL} onTryHarder={() => {}} onAnother={() => {}} />)
    expect(document.getElementById('full-transcript')).toBeNull()
    await userEvent.click(screen.getByText(/Full transcript/i))
    expect(document.getElementById('full-transcript')).toBeInTheDocument()
  })

  it('toggles a coaching bookmark and surfaces the saved count', async () => {
    render(<Scorecard persona={PRESETS[0]} scores={SYNTHETIC_FINAL} onTryHarder={() => {}} onAnother={() => {}} />)
    const bookmarkButtons = screen.getAllByTitle(/Save to playbook|Remove from playbook/i)
    expect(bookmarkButtons.length).toBe(3)
    expect(screen.getByText(/0 of 3 saved to playbook/i)).toBeInTheDocument()
    await userEvent.click(bookmarkButtons[0])
    expect(screen.getByText(/1 of 3 saved to playbook/i)).toBeInTheDocument()
  })

  it('fires onAnother when the primary CTA is clicked', async () => {
    const onAnother = vi.fn()
    render(<Scorecard persona={PRESETS[0]} scores={SYNTHETIC_FINAL} onTryHarder={() => {}} onAnother={onAnother} />)
    await userEvent.click(screen.getByTestId('run-another'))
    expect(onAnother).toHaveBeenCalled()
  })
})
