export default function Botao({text,cor,altura,largura}) {
return(
    <button className={`${cor} text-white ${altura} ${largura} rounded-tr-3xl font-semibold`}>{text}</button>
)
}