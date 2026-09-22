import './index.css'
import RoboflowCamera from './components/RoboflowCamera'
import AppHeader from './components/header'

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f8' }}>
      <AppHeader />
      <main style={{ padding: '92px 20px 40px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div className="app-heading">
            <div>
              <p className="app-kicker">Monitoramento</p>
              <h1 className="app-title">Verificação de EPIs</h1>
            </div>
            <p className="app-hint">Posicione-se em frente à câmera para iniciar.</p>
          </div>
          <RoboflowCamera />
        </div>
      </main>
    </div>
  )
}

export default App
