import { useMemo } from 'react'
import {
  activeCardOf,
  ARC,
  isArc,
  moveToSlot,
  nearestSlotFor,
  now,
  RING,
  slotAt,
  startMorph,
  stepsToItem,
} from '../engine/state'

// The reel's actions, shared by the input handlers and the imperative handle. They only touch refs,
// so the returned object stays the same for the component's lifetime.
export function useReelCommands(simRef, liveRef) {
  return useMemo(() => {
    // `k` optionally picks the slot to bring to the top when entering the arc.
    const changeView = (view, k) => {
      const S = simRef.current
      const target = view === 'arc' ? ARC : RING
      if (S.morphTo === target) return
      if (target === ARC) S.k = k ?? slotAt(S.rot, liveRef.current.n)
      startMorph(S, target, now())
      liveRef.current.onViewChange?.(view)
    }

    const enterArc = () => {
      if (!isArc(simRef.current)) changeView('arc')
    }

    const stepBy = (dir) => {
      enterArc()
      const S = simRef.current
      moveToSlot(S, S.k + dir, now())
    }

    // Brings item `itemIndex` to the top, using whichever copy of its card is closest.
    const goTo = (itemIndex) => {
      enterArc()
      const S = simRef.current
      const { n, len } = liveRef.current
      moveToSlot(S, S.k + stepsToItem(S.k, itemIndex, n, len), now())
    }

    // Brings card `card` (a card slot, not an item index) to the top by the shortest turn.
    const focusCard = (card) => {
      const S = simRef.current
      moveToSlot(S, nearestSlotFor(card, S.rot, liveRef.current.n), now())
    }

    // Opens the top item. With an onSelect handler the app decides what happens; otherwise follow the item's href.
    const select = () => {
      const { items, n, len, onSelect } = liveRef.current
      const index = activeCardOf(simRef.current, n) % len
      const item = items[index]
      if (onSelect) onSelect(item, index)
      else if (item?.href) window.location.assign(item.href)
    }

    return { changeView, stepBy, goTo, focusCard, select }
  }, [simRef, liveRef])
}
