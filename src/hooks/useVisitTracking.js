import { useEffect, useMemo, useRef, useState } from 'react'

const HEARTBEAT_MS = 30_000 // how often an open page updates "last seen", for how long they stayed
const MAX_HEARTBEATS = 60 // stop after half an hour, so a forgotten tab doesn't keep writing

// Records the visit as soon as the site opens, then what the visitor looks at. The tracking code and
// Firebase load after the page is up, so they never hold up the reel. `active` is false when tracking is
// off (see lib/visits.js), and the other functions then do nothing.
export function useVisitTracking() {
  const visitRef = useRef(null) // promise of the visit handle, or of null
  const [active, setActive] = useState(false)

  useEffect(() => {
    visitRef.current ??= import('../lib/visits')
      .then(({ startVisit }) => startVisit())
      .catch((err) => {
        console.warn('Visit not recorded:', err)
        return null
      })
    visitRef.current.then((visit) => setActive(Boolean(visit)))
  }, [])

  useEffect(() => {
    if (!active) return
    let beats = 0
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      visitRef.current.then((visit) => visit?.stillHere())
      if (++beats >= MAX_HEARTBEATS) clearInterval(id)
    }, HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [active])

  return useMemo(() => {
    const call = (method) => (arg) => visitRef.current?.then((visit) => visit?.[method](arg))
    return { active, viewed: call('viewed'), opened: call('opened'), named: call('named') }
  }, [active])
}
