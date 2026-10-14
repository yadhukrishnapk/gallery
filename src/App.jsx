import OrbitReel from './components/OrbitReel/OrbitReel'
import { gallery } from './data/gallery'

export default function App() {
  return (
    <main className="h-dvh w-full">
      <OrbitReel items={gallery} backgroundColor="#0A0A0A" />
    </main>
  )
}
