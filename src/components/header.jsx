function header() {
    return(   
      
<div className=" ">
      <header className="bg-green-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          <h1 className="text-2xl font-bold">
            Found Pharmacy
          </h1>

          <nav className="hidden md:flex space-x-6 ">
            <a href="#" className="hover:text-green-200 transition">Início</a>
            <a href="#" className="hover:text-green-200 transition">Sobre</a>
            <a href="#" className="hover:text-green-200 transition">Serviços</a>
            <a href="#" className="hover:text-green-200 transition">Contato</a>
          </nav>

          <button className="hidden md:block bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-100 transition">
            Entrar
          </button>

          <button className="md:hidden text-white">
            ☰
          </button>

        </div>
      </header>
      </div>
        );

}
export default header