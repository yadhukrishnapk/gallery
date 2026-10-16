import { memo } from 'react'
import { pad } from '../../../lib/format'
import * as styles from '../OrbitReel.styles'

// The animation loop positions cards by writing to the DOM, so they only depend on size and content:
// memo keeps stepping between cards (which re-renders OrbitReel) from re-rendering all of them.
export const ReelCards = memo(function ReelCards({ items, n, width, height, radius, accentColor, cardRefs, flipRefs }) {
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
        width={width}
        height={height}
        cornerRadius={cornerRadius}
        backFill={backFill}
        cardRef={(el) => {
          cardRefs.current[i] = el
        }}
        flipRef={(el) => {
          flipRefs.current[i] = el
        }}
      />
    )
  })
})

// Front shows the image, back shows the item number; the flip wave turns the inner flipper.
function ReelCard({ slot, item, number, width, height, cornerRadius, backFill, cardRef, flipRef }) {
  return (
    <button
      ref={cardRef}
      type="button"
      tabIndex={-1}
      data-orbit-card=""
      data-index={slot}
      aria-label={item.title || item.alt}
      className={styles.card}
      // Hidden until the animation loop places it.
      style={{ width, height, visibility: 'hidden' }}
    >
      <span ref={flipRef} className={styles.cardFlipper}>
        <span className={styles.cardFront} style={{ borderRadius: cornerRadius }}>
          <img src={item.src} alt="" draggable={false} decoding="async" className={styles.cardImage} />
        </span>
        <span className={styles.cardBack} style={{ borderRadius: cornerRadius, background: backFill }}>
          {pad(number)}
        </span>
      </span>
    </button>
  )
}
