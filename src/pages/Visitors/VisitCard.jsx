import { useState } from 'react'
import { cameFrom, flag, languageName, mapUrl, phoneName, theirTime } from './visitFacts'
import { formatAgo, formatDevice, formatPlace, formatStay, formatWhen, isTestVisit, ordinal } from './visitorsData'
import * as styles from './Visitors.styles'

// A visit in short; tapping it opens everything that was saved about it.
export function VisitCard({ visit, phone, onRemove }) {
  const [open, setOpen] = useState(false)
  const place = formatPlace(visit)

  return (
    <li className={styles.card}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={styles.cardToggle}>
        <span className={styles.cardHead}>
          <span className={styles.who}>{visit.name ?? 'Someone'}</span>
          <span className={styles.badges}>
            {visit.visitNumber > 1 && <span className={styles.badge}>{ordinal(visit.visitNumber)} visit</span>}
            {visit.fromInstagram && <span className={styles.instagramBadge}>Instagram</span>}
            {isTestVisit(visit) && <span className={styles.badge}>test</span>}
          </span>
        </span>
        <span className={styles.when}>
          {formatWhen(visit.startedAt)} · {formatAgo(visit.startedAt)}
        </span>
        <span className={styles.details}>
          <Detail label="Where" value={[flag(visit.countryCode), place].filter(Boolean).join(' ')} />
          <Detail label="Phone" value={formatDevice(visit)} />
          <Detail label="From" value={cameFrom(visit).label} />
          <Detail label="Stayed" value={stayedSummary(visit)} />
        </span>
        <span className={styles.toggleHint}>{open ? 'Hide details ▴' : 'All details ▾'}</span>
      </button>
      {open && <VisitDetails visit={visit} place={place} phone={phone} onRemove={onRemove} />}
    </li>
  )
}

function VisitDetails({ visit, place, phone, onRemove }) {
  const [confirming, setConfirming] = useState(false)
  const model = phoneName(visit)
  const map = mapUrl(visit, place)

  return (
    <div className={styles.more}>
      <Group title="Where">
        <Detail label="Area" value={[place, visit.accuracyKm && `within about ${visit.accuracyKm} km`].filter(Boolean).join(', ')} />
        <Detail
          label="Map"
          value={
            map && (
              <a href={map} target="_blank" rel="noreferrer" className={styles.link}>
                Show the area on Google Maps ↗
              </a>
            )
          }
        />
        <Detail label="Network" value={visit.network} />
        <Detail label="Time zone" value={theirTime(visit)} />
        <Detail label="Language" value={languageName(visit.language)} />
      </Group>

      <Group title="Phone">
        <Detail label="Model" value={model.guessed ? `${model.full} (guessed from the screen size)` : model.full} />
        <Detail label="System" value={visit.os} />
        <Detail label="Browser" value={visit.browser} />
        <Detail label="Screen" value={visit.screen} />
      </Group>

      <Group title="Visit">
        <Detail label="Came from" value={cameFrom(visit).detail} />
        <Detail label="Link tag" value={visit.linkTag} />
        <Detail label="Arrived" value={formatWhen(visit.startedAt)} />
        <Detail label="Last seen" value={formatWhen(visit.lastSeenAt)} />
        <Detail label="Stayed" value={formatStay(visit)} />
        <Detail label="Looked at" value={visit.viewed?.join(', ')} />
        <Detail label="Opened" value={visit.opened?.join(', ')} />
        <Detail label="Said hi" value={formatWhen(visit.namedAt)} />
        <Detail label="This phone" value={phoneHistory(visit, phone)} />
        <Detail label="Landed on" value={`${visit.host ?? ''}${visit.landingPage ?? ''}`} />
      </Group>

      <button
        type="button"
        onClick={() => (confirming ? onRemove(visit.id) : setConfirming(true))}
        onBlur={() => setConfirming(false)}
        className={styles.removeButton}
      >
        {confirming ? 'Tap again to remove' : 'Remove'}
      </button>
    </div>
  )
}

// "about 2 min · looked at 3 photos"
function stayedSummary(visit) {
  const looked = visit.viewed?.length
  return [formatStay(visit), looked && `looked at ${looked} photo${looked === 1 ? '' : 's'}`].filter(Boolean).join(' · ')
}

// "3rd visit · 2 in this list, first Mon 12 Oct, 7:15 pm"
function phoneHistory(visit, phone) {
  const nth = visit.visitNumber > 1 ? `${ordinal(visit.visitNumber)} visit` : 'First visit'
  if (!phone || phone.count < 2) return nth
  return `${nth} · ${phone.count} in this list, first ${formatWhen(phone.first)}`
}

function Group({ title, children }) {
  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <div className={styles.details}>{children}</div>
    </section>
  )
}

function Detail({ label, value }) {
  if (!value) return null
  return (
    <>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </>
  )
}
