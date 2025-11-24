import React from "react";

const NAV_ITEMS = [
  { id: "departments", label: "Departments" },
  { id: "classes", label: "Classes" },
  { id: "students", label: "Students" },
  { id: "attendance", label: "Attendance" },
  { id: "explorer", label: "Explorer" },
];

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside
      style={{
        padding: "18px 14px",
        borderRight: "1px solid var(--border-subtle)",
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.95), #020617 80%, #000)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "12px",
            background:
              "conic-gradient(from 180deg, #38bdf8, #22c55e, #a855f7, #38bdf8)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 30px rgba(56,189,248,0.45)",
          }}
        >
          <span style={{ fontSize: 14, color: "#020617", fontWeight: 700 }}>
            BA
          </span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>BAMS</div>
          <div className="text-muted" style={{ fontSize: 11 }}>
            Blockchain Attendance
          </div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                justifyContent: "flex-start",
                padding: "8px 10px",
                borderRadius: 999,
                border: "none",
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent-strong)" : "var(--text-muted)",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: active
                    ? "var(--accent-strong)"
                    : "rgba(148,163,184,0.5)",
                }}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          fontSize: 11,
          color: "var(--text-muted)",
          opacity: 0.75,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: 0.06 }}>
          POWERED BY BLOCKCHAIN
        </div>
        <div>All updates are stored immutably.</div>
      </div>
    </aside>
  );
}

export default Sidebar;
