import { useEffect, useRef } from 'react'
import { HERO_TRANSITION } from '../lib/viewTransition'

const pad = (n) => String(n).padStart(2, '0')

function Arrow({ dir }) {
  const d = {
    left: 'M12.5 4 6.5 10l6 6',
    right: 'M7.5 4l6 6-6 6',
    out: 'M7 13 13 7M8 7h5v5',
  }[dir]
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const roundButton =
  'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/8 text-neutral-50 backdrop-blur-md transition-colors hover:bg-white/15 active:bg-white/20'

export default function ProjectDetail({ project, index, total, prevProject, nextProject, onBack, onShow }) {
  const scroller = useRef(null)
  const meta = [project.category, project.year].filter(Boolean)

  // New project: start at the top and take focus away from the reel underneath.
  useEffect(() => {
    scroller.current?.scrollTo(0, 0)
    scroller.current?.focus({ preventScroll: true })
  }, [project.slug])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  return (
    <div
      ref={scroller}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#0a0a0a] text-neutral-50 outline-none [-webkit-tap-highlight-color:transparent]"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6 md:px-8">
        <button type="button" onClick={onBack} aria-label="Back to gallery" className={roundButton}>
          <Arrow dir="left" />
        </button>
        <span className="text-xs text-neutral-400 tabular-nums">
          {pad(index + 1)} / {pad(total)}
        </span>
      </header>

      <article className="mx-auto -mt-2 grid max-w-6xl gap-8 px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start md:gap-14 md:px-10">
        <div className="mx-auto w-full max-w-md md:sticky md:top-24 md:max-w-none">
          <img
            src={project.src}
            alt={project.alt ?? ''}
            fetchPriority="high"
            className="block aspect-[4/5] w-full rounded-2xl bg-neutral-500/20 object-cover shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]"
            style={{ viewTransitionName: HERO_TRANSITION }}
          />
        </div>

        <div key={project.slug} className="detail-reveal flex flex-col gap-6 md:pt-4">
          {meta.length > 0 && (
            <p className="m-0 text-xs tracking-[0.2em] text-neutral-400 uppercase">{meta.join(' · ')}</p>
          )}

          <div className="flex flex-col gap-2">
            <h1 id="project-title" className="m-0 text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              {project.title}
            </h1>
            {project.subtitle && <p className="m-0 text-lg text-neutral-400 md:text-xl">{project.subtitle}</p>}
          </div>

          {project.description?.length > 0 && (
            <div className="flex max-w-prose flex-col gap-4 text-[15px] leading-relaxed text-neutral-300 md:text-base">
              {project.description.map((paragraph, i) => (
                <p key={i} className="m-0">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {project.href && (
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-neutral-900 transition-opacity hover:opacity-85"
            >
              Visit project
              <Arrow dir="out" />
            </a>
          )}

          {project.images?.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {project.images.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${project.title} — image ${i + 2}`}
                  loading="lazy"
                  decoding="async"
                  className="block w-full rounded-xl bg-neutral-500/20 object-cover"
                />
              ))}
            </div>
          )}

          {total > 1 && (
            <nav aria-label="More work" className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
              {[
                { i: (index - 1 + total) % total, item: prevProject, label: 'Previous', dir: 'left' },
                { i: (index + 1) % total, item: nextProject, label: 'Next', dir: 'right' },
              ].map(({ i, item, label, dir }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onShow(i)}
                  className={`flex min-h-11 cursor-pointer flex-col gap-1 rounded-xl border-0 bg-white/[0.04] p-4 text-neutral-50 transition-colors hover:bg-white/[0.08] active:bg-white/[0.1] ${dir === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
                >
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    {dir === 'left' && <Arrow dir="left" />}
                    {label}
                    {dir === 'right' && <Arrow dir="right" />}
                  </span>
                  <span className="line-clamp-1 text-sm font-medium">{item.title}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </article>
    </div>
  )
}
