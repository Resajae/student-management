const BASE = "/api/students";

async function request(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Something went wrong.");
  return body;
}

export const getStudents = () => request(BASE);
export const createStudent = (s) => request(BASE, { method: "POST", body: JSON.stringify(s) });
export const updateStudent = (id, s) => request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(s) });
export const deleteStudent = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
