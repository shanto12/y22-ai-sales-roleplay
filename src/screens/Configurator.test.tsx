import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Configurator } from './Configurator.tsx'
import type { CustomConfig } from '../types.ts'

beforeEach(() => {
  // Pre-dismiss the intro card so we test the configurator core, not the welcome state.
  try { window.localStorage.setItem('y22.introDismissed.v1', '1') } catch { /* ignore */ }
})

describe('<Configurator/>', () => {
  it('renders all 3 preset cards', () => {
    const noop = () => {}
    const custom: CustomConfig = { industry: 'fintech', title: 'cfo', difficulty: 'hard', objection: 'price' }
    render(
      <Configurator selectedPreset="cfo" setSelectedPreset={noop} custom={custom} setCustom={noop} onStart={noop} />,
    )
    expect(screen.getByTestId('preset-cfo')).toBeInTheDocument()
    expect(screen.getByTestId('preset-vpsales')).toBeInTheDocument()
    expect(screen.getByTestId('preset-procure')).toBeInTheDocument()
  })

  it('fires onStart when the primary CTA is clicked', async () => {
    const start = vi.fn()
    const noop = () => {}
    const custom: CustomConfig = { industry: 'fintech', title: 'cfo', difficulty: 'hard', objection: 'price' }
    render(
      <Configurator selectedPreset="cfo" setSelectedPreset={noop} custom={custom} setCustom={noop} onStart={start} />,
    )
    await userEvent.click(screen.getByTestId('start-roleplay-cta'))
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('reveals the custom buyer panel when the toggle is clicked', async () => {
    const noop = () => {}
    const custom: CustomConfig = { industry: 'fintech', title: 'cfo', difficulty: 'hard', objection: 'price' }
    render(
      <Configurator selectedPreset="cfo" setSelectedPreset={noop} custom={custom} setCustom={noop} onStart={noop} />,
    )
    // Custom panel hidden initially.
    expect(document.getElementById('custom-buyer-panel')).toBeNull()
    await userEvent.click(screen.getByTestId('custom-toggle'))
    expect(document.getElementById('custom-buyer-panel')).toBeInTheDocument()
    // Persona preview synthesizes Sarah Chen from cfo+fintech.
    expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThan(0)
  })
})
