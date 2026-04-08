function header() {
    return(   
      
<div className=" ">
      <header className="bg-wihte text-black ">
        <div className="max-w-full  mx-auto px-4 py-4 flex items-center justify-between shadow-2xl ">

          <h1 className="text-2xl font-bold">
            Found <span className="text-green-600"> Pharmacy</span>
          </h1>

          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-green-200 text-xl transition hover:text-xl">Início</a>
            <a href="#" className="hover:text-green-200  text-xl transition hover:text-xl">Sobre</a>
            <a href="#" className="hover:text-green-200  text-xl transition hover:text-xl">Serviços</a>
            <a href="#" className="hover:text-green-200 text-xl transition hover:text-xl">Contato</a>
          </nav>

          <button className="hidden md:block bg-green-600 text-white px-10 py-2 rounded-lg font-semibold hover:bg-green-100 transition">
            Entrar
          </button>

          <button className="md:hidden text-white">
            ☰
          </button>

        </div>
      </header>
      <hr className="shadow-xl" />
      </div>
        );

}
export default header