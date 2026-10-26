import { useState } from 'react'
import { signIn, signInError } from './ownerAuth'
import * as styles from './Visitors.styles'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // On success the page switches to the list by itself (see VisitorsPage).
  const submit = async (ev) => {
    ev.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(username, password)
    } catch (err) {
      setError(signInError(err))
      setBusy(false)
    }
  }

  return (
    <div className={styles.centered}>
      <form onSubmit={submit} className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Visitors</h1>
        <label className={styles.label}>
          Username
          <input
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            autoComplete="current-password"
            required
            className={styles.input}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={busy} className={styles.primaryButton}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  )
}
