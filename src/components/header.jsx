import { useState } from "react";

function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: "rgba(10,22,40,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.32)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* ── Logo ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Shield icon */}
          <div
            style={{
              width: "38px", height: "38px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="white"
                opacity="0.9"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="rgba(249,115,22,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              HST{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #f97316, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Safe Master
              </span>
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Segurança Industrial
            </div>
          </div>
        </div>

        {/* ── Nav links (desktop) ── */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="hidden md:flex"
        >
          {[""].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                textDecoration: "none",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#fff";
                e.target.style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "rgba(255,255,255,0.65)";
                e.target.style.background = "transparent";
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* ── Right side ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {/* User avatar */}
          <div
            style={{
              width: "36px", height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              border: "2px solid rgba(249,115,22,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "#fff",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
            title="Utilizador"
          >
            U
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div
          style={{
            padding: "12px 24px 20px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex", flexDirection: "column", gap: "4px",
          }}
        >
          {["Início", "Detecção", "Relatórios", "Configurações"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                background: "rgba(255,255,255,0.04)",
              }}
              onClick={() => setMobileOpen(false)}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

export default AppHeader;
