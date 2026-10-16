import { pad } from '../../../lib/format'
import * as styles from '../OrbitReel.styles'
import { Chevron, RingIcon } from './icons'

// Caption, prev/next controls and the "show all" button for the arc view. The animation loop fades
// it in and out through `ref`.
export function ReelOverlay({ ref, geo, item, position, total, captions, controls, lightBg, onStep, onShowAll }) {
  const { compact } = geo
  const buttonClass = styles.navButton({ compact, lightBg })

  return (
    <div ref={ref} className={styles.overlay}>
      {(captions || controls) && (
        <div className={styles.captionArea} style={{ top: geo.captionY }}>
          {captions && <Caption item={item} compact={compact} />}
          {controls && (
            <div data-orbit-ui="" className={styles.nav(compact)}>
              <button type="button" aria-label="Previous card" onClick={() => onStep(-1)} className={buttonClass}>
                <Chevron dir="left" />
              </button>
              <span className={styles.counter}>
                {pad(position)} / {pad(total)}
              </span>
              <button type="button" aria-label="Next card" onClick={() => onStep(1)} className={buttonClass}>
                <Chevron dir="right" />
              </button>
            </div>
          )}
        </div>
      )}
      {controls && (
        <button
          type="button"
          data-orbit-ui=""
          aria-label="Show all cards"
          onClick={onShowAll}
          className={styles.showAllButton({ compact, lightBg })}
        >
          <RingIcon />
        </button>
      )}
    </div>
  )
}

function Caption({ item, compact }) {
  return (
    <div aria-live="polite" className={styles.caption}>
      {item?.title && <p className={styles.captionTitle(compact)}>{item.title}</p>}
      {item?.subtitle && <p className={styles.captionSubtitle(compact)}>{item.subtitle}</p>}
    </div>
  )
}
