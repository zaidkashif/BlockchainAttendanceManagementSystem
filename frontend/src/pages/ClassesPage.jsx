// src/pages/ClassesPage.jsx

import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

function ClassesPage() {
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formMode, setFormMode] = useState("create");
  const [formClassId, setFormClassId] = useState("");
  const [formClassName, setFormClassName] = useState("");
  const [formDeptId, setFormDeptId] = useState("");

  const loadDepartments = async () => {
    try {
      const data = await apiGet("/api/departments?includeDeleted=false");
      setDepartments(data);
      if (!selectedDept && data.length > 0) {
        setSelectedDept(data[0].departmentId);
        setFormDeptId(data[0].departmentId);
      }
    } catch (err) {
      // ignore for now
    }
  };

  const loadClasses = async () => {
    if (!selectedDept) {
      setClasses([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("departmentId", selectedDept);
      params.set("includeDeleted", includeDeleted ? "true" : "false");
      if (search.trim()) params.set("q", search.trim());

      const data = await apiGet(`/api/classes?${params.toString()}`);
      setClasses(data);
    } catch (err) {
      setError(err.message || "Failed to load classes");
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
  }, [selectedDept, includeDeleted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formClassId || !formClassName || !formDeptId) {
      setError("Class ID, name and department are required");
      return;
    }

    try {
      setError("");
      if (formMode === "create") {
        await apiPost("/api/classes", {
          classId: formClassId.trim(),
          className: formClassName.trim(),
          departmentId: formDeptId.trim(),
        });
      } else {
        await apiPut(`/api/classes/${formClassId}`, {
          className: formClassName.trim(),
        });
      }

      setFormMode("create");
      setFormClassId("");
      setFormClassName("");
      setFormDeptId(selectedDept || "");
      await loadClasses();
    } catch (err) {
      setError(err.message || "Failed to save class");
    }
  };

  const handleEdit = (cls) => {
    setFormMode("edit");
    setFormClassId(cls.classId);
    setFormClassName(cls.className || "");
    setFormDeptId(cls.departmentId);
  };

  const handleDelete = async (classId) => {
    const confirmed = window.confirm(
      `Soft delete class ${classId}? All blocks remain in chain.`
    );
    if (!confirmed) return;

    try {
      setError("");
      await apiDelete(`/api/classes/${classId}`);
      await loadClasses();
    } catch (err) {
      setError(err.message || "Failed to delete class");
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await loadClasses();
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
          <div style={{ fontSize: 16, fontWeight: 600 }}>Classes</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            Classes are chained under their parent department.
          </div>
        </div>
        <div style={{ fontSize: 12 }}>
          <span className="text-muted" style={{ marginRight: 4 }}>
            Department:
          </span>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setFormDeptId(e.target.value);
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
            placeholder="Search by ID or name..."
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
              {formMode === "create" ? "Create Class" : "Edit Class"}
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>
              Genesis prev_hash comes from the parent department chain.
            </div>
          </div>
          {formMode === "edit" && (
            <button
              type="button"
              onClick={() => {
                setFormMode("create");
                setFormClassId("");
                setFormClassName("");
                setFormDeptId(selectedDept || "");
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
            placeholder="Class ID (e.g. CS-7A)"
            value={formClassId}
            onChange={(e) => setFormClassId(e.target.value)}
            disabled={formMode === "edit"}
            style={{ minWidth: 160 }}
          />
          <input
            type="text"
            placeholder="Class Name (e.g. BSCS-7A)"
            value={formClassName}
            onChange={(e) => setFormClassName(e.target.value)}
            style={{ minWidth: 220, flex: 1 }}
          />
          <select
            value={formDeptId}
            onChange={(e) => setFormDeptId(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">Department…</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentId} — {d.departmentName}
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
          <span style={{ fontSize: 13, fontWeight: 500 }}>Classes</span>
          {loading && (
            <span className="text-muted" style={{ fontSize: 11 }}>
              Loading…
            </span>
          )}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Class ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ padding: "10px 4px" }}>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    No classes found.
                  </span>
                </td>
              </tr>
            )}
            {classes.map((cls) => {
              const badgeClass =
                cls.status === "deleted"
                  ? "badge badge-deleted"
                  : "badge badge-active";
              const lastUpdated = cls.lastUpdatedAt
                ? new Date(cls.lastUpdatedAt).toLocaleString()
                : "-";

              return (
                <tr key={cls.classId}>
                  <td>{cls.classId}</td>
                  <td>{cls.className || "-"}</td>
                  <td>{cls.departmentId}</td>
                  <td>
                    <span className={badgeClass}>{cls.status}</span>
                  </td>
                  <td>{lastUpdated}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(cls)}
                    >
                      Edit
                    </button>
                    {cls.status !== "deleted" && (
                      <button
                        onClick={() => handleDelete(cls.classId)}
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

export default ClassesPage;
