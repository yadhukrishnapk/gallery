import { clamp } from '../../../lib/math'
import { orbitAt, pointOnOrbit } from './geometry'
import { waveFlipAt } from './update'

// Returns a `render(S, live, t, waveEnded)` that writes one frame straight to the DOM through the
// given refs. It skips all writes while nothing moves (settled arc, paused ring), so an idle reel
// costs nothing.
export function createRenderer({ cardsRef, flipsRef, childrenRef, overlayRef }) {
  const last = {}

  return function render(S, live, t, waveEnded) {
    const { geo, n, tilt } = live
    const unchanged =
      last.rot === S.rot && last.m === S.m && last.geo === geo && last.tilt === tilt && last.n === n
    if (unchanged && !waveEnded && S.waveStart === null) return
    Object.assign(last, { rot: S.rot, m: S.m, geo, tilt, n })

    const orbit = orbitAt(geo, S.m)
    // Cards whose centre is further than this outside the frame are hidden.
    const reach = Math.max(geo.cardW, geo.cardH) * orbit.s * 0.75

    for (let i = 0; i < n; i++) {
      const card = cardsRef.current[i]
      if (!card) continue
      const theta = S.rot + i * geo.step
      const { x, y } = pointOnOrbit(orbit, theta)
      const visible = x > -reach && x < geo.w + reach && y > -reach && y < geo.h + reach
      card.style.visibility = visible ? 'visible' : 'hidden'
      if (!visible) continue

      const tx = (x - geo.cardW / 2).toFixed(2)
      const ty = (y - geo.cardH / 2).toFixed(2)
      const angle = tilt ? theta.toFixed(4) : 0
      card.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${angle}rad) scale(${orbit.s.toFixed(4)})`
      // Cards nearer the top of the wheel stack in front.
      card.style.zIndex = String(Math.round(200 + Math.cos(theta) * 100))

      const flipper = flipsRef.current[i]
      if (flipper) {
        const flip = waveFlipAt(theta, S.waveStart, t)
        flipper.style.transform = flip > 0 && flip < 360 ? `rotateY(${flip}deg)` : ''
      }
    }

    fadeLayers(S.m, childrenRef.current, overlayRef.current)
  }
}

// `children` fade out over the first half of the morph to the arc; the caption and controls
// fade in over its last quarter.
function fadeLayers(m, children, overlay) {
  if (children) children.style.opacity = String(1 - clamp(m * 2, 0, 1))
  if (overlay) {
    const opacity = clamp((m - 0.75) / 0.25, 0, 1)
    overlay.style.opacity = String(opacity)
    overlay.style.visibility = opacity > 0.6 ? 'visible' : 'hidden'
  }
}
