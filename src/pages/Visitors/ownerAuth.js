import { connectAuthEmulator, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { firebaseApp, usesEmulators } from '../../lib/firebase'
import { ownerEmail } from '../../lib/owner'

// Firebase keeps you signed in on this browser until you sign out.
let instance = null
function auth() {
  if (!instance) {
    instance = getAuth(firebaseApp)
    if (usesEmulators) connectAuthEmulator(instance, 'http://127.0.0.1:9099', { disableWarnings: true })
  }
  return instance
}

export const watchOwner = (callback) => onAuthStateChanged(auth(), callback)
export const signIn = (username, password) => signInWithEmailAndPassword(auth(), ownerEmail(username), password)
export const signOutOwner = () => signOut(auth())

export function signInError(err) {
  if (err?.code === 'auth/too-many-requests') return 'Too many tries. Wait a minute and try again.'
  if (err?.code === 'auth/network-request-failed') return 'No connection. Check your internet and try again.'
  return 'Wrong username or password.'
}
