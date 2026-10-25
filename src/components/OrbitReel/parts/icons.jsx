import { TAU } from '../../../lib/math'
import * as styles from '../OrbitReel.styles'

export function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon.chevron} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={dir === 'left' ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RingIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon.ring} fill="currentColor" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * TAU
        return <circle key={i} cx={8 + 5.5 * Math.sin(a)} cy={8 - 5.5 * Math.cos(a)} r="1.35" />
      })}
    </svg>
  )
}
