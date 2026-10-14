import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'

const TAU = Math.PI * 2
const MAX_CARDS = 72
const MORPH_MS = 1100
const WAVE_SPREAD_MS = 650
const WAVE_FLIP_MS = 850
const WAVE_EVERY_MS = 6500
const DRAG_THRESHOLD = { mouse: 5, touch: 9, pen: 6 }
const COMPACT_WIDTH = 640
const CAPTION_GAP = 22

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const lerp = (a, b, t) => a + (b - a) * t
const mod = (n, m) => ((n % m) + m) % m
const wrapPi = (a) => mod(a + Math.PI, TAU) - Math.PI
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const pad = (n) => String(n).padStart(2, '0')

function getGeometry(w, h, n, { aspect, gap, arc, apex, uiHeight }) {
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

function isLightColor(color) {
  if (!color || color === 'transparent' || typeof document === 'undefined') return false
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  if (a < 30) return false
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={dir === 'left' ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RingIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * TAU
        return <circle key={i} cx={8 + 5.5 * Math.sin(a)} cy={8 - 5.5 * Math.cos(a)} r="1.35" />
      })}
    </svg>
  )
}

export default function OrbitReel({
  items = [],
  count = 18,
  mobileCount = 9,
  defaultView = 'ring',
  spin = 8,
  autoplay = true,
  interval = 3.5,
  arc = 1,
  apex,
  aspect = 0.8,
  radius = 0.07,
  gap = 0.18,
  tilt = true,
  flipWave = true,
  accentColor = '#5227FF',
  backgroundColor = 'transparent',
  captions = true,
  controls = true,
  draggable = true,
  wheel = true,
  pauseOnHover = true,
  zoomOnClick = true,
  paused = false,
  ariaLabel = 'Orbit reel. Click a card to bring it forward, scroll or drag to turn, press Escape to see the whole ring.',
  onViewChange,
  onActiveChange,
  onSelect,
  ref,
  children,
  className = '',
  style,
}) {
  const rootRef = useRef(null)
  const cardRefs = useRef([])
  const flipRefs = useRef([])
  const childrenRef = useRef(null)
  const overlayRef = useRef(null)
  const lastDraw = useRef({})

  const [size, setSize] = useState({ w: 0, h: 0 })
  const [active, setActive] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  const len = Math.max(1, items.length)
  const compact = size.w > 0 && size.w < COMPACT_WIDTH
  const wanted = compact ? mobileCount : count
  const n = Math.min(Math.max(1, Math.floor(MAX_CARDS / len)), Math.max(1, Math.round(wanted / len))) * len
  const uiHeight = (captions ? 48 : 0) + (controls ? (compact ? 60 : 48) : 0)
  const geo = useMemo(
    () => (size.w ? getGeometry(size.w, size.h, n, { aspect, gap, arc, apex, uiHeight }) : null),
    [size.w, size.h, n, aspect, gap, arc, apex, uiHeight],
  )
  const lightBg = useMemo(() => isLightColor(backgroundColor), [backgroundColor])

  // Everything the animation loop reads lives in refs so the loop never restarts.
  const propsRef = useRef(null)
  propsRef.current = {
    items, n, len, spin, autoplay, interval, tilt, flipWave, draggable, wheel, pauseOnHover, zoomOnClick,
    frozen: paused || reducedMotion, reducedMotion, onViewChange, onActiveChange, onSelect,
  }
  const geoRef = useRef(geo)
  geoRef.current = geo

  const sim = useRef(null)
  if (!sim.current) {
    const arcStart = defaultView === 'arc' ? 1 : 0
    sim.current = {
      rot: 0, vel: 0, k: 0,
      m: arcStart, morphFrom: arcStart, morphTo: arcStart, morphStart: 0,
      drag: null, hover: false,
      wheelPending: false, wheelUntil: 0,
      lastStep: 0, waveStart: null, nextWaveAt: 0,
      reportedActive: -1,
    }
  }

  useLayoutEffect(() => {
    const el = rootRef.current
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const now = () => performance.now()

  // `k` optionally picks the slot to bring to the top when entering the arc.
  const changeView = useCallback((next, k) => {
    const S = sim.current
    const target = next === 'arc' ? 1 : 0
    if (S.morphTo === target) return
    const t = now()
    if (target === 1) S.k = k ?? Math.round(-S.rot / (TAU / propsRef.current.n))
    S.morphFrom = S.m
    S.morphTo = target
    S.morphStart = t
    S.lastStep = t
    S.waveStart = t + 120
    S.nextWaveAt = t + MORPH_MS + WAVE_EVERY_MS
    propsRef.current.onViewChange?.(next)
  }, [])

  // Nearest wheel slot k (unbounded integer) that shows card `card` at the top.
  const nearestK = (card) => {
    const { n } = propsRef.current
    const cur = -sim.current.rot / (TAU / n)
    return card + n * Math.round((cur - card) / n)
  }

  const stepBy = useCallback((dir) => {
    const S = sim.current
    if (S.morphTo === 0) changeView('arc')
    S.k += dir
    S.lastStep = now()
  }, [changeView])

  const goTo = useCallback((itemIndex) => {
    const { n, len } = propsRef.current
    const S = sim.current
    if (S.morphTo === 0) changeView('arc')
    const cur = mod(S.k, n)
    let best = null
    for (let card = mod(itemIndex, len); card < n; card += len) {
      let diff = mod(card - cur, n)
      if (diff > n / 2) diff -= n
      if (best === null || Math.abs(diff) < Math.abs(best)) best = diff
    }
    S.k += best
    S.lastStep = now()
  }, [changeView])

  const select = useCallback(() => {
    const { items, n, len, onSelect } = propsRef.current
    const index = mod(sim.current.k, n) % len
    const item = items[index]
    onSelect?.(item, index)
    if (item?.href) window.location.assign(item.href)
  }, [])

  useImperativeHandle(ref, () => ({
    next: () => stepBy(1),
    previous: () => stepBy(-1),
    goTo,
    setView: changeView,
  }), [stepBy, goTo, changeView])

  // Animation loop: integrates rotation/morph and writes transforms straight to the DOM.
  useEffect(() => {
    let raf
    let last = now()
    const S = sim.current
    S.nextWaveAt = last + 1200

    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      const p = propsRef.current
      const g = geoRef.current
      if (!g) return

      const holding = !!S.drag?.moved || (p.pauseOnHover && S.hover)
      const mt = p.reducedMotion ? 1 : clamp((t - S.morphStart) / MORPH_MS, 0, 1)
      S.m = lerp(S.morphFrom, S.morphTo, easeInOut(mt))
      const inArc = S.morphTo === 1

      if (!S.drag?.moved) {
        if (inArc) {
          if (S.wheelPending && t > S.wheelUntil) {
            S.wheelPending = false
            S.k = Math.round(-S.rot / g.step)
          }
          if (!S.wheelPending) {
            const target = -S.k * g.step
            if (p.reducedMotion || (Math.abs(target - S.rot) < 1e-5 && Math.abs(S.vel) < 1e-4)) {
              S.rot = target
              S.vel = 0
            } else {
              S.vel += ((target - S.rot) * 120 - S.vel * 22) * dt
              S.rot += S.vel * dt
            }
          }
          if (p.autoplay && !p.frozen && !holding && mt === 1 && t - S.lastStep > p.interval * 1000) {
            S.k += 1
            S.lastStep = t
          }
        } else {
          const spinVel = p.frozen || holding ? 0 : (p.spin * Math.PI) / 180
          S.vel += (spinVel - S.vel) * (1 - Math.exp(-dt * 2.5))
          if (spinVel === 0 && Math.abs(S.vel) < 1e-4) S.vel = 0
          S.rot += S.vel * dt
        }
      }

      const activeCard = mod(S.k, p.n)
      if (activeCard !== S.reportedActive) {
        S.reportedActive = activeCard
        const index = activeCard % p.len
        setActive(index)
        p.onActiveChange?.(p.items[index], index)
      }

      let waveEnded = false
      if (!p.flipWave || p.frozen) waveEnded = S.waveStart !== null
      else if (!inArc && mt === 1 && t >= S.nextWaveAt) {
        S.waveStart = t
        S.nextWaveAt = t + WAVE_EVERY_MS
      } else if (S.waveStart !== null && t > S.waveStart + WAVE_SPREAD_MS + WAVE_FLIP_MS) waveEnded = true
      if (waveEnded) S.waveStart = null

      // Skip DOM writes entirely while nothing is moving (settled arc, paused ring).
      const L = lastDraw.current
      if (
        !waveEnded && S.waveStart === null &&
        L.rot === S.rot && L.m === S.m && L.g === g && L.tilt === p.tilt && L.n === p.n
      ) return
      Object.assign(L, { rot: S.rot, m: S.m, g, tilt: p.tilt, n: p.n })

      const e = S.m
      const cx = lerp(g.ring.cx, g.arc.cx, e)
      const cy = lerp(g.ring.cy, g.arc.cy, e)
      const r = lerp(g.ring.r, g.arc.r, e)
      const s = lerp(g.ring.s, g.arc.s, e)
      S.geo = { cx, cy, r }
      const reach = Math.max(g.cardW, g.cardH) * s * 0.75

      for (let i = 0; i < p.n; i++) {
        const el = cardRefs.current[i]
        if (!el) continue
        const theta = S.rot + i * g.step
        const x = cx + r * Math.sin(theta)
        const y = cy - r * Math.cos(theta)
        const visible = x > -reach && x < g.w + reach && y > -reach && y < g.h + reach
        el.style.visibility = visible ? 'visible' : 'hidden'
        if (!visible) continue
        el.style.transform = `translate3d(${(x - g.cardW / 2).toFixed(2)}px, ${(y - g.cardH / 2).toFixed(2)}px, 0) rotate(${p.tilt ? theta.toFixed(4) : 0}rad) scale(${s.toFixed(4)})`
        el.style.zIndex = String(Math.round(200 + Math.cos(theta) * 100))

        let flip = 0
        if (S.waveStart !== null) {
          const delay = (Math.abs(wrapPi(theta)) / Math.PI) * WAVE_SPREAD_MS
          flip = 360 * easeInOut(clamp((t - S.waveStart - delay) / WAVE_FLIP_MS, 0, 1))
        }
        const inner = flipRefs.current[i]
        if (inner) inner.style.transform = flip > 0 && flip < 360 ? `rotateY(${flip}deg)` : ''
      }

      if (childrenRef.current) childrenRef.current.style.opacity = String(1 - clamp(S.m * 2, 0, 1))
      if (overlayRef.current) {
        const o = clamp((S.m - 0.75) / 0.25, 0, 1)
        overlayRef.current.style.opacity = String(o)
        overlayRef.current.style.visibility = o > 0.6 ? 'visible' : 'hidden'
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Scroll to turn: spins the ring, or glides the arc and settles on the nearest card.
  useEffect(() => {
    const el = rootRef.current
    const onWheel = (ev) => {
      const p = propsRef.current
      const g = geoRef.current
      if (!p.wheel || !g) return
      ev.preventDefault()
      const unit = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? g.h : 1
      const delta = (Math.abs(ev.deltaY) > Math.abs(ev.deltaX) ? ev.deltaY : ev.deltaX) * unit
      const S = sim.current
      if (S.morphTo === 1) {
        S.rot -= (delta * 0.6) / g.arc.r
        S.vel = 0
        S.wheelPending = true
        S.wheelUntil = now() + 160
        S.lastStep = now()
      } else {
        S.vel = clamp(S.vel + delta * 0.0025, -6, 6)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const localPoint = (ev) => {
    const rect = rootRef.current.getBoundingClientRect()
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top }
  }
  const angleAt = ({ x, y }) => {
    const { cx, cy } = sim.current.geo
    return Math.atan2(x - cx, -(y - cy))
  }

  const tap = (cardIndex) => {
    const S = sim.current
    const p = propsRef.current
    if (cardIndex === null) {
      if (S.morphTo === 1) changeView('ring')
      return
    }
    if (S.morphTo === 0) {
      if (p.zoomOnClick) changeView('arc', nearestK(cardIndex))
    } else if (cardIndex === mod(S.k, p.n)) {
      select()
    } else {
      S.k = nearestK(cardIndex)
      S.lastStep = now()
    }
  }

  const onPointerDown = (ev) => {
    if (ev.button !== 0 || ev.target.closest('[data-orbit-ui]') || !ev.isPrimary) return
    const card = ev.target.closest('[data-orbit-card]')
    // Keep focus on the root: a focused card that turns offscreen gets hidden and would drop focus to <body>.
    ev.preventDefault()
    rootRef.current.focus({ preventScroll: true })
    const pt = localPoint(ev)
    sim.current.drag = {
      id: ev.pointerId,
      start: pt,
      last: pt,
      lastAngle: angleAt(pt),
      lastT: now(),
      type: ev.pointerType,
      card: card ? Number(card.dataset.index) : null,
      moved: false,
    }
  }

  const onPointerMove = (ev) => {
    const S = sim.current
    if (ev.pointerType === 'mouse') S.hover = !!ev.target.closest?.('[data-orbit-card]')
    const d = S.drag
    if (!d || d.id !== ev.pointerId) return
    const pt = localPoint(ev)
    if (!d.moved) {
      if (!propsRef.current.draggable) return
      if (Math.hypot(pt.x - d.start.x, pt.y - d.start.y) < (DRAG_THRESHOLD[d.type] ?? 5)) return
      d.moved = true
      S.wheelPending = false
      rootRef.current.setPointerCapture(ev.pointerId)
    }
    const t = now()
    const dt = Math.max(1, t - d.lastT) / 1000
    let delta
    if (S.morphTo === 1) {
      delta = (pt.x - d.last.x) / S.geo.r
    } else {
      const a = angleAt(pt)
      delta = wrapPi(a - d.lastAngle)
      d.lastAngle = a
    }
    S.rot += delta
    S.vel = lerp(S.vel, delta / dt, 0.4)
    d.last = pt
    d.lastT = t
  }

  const onPointerUp = (ev) => {
    const S = sim.current
    const d = S.drag
    if (!d || d.id !== ev.pointerId) return
    S.drag = null
    if (!d.moved) return tap(d.card)
    rootRef.current.releasePointerCapture?.(ev.pointerId)
    if (now() - d.lastT > 80) S.vel = 0
    if (S.morphTo === 1) {
      let k = Math.round(-(S.rot + S.vel * 0.18) / (TAU / propsRef.current.n))
      // A short, deliberate swipe still moves one card.
      const swipe = d.last.x - d.start.x
      if (k === S.k && Math.abs(swipe) > 28) k = S.k - Math.sign(swipe)
      S.k = k
      S.lastStep = now()
    }
  }

  const onKeyDown = (ev) => {
    const S = sim.current
    if (ev.key === 'Escape') changeView('ring')
    else if (ev.key === 'Enter') {
      if (ev.target.closest('[data-orbit-ui]')) return
      if (S.morphTo === 1) select()
      else changeView('arc')
    } else if (ev.key === 'ArrowRight') stepBy(1)
    else if (ev.key === 'ArrowLeft') stepBy(-1)
    else return
    ev.preventDefault()
  }

  const item = items[active] ?? items[0]
  const cardW = geo?.cardW
  const cardH = geo?.cardH
  const uiTone = lightBg ? 'text-neutral-900' : 'text-neutral-50'
  const buttonTone = lightBg
    ? 'bg-black/5 hover:bg-black/10 active:bg-black/15 text-neutral-900'
    : 'bg-white/8 hover:bg-white/15 active:bg-white/20 text-neutral-50'

  // Card elements only depend on size and content, so stepping between cards never re-renders them.
  const cards = useMemo(() => {
    if (!cardW || items.length === 0) return null
    const cornerRadius = cardW * radius
    const back = `linear-gradient(155deg, color-mix(in oklch, ${accentColor} 88%, white) 0%, ${accentColor} 45%, color-mix(in oklch, ${accentColor} 55%, black) 100%)`
    return Array.from({ length: n }, (_, i) => {
      const it = items[i % len]
      return (
        <button
          key={i}
          ref={(el) => (cardRefs.current[i] = el)}
          type="button"
          tabIndex={-1}
          data-orbit-card=""
          data-index={i}
          aria-label={it.title || it.alt}
          className="absolute top-0 left-0 m-0 cursor-pointer border-0 bg-transparent p-0 outline-none will-change-transform [transform-style:preserve-3d]"
          style={{ width: cardW, height: cardH, visibility: 'hidden' }}
        >
          <span ref={(el) => (flipRefs.current[i] = el)} className="absolute inset-0 [transform-style:preserve-3d]">
            <span
              className="absolute inset-0 overflow-hidden bg-neutral-500/20 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55),0_2px_6px_-2px_rgba(0,0,0,0.25)] [backface-visibility:hidden]"
              style={{ borderRadius: cornerRadius }}
            >
              <img
                src={it.src}
                alt=""
                draggable={false}
                decoding="async"
                className="pointer-events-none block size-full object-cover"
              />
            </span>
            <span
              className="absolute inset-0 flex items-end justify-start overflow-hidden p-[8%] text-[clamp(10px,1.1vw,14px)] tracking-wider text-white/90 tabular-nums [backface-visibility:hidden] [transform:rotateY(180deg)]"
              style={{ borderRadius: cornerRadius, background: back }}
            >
              {pad((i % len) + 1)}
            </span>
          </span>
        </button>
      )
    })
  }, [cardW, cardH, items, n, len, radius, accentColor])

  const compactUi = geo?.compact
  const navButton = `pointer-events-auto grid cursor-pointer place-items-center rounded-full border-0 transition-colors ${compactUi ? 'size-11' : 'size-9'} ${buttonTone}`

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => (sim.current.hover = false)}
      className={`relative h-full min-h-[420px] w-full touch-none overflow-hidden outline-none select-none [-webkit-tap-highlight-color:transparent] [contain:layout_paint_style] ${uiTone} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
      style={{ backgroundColor, ...style }}
    >
      <div
        ref={childrenRef}
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      >
        <div className="pointer-events-auto">{children}</div>
      </div>

      <div className="absolute inset-0" style={{ perspective: '1400px' }}>
        {cards}
      </div>

      {geo && items.length > 0 && (
        <div
          ref={overlayRef}
          className="pointer-events-none invisible absolute inset-0 z-[400] opacity-0"
        >
          {(captions || controls) && (
            <div
              className="absolute inset-x-0 flex flex-col items-center px-6 text-center"
              style={{ top: geo.captionY }}
            >
              {captions && (
                <div aria-live="polite" className="flex max-w-md flex-col items-center gap-1">
                  {item?.title && (
                    <p className={`m-0 font-semibold tracking-tight ${compactUi ? 'text-[17px]' : 'text-[15px]'}`}>
                      {item.title}
                    </p>
                  )}
                  {item?.subtitle && (
                    <p className={`m-0 opacity-60 ${compactUi ? 'text-sm' : 'text-[13px]'}`}>{item.subtitle}</p>
                  )}
                </div>
              )}
              {controls && (
                <div data-orbit-ui="" className={`flex items-center ${compactUi ? 'mt-4 gap-5' : 'mt-3 gap-4'}`}>
                  <button type="button" aria-label="Previous card" onClick={() => stepBy(-1)} className={navButton}>
                    <Chevron dir="left" />
                  </button>
                  <span className="min-w-12 text-xs tabular-nums opacity-55">
                    {pad(active + 1)} / {pad(len)}
                  </span>
                  <button type="button" aria-label="Next card" onClick={() => stepBy(1)} className={navButton}>
                    <Chevron dir="right" />
                  </button>
                </div>
              )}
            </div>
          )}
          {controls && (
            <button
              type="button"
              data-orbit-ui=""
              aria-label="Show all cards"
              onClick={() => changeView('ring')}
              className={`absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] ${navButton}`}
            >
              <RingIcon />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
