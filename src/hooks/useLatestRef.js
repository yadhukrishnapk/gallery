import { useLayoutEffect, useRef } from 'react'

// A ref that always holds the latest committed `value`, for loops and event handlers that are set
// up once and must not restart whenever props change.
export function useLatestRef(value) {
  const ref = useRef(value)
  useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}
