import { clamp, easeInOut, lerp, wrapPi } from '../../../lib/math'
import {
  MORPH_MS,
  REST,
  SPIN_EASE,
  VISIBLY_AT_REST,
  SPRING,
  WAVE_EVERY_MS,
  WAVE_FLIP_MS,
  WAVE_SPREAD_MS,
} from '../OrbitReel.constants'
import { isArc, moveToSlot, slotAt, slotRotation } from './state'

// Per-frame simulation steps, run in order by hooks/useAnimationLoop.js. Each one mutates the sim
// state `S`; `live` holds the latest props and geometry. `t` is in ms, `dt` in seconds.

// Advances the ring ⇄ arc morph. Returns its progress, 1 once finished.
export function updateMorph(S, t, reducedMotion) {
  const progress = reducedMotion ? 1 : clamp((t - S.morphStart) / MORPH_MS, 0, 1)
  S.m = lerp(S.morphFrom, S.morphTo, easeInOut(progress))
  return progress
}

// Turns the wheel: the arc springs onto slot `k` and autoplays, the ring spins at its idle speed.
export function updateRotation(S, live, t, dt, morphProgress) {
  if (S.drag?.moved) return // a drag turns the wheel directly
  const hovering = live.pauseOnHover && S.hover
  if (isArc(S)) {
    settleArc(S, live, t, dt)
    const autoplayDue =
      live.autoplay && !live.frozen && !hovering && morphProgress === 1 && t - S.lastStep > live.interval * 1000
    if (autoplayDue) moveToSlot(S, S.k + 1, t)
  } else {
    spinRing(S, live, dt, hovering)
  }
}

// True once the arc has fully formed and its top card has visibly come to rest: within a fraction of
// a pixel of its slot, while the spring may still be settling the last of the way.
export const arcAtRest = (S, geo, morphProgress) =>
  isArc(S) &&
  morphProgress === 1 &&
  !S.drag?.moved &&
  !S.wheelPending &&
  Math.abs(S.rot - slotRotation(S.k, geo.step)) < VISIBLY_AT_REST.rot &&
  Math.abs(S.vel) < VISIBLY_AT_REST.vel

function settleArc(S, { geo, n, reducedMotion }, t, dt) {
  // Scrolling glides the arc freely; once it pauses, settle on the nearest slot.
  if (S.wheelPending && t > S.wheelUntil) {
    S.wheelPending = false
    S.k = slotAt(S.rot, n)
  }
  if (S.wheelPending) return

  const target = slotRotation(S.k, geo.step)
  const atRest = Math.abs(target - S.rot) < REST.rot && Math.abs(S.vel) < REST.vel
  if (reducedMotion || atRest) {
    S.rot = target
    S.vel = 0
    return
  }
  S.vel += ((target - S.rot) * SPRING.stiffness - S.vel * SPRING.damping) * dt
  S.rot += S.vel * dt
}

function spinRing(S, { spin, frozen }, dt, hovering) {
  const targetVel = frozen || hovering ? 0 : (spin * Math.PI) / 180
  S.vel += (targetVel - S.vel) * (1 - Math.exp(-dt * SPIN_EASE))
  if (targetVel === 0 && Math.abs(S.vel) < REST.vel) S.vel = 0
  S.rot += S.vel * dt
}

// Starts a flip wave every few seconds on the settled ring, and ends it once every card has
// flipped. Returns true on the frame a wave ends or is cancelled, so the last flip gets cleared.
export function updateWave(S, { flipWave, frozen }, t, morphProgress) {
  let ended = false
  if (!flipWave || frozen) {
    ended = S.waveStart !== null
  } else if (!isArc(S) && morphProgress === 1 && t >= S.nextWaveAt) {
    S.waveStart = t
    S.nextWaveAt = t + WAVE_EVERY_MS
  } else if (S.waveStart !== null && t > S.waveStart + WAVE_SPREAD_MS + WAVE_FLIP_MS) {
    ended = true
  }
  if (ended) S.waveStart = null
  return ended
}

// Flip angle (0–360°) of the card at wheel angle `theta`: the wave starts at the top and
// reaches the bottom card WAVE_SPREAD_MS later.
export function waveFlipAt(theta, waveStart, t) {
  if (waveStart === null) return 0
  const delay = (Math.abs(wrapPi(theta)) / Math.PI) * WAVE_SPREAD_MS
  return 360 * easeInOut(clamp((t - waveStart - delay) / WAVE_FLIP_MS, 0, 1))
}
