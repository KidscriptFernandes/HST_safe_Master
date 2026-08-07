export default function Botao({text,cor,altura,largura}) {
return(
    <button className={`${cor} text-white ${altura} ${largura} rounded-full font-semibold`}>{text}</button>
)
}