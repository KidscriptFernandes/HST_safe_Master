import './index.css'
import Epi from './components/epi_detection'
import RoboflowCamera from './components/RoboflowCamera'
import AppHeader from './components/header'

function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a1628 0%, #0f2040 50%, #0a1628 100%)' }}>
      <AppHeader />
      <main style={{ paddingTop: '72px' }}>
        <Epi />
        <section style={{ padding: '32px 16px 64px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <RoboflowCamera />
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
