import { useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useLatestRef } from '../../hooks/useLatestRef'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { isLightColor } from '../../lib/color'
import { DEFAULT_ARIA_LABEL } from './OrbitReel.constants'
import * as styles from './OrbitReel.styles'
import { activeCardOf, createSimState, viewOf } from './engine/state'
import { useAnimationLoop } from './hooks/useAnimationLoop'
import { useKeyboardInput } from './hooks/useKeyboardInput'
import { usePointerInput } from './hooks/usePointerInput'
import { useReelCommands } from './hooks/useReelCommands'
import { useReelLayout } from './hooks/useReelLayout'
import { useWheelInput } from './hooks/useWheelInput'
import { ReelCards } from './parts/ReelCards'
import { ReelOverlay } from './parts/ReelOverlay'

/**
 * A wheel of image cards. It idles as a slowly spinning ring; clicking a card zooms into an arc with
 * that card on top, plus a caption and prev/next controls. Escape goes back to the ring.
 *
 * `items` are `{ src, thumb?, alt?, title?, subtitle?, href? }`, repeated as needed to fill the wheel.
 * Cards show the small `thumb` when there is one; the card resting on top of the arc switches to the full `src`.
 * `ref` exposes `{ next, previous, goTo(index), setView('ring' | 'arc'), getView, getActiveCard }`.
 */
export function OrbitReel({
  items = [],
  count = 18, // cards on the wheel
  mobileCount = 9, // cards on the wheel on narrow screens
  defaultView = 'ring', // 'ring' | 'arc'
  spin = 8, // ring idle speed, degrees per second
  autoplay = true, // in the arc, move on one card every `interval` seconds
  interval = 3.5,
  arc = 1, // arc radius multiplier; higher is flatter
  apex, // vertical centre of the top card in the arc (0–1); centred with its caption by default
  aspect = 0.8, // card width / height
  radius = 0.07, // card corner radius, as a fraction of card width
  gap = 0.18, // space between cards, as a fraction of each slot
  tilt = true, // cards lean with the wheel
  flipWave = true, // a flip ripples around the ring every few seconds
  accentColor = '#5227FF', // card backs
  backgroundColor = 'transparent', // also decides between light and dark UI text
  captions = true,
  controls = true,
  draggable = true,
  wheel = true, // scroll to turn
  pauseOnHover = true,
  zoomOnClick = true, // clicking a card on the ring zooms in to it
  paused = false,
  ariaLabel = DEFAULT_ARIA_LABEL,
  onViewChange, // (view)
  onActiveChange, // (item, index)
  onRest, // (item, index) once a card comes to rest on top of the arc and shows its full photo
  onSelect, // (item, index) when the top card is clicked; without it, follows item.href
  ref,
  children, // centred inside the ring; fades out in the arc
  className = '',
  style,
}) {
  const rootRef = useRef(null)
  const childrenRef = useRef(null)
  const stageRef = useRef(null)
  const overlayRef = useRef(null)
  const cardsRef = useRef([])
  const flipsRef = useRef([])

  const [active, setActive] = useState(0) // item on top
  const [focus, setFocus] = useState(null) // card resting on top of the arc, which shows its full photo
  const reducedMotion = usePrefersReducedMotion()
  const len = Math.max(1, items.length)
  const { n, geo } = useReelLayout(rootRef, { len, count, mobileCount, captions, controls, aspect, gap, arc, apex })
  const lightBg = useMemo(() => isLightColor(backgroundColor), [backgroundColor])

  // Everything the animation loop and input handlers read, so they never need to restart.
  const liveRef = useLatestRef({
    items, n, len, geo, spin, autoplay, interval, tilt, flipWave, draggable, wheel, pauseOnHover, zoomOnClick,
    frozen: paused || reducedMotion, reducedMotion, onViewChange, onActiveChange, onRest, onSelect,
  })

  const simRef = useRef(null)
  if (simRef.current === null) simRef.current = createSimState(defaultView)

  const commands = useReelCommands(simRef, liveRef)
  const pointerHandlers = usePointerInput({ rootRef, simRef, liveRef, commands })
  const onKeyDown = useKeyboardInput(simRef, commands)
  useWheelInput({ rootRef, simRef, liveRef })
  useAnimationLoop({ simRef, liveRef, setActive, setFocus, stageRef, cardsRef, flipsRef, childrenRef, overlayRef })

  useImperativeHandle(
    ref,
    () => ({
      next: () => commands.stepBy(1),
      previous: () => commands.stepBy(-1),
      goTo: commands.goTo,
      setView: commands.changeView,
      getView: () => viewOf(simRef.current),
      // Front face of the card on top (used for shared-element page transitions).
      getActiveCard: () => flipsRef.current[activeCardOf(simRef.current, liveRef.current.n)]?.firstElementChild ?? null,
    }),
    [commands, liveRef],
  )

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      {...pointerHandlers}
      className={styles.root({ lightBg, draggable, className })}
      style={{ backgroundColor, ...style }}
    >
      <div ref={childrenRef} className={styles.childrenLayer}>
        <div className={styles.childrenSlot}>{children}</div>
      </div>

      <div ref={stageRef} className={styles.stage}>
        <ReelCards
          items={items}
          n={n}
          focus={focus}
          width={geo?.cardW}
          height={geo?.cardH}
          radius={radius}
          accentColor={accentColor}
          cardsRef={cardsRef}
          flipsRef={flipsRef}
        />
      </div>

      {geo && items.length > 0 && (
        <ReelOverlay
          ref={overlayRef}
          geo={geo}
          item={items[active] ?? items[0]}
          position={active + 1}
          total={len}
          captions={captions}
          controls={controls}
          lightBg={lightBg}
          onStep={commands.stepBy}
          onShowAll={() => commands.changeView('ring')}
        />
      )}
    </div>
  )
}
