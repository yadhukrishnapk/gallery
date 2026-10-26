const cx = (...classes) => classes.filter(Boolean).join(' ')

// UI colors follow the reel background: dark text and buttons on light backgrounds, light on dark.
const tones = {
  light: {
    text: 'text-neutral-900',
    button: 'bg-black/5 hover:bg-black/10 active:bg-black/15 text-neutral-900',
  },
  dark: {
    text: 'text-neutral-50',
    button: 'bg-white/8 hover:bg-white/15 active:bg-white/20 text-neutral-50',
  },
}
const toneFor = (lightBg) => (lightBg ? tones.light : tones.dark)

export const root = ({ lightBg, draggable, className }) =>
  cx(
    'relative h-full min-h-[420px] w-full touch-none overflow-hidden outline-none select-none [-webkit-tap-highlight-color:transparent] [contain:layout_paint_style]',
    toneFor(lightBg).text,
    draggable && 'cursor-grab active:cursor-grabbing',
    className,
  )

export const childrenLayer = 'pointer-events-none absolute inset-0 z-0 flex items-center justify-center'
export const childrenSlot = 'pointer-events-auto'
// Holds the cards. The browser turns it as a whole while the ring just spins (see engine/cruise.js).
export const stage = 'absolute inset-0 will-change-transform [perspective:1400px]'

// Cards
export const card =
  'absolute top-0 left-0 m-0 cursor-pointer border-0 bg-transparent p-0 outline-none will-change-transform [transform-style:preserve-3d]'
export const cardFlipper = 'absolute inset-0 [transform-style:preserve-3d]'
export const cardFront =
  'absolute inset-0 overflow-hidden bg-neutral-500/20 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55),0_2px_6px_-2px_rgba(0,0,0,0.25)] [backface-visibility:hidden]'
export const cardImage = 'pointer-events-none block size-full object-cover'
// The full photo, laid over the thumbnail of the card in focus and faded in once it has loaded.
export const cardFullImage = (loaded) =>
  cx(
    'pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-300 motion-reduce:transition-none',
    loaded ? 'opacity-100' : 'opacity-0',
  )
export const cardBack =
  'absolute inset-0 flex items-end justify-start overflow-hidden p-[8%] text-[clamp(10px,1.1vw,14px)] tracking-wider text-white/90 tabular-nums [backface-visibility:hidden] [transform:rotateY(180deg)]'
export const cardBackFill = (accent) =>
  `linear-gradient(155deg, color-mix(in oklch, ${accent} 88%, white) 0%, ${accent} 45%, color-mix(in oklch, ${accent} 55%, black) 100%)`

// Overlay (arc view only)
export const overlay = 'pointer-events-none invisible absolute inset-0 z-[400] opacity-0'
export const captionArea = 'absolute inset-x-0 flex flex-col items-center px-6 text-center'
export const caption = 'flex max-w-md flex-col items-center gap-1'
export const captionTitle = (compact) =>
  cx('m-0 font-semibold tracking-tight', compact ? 'text-[17px]' : 'text-[15px]')
export const captionSubtitle = (compact) => cx('m-0 opacity-60', compact ? 'text-sm' : 'text-[13px]')
export const nav = (compact) => cx('flex items-center', compact ? 'mt-4 gap-5' : 'mt-3 gap-4')
export const counter = 'min-w-12 text-xs tabular-nums opacity-55'
export const navButton = ({ compact, lightBg }) =>
  cx(
    'pointer-events-auto grid cursor-pointer place-items-center rounded-full border-0 transition-colors',
    compact ? 'size-11' : 'size-9',
    toneFor(lightBg).button,
  )
export const showAllButton = (opts) =>
  cx(
    'absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))]',
    navButton(opts),
  )

export const icon = { chevron: 'size-3.5', ring: 'size-4' }
