import Botao from "../ui/button"
import img_hero from "../assets/img/Female chef clothing apparel person _ Premium AI-generated image.png";
function Hero(){

 return(
    <div className="w-full h-screen bg-white flex flex-col justify-center xl:flex-row">
        <div className="xl:w-6/12 h-5/6 bg-white flex flex-col items-center justify-center gap-14">
                
               <div> 
                    <h1 className=" font-segoe text-5xl">Monitore sua <span className="text-green-600">saúde,</span> <br />
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
        <div className="w-6/12 h-5/6 bg-red-500">
        <img src={img_hero} alt="" srcset="" />
        </div>
     <hr className="shadow-xl" />
    </div>

 )   
}
export default Hero