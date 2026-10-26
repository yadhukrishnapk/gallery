import { TAU } from '../../../lib/math'
import { CRUISE_TOLERANCE } from '../OrbitReel.constants'
import { isArc } from './state'

// While the ring turns at its steady idle speed, the browser does the turning: a Web Animation rotates
// the stage around the ring's centre on the compositor. That stays smooth even when the page is busy
// or requestAnimationFrame is throttled (iOS Low Power Mode caps it at 30fps), and costs no work per
// frame. The cards stay drawn where they were when the cruise began, while `S.rot` follows the
// animation's clock so waves, drags and taps still see the real angle. Anything else that moves the
// ring ends the cruise, and the cards are redrawn at the real angle in that same frame.
export function createCruise(stageRef) {
  let animation = null
  let base = 0 // wheel rotation the cruise started from; the cards stay drawn at it
  let speed = 0 // rad/s
  let origin = '' // ring centre the stage turns around

  function stop() {
    animation?.cancel()
    animation = null
  }

  // Keeps `S.rot` in step with a running cruise, or ends it. True while the browser turns the ring.
  function follow(S, live, morphProgress) {
    if (!animation) return false
    const unchanged =
      canCruise(S, live, morphProgress) &&
      spinSpeed(live) === speed &&
      S.vel === speed && // a scroll nudges the speed
      originOf(live.geo) === origin
    if (!unchanged) {
      stop() // `S.rot` keeps last frame's angle (plus any drag since then), where the cards get redrawn
      return false
    }
    S.rot = base + (speed * (animation.currentTime ?? 0)) / 1000
    return true
  }

  // Hands the spin over once the ring has eased up to its steady speed.
  function start(S, live, morphProgress) {
    const stage = stageRef.current
    const target = spinSpeed(live)
    if (animation || !stage?.animate || !canCruise(S, live, morphProgress)) return
    if (Math.abs(S.vel - target) > CRUISE_TOLERANCE) return

    base = S.rot
    speed = target
    S.vel = speed
    origin = originOf(live.geo)
    stage.style.transformOrigin = origin
    animation = stage.animate(
      [{ transform: 'rotate(0rad)' }, { transform: `rotate(${Math.sign(speed) * TAU}rad)` }],
      { duration: (TAU / Math.abs(speed)) * 1000, iterations: Infinity },
    )
    // A new animation only starts counting a frame later, which would hold the ring still for a frame.
    // Starting it at this frame's time makes the hand-over seamless.
    animation.startTime = document.timeline.currentTime
  }

  return {
    follow,
    start,
    stop,
    // Wheel rotation to draw the cards at: frozen while the stage turns them.
    cardRotation: (S) => (animation ? base : S.rot),
  }
}

const spinSpeed = (live) => (live.spin * Math.PI) / 180
const originOf = (geo) => `${geo.ring.cx}px ${geo.ring.cy}px`

// The idle spin is all that moves the ring: no arc, drag, hover or pause, and the cards lean with the
// wheel (upright cards would need turning back one by one).
function canCruise(S, live, morphProgress) {
  return (
    !isArc(S) &&
    morphProgress === 1 &&
    !S.drag?.moved &&
    !(live.pauseOnHover && S.hover) &&
    !live.frozen &&
    live.tilt &&
    spinSpeed(live) !== 0
  )
}
