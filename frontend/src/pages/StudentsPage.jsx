// src/pages/StudentsPage.jsx

import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

function StudentsPage() {
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formMode, setFormMode] = useState("create");
  const [formStudentId, setFormStudentId] = useState("");
  const [formStudentName, setFormStudentName] = useState("");
  const [formRollNo, setFormRollNo] = useState("");
  const [formClassId, setFormClassId] = useState("");

  const loadDepartments = async () => {
    try {
      const data = await apiGet("/api/departments?includeDeleted=false");
      setDepartments(data);
      if (!selectedDept && data.length > 0) {
        setSelectedDept(data[0].departmentId);
      }
    } catch {}
  };

  const loadClasses = async () => {
    if (!selectedDept) {
      setClasses([]);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.set("departmentId", selectedDept);
      params.set("includeDeleted", "false");
      const data = await apiGet(`/api/classes?${params.toString()}`);
      setClasses(data);
      if (!selectedClass && data.length > 0) {
        setSelectedClass(data[0].classId);
        setFormClassId(data[0].classId);
      }
    } catch {}
  };

  const loadStudents = async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("classId", selectedClass);
      params.set("includeDeleted", includeDeleted ? "true" : "false");
      if (search.trim()) params.set("q", search.trim());

      const data = await apiGet(`/api/students?${params.toString()}`);
      setStudents(data);
    } catch (err) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDept]);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, includeDeleted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formStudentId || !formStudentName || !formRollNo || !formClassId) {
      setError("Student ID, name, roll no and class are required");
      return;
    }

    try {
      setError("");
      if (formMode === "create") {
        await apiPost("/api/students", {
          studentId: formStudentId.trim(),
          studentName: formStudentName.trim(),
          rollNo: formRollNo.trim(),
          classId: formClassId.trim(),
        });
      } else {
        await apiPut(`/api/students/${formStudentId}`, {
          studentName: formStudentName.trim(),
          rollNo: formRollNo.trim(),
          classId: formClassId.trim(),
        });
      }

      setFormMode("create");
      setFormStudentId("");
      setFormStudentName("");
      setFormRollNo("");
      setFormClassId(selectedClass || "");
      await loadStudents();
    } catch (err) {
      setError(err.message || "Failed to save student");
    }
  };

  const handleEdit = (stu) => {
    setFormMode("edit");
    setFormStudentId(stu.studentId);
    setFormStudentName(stu.studentName || "");
    setFormRollNo(stu.rollNo || "");
    setFormClassId(stu.classId);
  };

  const handleDelete = async (studentId) => {
    const confirmed = window.confirm(
      `Soft delete student ${studentId}? Their blockchain ledger remains.`
    );
    if (!confirmed) return;

    try {
      setError("");
      await apiDelete(`/api/students/${studentId}`);
      await loadStudents();
    } catch (err) {
      setError(err.message || "Failed to delete student");
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await loadStudents();
  };

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
          <div style={{ fontSize: 16, fontWeight: 600 }}>Students</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            Each student has their own attendance blockchain.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
          <div>
            <span className="text-muted" style={{ marginRight: 4 }}>
              Department:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedClass("");
              }}
            >
              <option value="">Choose…</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.departmentId} — {d.departmentName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-muted" style={{ marginRight: 4 }}>
              Class:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setFormClassId(e.target.value);
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
        </div>
      </div>

      {/* Search + filter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", gap: 8, flex: 1 }}
        >
          <input
            type="text"
            placeholder="Search by ID, roll no or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <label style={{ fontSize: 12 }} className="text-muted">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          Include deleted
        </label>
      </div>

      {/* Form */}
      <div
        style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          padding: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {formMode === "create" ? "Create Student" : "Edit Student"}
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>
              Student genesis links to their class chain.
            </div>
          </div>
          {formMode === "edit" && (
            <button
              type="button"
              onClick={() => {
                setFormMode("create");
                setFormStudentId("");
                setFormStudentName("");
                setFormRollNo("");
                setFormClassId(selectedClass || "");
              }}
            >
              Reset
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}
        >
          <input
            type="text"
            placeholder="Student ID"
            value={formStudentId}
            onChange={(e) => setFormStudentId(e.target.value)}
            disabled={formMode === "edit"}
            style={{ minWidth: 140 }}
          />
          <input
            type="text"
            placeholder="Student Name"
            value={formStudentName}
            onChange={(e) => setFormStudentName(e.target.value)}
            style={{ minWidth: 200 }}
          />
          <input
            type="text"
            placeholder="Roll No (e.g. F23-3700)"
            value={formRollNo}
            onChange={(e) => setFormRollNo(e.target.value)}
            style={{ minWidth: 140 }}
          />
          <select
            value={formClassId}
            onChange={(e) => setFormClassId(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">Class…</option>
            {classes.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.classId} — {c.className}
              </option>
            ))}
          </select>
          <button type="submit">
            {formMode === "create" ? "Create" : "Update"}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 8, color: "var(--danger)", fontSize: 12 }}>
            {error}
          </div>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          padding: 12,
        }}
      >
        <div
          style={{
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500 }}>Students</span>
          {loading && (
            <span className="text-muted" style={{ fontSize: 11 }}>
              Loading…
            </span>
          )}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Roll No</th>
              <th>Class</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && !loading && (
              <tr>
                <td colSpan="7" style={{ padding: "10px 4px" }}>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    No students found.
                  </span>
                </td>
              </tr>
            )}
            {students.map((stu) => {
              const badgeClass =
                stu.status === "deleted"
                  ? "badge badge-deleted"
                  : stu.status === "Present"
                  ? "badge badge-active"
                  : "badge";
              const lastUpdated = stu.lastUpdatedAt
                ? new Date(stu.lastUpdatedAt).toLocaleString()
                : "-";

              return (
                <tr key={stu.studentId}>
                  <td>{stu.studentId}</td>
                  <td>{stu.studentName || "-"}</td>
                  <td>{stu.rollNo || "-"}</td>
                  <td>{stu.classId}</td>
                  <td>
                    <span className={badgeClass}>{stu.status}</span>
                  </td>
                  <td>{lastUpdated}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(stu)}
                    >
                      Edit
                    </button>
                    {stu.status !== "deleted" && (
                      <button
                        onClick={() => handleDelete(stu.studentId)}
                        style={{
                          background: "rgba(248,113,113,0.08)",
                          color: "var(--danger)",
                          borderColor: "rgba(248,113,113,0.45)",
                        }}
                      >
                        Delete
                      </button>
                    )}
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

export default StudentsPage;
