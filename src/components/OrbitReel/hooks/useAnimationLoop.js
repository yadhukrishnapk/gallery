import { useEffect } from 'react'
import { FIRST_WAVE_MS, MAX_FRAME_S } from '../OrbitReel.constants'
import { createCruise } from '../engine/cruise'
import { createRenderer } from '../engine/render'
import { activeCardOf, now } from '../engine/state'
import { arcAtRest, updateMorph, updateRotation, updateWave } from '../engine/update'

// Runs the frame loop for the component's lifetime: advance the simulation, report the active item,
// then draw. Everything it reads comes through refs, so it never restarts. While the ring just spins,
// the browser turns it instead (see engine/cruise.js) and the loop only keeps count.
export function useAnimationLoop({ simRef, liveRef, setActive, setFocus, stageRef, cardsRef, flipsRef, childrenRef, overlayRef }) {
  useEffect(() => {
    const S = simRef.current
    const render = createRenderer({ cardsRef, flipsRef, childrenRef, overlayRef })
    const cruise = createCruise(stageRef)
    let last = now()
    let raf
    S.nextWaveAt = last + FIRST_WAVE_MS

    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(MAX_FRAME_S, (t - last) / 1000)
      last = t
      const live = liveRef.current
      if (!live.geo) return

      const morphProgress = updateMorph(S, t, live.reducedMotion)
      const cruising = cruise.follow(S, live, morphProgress)
      if (!cruising) updateRotation(S, live, t, dt, morphProgress)
      reportActive(S, live, setActive)
      reportFocus(S, live, setFocus, morphProgress)
      const waveEnded = updateWave(S, live, t, morphProgress)
      if (!cruising) cruise.start(S, live, morphProgress)
      render(S, live, t, waveEnded, cruise.cardRotation(S))
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      cruise.stop()
    }
  }, [simRef, liveRef, setActive, setFocus, stageRef, cardsRef, flipsRef, childrenRef, overlayRef])
}

function reportActive(S, live, setActive) {
  const card = activeCardOf(S, live.n)
  if (card === S.reportedActive) return
  S.reportedActive = card
  const index = card % live.len
  setActive(index)
  live.onActiveChange?.(live.items[index], index)
}

// The card in focus is the one resting on top of the arc, and it switches to its full photo. Waiting
// until it rests keeps photo decoding out of the animation, and skips photos that only pass by.
function reportFocus(S, live, setFocus, morphProgress) {
  const focus = arcAtRest(S, live.geo, morphProgress) ? activeCardOf(S, live.n) : null
  if (focus === S.reportedFocus) return
  S.reportedFocus = focus
  setFocus(focus)
}
