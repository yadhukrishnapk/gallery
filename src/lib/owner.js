import { readStored, writeStored } from './storage'

// The /visitors login. Firebase sign-in needs an email address, so the username is turned into one,
// and the password is kept only by Firebase Authentication. Keep the domain in step with firestore.rules.
const OWNER_EMAIL_DOMAIN = 'orbit-reel.app'
// Typing the full email works too.
export function ownerEmail(username) {
  const name = username.trim().toLowerCase()
  return name.includes('@') ? name : `${name}@${OWNER_EMAIL_DOMAIN}`
}

// Browsers you've signed in on are remembered, so your own visits aren't recorded.
const OWNER_KEY = 'orbit:owner'
export const isOwnerBrowser = () => readStored(OWNER_KEY) === '1'
export const markOwnerBrowser = () => writeStored(OWNER_KEY, '1')
