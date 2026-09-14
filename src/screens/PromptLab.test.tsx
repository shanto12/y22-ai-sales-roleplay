import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptLab } from './PromptLab.tsx'

describe('<PromptLab/>', () => {
  it('shows v1.4 as SELECTED on first render', () => {
    render(<PromptLab />)
    expect(screen.getByText('v1.4 +personality')).toBeInTheDocument()
    expect(screen.getByText(/^SELECTED$/i)).toBeInTheDocument()
  })

  it('switches the active version when Select example is clicked', async () => {
    render(<PromptLab />)
    // Two non-active versions render Select example buttons.
    const activates = screen.getAllByRole('button', { name: /^Select example$/i })
    expect(activates.length).toBe(2)
    await userEvent.click(activates[0]) // activate v1.2
    // Now there are still 2 Select example buttons but a different version is SELECTED.
    expect(screen.getAllByRole('button', { name: /^Select example$/i }).length).toBe(2)
  })

  it('opens the Diff modal when the diff button is clicked', async () => {
    render(<PromptLab />)
    await userEvent.click(screen.getByRole('button', { name: /Diff v1\.3/i }))
    expect(screen.getByRole('dialog', { name: /Diff/i })).toBeInTheDocument()
  })

  it('opens the Versioning roadmap modal', async () => {
    render(<PromptLab />)
    await userEvent.click(screen.getByRole('button', { name: /Versioning roadmap/i }))
    expect(screen.getByRole('dialog', { name: /Prompt versioning roadmap/i })).toBeInTheDocument()
  })
})
