import { useMemo } from 'react'
import { lerp, wrapPi } from '../../../lib/math'
import { CARD_SELECTOR, DRAG_THRESHOLD, DRAG_VELOCITY_BLEND, FLING, UI_SELECTOR } from '../OrbitReel.constants'
import { angleOnOrbit, orbitAt } from '../engine/geometry'
import { activeCardOf, isArc, moveToSlot, nearestSlotFor, now, slotAt } from '../engine/state'

// Pointer handlers for the reel root. A press that doesn't travel is a tap; anything else drags
// the wheel: like a dial on the ring, sideways along the rim in the arc.
export function usePointerInput({ rootRef, simRef, liveRef, commands }) {
  return useMemo(() => {
    const localPoint = (ev) => {
      const rect = rootRef.current.getBoundingClientRect()
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top }
    }
    const angleAt = (pt) => angleOnOrbit(orbitAt(liveRef.current.geo, simRef.current.m), pt)

    // `card` is the tapped card slot, or null for empty space.
    const tap = (card) => {
      const S = simRef.current
      const { n, zoomOnClick } = liveRef.current
      if (card === null) {
        if (isArc(S)) commands.changeView('ring')
      } else if (!isArc(S)) {
        if (zoomOnClick) commands.changeView('arc', nearestSlotFor(card, S.rot, n))
      } else if (card === activeCardOf(S, n)) {
        commands.select()
      } else {
        commands.focusCard(card)
      }
    }

    const onPointerDown = (ev) => {
      if (ev.button !== 0 || !ev.isPrimary || ev.target.closest(UI_SELECTOR) || !liveRef.current.geo) return
      const card = ev.target.closest(CARD_SELECTOR)
      // Keep focus on the root: a focused card that turns offscreen gets hidden and would drop focus to <body>.
      ev.preventDefault()
      rootRef.current.focus({ preventScroll: true })
      const pt = localPoint(ev)
      simRef.current.drag = {
        id: ev.pointerId,
        type: ev.pointerType,
        card: card ? Number(card.dataset.index) : null,
        start: pt,
        last: pt,
        lastAngle: angleAt(pt),
        lastT: now(),
        moved: false,
      }
    }

    const onPointerMove = (ev) => {
      const S = simRef.current
      const live = liveRef.current
      if (ev.pointerType === 'mouse') S.hover = !!ev.target.closest?.(CARD_SELECTOR)
      const drag = S.drag
      if (!drag || drag.id !== ev.pointerId || !live.geo) return
      const pt = localPoint(ev)
      if (!drag.moved) {
        const threshold = DRAG_THRESHOLD[drag.type] ?? DRAG_THRESHOLD.mouse
        if (!live.draggable || Math.hypot(pt.x - drag.start.x, pt.y - drag.start.y) < threshold) return
        drag.moved = true
        S.wheelPending = false
        rootRef.current.setPointerCapture(ev.pointerId)
      }

      const t = now()
      const dt = Math.max(1, t - drag.lastT) / 1000
      let delta
      if (isArc(S)) {
        delta = (pt.x - drag.last.x) / orbitAt(live.geo, S.m).r
      } else {
        const angle = angleAt(pt)
        delta = wrapPi(angle - drag.lastAngle)
        drag.lastAngle = angle
      }
      S.rot += delta
      S.vel = lerp(S.vel, delta / dt, DRAG_VELOCITY_BLEND)
      drag.last = pt
      drag.lastT = t
    }

    const onPointerUp = (ev) => {
      const S = simRef.current
      const drag = S.drag
      if (!drag || drag.id !== ev.pointerId) return
      S.drag = null
      if (!drag.moved) {
        tap(drag.card)
        return
      }
      rootRef.current.releasePointerCapture?.(ev.pointerId)
      if (now() - drag.lastT > FLING.staleMs) S.vel = 0
      if (isArc(S)) moveToSlot(S, flingTarget(S, drag, liveRef.current.n), now())
    }

    const onPointerLeave = () => {
      simRef.current.hover = false
    }

    return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onPointerLeave }
  }, [rootRef, simRef, liveRef, commands])
}

// Slot the arc settles on after a drag: where the release velocity would carry it, except that a
// short, deliberate swipe still moves one card.
function flingTarget(S, drag, n) {
  const k = slotAt(S.rot + S.vel * FLING.lookaheadS, n)
  const swipe = drag.last.x - drag.start.x
  return k === S.k && Math.abs(swipe) > FLING.swipePx ? S.k - Math.sign(swipe) : k
}
