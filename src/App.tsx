import { useGradientState } from './hooks/useGradientState'
import { GradientCanvas } from './components/GradientCanvas'
import { Toolbar } from './components/Toolbar'
import { PointPanel } from './components/PointPanel'
import { DistancePanel } from './components/DistancePanel'
import './App.css'

function App() {
  const api = useGradientState()

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mesh Gradient Generator</h1>
        <p>Линейная интерполяция по радиусу точек</p>
      </header>

      <Toolbar api={api} />

      <main className="app-main">
        <div className="canvas-column">
          <GradientCanvas api={api} />
          <DistancePanel state={api.state} />
        </div>
        <PointPanel api={api} />
      </main>
    </div>
  )
}

export default App
