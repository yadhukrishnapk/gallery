import { clamp, lerp, TAU } from '../../../lib/math'
import {
  CAPTION_GAP,
  CAPTION_HEIGHT,
  COMPACT_WIDTH,
  CONTROLS_HEIGHT,
  MAX_CARDS,
} from '../OrbitReel.constants'

// Cards on the wheel: the items repeated a whole number of times, close to `wanted` and at most MAX_CARDS.
export function getCardCount(itemCount, wanted) {
  const maxRepeats = Math.max(1, Math.floor(MAX_CARDS / itemCount))
  const repeats = Math.max(1, Math.round(wanted / itemCount))
  return Math.min(maxRepeats, repeats) * itemCount
}

// Height of the caption and controls under the top card in the arc.
export function getUiHeight({ captions, controls, compact }) {
  const controlsHeight = compact ? CONTROLS_HEIGHT.compact : CONTROLS_HEIGHT.regular
  return (captions ? CAPTION_HEIGHT : 0) + (controls ? controlsHeight : 0)
}

// Card size plus the two wheel layouts the reel morphs between: the whole `ring`, and the `arc`
// zoomed in on its top card.
export function getGeometry(w, h, n, { aspect, gap, arc, apex, uiHeight }) {
  const compact = w < COMPACT_WIDTH
  const step = TAU / n
  const space = 1 - clamp(gap, 0, 0.9)
  // Phones get a card that fills most of the width; larger screens a calmer share.
  const cardH = Math.max(40, Math.min(h * (compact ? 0.5 : 0.46), (w * (compact ? 0.68 : 0.36)) / aspect))
  const cardW = cardH * aspect
  const short = Math.min(w, h)

  // Ring: largest radius where the cards (sized to their slot) still fit inside the frame.
  const radialHalf = (step * space) / (2 * aspect)
  const ringR = (short * 0.46) / (1 + radialHalf)
  const ringScale = (ringR * step * space) / cardW

  // Arc: cards at full size, wheel radius set by card spacing so only the top sweep shows.
  const arcR = (cardW / space / step) * Math.max(0.2, arc)

  // Without an explicit apex, centre the card + caption + controls block vertically.
  const cardY = apex ?? Math.max(cardH / 2 + 16, (h - (cardH + CAPTION_GAP + uiHeight)) / 2 + cardH / 2) / h

  return {
    w,
    h,
    compact,
    step,
    cardW,
    cardH,
    ring: { cx: w / 2, cy: h / 2, r: ringR, s: ringScale },
    arc: { cx: w / 2, cy: cardY * h + arcR, r: arcR, s: 1 },
    captionY: cardY * h + cardH / 2 + CAPTION_GAP,
  }
}

// The wheel's centre, radius and card scale part-way through the morph (m: 0 = ring, 1 = arc).
export function orbitAt(geo, m) {
  const { ring, arc } = geo
  return {
    cx: lerp(ring.cx, arc.cx, m),
    cy: lerp(ring.cy, arc.cy, m),
    r: lerp(ring.r, arc.r, m),
    s: lerp(ring.s, arc.s, m),
  }
}

// Point on the wheel at angle `theta`, measured clockwise from 12 o'clock.
export const pointOnOrbit = ({ cx, cy, r }, theta) => ({
  x: cx + r * Math.sin(theta),
  y: cy - r * Math.cos(theta),
})

// Angle of point `{ x, y }` around the wheel centre, in the same convention as pointOnOrbit.
export const angleOnOrbit = ({ cx, cy }, { x, y }) => Math.atan2(x - cx, -(y - cy))
