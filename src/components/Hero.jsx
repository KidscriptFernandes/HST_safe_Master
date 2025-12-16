function Hero(){
 return(
    <div className="w-full h-96 bg-azul flex gap-64 items-center justify-center">
        <div>
        <h1 className="text-4xl">Venha Cuidar da sua Saude 
        <br /> Monitorize todos os dias Com Fp </h1>
        <div className="flex items-center justify-around mt-12">
            <button className="w-56  text-md h-12 bg-white  text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-100 transition">Começar agora</button>
            <button className="w-56  text-md h-12 bg-gray-400 rounded-xl">Saber mais</button>
        </div>
    </div>
    <div className="bg-black w-96 h-96 rounded-full">

    </div>
    </div>

 )   
}
export default Hero