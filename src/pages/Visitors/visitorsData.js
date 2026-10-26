import { collection, deleteDoc, doc, getDocs, limit, orderBy, query } from 'firebase/firestore/lite'
import { firestore } from '../../lib/firebase'

export const MAX_VISITS = 500 // newest visits loaded at once
const DAY_MS = 86_400_000

const visitsCollection = () => collection(firestore(), 'visits')

export async function fetchVisits() {
  const snapshot = await getDocs(query(visitsCollection(), orderBy('startedAt', 'desc'), limit(MAX_VISITS)))
  return snapshot.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      startedAt: data.startedAt?.toDate(),
      lastSeenAt: data.lastSeenAt?.toDate(),
      namedAt: data.namedAt?.toDate(),
    }
  })
}

export const removeVisit = (id) => deleteDoc(doc(visitsCollection(), id))

export function summarize(visits, now = new Date()) {
  const weekAgo = now - 7 * DAY_MS
  return {
    today: visits.filter((v) => v.startedAt >= startOfDay(now)).length,
    week: visits.filter((v) => v.startedAt >= weekAgo).length,
    total: visits.length,
    phones: new Set(visits.map((v) => v.visitor)).size,
  }
}

export function loadError(err) {
  if (err?.code === 'permission-denied') return "This login can't read visits. Check the rules in firestore.rules."
  return "Couldn't load visits. Check your connection and refresh."
}

// Visits from your own computer while testing, not from the live site.
export const isTestVisit = (visit) => /^(localhost|127\.0\.0\.1)(:|$)/.test(visit.host ?? '')

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
const startOfDay = (date) => new Date(date).setHours(0, 0, 0, 0)

// "Today, 9:41 pm", "Yesterday, 8:02 am", "Mon 12 Oct, 7:15 pm"
export function formatWhen(date, now = new Date()) {
  if (!date) return ''
  return `${dayLabel(date, now)}, ${timeFormat.format(date)}`
}

function dayLabel(date, now) {
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return dayFormat.format(date)
}

// "just now", "5 min ago", "3 h ago", "4 days ago"
export function formatAgo(date, now = new Date()) {
  if (!date) return ''
  const minutes = Math.round((now - date) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

// How long the page stayed open, from its "still here" updates (sent every 30 s while it's on screen).
export function formatStay({ startedAt, lastSeenAt }) {
  const seconds = (lastSeenAt - startedAt) / 1000
  if (!Number.isFinite(seconds) || seconds < 30) return 'under 30 s'
  if (seconds < 60) return 'about 30 s'
  return `about ${Math.round(seconds / 60)} min`
}

export const formatPlace = (visit) => [...new Set([visit.city, visit.region, visit.country].filter(Boolean))].join(', ')
export const formatDevice = (visit) => [visit.model, visit.os, visit.browser].filter(Boolean).join(' · ')

export function ordinal(n) {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'
  return `${n}${suffix}`
}
