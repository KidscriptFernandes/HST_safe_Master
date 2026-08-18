import { useEffect, useState } from "react";
export default function Todo() {
  const url="http://localhost:3333/user"
    async function getUsers() {
      const response= await fetch(url)
      console.log(response)
    
  }
useEffect(()=>{
getUsers()
},[])
 

  const [dados, setDados] = useState([]); // lista de tarefas
  const [tarefa, setTarefa] = useState(""); // texto do input
  const [time, setTime] = useState(""); // hora do input

  // 1. Função pra criar tarefa
  const handleCriarTarefa = (e) => {
    e.preventDefault(); // não deixa recarregar a página

    if (tarefa.trim() === "" || time === "") return; // não deixa vazio

    const novaTarefa = {
      id: Date.now(), // id único
      tarefa: tarefa,
      hora: time,
    };

    setDados([novaTarefa, ...dados]); // adiciona no topo
    setTarefa(""); // limpa os inputs
    setTime("");
    alert("tarefa adicionada")
  };

  // 2. Função pra deletar
  const handleDeletar = (id) => {
    setDados(dados.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 p-4">
      <div className="flex flex-col gap-6 items-center justify-center">
        <h1 className="text-2xl text-white font-bold">Sua lista de tarefas</h1>

        <div className="w-full max-w-lg bg-white rounded-xl flex flex-col items-center p-6 gap-5">
          {/* FORM */}
          <form onSubmit={handleCriarTarefa} className="flex flex-col items-center justify-center gap-5 w-full">
            <label className="text-xl text-slate-950">Digite aqui a sua tarefa!</label>
            <input 
              type="text" 
              value={tarefa}
              onChange={(e) => setTarefa(e.target.value)} // liga com o estado
              className="w-full py-2 px-4 border rounded-lg outline-none border-slate-950 focus:border-blue-500" 
              placeholder="cozinhar" 
            />

            <label className="text-xl text-slate-950">Horas</label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)} // liga com o estado
              className="py-2 px-4 border rounded-lg border-slate-950" 
            />

            <button 
              type="submit"
              className="bg-slate-950 w-full px-6 py-2 text-white text-xl rounded-xl cursor-pointer hover:bg-slate-800 transition"
            >
              Criar tarefa
            </button>
          </form>

          <h1 className="text-2xl text-slate-950 text-center font-bold">Tarefas actuais</h1>
          
          {/* LISTAGEM */}

          <div className="w-full flex flex-col gap-3">
            {dados.length === 0 ? (
              <p className="text-center text-gray-400">Nenhuma tarefa ainda</p>
            ) : (
              dados.map((item) => (
                <div 
                  key={item.id} 
                  className="w-full flex items-center justify-between bg-slate-100 p-3 rounded-lg border"
                >
                  <div>
                    <p className="text-lg text-slate-950 font-medium">{item.tarefa}</p>
                    <span className="text-sm text-slate-600">Hora: {item.hora}</span>
                  </div>
                  <button 
                    onClick={() => handleDeletar(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                  >
                    X
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
