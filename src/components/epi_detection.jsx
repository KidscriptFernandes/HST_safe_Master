
export default function epi(){

    return(
        <div className="w-full h-[100vh] bg-slate-900">
            <div className="w-full h-full flex justify-center items-center  gap-10 flex-col">
            <div><h1 className="text-center text-2xl text-white">Sua proteção sua vida</h1></div>
             <div className="w-[100vw] h-[100vh] md:w-5/12 md:h-5/6 bg-white shadow shadow-orange-500 rounded-xl flex justify-center gap-16 items-center flex-col">
                <div>
                    <h1 className="text-orange-500 font-bold text-center text-xl">Lembretes</h1>
                    <div>
                        <ul className="m-6 xl:m-0 list-disc flex flex-col gap-3">
                        <li>Fique a o pelo  <span className="text-slate-900 font-bold">à 2 mteros</span> de distância em relação a câmera</li>
                        <li>Verifique se o ambiente está <span className="text-slate-900 font-bold">bem iluminado</span></li>
                        <li>Use os <span className="text-slate-900 font-bold">EPIs</span> de forma correcta</li>
                        <li>Mantenha-se <span className="text-slate-900 font-bold">imóvel</span> ate o termino da análise</li>
                        </ul>
                        
                    </div>
                    </div>
                <button className="bg-slate-800 p-6 text-white rounded-lg shadow-xl shadow-slate-900">Clique aqui pra iniciar a live</button>
             </div>
             </div>

        </div>
    )
}