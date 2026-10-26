// localStorage that never throws: private browsing and some in-app browsers block it, and then the
// value simply isn't remembered.
export function readStored(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStored(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage is blocked; nothing to remember it in.
  }
}
