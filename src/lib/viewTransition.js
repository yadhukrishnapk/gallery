// Name shared by the tapped reel card and the detail page hero, so the browser morphs one into the other.
export const HERO_TRANSITION = 'project-hero'

export const setTransitionName = (el, name) => {
  if (el) el.style.viewTransitionName = name
}

// Runs `update` inside a View Transition when the browser supports it; otherwise just runs it.
// `update` may return a promise — the new snapshot is taken once it resolves.
export function runViewTransition(update, { onFinish } = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduced) {
    Promise.resolve(update()).finally(onFinish)
    return
  }
  const transition = document.startViewTransition(update)
  transition.finished.finally(onFinish)
}
