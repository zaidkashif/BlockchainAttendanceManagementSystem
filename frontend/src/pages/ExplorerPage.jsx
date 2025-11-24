// src/pages/ExplorerPage.jsx

import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

function ExplorerPage() {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [studentLedger, setStudentLedger] = useState([]);
  const [ledgerError, setLedgerError] = useState("");

  const loadValidation = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/validate-all");
      setValidation(data);
    } catch {
      setValidation(null);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentLedger = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    try {
      setLedgerError("");
      const data = await apiGet(`/api/students/${studentId}/ledger`);
      setStudentLedger(data);
    } catch (err) {
      setStudentLedger([]);
      setLedgerError(err.message || "Failed to fetch ledger");
    }
  };

  useEffect(() => {
    loadValidation();
  }, []);

  const countTrue = (arr) => arr.filter((x) => x.isValid).length;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Blockchain Explorer</div>
        <div className="text-muted" style={{ fontSize: 12 }}>
          View validation status for all chains and inspect a specific student
          ledger.
        </div>
      </div>

      {/* Validation cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            padding: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            Departments
          </div>
          {loading && !validation && (
            <div className="text-muted" style={{ fontSize: 11 }}>
              Checking…
            </div>
          )}
          {validation && (
            <>
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {countTrue(validation.departments)}/
                {validation.departments.length}
              </div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                valid chains
              </div>
            </>
          )}
        </div>

        <div
          style={{
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            padding: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            Classes
          </div>
          {validation && (
            <>
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {countTrue(validation.classes)}/{validation.classes.length}
              </div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                valid chains
              </div>
            </>
          )}
        </div>

        <div
          style={{
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            padding: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            Students
          </div>
          {validation && (
            <>
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {countTrue(validation.students)}/{validation.students.length}
              </div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                valid chains
              </div>
            </>
          )}
        </div>
      </div>

      {/* Student ledger quick view */}
      <div
        style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          padding: 14,
        }}
      >
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              Inspect Student Ledger
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>
              Enter a studentId (e.g. STU-001) to inspect all their blocks.
            </div>
          </div>
          <form
            onSubmit={loadStudentLedger}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{ minWidth: 140 }}
            />
            <button type="submit">Load</button>
          </form>
        </div>

        {ledgerError && (
          <div style={{ color: "var(--danger)", fontSize: 12 }}>
            {ledgerError}
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Hash (prefix)</th>
            </tr>
          </thead>
          <tbody>
            {(!studentLedger || studentLedger.length === 0) && (
              <tr>
                <td colSpan="5" style={{ padding: "10px 4px" }}>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    No ledger loaded yet.
                  </span>
                </td>
              </tr>
            )}
            {studentLedger.map((block) => {
              const tx = block.transactions || {};
              const ts =
                tx.timestamp || block.timestamp
                  ? new Date(tx.timestamp || block.timestamp).toLocaleString()
                  : "-";
              const label =
                tx.type === "ATTENDANCE" ? tx.status : tx.type || "-";

              return (
                <tr key={block.hash}>
                  <td>{block.index}</td>
                  <td>{tx.type || "-"}</td>
                  <td>{label}</td>
                  <td>{ts}</td>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 10,
                        color: "var(--text-muted)",
                      }}
                    >
                      {block.hash?.slice(0, 14)}…
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExplorerPage;
