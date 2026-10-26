// Docks to the bottom of the screen, above the reel and project pages, without blocking taps elsewhere.
export const wrap =
  'pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
export const card =
  'pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900/90 p-4 text-neutral-50 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md animate-[rise-in_450ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none'
export const title = 'm-0 text-base font-semibold'
export const text = 'm-0 mt-1 text-sm text-neutral-400'
// 16px text stops iPhones zooming the page when the field is focused.
export const input =
  'mt-3 block h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-base text-neutral-50 outline-none placeholder:text-neutral-500 focus:border-white/30'
export const actions = 'mt-3 flex justify-end gap-2'
export const skip =
  'h-10 cursor-pointer rounded-full border-0 bg-transparent px-4 text-sm text-neutral-400 transition-colors hover:text-neutral-200'
export const send =
  'h-10 cursor-pointer rounded-full border-0 bg-white px-5 text-sm font-medium text-neutral-900 transition-opacity hover:opacity-85 disabled:cursor-default disabled:opacity-40'
export const thanks = 'm-0 py-2 text-center text-base font-medium'
