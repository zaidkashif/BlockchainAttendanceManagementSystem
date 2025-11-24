const API_BASE_URL = "http://localhost:4000";

async function handleResponse(res, method, path) {
  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {
      text = "";
    }
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  return handleResponse(res, "GET", path);
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res, "POST", path);
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res, "PUT", path);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
  });
  return handleResponse(res, "DELETE", path);
}
