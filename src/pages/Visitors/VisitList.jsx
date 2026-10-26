import { useCallback, useEffect, useState } from 'react'
import { signOutOwner } from './ownerAuth'
import { VisitCard } from './VisitCard'
import { fetchVisits, formatAgo, formatDevice, formatPlace, loadError, MAX_VISITS, removeVisit, summarize } from './visitorsData'
import * as styles from './Visitors.styles'

export function VisitList() {
  const [visits, setVisits] = useState(null) // null until first loaded
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    () =>
      fetchVisits()
        .then((list) => {
          setVisits(list)
          setError('')
        })
        .catch((err) => {
          console.warn('Visits not loaded:', err)
          setError(loadError(err))
        })
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    void load()
  }, [load])

  const refresh = () => {
    setLoading(true)
    void load()
  }

  const remove = async (id) => {
    try {
      await removeVisit(id)
      setVisits((list) => list.filter((v) => v.id !== id))
    } catch (err) {
      console.warn('Visit not removed:', err)
      setError("Couldn't remove that visit. Try again.")
    }
  }

  const named = visits?.filter((v) => v.name) ?? []
  const totals = visits && summarize(visits)

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Visitors</h1>
          <div className={styles.headerActions}>
            <button type="button" onClick={refresh} disabled={loading} className={styles.ghostButton}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button type="button" onClick={signOutOwner} className={styles.ghostButton}>
              Sign out
            </button>
          </div>
        </header>

        {error && <p className={styles.error}>{error}</p>}

        {totals && (
          <div className={styles.stats}>
            <Stat value={totals.today} label="Today" />
            <Stat value={totals.week} label="Last 7 days" />
            <Stat value={totals.total === MAX_VISITS ? `${MAX_VISITS}+` : totals.total} label="All visits" />
            <Stat value={totals.phones} label="Different phones" />
          </div>
        )}

        {named.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>👋 Said hi ({named.length})</h2>
            <ul className={styles.list}>
              {named.map((v) => (
                <li key={v.id} className={styles.hiRow}>
                  <p className={styles.hiName}>{v.name}</p>
                  <p className={styles.hiMeta}>
                    {[formatPlace(v), formatDevice(v), formatAgo(v.namedAt ?? v.startedAt)].filter(Boolean).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {visits && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>All visits</h2>
            {visits.length === 0 ? (
              <p className={styles.note}>No visits yet. They show up here as soon as someone opens your link.</p>
            ) : (
              <ul className={styles.list}>
                {visits.map((v) => (
                  <VisitCard key={v.id} visit={v} onRemove={remove} />
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className={styles.stat}>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  )
}
