import './index.css'
import Hero from "./components/Hero"
import Header from "./components/header"
import About from "./components/about"


function App() {
  function chatbot(){
    alert("Me clicararm!");
  }
  return (
    <>
    <div>
     <div onClick={chatbot} className="w-24 h-24 cursor-pointer transition duration-300 ease-in-out hover:text-green-600 hover:bg-white rounded-full flex  justify-center items-center bg-green-600 fixed bottom-0 right-0 mr-10 mb-10 shadow-2xl shadow-green-600">
      <h1 className="text-4xl hover:text-green-600 p-10 text-white">FF</h1>
    </div>
    </div>
   
    <Header/>
    <Hero/>
    <About/>
   
    </>
  )
}

export default App
