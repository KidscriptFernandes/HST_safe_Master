import Botao from "../ui/button"
function Hero(){

 return(
    <div className="w-full h-screen bg-white flex justify-center">
        <div className="w-6/12 h-5/6 bg-white flex flex-col items-center justify-center gap-14">
                
               <div> 
                    <h1 className=" font-segoe text-5xl">Monitore sua <span className="text-green-600">saúde</span> <br />
                     localize seus serviços <br />
                     de Forma rápida e <span className="text-green-600">eficiente</span></h1>
                </div> 
                <div className="flex items-center justify-center gap-6">
                   <Botao text="Localizar um serviço"
                   cor="bg-green-600"
                   altura="py-4"
                   largura="px-14"/>
                     <Botao text="cuide da saúde"
                   cor="bg-green-600"
                   altura="py-4"
                   largura="px-14"/>
                </div>
              


        </div>
        <div className="w-6/12 h-5/6 bg-red-500"></div>
     
    </div>

 )   
}
export default Hero