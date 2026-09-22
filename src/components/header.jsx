function AppHeader() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
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
              background: "#f97316",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
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
                fontSize: "15px",
                fontWeight: "800",
                letterSpacing: "-0.02em",
                color: "#172033",
                lineHeight: 1.1,
              }}
            >
              HST{" "}
              <span
                style={{
                  color: "#f97316",
                }}
              >
                Safe Master
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "12px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
          Sistema pronto
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
