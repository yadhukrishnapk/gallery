import { useEffect, useState } from 'react'
import { readStored, writeStored } from '../../lib/storage'

export const SAY_HI_AFTER_MS = 60_000 // time on screen before the visitor is asked
export const THANKS_MS = 2500

// Once a visitor has sent their name or skipped, they're never asked again on that phone.
const ASKED_KEY = 'orbit:said-hi'
export const wasAsked = () => readStored(ASKED_KEY) !== null
export const markAsked = (how) => writeStored(ASKED_KEY, how) // 'sent' or 'skipped'

// True once the page has been on screen for `ms` in total. Time spent in another app or tab doesn't count.
export function useOnScreenFor(ms) {
  const [reached, setReached] = useState(false)
  useEffect(() => {
    if (reached) return
    let onScreen = 0
    let last = performance.now()
    const id = setInterval(() => {
      const t = performance.now()
      if (document.visibilityState === 'visible') onScreen += t - last
      last = t
      if (onScreen >= ms) setReached(true)
    }, 1000)
    return () => clearInterval(id)
  }, [ms, reached])
  return reached
}
