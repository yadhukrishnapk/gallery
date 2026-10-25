import { useEffect } from 'react'
import { clamp } from '../../../lib/math'
import { WHEEL } from '../OrbitReel.constants'
import { isArc, now } from '../engine/state'

// Scroll to turn: spins the ring, or glides the arc and settles on the nearest card once scrolling
// pauses. Attached natively because React's onWheel is passive and can't stop the page scrolling.
export function useWheelInput({ rootRef, simRef, liveRef }) {
  useEffect(() => {
    const el = rootRef.current
    const onWheel = (ev) => {
      const { wheel, geo } = liveRef.current
      if (!wheel || !geo) return
      ev.preventDefault()
      const delta = scrollDelta(ev, geo.h)
      const S = simRef.current
      if (isArc(S)) {
        S.rot -= (delta * WHEEL.arcSpeed) / geo.arc.r
        S.vel = 0
        S.wheelPending = true
        S.wheelUntil = now() + WHEEL.settleMs
        S.lastStep = now()
      } else {
        S.vel = clamp(S.vel + delta * WHEEL.ringSpeed, -WHEEL.maxRingVel, WHEEL.maxRingVel)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [rootRef, simRef, liveRef])
}

// Scroll distance along the dominant axis, in pixels whatever unit the device reports.
function scrollDelta(ev, pageHeight) {
  const unit =
    ev.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? WHEEL.lineHeightPx
      : ev.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? pageHeight
        : 1
  const delta = Math.abs(ev.deltaY) > Math.abs(ev.deltaX) ? ev.deltaY : ev.deltaX
  return delta * unit
}
