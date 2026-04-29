import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreTile } from './ScoreTile.tsx'
import type { Behavior } from '../../types.ts'

const b: Behavior = { id: 'discovery', name: 'Discovery Depth', short: 'discovery' }

describe('<ScoreTile/>', () => {
  it('renders the score with /5 suffix and the rationale', () => {
    render(<ScoreTile b={b} score={{ score: 4, band: 'green', rationale: 'Asked about budget cycle.' }} />)
    expect(screen.getByText('Discovery Depth')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('/5')).toBeInTheDocument()
    expect(screen.getByText('Asked about budget cycle.')).toBeInTheDocument()
  })

  it('uses the band class on the tile container', () => {
    const { container } = render(<ScoreTile b={b} score={{ score: 2, band: 'coral', rationale: 'No multithread yet.' }} />)
    expect(container.querySelector('.tile.s-coral')).toBeInTheDocument()
  })

  it('shows pulse class only when updated=true', () => {
    const { container, rerender } = render(<ScoreTile b={b} score={{ score: 3, band: 'amber', rationale: 'x', updated: false }} />)
    expect(container.querySelector('.tile.pulse')).toBeNull()
    rerender(<ScoreTile b={b} score={{ score: 3, band: 'amber', rationale: 'x', updated: true }} />)
    expect(container.querySelector('.tile.pulse')).toBeInTheDocument()
  })

  it('shows the placeholder rationale when score is 0 and no rationale', () => {
    render(<ScoreTile b={b} score={{ score: 0, band: 'coral', rationale: '' }} />)
    expect(screen.getByText('Awaiting first signal…')).toBeInTheDocument()
  })
})
