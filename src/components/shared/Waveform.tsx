import { useEffect, useMemo, useState } from 'react'
import { makeWaveBars } from '../../lib/wave-bars.ts'

export interface WaveformProps {
  side?: 'l' | 'r'
  active?: boolean
  count?: number
  seedOffset?: number
}

export function Waveform({ side = 'l', active = false, count = 56, seedOffset = 0 }: WaveformProps) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick((t) => (t + 1) % 1000), 110)
    return () => clearInterval(id)
  }, [active])

  const bars = useMemo(
    () => makeWaveBars(count, 1 + seedOffset + (active ? tick : 0)),
    [count, seedOffset, active, tick],
  )

  return (
    <div
      className={`wave ${active ? `live ${side === 'l' ? 'user' : 'ai'}` : 'dim'}`}
      style={{ flexDirection: side === 'r' ? 'row-reverse' : 'row' }}
    >
      {bars.map((b, i) => {
        const h = active ? Math.max(4, b * 64) : 4 + ((i * 13) % 8)
        return <div key={i} className="bar" style={{ height: `${h}px` }} />
      })}
    </div>
  )
}
