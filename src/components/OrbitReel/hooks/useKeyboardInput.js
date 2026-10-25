import { useCallback } from 'react'
import { UI_SELECTOR } from '../OrbitReel.constants'
import { isArc } from '../engine/state'

// Escape shows the ring, arrows step through cards, Enter zooms in or opens the top card.
export function useKeyboardInput(simRef, commands) {
  return useCallback(
    (ev) => {
      switch (ev.key) {
        case 'Escape':
          commands.changeView('ring')
          break
        case 'ArrowRight':
          commands.stepBy(1)
          break
        case 'ArrowLeft':
          commands.stepBy(-1)
          break
        case 'Enter':
          // On a focused overlay button, let Enter click it instead.
          if (ev.target.closest(UI_SELECTOR)) return
          if (isArc(simRef.current)) commands.select()
          else commands.changeView('arc')
          break
        default:
          return
      }
      ev.preventDefault()
    },
    [simRef, commands],
  )
}
