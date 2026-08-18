import './index.css'
import Epi from './components/epi_detection'
import RoboflowCamera from './components/RoboflowCamera'

function App() {
  return (
    <>
      <Epi />
      <div className="bg-slate-950 px-4 py-8">
        <RoboflowCamera />
      </div>
    </>
  )
}

export default App
