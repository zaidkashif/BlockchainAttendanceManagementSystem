// src/layout/AppLayout.jsx

import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout({ activePage, onNavigate, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        minHeight: "100vh",
        background: "transparent",
      }}
    >
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "16px 20px",
          gap: "12px",
        }}
      >
        <Topbar />
        <main
          style={{
            flex: 1,
            background:
              "radial-gradient(circle at top left, rgba(56,189,248,0.08), transparent 55%), radial-gradient(circle at top right, rgba(59,130,246,0.08), transparent 55%)",
            borderRadius: "24px",
            padding: "16px 20px 20px",
            border: "1px solid rgba(15,23,42,0.9)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
