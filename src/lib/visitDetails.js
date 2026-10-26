// What a visitor's browser reveals about their device, without asking them anything.

// Instagram's, Threads' and Facebook's in-app browsers name the iPhone by Apple's internal model code.
const IPHONE_NAMES = {
  'iPhone10,3': 'iPhone X',
  'iPhone10,6': 'iPhone X',
  'iPhone11,2': 'iPhone XS',
  'iPhone11,6': 'iPhone XS Max',
  'iPhone11,8': 'iPhone XR',
  'iPhone12,1': 'iPhone 11',
  'iPhone12,3': 'iPhone 11 Pro',
  'iPhone12,5': 'iPhone 11 Pro Max',
  'iPhone12,8': 'iPhone SE (2nd gen)',
  'iPhone13,1': 'iPhone 12 mini',
  'iPhone13,2': 'iPhone 12',
  'iPhone13,3': 'iPhone 12 Pro',
  'iPhone13,4': 'iPhone 12 Pro Max',
  'iPhone14,2': 'iPhone 13 Pro',
  'iPhone14,3': 'iPhone 13 Pro Max',
  'iPhone14,4': 'iPhone 13 mini',
  'iPhone14,5': 'iPhone 13',
  'iPhone14,6': 'iPhone SE (3rd gen)',
  'iPhone14,7': 'iPhone 14',
  'iPhone14,8': 'iPhone 14 Plus',
  'iPhone15,2': 'iPhone 14 Pro',
  'iPhone15,3': 'iPhone 14 Pro Max',
  'iPhone15,4': 'iPhone 15',
  'iPhone15,5': 'iPhone 15 Plus',
  'iPhone16,1': 'iPhone 15 Pro',
  'iPhone16,2': 'iPhone 15 Pro Max',
  'iPhone17,1': 'iPhone 16 Pro',
  'iPhone17,2': 'iPhone 16 Pro Max',
  'iPhone17,3': 'iPhone 16',
  'iPhone17,4': 'iPhone 16 Plus',
  'iPhone17,5': 'iPhone 16e',
  'iPhone18,1': 'iPhone 17 Pro',
  'iPhone18,2': 'iPhone 17 Pro Max',
  'iPhone18,3': 'iPhone 17',
  'iPhone18,4': 'iPhone Air',
}

// First match wins, so in-app browsers come before the browser engines they are built on. A browser
// ending in " app" tells the /visitors page which app the link was tapped in.
const BROWSERS = [
  [/\bBarcelona\b/, 'Threads app'],
  [/\bInstagram\b/, 'Instagram app'],
  [/MessengerForiOS|FB_IAB\/Orca|FBAN\/Messenger/, 'Messenger app'],
  [/FBAN|FBAV|FB_IAB/, 'Facebook app'],
  [/LinkedInApp/, 'LinkedIn app'],
  [/Snapchat/, 'Snapchat app'],
  [/musical_ly|BytedanceWebview|TikTok/, 'TikTok app'],
  [/Twitter/, 'X app'],
  [/Telegram/, 'Telegram app'],
  [/\bLine\//, 'LINE app'],
  [/Pinterest/, 'Pinterest app'],
  [/\bGSA\//, 'Google app'],
  [/SamsungBrowser/, 'Samsung Internet'],
  [/EdgiOS|Edg\//, 'Edge'],
  [/OPR\/|OPiOS/, 'Opera'],
  [/CriOS|Chrome\//, 'Chrome'],
  [/FxiOS|Firefox\//, 'Firefox'],
  [/Safari\//, 'Safari'],
]

export function describeDevice(ua = navigator.userAgent, touchPoints = navigator.maxTouchPoints ?? 0) {
  // iPads ask for desktop sites, so they look like a Mac apart from the touch screen.
  const iPadAsMac = /Macintosh/.test(ua) && touchPoints > 1
  return {
    fromInstagram: /\bInstagram\b/.test(ua),
    type: deviceType(ua, iPadAsMac),
    os: osName(ua, iPadAsMac),
    browser: BROWSERS.find(([pattern]) => pattern.test(ua))?.[1] ?? '',
    model: modelName(ua),
  }
}

// Tags you add to the link, like ?from=story, so you can tell which of your links was tapped.
const TAG_PARAMS = ['from', 'src', 'ref', 'utm_source', 'utm_medium', 'utm_campaign']
export function linkTag(search = window.location.search) {
  const params = new URLSearchParams(search)
  return [...new Set(TAG_PARAMS.map((name) => params.get(name)?.trim()).filter(Boolean))].join(' / ').slice(0, 80)
}

// Instagram and Facebook add a click id to every link tapped in them, even when the link opens in another browser.
export const hasMetaClickId = (search = window.location.search) => new URLSearchParams(search).has('fbclid')

export function describeScreen() {
  const ratio = Math.round((window.devicePixelRatio || 1) * 100) / 100
  return `${screen.width}×${screen.height} @${ratio}x`
}

// Chrome on Android hides the phone model in its user agent, but tells it when asked.
export async function lookUpModel() {
  try {
    const values = await navigator.userAgentData?.getHighEntropyValues(['model'])
    return values?.model ?? ''
  } catch {
    return ''
  }
}

function deviceType(ua, iPadAsMac) {
  if (iPadAsMac || /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) return 'tablet'
  if (/Mobi|iPhone|iPod|Android/.test(ua)) return 'phone'
  return 'computer'
}

function osName(ua, iPadAsMac) {
  const ios = ua.match(/OS (\d+)_(\d+)(?:_\d+)? like Mac OS X/)
  if (ios) return `${/iPad/.test(ua) ? 'iPadOS' : 'iOS'} ${ios[1]}.${ios[2]}`
  if (iPadAsMac) return 'iPadOS'
  const android = ua.match(/Android (\d+(?:\.\d+)?)/)
  if (android) return `Android ${android[1]}`
  if (/Windows NT/.test(ua)) return 'Windows'
  if (/CrOS/.test(ua)) return 'ChromeOS'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Linux/.test(ua)) return 'Linux'
  return ''
}

function modelName(ua) {
  // Instagram (or Threads, "Barcelona") on iPhone: "Instagram 337.0.3.23.54 (iPhone14,5; iOS 17_5; …)"
  const apple = ua.match(/(?:Instagram|Barcelona) [\d.]+ \((i(?:Phone|Pad)\d+,\d+);/)
  if (apple) return IPHONE_NAMES[apple[1]] ?? apple[1]
  // Facebook and Messenger: "[FBAN/FBIOS;FBDV/iPhone14,5;…]", or "FBDV/SM-S911B" on Android
  const facebook = ua.match(/FBDV\/([^;\]]+)/)
  if (facebook) return IPHONE_NAMES[facebook[1]] ?? facebook[1]
  // Instagram on Android: "Instagram 312.1.0.34.111 Android (33/13; 450dpi; 1080x2340; samsung; SM-S911B; …)"
  const droid = ua.match(/(?:Instagram|Barcelona) [\d.]+ Android \([^;]*;[^;]*;[^;]*; ([^;]+); ([^;]+);/)
  if (droid) return `${droid[1].charAt(0).toUpperCase()}${droid[1].slice(1)} ${droid[2]}`
  // Other Android browsers that still name the model: "Android 13; SM-S911B Build/…". Chrome hides it as "K".
  const android = ua.match(/Android [\d.]+; ([^;)]+?)(?: Build\/|\))/)
  if (android && android[1] !== 'K') return android[1].trim()
  return ''
}
