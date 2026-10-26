// Turns what a visit saved into plain answers: which phone, which app or site, and where on a map.

// Safari and Chrome on iPhone never say which model they run on, but each family of models has its own
// screen size, so the size narrows it down. Display zoom changes the size, so it stays a guess.
const IPHONE_SCREENS = {
  '375×667@2': ['iPhone SE / 8', 'iPhone SE (2nd or 3rd gen), 6s, 7 or 8'],
  '414×736@3': ['iPhone 8 Plus', 'iPhone 6s Plus, 7 Plus or 8 Plus'],
  '375×812@3': ['iPhone X–13 mini', 'iPhone X, XS, 11 Pro, 12 mini or 13 mini'],
  '414×896@2': ['iPhone XR / 11', 'iPhone XR or 11'],
  '414×896@3': ['iPhone 11 Pro Max', 'iPhone XS Max or 11 Pro Max'],
  '390×844@3': ['iPhone 12–14', 'iPhone 12, 12 Pro, 13, 13 Pro, 14 or 16e'],
  '428×926@3': ['iPhone 12–14 Max', 'iPhone 12 Pro Max, 13 Pro Max or 14 Plus'],
  '393×852@3': ['iPhone 14 Pro–16', 'iPhone 14 Pro, 15, 15 Pro or 16'],
  '430×932@3': ['iPhone 14–16 Max', 'iPhone 14 Pro Max, 15 Plus, 15 Pro Max or 16 Plus'],
  '402×874@3': ['iPhone 16 Pro / 17', 'iPhone 16 Pro, 17 or 17 Pro'],
  '440×956@3': ['iPhone 16–17 Pro Max', 'iPhone 16 Pro Max or 17 Pro Max'],
  '420×912@3': ['iPhone Air', 'iPhone Air'],
}

// { short: 'iPhone 12–14', full: 'iPhone 12, 12 Pro, …', guessed: true }, or blanks when nothing is known.
export function phoneName(visit) {
  if (visit.model) return { short: visit.model, full: visit.model, guessed: false }
  const size = visit.os?.startsWith('iOS') && visit.screen?.match(/^(\d+)×(\d+) @([\d.]+)x$/)
  const names = size && IPHONE_SCREENS[`${size[1]}×${size[2]}@${size[3]}`]
  if (!names) return { short: '', full: '', guessed: false }
  return { short: names[0], full: names[1], guessed: true }
}

// Sites a link can be tapped on, by the address they pass along.
const SITES = [
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)threads\.(net|com)$/, 'Threads'],
  [/(^|\.)facebook\.com$|^fb\.me$/, 'Facebook'],
  [/^t\.co$|(^|\.)(x|twitter)\.com$/, 'X'],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'LinkedIn'],
  [/(^|\.)youtube\.com$|^youtu\.be$/, 'YouTube'],
  [/(^|\.)whatsapp\.com$/, 'WhatsApp'],
  [/(^|\.)linktr\.ee$/, 'Linktree'],
  [/(^|\.)google\.[a-z.]+$/, 'Google search'],
  [/(^|\.)bing\.com$/, 'Bing search'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)github\.com$/, 'GitHub'],
]

// { label: 'Instagram app', detail: 'Tapped the link inside the Instagram app' }
export function cameFrom(visit) {
  const app = visit.browser?.endsWith(' app') ? visit.browser : visit.fromInstagram && 'Instagram app'
  if (app) return { label: app, detail: `Tapped the link inside the ${app}` }
  const site = referrerSite(visit)
  if (site) return { label: site, detail: `Tapped a link on ${site}` }
  if (visit.metaClickId) {
    return { label: 'Instagram or Facebook', detail: "Tapped in Instagram or Facebook, then opened in the phone's own browser" }
  }
  return {
    label: 'Direct link',
    detail: 'Typed or pasted, or opened from an app that hides where links come from, like WhatsApp',
  }
}

function referrerSite({ referrer, host }) {
  if (!referrer) return ''
  try {
    const { hostname } = new URL(referrer)
    if (hostname === host?.split(':')[0]) return '' // came from another page of this site
    return SITES.find(([pattern]) => pattern.test(hostname))?.[1] ?? hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// The area on Google Maps: its middle when the visit saved one, otherwise the place name.
export function mapUrl(visit, place) {
  const where = Number.isFinite(visit.latitude) ? `${visit.latitude},${visit.longitude}` : place
  return where ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}` : ''
}

// "IN" → 🇮🇳
export function flag(countryCode) {
  if (!/^[A-Za-z]{2}$/.test(countryCode ?? '')) return ''
  return String.fromCodePoint(...[...countryCode.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

const languageNames = new Intl.DisplayNames(undefined, { type: 'language' })
// "en-IN" → "English (India)"
export function languageName(code) {
  if (!code) return ''
  try {
    return languageNames.of(code)
  } catch {
    return code
  }
}

// "Asia/Kolkata · 4:17 pm for them"
export function theirTime({ timezone, startedAt }) {
  if (!timezone) return ''
  const zone = timezone.replaceAll('_', ' ')
  if (!startedAt) return zone
  try {
    const clock = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: timezone })
    return `${zone} · ${clock.format(startedAt)} for them`
  } catch {
    return zone
  }
}
