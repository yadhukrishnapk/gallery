import { useLayoutEffect, useState } from 'react'

// Content-box size of the element in `ref`, kept current with a ResizeObserver. 0 × 0 until measured.
export function useElementSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }))
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return size
}
