export const DEFAULT_ARIA_LABEL =
  'Orbit reel. Click a card to bring it forward, scroll or drag to turn, press Escape to see the whole ring.'

// Matches the data-* attributes on the cards and on the overlay controls (see parts/).
export const CARD_SELECTOR = '[data-orbit-card]'
export const UI_SELECTOR = '[data-orbit-ui]'

// Layout
export const MAX_CARDS = 72
export const COMPACT_WIDTH = 640 // below this the reel switches to its phone layout
export const CAPTION_GAP = 22 // px between the top card and its caption
export const CAPTION_HEIGHT = 48
export const CONTROLS_HEIGHT = { compact: 60, regular: 48 }

// Timing (ms)
export const MORPH_MS = 1100 // ring ⇄ arc transition
export const WAVE_SPREAD_MS = 650 // delay between the top and bottom card flipping
export const WAVE_FLIP_MS = 850 // a single card's flip
export const WAVE_EVERY_MS = 6500 // pause between flip waves on the ring
export const FIRST_WAVE_MS = 1200 // first wave after mount
export const VIEW_CHANGE_WAVE_MS = 120 // every view change also sets off a wave, after this delay

// Motion
export const MAX_FRAME_S = 0.05 // cap on one frame's time step, so a backgrounded tab doesn't jump
export const SPRING = { stiffness: 120, damping: 22 } // the arc settling onto a card
export const SPIN_EASE = 2.5 // how fast the ring eases to its spin speed, 1/s
export const REST = { rot: 1e-5, vel: 1e-4 } // below these the wheel snaps to rest

// Input
export const DRAG_THRESHOLD = { mouse: 5, touch: 9, pen: 6 } // px a press travels before it becomes a drag
export const DRAG_VELOCITY_BLEND = 0.4 // smoothing of the drag velocity used for flings
export const FLING = {
  lookaheadS: 0.18, // the arc settles where the release velocity would carry it this far ahead
  staleMs: 80, // a pointer that rested this long before lifting doesn't fling
  swipePx: 28, // a short swipe this long still moves one card
}
export const WHEEL = {
  lineHeightPx: 16, // for devices that scroll in lines
  arcSpeed: 0.6,
  ringSpeed: 0.0025,
  maxRingVel: 6, // rad/s
  settleMs: 160, // the arc settles on a card once scrolling pauses this long
}
