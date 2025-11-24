// src/pages/DepartmentsPage.jsx

import React, { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formMode, setFormMode] = useState("create");
  const [formDeptId, setFormDeptId] = useState("");
  const [formDeptName, setFormDeptName] = useState("");

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("includeDeleted", includeDeleted ? "true" : "false");
      if (search.trim()) params.set("q", search.trim());

      const data = await apiGet(`/api/departments?${params.toString()}`);
      setDepartments(data);
    } catch (err) {
      setError(err.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeDeleted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDeptId || !formDeptName) {
      setError("Department ID and name are required");
      return;
    }

    try {
      setError("");
      if (formMode === "create") {
        await apiPost("/api/departments", {
          departmentId: formDeptId.trim(),
          departmentName: formDeptName.trim(),
        });
      } else {
        await apiPut(`/api/departments/${formDeptId}`, {
          departmentName: formDeptName.trim(),
        });
      }

      setFormDeptId("");
      setFormDeptName("");
      setFormMode("create");
      await loadDepartments();
    } catch (err) {
      setError(err.message || "Failed to save department");
    }
  };

  const handleEdit = (dept) => {
    setFormMode("edit");
    setFormDeptId(dept.departmentId);
    setFormDeptName(dept.departmentName || "");
  };

  const handleDelete = async (departmentId) => {
    const confirmed = window.confirm(
      `Soft delete department ${departmentId}? Blockchain history will stay.`
    );
    if (!confirmed) return;

    try {
      setError("");
      await apiDelete(`/api/departments/${departmentId}`);
      await loadDepartments();
    } catch (err) {
      setError(err.message || "Failed to delete department");
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await loadDepartments();
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
          <div style={{ fontSize: 16, fontWeight: 600 }}>Departments</div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            Manage department chains. Updates & deletes become new blocks.
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

      {/* Form card */}
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
              {formMode === "create" ? "Create Department" : "Edit Department"}
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>
              Genesis + update blocks on the department chain.
            </div>
          </div>
          {formMode === "edit" && (
            <button
              type="button"
              onClick={() => {
                setFormMode("create");
                setFormDeptId("");
                setFormDeptName("");
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
            placeholder="Department ID (e.g. CS)"
            value={formDeptId}
            onChange={(e) => setFormDeptId(e.target.value)}
            disabled={formMode === "edit"}
            style={{ minWidth: 140 }}
          />
          <input
            type="text"
            placeholder="Department Name"
            value={formDeptName}
            onChange={(e) => setFormDeptName(e.target.value)}
            style={{ minWidth: 220, flex: 1 }}
          />
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
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500 }}>All Departments</span>
          {loading && (
            <span className="text-muted" style={{ fontSize: 11 }}>
              Loading…
            </span>
          )}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ padding: "10px 4px" }}>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    No departments found.
                  </span>
                </td>
              </tr>
            )}
            {departments.map((dept) => {
              const badgeClass =
                dept.status === "deleted"
                  ? "badge badge-deleted"
                  : "badge badge-active";
              const lastUpdated = dept.lastUpdatedAt
                ? new Date(dept.lastUpdatedAt).toLocaleString()
                : "-";

              return (
                <tr key={dept.departmentId}>
                  <td>{dept.departmentId}</td>
                  <td>{dept.departmentName || "-"}</td>
                  <td>
                    <span className={badgeClass}>{dept.status}</span>
                  </td>
                  <td>{lastUpdated}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(dept)}
                    >
                      Edit
                    </button>
                    {dept.status !== "deleted" && (
                      <button
                        onClick={() => handleDelete(dept.departmentId)}
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

export default DepartmentsPage;
