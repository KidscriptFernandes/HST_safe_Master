export default function Epi() {
  return (
    <div className="app-checks" aria-label="Orientações rápidas">
      {[
        "Fique de frente para a câmera",
        "Mantenha o ambiente iluminado",
        "Permaneça imóvel durante a análise",
      ].map((reminder) => (
        <span key={reminder} className="app-check">
          <span className="app-check-dot" />
          {reminder}
        </span>
      ))}
    </div>
  );
}