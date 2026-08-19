const reminders = [
  {
    icon: "📏",
    text: "Posicione-se a",
    highlight: "2 metros",
    suffix: "de distância da câmera",
  },
  {
    icon: "💡",
    text: "Garanta que o ambiente está",
    highlight: "bem iluminado",
    suffix: "",
  },
  {
    icon: "🦺",
    text: "Utilize os",
    highlight: "EPIs corretamente",
    suffix: "antes de iniciar",
  },
  {
    icon: "🧍",
    text: "Mantenha-se",
    highlight: "imóvel",
    suffix: "até ao fim da análise",
  },
];

export default function Epi() {
  return (
    <section
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 16px 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow orbs */}
      <div
        style={{
          position: "absolute",
          top: "20%", left: "10%",
          width: "500px", height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%", right: "5%",
          width: "400px", height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          position: "relative",
        }}
        className="hst-fade-up"
      >
        {/* Eyebrow label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "999px",
            background: "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.25)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#fb923c",
          }}
        >
          <span
            style={{
              width: "6px", height: "6px",
              borderRadius: "50%",
              background: "#f97316",
              animation: "hst-dot-blink 1.2s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          Antes de iniciar
        </div>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 800,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            A sua proteção,{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #f97316, #fbbf24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              a sua vida
            </span>
          </h1>
          <p
            style={{
              marginTop: "12px",
              fontSize: "15px",
              color: "rgba(226,232,240,0.55)",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Certifique-se de que cumpre todos os requisitos antes de iniciar a deteção de EPIs.
          </p>
        </div>

        {/* Checklist card */}
        <div
          className="glass-card"
          style={{
            width: "100%",
            padding: "32px",
            boxShadow: "0 0 60px rgba(249,115,22,0.08), 0 16px 48px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {reminders.map((r, i) => (
              <div
                key={i}
                className={`hst-fade-up hst-delay-${Math.min(i + 1, 3)}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(249,115,22,0.06)";
                  e.currentTarget.style.borderColor = "rgba(249,115,22,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                {/* Emoji icon */}
                <div
                  style={{
                    width: "40px", height: "40px",
                    borderRadius: "10px",
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px",
                    flexShrink: 0,
                  }}
                >
                  {r.icon}
                </div>
                {/* Text */}
                <div style={{ paddingTop: "2px" }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "rgba(226,232,240,0.7)", lineHeight: 1.5 }}>
                    {r.text}{" "}
                    <strong
                      style={{ color: "#fff", fontWeight: 600 }}
                    >
                      {r.highlight}
                    </strong>
                    {r.suffix && ` ${r.suffix}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            opacity: 0.4,
          }}
        >
          <span style={{ fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Continue para a análise
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}