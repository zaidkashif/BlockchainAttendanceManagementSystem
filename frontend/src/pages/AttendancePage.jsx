// src/pages/AttendancePage.jsx

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

const STATUS_OPTIONS = ["Present", "Absent", "Leave"];

function AttendancePage() {
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [status, setStatus] = useState("Present");
  const [message, setMessage] = useState("");
  const [ledger, setLedger] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState("");

  const loadClasses = async () => {
    try {
      const params = new URLSearchParams();
      params.set("includeDeleted", "false");
      const data = await apiGet(`/api/classes?${params.toString()}`);
      setClasses(data);
      if (!classId && data.length > 0) {
        setClassId(data[0].classId);
      }
    } catch {}
  };

  const loadStudents = async () => {
    if (!classId) {
      setStudents([]);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.set("classId", classId);
      params.set("includeDeleted", "false");
      const data = await apiGet(`/api/students?${params.toString()}`);
      setStudents(data);
      if (!selectedStudent && data.length > 0) {
        setSelectedStudent(data[0].studentId);
      }
    } catch {}
  };

  const loadLedger = async (studentId) => {
    if (!studentId) {
      setLedger([]);
      return;
    }
    try {
      setLoadingLedger(true);
      const data = await apiGet(`/api/students/${studentId}/ledger`);
      setLedger(data);
    } catch {
      setLedger([]);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  useEffect(() => {
    loadLedger(selectedStudent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudent]);

  const handleMark = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError("Select a student first");
      return;
    }

    try {
      setError("");
      setMessage("");
      const res = await apiPost("/api/attendance", {
        studentId: selectedStudent,
        status,
      });
      setMessage(
        `Attendance marked as "${status}". Block index ${res.latestBlock.index} mined.`
      );
      await loadLedger(selectedStudent);
    } catch (err) {
      setError(err.message || "Failed to mark attendance");
    }
  };

  const currentStudent = students.find((s) => s.studentId === selectedStudent);

  return (
    <div>
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Attendance</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            Each attendance entry becomes a mined block on the student chain.
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 12,
          fontSize: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="text-muted" style={{ marginRight: 4 }}>
            Class:
          </span>
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSelectedStudent("");
            }}
          >
            <option value="">Choose…</option>
            {classes.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.classId} — {c.className}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-muted" style={{ marginRight: 4 }}>
            Student:
          </span>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Choose…</option>
            {students.map((s) => (
              <option key={s.studentId} value={s.studentId}>
                {s.studentId} — {s.studentName} ({s.rollNo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mark attendance + summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 320px) 1fr",
          gap: 12,
          alignItems: "flex-start",
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
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
            Mark Attendance
          </div>
          <form
            onSubmit={handleMark}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                Status
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%" }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit">Mark Attendance</button>

            {error && (
              <div style={{ color: "var(--danger)", fontSize: 12 }}>
                {error}
              </div>
            )}
            {message && (
              <div
                style={{
                  color: "#4ade80",
                  fontSize: 12,
                  background: "rgba(22,163,74,0.1)",
                  borderRadius: 8,
                  padding: "6px 8px",
                  border: "1px solid rgba(22,163,74,0.5)",
                }}
              >
                {message}
              </div>
            )}
          </form>

          {currentStudent && (
            <div style={{ marginTop: 12, fontSize: 12 }}>
              <div className="text-muted" style={{ marginBottom: 4 }}>
                Current student
              </div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {currentStudent.studentName} ({currentStudent.rollNo})
              </div>
              <div className="text-muted">
                Status: <strong>{currentStudent.status}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Ledger */}
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
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Student Ledger</span>
            {loadingLedger && (
              <span className="text-muted" style={{ fontSize: 11 }}>
                Loading…
              </span>
            )}
          </div>
          <div
            className="text-muted"
            style={{ fontSize: 11, marginBottom: 10 }}
          >
            Each row is a block on the student's chain (including genesis).
          </div>

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
              {(!ledger || ledger.length === 0) && !loadingLedger && (
                <tr>
                  <td colSpan="5" style={{ padding: "10px 4px" }}>
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      No blocks for this student yet.
                    </span>
                  </td>
                </tr>
              )}
              {ledger.map((block) => {
                const tx = block.transactions || {};
                const ts =
                  tx.timestamp || block.timestamp
                    ? new Date(tx.timestamp || block.timestamp).toLocaleString()
                    : "-";
                const statusLabel =
                  tx.type === "ATTENDANCE" ? tx.status : tx.type;

                return (
                  <tr key={block.hash}>
                    <td>{block.index}</td>
                    <td>{tx.type || "-"}</td>
                    <td>{statusLabel || "-"}</td>
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
    </div>
  );
}

export default AttendancePage;
