import { useMemo } from 'react'
import { useElementSize } from '../../../hooks/useElementSize'
import { COMPACT_WIDTH } from '../OrbitReel.constants'
import { getCardCount, getGeometry, getUiHeight } from '../engine/geometry'

// Measures the reel and works out how many cards it shows (`n`) and where they go (`geo`).
// `geo` is null until the reel has been measured.
export function useReelLayout(rootRef, { len, count, mobileCount, captions, controls, aspect, gap, arc, apex }) {
  const { w, h } = useElementSize(rootRef)
  const compact = w > 0 && w < COMPACT_WIDTH
  const n = getCardCount(len, compact ? mobileCount : count)
  const uiHeight = getUiHeight({ captions, controls, compact })
  const geo = useMemo(
    () => (w ? getGeometry(w, h, n, { aspect, gap, arc, apex, uiHeight }) : null),
    [w, h, n, aspect, gap, arc, apex, uiHeight],
  )
  return { n, geo }
}
