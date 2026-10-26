import { clamp, wrapPi } from '../../../lib/math'
import { orbitAt, pointOnOrbit } from './geometry'
import { waveFlipAt } from './update'

// Returns a `render(S, live, t, waveEnded, cardRot)` that writes one frame straight to the DOM through
// the given refs, with the cards drawn at wheel rotation `cardRot`. Only values that changed are
// written, and frames where nothing moves are skipped (settled arc, paused ring, browser-driven spin).
export function createRenderer({ cardsRef, flipsRef, childrenRef, overlayRef }) {
  const last = {}
  const written = new WeakMap() // element → style values last written to it

  function set(el, prop, value) {
    let values = written.get(el)
    if (!values) {
      values = {}
      written.set(el, values)
    }
    if (values[prop] === value) return
    values[prop] = value
    el.style[prop] = value
  }

  function drawCard(i, cardRot, orbit, S, live, t) {
    const card = cardsRef.current[i]
    if (!card) return
    const { geo, n, tilt } = live
    const theta = cardRot + i * geo.step
    const { x, y } = pointOnOrbit(orbit, theta)
    // Cards whose centre is further than this outside the frame are hidden.
    const reach = Math.max(geo.cardW, geo.cardH) * orbit.s * 0.75
    const visible = x > -reach && x < geo.w + reach && y > -reach && y < geo.h + reach
    set(card, 'visibility', visible ? 'visible' : 'hidden')
    if (!visible) return

    const tx = (x - geo.cardW / 2).toFixed(2)
    const ty = (y - geo.cardH / 2).toFixed(2)
    const angle = tilt ? theta.toFixed(4) : 0
    set(card, 'transform', `translate3d(${tx}px, ${ty}px, 0) rotate(${angle}rad) scale(${orbit.s.toFixed(4)})`)
    // Cards nearer the top stack in front. Counting whole slots changes the order only when two cards
    // pass each other: a z-index change can make Safari repaint the card.
    set(card, 'zIndex', String(n - Math.round(Math.abs(wrapPi(theta)) / geo.step)))

    const flipper = flipsRef.current[i]
    if (!flipper) return
    // The wave follows the real wheel angle, which runs ahead of `cardRot` while the browser spins.
    const flip = waveFlipAt(S.rot + i * geo.step, S.waveStart, t)
    set(flipper, 'transform', flip > 0 && flip < 360 ? `rotateY(${flip}deg)` : '')
  }

  // `children` fade out over the first half of the morph to the arc; the caption and controls fade in
  // over its last quarter.
  function fadeLayers(m) {
    const children = childrenRef.current
    if (children) set(children, 'opacity', String(1 - clamp(m * 2, 0, 1)))
    const overlay = overlayRef.current
    if (!overlay) return
    const opacity = clamp((m - 0.75) / 0.25, 0, 1)
    set(overlay, 'opacity', String(opacity))
    set(overlay, 'visibility', opacity > 0.6 ? 'visible' : 'hidden')
  }

  return function render(S, live, t, waveEnded, cardRot) {
    const { geo, n, tilt } = live
    const unchanged =
      last.rot === cardRot && last.m === S.m && last.geo === geo && last.tilt === tilt && last.n === n
    if (unchanged && !waveEnded && S.waveStart === null) return
    Object.assign(last, { rot: cardRot, m: S.m, geo, tilt, n })

    const orbit = orbitAt(geo, S.m)
    for (let i = 0; i < n; i++) drawCard(i, cardRot, orbit, S, live, t)
    fadeLayers(S.m)
  }
}
