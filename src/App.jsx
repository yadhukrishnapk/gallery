import { useEffect, useLayoutEffect, useRef } from 'react'
import { Navigate, useLocation, useMatch, useNavigate } from 'react-router'
import { OrbitReel } from './components/OrbitReel'
import { projects } from './data/gallery'
import { HERO_TRANSITION, runViewTransition, setTransitionName } from './lib/viewTransition'
import ProjectDetail from './pages/ProjectDetail'

const SITE_TITLE = 'Orbit Reel'

export default function App() {
  const reel = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const match = useMatch('/work/:slug')
  const index = match ? projects.findIndex((p) => p.slug === match.params.slug) : -1
  const project = projects[index]

  // Resolves once a navigation has been committed to the DOM, so view transitions snapshot the new page.
  const routeCommitted = useRef(null)
  useLayoutEffect(() => {
    routeCommitted.current?.()
    routeCommitted.current = null
  }, [location.key])
  const navigateAndWait = (go) =>
    new Promise((resolve) => {
      routeCommitted.current = resolve
      go()
      setTimeout(resolve, 600)
    })

  useEffect(() => {
    document.title = project ? `${project.title} — ${SITE_TITLE}` : SITE_TITLE
  }, [project])

  const openProject = (item) => {
    const card = reel.current?.getActiveCard()
    setTransitionName(card, HERO_TRANSITION)
    runViewTransition(async () => {
      setTransitionName(card, '')
      await navigateAndWait(() => navigate(`/work/${item.slug}`, { state: { fromReel: true } }))
    })
  }

  const closeProject = () => {
    // The card for this project waits at the top of the reel, so the hero can shrink back into it.
    const card = reel.current?.getView() === 'arc' ? reel.current.getActiveCard() : null
    runViewTransition(
      async () => {
        await navigateAndWait(() =>
          location.state?.fromReel ? navigate(-1) : navigate('/', { replace: true }),
        )
        setTransitionName(card, HERO_TRANSITION)
      },
      { onFinish: () => setTransitionName(card, '') },
    )
  }

  const showProject = (nextIndex) => {
    const next = projects[nextIndex]
    reel.current?.goTo(nextIndex)
    runViewTransition(() =>
      navigateAndWait(() => navigate(`/work/${next.slug}`, { replace: true, state: location.state })),
    )
  }

  // Opening a link to a project directly: bring its card to the top so "back" lands on it.
  useEffect(() => {
    if (index >= 0 && !location.state?.fromReel) reel.current?.goTo(index)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (match && !project) return <Navigate to="/" replace />

  return (
    <main className="h-dvh w-full">
      {/* While a project is open the reel stays mounted (keeping its place) but can't be reached. */}
      <div className="h-full" inert={!!project}>
        <OrbitReel
          ref={reel}
          items={projects}
          backgroundColor="#0A0A0A"
          paused={!!project}
          onSelect={openProject}
        />
      </div>
      {project && (
        <ProjectDetail
          project={project}
          index={index}
          total={projects.length}
          prevProject={projects[(index - 1 + projects.length) % projects.length]}
          nextProject={projects[(index + 1) % projects.length]}
          onBack={closeProject}
          onShow={showProject}
        />
      )}
    </main>
  )
}
