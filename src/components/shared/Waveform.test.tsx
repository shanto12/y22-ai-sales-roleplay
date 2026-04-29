import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Waveform } from './Waveform.tsx'

describe('<Waveform/>', () => {
  it('renders the requested number of bars', () => {
    const { container } = render(<Waveform count={42} />)
    expect(container.querySelectorAll('.wave .bar').length).toBe(42)
  })

  it('applies live + side class when active', () => {
    const { container } = render(<Waveform active count={8} side="r" />)
    expect(container.querySelector('.wave.live.ai')).toBeInTheDocument()
    expect(container.querySelector('.wave.dim')).toBeNull()
  })

  it('applies dim class when inactive', () => {
    const { container } = render(<Waveform count={8} />)
    expect(container.querySelector('.wave.dim')).toBeInTheDocument()
  })
})
