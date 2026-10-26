import { mod, TAU } from '../../../lib/math'
import { MORPH_MS, VIEW_CHANGE_WAVE_MS, WAVE_EVERY_MS } from '../OrbitReel.constants'

// Morph targets: the whole ring, and the arc zoomed in on its top card.
export const RING = 0
export const ARC = 1

export const now = () => performance.now()

/**
 * Mutable simulation state, advanced every frame by engine/update.js and drawn by engine/render.js.
 * Angles are in radians, times in ms (performance.now()).
 *
 * The wheel has `n` card slots. In the arc it parks on slot `k`, an unbounded integer so turning
 * past the last card never jumps back; the card on top is `mod(k, n)`.
 */
export function createSimState(defaultView) {
  const view = defaultView === 'arc' ? ARC : RING
  return {
    rot: 0, // wheel rotation
    vel: 0, // angular velocity, rad/s
    k: 0, // arc slot to settle on
    m: view, // morph progress from RING to ARC
    morphFrom: view,
    morphTo: view,
    morphStart: 0,
    drag: null, // pointer gesture in progress (see hooks/usePointerInput.js)
    hover: false, // mouse is over a card
    wheelPending: false, // the arc glides freely under scroll input…
    wheelUntil: 0, // …until this time, then settles on a slot
    lastStep: 0, // last slot change; autoplay waits `interval` after it
    waveStart: null, // start of the flip wave in progress, if any
    nextWaveAt: 0,
    reportedActive: -1, // last active card reported to React
    reportedFocus: null, // last focus card reported to React: the card resting on top of the arc, if any
  }
}

export const isArc = (S) => S.morphTo === ARC
export const viewOf = (S) => (isArc(S) ? 'arc' : 'ring')
export const activeCardOf = (S, n) => mod(S.k, n)

// Slot whose card is on top at rotation `rot`.
export const slotAt = (rot, n) => Math.round(-rot / (TAU / n))

// Rotation that puts slot `k` on top.
export const slotRotation = (k, step) => -k * step

// The slot nearest the current rotation that shows `card` on top.
export function nearestSlotFor(card, rot, n) {
  const current = -rot / (TAU / n)
  return card + n * Math.round((current - card) / n)
}

// Shortest signed number of slots from slot `k` to any card showing item `itemIndex`
// (items repeat every `len` cards).
export function stepsToItem(k, itemIndex, n, len) {
  const current = mod(k, n)
  let best = null
  for (let card = mod(itemIndex, len); card < n; card += len) {
    let diff = mod(card - current, n)
    if (diff > n / 2) diff -= n
    if (best === null || Math.abs(diff) < Math.abs(best)) best = diff
  }
  return best
}

export function moveToSlot(S, k, t) {
  S.k = k
  S.lastStep = t
}

// Starts morphing toward RING or ARC. A flip wave rides along with every view change.
export function startMorph(S, target, t) {
  S.morphFrom = S.m
  S.morphTo = target
  S.morphStart = t
  S.lastStep = t
  S.waveStart = t + VIEW_CHANGE_WAVE_MS
  S.nextWaveAt = t + MORPH_MS + WAVE_EVERY_MS
}
