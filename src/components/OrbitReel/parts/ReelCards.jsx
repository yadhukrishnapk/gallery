import { memo, useState } from 'react'
import { pad } from '../../../lib/format'
import * as styles from '../OrbitReel.styles'

// The animation loop positions cards by writing to the DOM, so they only depend on size, content and
// which card is in focus. Each card is memoised, so moving the focus re-renders just the two involved.
export const ReelCards = memo(function ReelCards({ items, n, focus, width, height, radius, accentColor, cardsRef, flipsRef }) {
  if (!width || items.length === 0) return null
  const cornerRadius = width * radius
  const backFill = styles.cardBackFill(accentColor)

  return Array.from({ length: n }, (_, i) => {
    const itemIndex = i % items.length
    return (
      <ReelCard
        key={i}
        slot={i}
        item={items[itemIndex]}
        number={itemIndex + 1}
        focused={i === focus}
        width={width}
        height={height}
        cornerRadius={cornerRadius}
        backFill={backFill}
        cardsRef={cardsRef}
        flipsRef={flipsRef}
      />
    )
  })
})

// Front shows the photo, back shows the item number; the flip wave turns the inner flipper.
const ReelCard = memo(function ReelCard({ slot, item, number, focused, width, height, cornerRadius, backFill, cardsRef, flipsRef }) {
  return (
    <button
      ref={(el) => {
        cardsRef.current[slot] = el
      }}
      type="button"
      tabIndex={-1}
      data-orbit-card=""
      data-index={slot}
      aria-label={item.title || item.alt}
      className={styles.card}
      // Hidden until the animation loop places it.
      style={{ width, height, visibility: 'hidden' }}
    >
      <span
        ref={(el) => {
          flipsRef.current[slot] = el
        }}
        className={styles.cardFlipper}
      >
        <span className={styles.cardFront} style={{ borderRadius: cornerRadius }}>
          <Thumbnail item={item} />
          {focused && item.thumb && <FullPhoto src={item.src} />}
        </span>
        <span className={styles.cardBack} style={{ borderRadius: cornerRadius, background: backFill }}>
          {pad(number)}
        </span>
      </span>
    </button>
  )
})

// Falls back to the full photo when there's no thumbnail or it fails to load (for example a photo
// added while the dev server is running, before `npm run thumbnails` has made its thumbnail).
function Thumbnail({ item }) {
  const [broken, setBroken] = useState(null)
  const src = item.thumb && item.thumb !== broken ? item.thumb : item.src
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      decoding="async"
      onError={() => setBroken(item.thumb)}
      className={styles.cardImage}
    />
  )
}

function FullPhoto({ src }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={styles.cardFullImage(loaded)}
    />
  )
}
