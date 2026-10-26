import { useEffect, useState } from 'react'
import { firebaseApp } from '../../lib/firebase'
import { markOwnerBrowser } from '../../lib/owner'
import { LoginForm } from './LoginForm'
import { watchOwner } from './ownerAuth'
import { VisitList } from './VisitList'
import * as styles from './Visitors.styles'

// Your private list of visitors at /visitors. Only the login set up in Firebase can read it.
export default function VisitorsPage() {
  const [owner, setOwner] = useState(undefined) // undefined while Firebase checks for a saved login

  useEffect(() => {
    document.title = 'Visitors — Orbit Reel'
  }, [])

  useEffect(() => {
    if (!firebaseApp) return
    return watchOwner((user) => {
      if (user) markOwnerBrowser() // from now on, this browser's own visits aren't recorded
      setOwner(user)
    })
  }, [])

  if (!firebaseApp) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <p className={styles.note}>Firebase isn&apos;t set up yet, so there are no visitors to show.</p>
        </div>
      </div>
    )
  }
  if (owner === undefined) return <div className={styles.page} />
  return owner ? <VisitList /> : <div className={styles.page}><LoginForm /></div>
}
