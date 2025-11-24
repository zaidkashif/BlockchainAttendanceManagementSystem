import React from "react";

function Topbar() {
  const now = new Date();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          Blockchain Attendance Management
        </div>
        <div className="text-muted" style={{ fontSize: 12 }}>
          Departments, classes, students & attendance secured with PoW.
        </div>
      </div>

      <div
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          background: "#020617",
          border: "1px solid var(--border-subtle)",
          fontSize: 11,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <span style={{ fontWeight: 500 }}>
          {now.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="text-muted">
          {now.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </header>
  );
}

export default Topbar;
