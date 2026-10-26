import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import App from './App'

// Your private visitors list. Its code (and Firebase sign-in) only loads when /visitors is opened.
const Visitors = lazy(() => import('./pages/Visitors'))

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/visitors"
        element={
          <Suspense>
            <Visitors />
          </Suspense>
        }
      />
      <Route path="*" element={<App />} />
    </Routes>
  )
}
