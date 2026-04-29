import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Configurator } from './Configurator.tsx'
import type { CustomConfig } from '../types.ts'

describe('<Configurator/>', () => {
  it('renders all 3 preset cards and the persona preview', () => {
    const noop = () => {}
    const custom: CustomConfig = { industry: 'fintech', title: 'cfo', difficulty: 'hard', objection: 'price' }
    render(
      <Configurator selectedPreset="cfo" setSelectedPreset={noop} custom={custom} setCustom={noop} onStart={noop} />,
    )
    expect(screen.getByText('Skeptical mid-market CFO')).toBeInTheDocument()
    expect(screen.getByText('Friendly-but-firm VP Sales')).toBeInTheDocument()
    expect(screen.getByText('Procurement gatekeeper')).toBeInTheDocument()
    // Persona preview synthesizes a name from title selection.
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
  })

  it('fires onStart when the primary CTA is clicked', async () => {
    const start = vi.fn()
    const noop = () => {}
    const custom: CustomConfig = { industry: 'fintech', title: 'cfo', difficulty: 'hard', objection: 'price' }
    render(
      <Configurator selectedPreset="cfo" setSelectedPreset={noop} custom={custom} setCustom={noop} onStart={start} />,
    )
    const startBtns = screen.getAllByRole('button', { name: /start roleplay/i })
    // The primary CTA at the bottom is the last match.
    await userEvent.click(startBtns[startBtns.length - 1])
    expect(start).toHaveBeenCalledTimes(1)
  })
})
