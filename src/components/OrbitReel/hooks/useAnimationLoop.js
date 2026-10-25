import { useEffect } from 'react'
import { FIRST_WAVE_MS, MAX_FRAME_S } from '../OrbitReel.constants'
import { createRenderer } from '../engine/render'
import { activeCardOf, now } from '../engine/state'
import { updateMorph, updateRotation, updateWave } from '../engine/update'

// Runs the frame loop for the component's lifetime: advance the simulation, report the active item,
// then draw. Everything it reads comes through refs, so it never restarts.
export function useAnimationLoop({ simRef, liveRef, setActive, cardRefs, flipRefs, childrenRef, overlayRef }) {
  useEffect(() => {
    const S = simRef.current
    const render = createRenderer({ cardRefs, flipRefs, childrenRef, overlayRef })
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
      updateRotation(S, live, t, dt, morphProgress)
      reportActive(S, live, setActive)
      const waveEnded = updateWave(S, live, t, morphProgress)
      render(S, live, t, waveEnded)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [simRef, liveRef, setActive, cardRefs, flipRefs, childrenRef, overlayRef])
}

function reportActive(S, live, setActive) {
  const card = activeCardOf(S, live.n)
  if (card === S.reportedActive) return
  S.reportedActive = card
  const index = card % live.len
  setActive(index)
  live.onActiveChange?.(live.items[index], index)
}
