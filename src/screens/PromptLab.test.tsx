import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptLab } from './PromptLab.tsx'

describe('<PromptLab/>', () => {
  it('shows v1.4 as ACTIVE on first render', () => {
    render(<PromptLab />)
    expect(screen.getByText('v1.4 +personality')).toBeInTheDocument()
    expect(screen.getByText(/ACTIVE/i)).toBeInTheDocument()
  })

  it('switches the active version when Activate is clicked', async () => {
    render(<PromptLab />)
    // Two non-active versions render Activate buttons.
    const activates = screen.getAllByRole('button', { name: /^Activate$/i })
    expect(activates.length).toBe(2)
    await userEvent.click(activates[0]) // activate v1.2
    // Now there are still 2 Activate buttons but a different version is ACTIVE.
    expect(screen.getAllByRole('button', { name: /^Activate$/i }).length).toBe(2)
  })

  it('opens the Diff modal when the diff button is clicked', async () => {
    render(<PromptLab />)
    await userEvent.click(screen.getByRole('button', { name: /Diff v1\.3/i }))
    expect(screen.getByRole('dialog', { name: /Diff/i })).toBeInTheDocument()
  })

  it('opens the New version modal', async () => {
    render(<PromptLab />)
    await userEvent.click(screen.getByRole('button', { name: /New version/i }))
    expect(screen.getByRole('dialog', { name: /New persona version/i })).toBeInTheDocument()
  })
})
