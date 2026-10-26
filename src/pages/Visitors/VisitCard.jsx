import { useState } from 'react'
import { formatAgo, formatDevice, formatPlace, formatStay, formatWhen, isTestVisit, ordinal } from './visitorsData'
import * as styles from './Visitors.styles'

export function VisitCard({ visit, onRemove }) {
  const [confirming, setConfirming] = useState(false)
  const where = [formatPlace(visit), visit.network].filter(Boolean).join(' · ')

  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <p className={styles.who}>{visit.name ?? 'Someone'}</p>
        <div className={styles.badges}>
          {visit.visitNumber > 1 && <span className={styles.badge}>{ordinal(visit.visitNumber)} visit</span>}
          {visit.fromInstagram && <span className={styles.instagramBadge}>Instagram</span>}
          {isTestVisit(visit) && <span className={styles.badge}>test</span>}
        </div>
      </div>
      <p className={styles.when}>
        {formatWhen(visit.startedAt)} · {formatAgo(visit.startedAt)}
      </p>
      <dl className={styles.details}>
        <Detail label="Where" value={where} />
        <Detail label="Device" value={formatDevice(visit)} />
        <Detail label="Stayed" value={formatStay(visit)} />
        <Detail label="Looked at" value={visit.viewed?.join(', ')} />
        <Detail label="Opened" value={visit.opened?.join(', ')} />
      </dl>
      <button
        type="button"
        onClick={() => (confirming ? onRemove(visit.id) : setConfirming(true))}
        onBlur={() => setConfirming(false)}
        className={styles.removeButton}
      >
        {confirming ? 'Tap again to remove' : 'Remove'}
      </button>
    </li>
  )
}

function Detail({ label, value }) {
  if (!value) return null
  return (
    <>
      <dt className={styles.detailLabel}>{label}</dt>
      <dd className={styles.detailValue}>{value}</dd>
    </>
  )
}
