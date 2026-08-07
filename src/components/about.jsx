function about(){
   return(
   <div className="w-full mt-10">
    <h2 className="text-4xl font-bold text-center">Sobre <span className="text-green-600">Nós</span></h2>
    <div className=" flex justify-center items-center gap-10 mt-10 ">
      <div className="w-80 h-80 border border-green-600 rounded-xl  shadow-green-600 shadow cursor-pointer transition duration-300 ease-in-out hover:shadow-inner"></div>
      <div className="w-80 h-80 border border-green-600 rounded-xl  shadow-green-600 shadow cursor-pointer transition duration-300 ease-in-out hover:shadow-inner"></div>
      <div className="w-80 h-80 border border-green-600 rounded-xl  shadow-green-600 shadow cursor-pointer transition duration-300 ease-in-out hover:shadow-inner"></div>
      <div className="w-80 h-80 border border-green-600 rounded-xl  shadow-green-600 shadow cursor-pointer transition duration-300 ease-in-out hover:shadow-inner"></div>
   </div>
   <div className="w-full bg-slate-700 mt-12 flex justify-evenly items-center">
      <div id="conteudo" className="w-5/12 h-5/6">
      <h2 className="text-white text-4xl p-4">Comprimisso</h2>
         <p className="w-8/12">
         Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, quos? Inventore modi, aut eligendi corrupti quod illo 
         explicabo doloribus <span className="text-green-500">quia voluptatem</span>, nesciunt totam fugit porro fugiat ea 
         impedit recusandae molestias?
         <br />
         Lorem ipsum dolor sit amet consectetur, adipisicing elit. Distinctio minima nesciunt aliquid odit reiciendis quibusdam, sed rem 
         dolorum nihil, soluta
          amet molestias, <span className="text-green-500">quia voluptatem</span>? 
          Repellat enim earum culpa obcaecati veritatis!
          dolorum nihil, soluta
          amet molestias, praesentium cumque? 
          Repellat enim earum culpa  <span className="text-green-500">quia voluptatem</span>
         </p>
      </div>
      <div id="imagem" className="w-5/12 h-5/6"></div>
   </div>
   </div> 
   )
}
export default about;