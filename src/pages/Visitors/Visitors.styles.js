// Scrolls on its own: the body is locked for the reel.
export const page =
  'fixed inset-0 overflow-y-auto overscroll-contain bg-[#0a0a0a] text-neutral-50 [-webkit-tap-highlight-color:transparent]'
export const column =
  'mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]'
export const centered = 'flex min-h-full items-center justify-center px-4 py-10'
export const note = 'm-0 max-w-sm text-center text-sm text-neutral-400'

// Login
export const loginCard = 'flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6'
export const loginTitle = 'm-0 mb-1 text-xl font-semibold'
export const label = 'flex flex-col gap-1.5 text-sm text-neutral-400'
// 16px text stops iPhones zooming the page when the field is focused.
export const input =
  'h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-base text-neutral-50 outline-none focus:border-white/30'
export const error = 'm-0 text-sm text-red-400'
export const primaryButton =
  'mt-1 h-11 cursor-pointer rounded-full border-0 bg-white text-sm font-medium text-neutral-900 transition-opacity hover:opacity-85 disabled:cursor-default disabled:opacity-50'

// Header and totals
export const header = 'flex items-center justify-between gap-3'
export const pageTitle = 'm-0 text-2xl font-semibold tracking-tight'
export const headerActions = 'flex gap-2'
export const ghostButton =
  'h-9 cursor-pointer rounded-full border-0 bg-white/8 px-4 text-sm text-neutral-200 transition-colors hover:bg-white/15 disabled:opacity-50'
export const stats = 'grid grid-cols-2 gap-2 sm:grid-cols-4'
export const stat = 'rounded-xl bg-white/[0.04] p-3'
export const statValue = 'm-0 text-2xl font-semibold tabular-nums'
export const statLabel = 'm-0 text-xs text-neutral-400'

// Sections and lists
export const section = 'flex flex-col gap-2'
export const sectionTitle = 'm-0 text-sm font-medium tracking-wide text-neutral-400 uppercase'
export const list = 'm-0 flex list-none flex-col gap-2 p-0'
export const hiRow = 'flex items-baseline justify-between gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5'
export const hiName = 'm-0 font-medium'
export const hiMeta = 'm-0 text-right text-xs text-neutral-400'

// One visit
export const card = 'flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4'
export const cardHead = 'flex flex-wrap items-center justify-between gap-2'
export const who = 'm-0 text-base font-semibold'
export const badges = 'flex flex-wrap gap-1.5'
export const badge = 'rounded-full bg-white/10 px-2 py-0.5 text-xs text-neutral-300'
export const instagramBadge = 'rounded-full bg-pink-500/20 px-2 py-0.5 text-xs text-pink-200'
export const when = 'm-0 text-xs text-neutral-400'
export const details = 'm-0 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1 text-sm'
export const detailLabel = 'text-neutral-500'
export const detailValue = 'm-0 text-neutral-200'
export const removeButton =
  'self-end cursor-pointer border-0 bg-transparent p-0 text-xs text-neutral-500 transition-colors hover:text-red-400'
