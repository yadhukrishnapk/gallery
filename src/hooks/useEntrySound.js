import { useEffect } from 'react'

// Browsers only allow sound after a user gesture; these are the events that count as one.
const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']

// Plays `src` once when the page is opened. If the browser blocks sound because the visitor hasn't
// interacted with the page yet, it plays on their first click, tap or key press instead.
export function useEntrySound(src) {
  useEffect(() => {
    const audio = new Audio(src)
    let done = false

    function finish() {
      done = true
      GESTURES.forEach((type) => window.removeEventListener(type, tryPlay, true))
    }

    function tryPlay() {
      if (done) return
      audio.play().then(finish, (err) => {
        if (done) return
        // NotAllowedError means "no gesture yet": keep waiting for one. Anything else won't fix itself.
        if (err.name !== 'NotAllowedError') {
          console.warn(`Couldn't play ${src}:`, err)
          finish()
        }
      })
    }

    GESTURES.forEach((type) => window.addEventListener(type, tryPlay, true))
    tryPlay()
    return () => {
      finish()
      audio.pause()
    }
  }, [src])
}
