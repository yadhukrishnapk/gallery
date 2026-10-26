import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore/lite'

// The Firebase web config, from environment variables (see .env.example). These values are fine to
// ship to the browser: what anyone may do with the database is decided by firestore.rules.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Null until the config is filled in; visit tracking and the /visitors page stay off until then.
export const firebaseApp = config.apiKey && config.projectId ? initializeApp(config) : null

// In development, VITE_FIREBASE_EMULATORS=true talks to the local Firebase emulators instead of the
// real project, so testing never touches real visits.
export const usesEmulators = import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATORS === 'true'

let db = null
export function firestore() {
  if (!db) {
    db = getFirestore(firebaseApp)
    if (usesEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }
  return db
}
