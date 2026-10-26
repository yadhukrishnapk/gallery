import { addDoc, arrayUnion, collection, serverTimestamp, updateDoc } from 'firebase/firestore/lite'
import { firebaseApp, firestore } from './firebase'
import { lookUpPlace } from './geo'
import { isOwnerBrowser } from './owner'
import { readStored, writeStored } from './storage'
import { describeDevice, describeScreen, lookUpModel } from './visitDetails'

const VISITOR_KEY = 'orbit:visitor' // random id for this browser, to tell repeat visitors from new ones
const VISIT_COUNT_KEY = 'orbit:visit-count'

// Records this visit in the `visits` collection and returns a handle for adding to it as the visitor
// looks around. Returns null when tracking is off: no Firebase config yet, or a browser you've signed
// in to /visitors on.
export async function startVisit() {
  if (!firebaseApp || isOwnerBrowser()) return null

  const device = describeDevice()
  const [place, model] = await Promise.all([lookUpPlace(), device.model || lookUpModel()])
  const visitNumber = Number(readStored(VISIT_COUNT_KEY) ?? 0) + 1
  writeStored(VISIT_COUNT_KEY, String(visitNumber))

  const ref = await addDoc(
    collection(firestore(), 'visits'),
    withoutBlanks({
      startedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      visitor: visitorId(),
      visitNumber,
      host: window.location.host,
      landingPage: window.location.pathname,
      referrer: document.referrer.slice(0, 300),
      ...device,
      model,
      screen: describeScreen(),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...place,
      viewed: [],
      opened: [],
    }),
  )

  const update = (data) => updateDoc(ref, data).catch((err) => console.warn('Visit not updated:', err))
  const added = { viewed: new Set(), opened: new Set() }
  const addTo = (list, title) => {
    if (!title || added[list].has(title)) return
    added[list].add(title)
    void update({ [list]: arrayUnion(title.slice(0, 120)) })
  }

  return {
    viewed: (title) => addTo('viewed', title), // a photo that came to rest at the front of the reel
    opened: (title) => addTo('opened', title), // a project page
    named: (name) => update({ name: name.slice(0, 60), namedAt: serverTimestamp() }),
    stillHere: () => update({ lastSeenAt: serverTimestamp() }),
  }
}

function visitorId() {
  let id = readStored(VISITOR_KEY)
  if (!id) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
    writeStored(VISITOR_KEY, id)
  }
  return id
}

// Firestore rejects undefined values, and empty ones only clutter the list.
const withoutBlanks = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== ''))
