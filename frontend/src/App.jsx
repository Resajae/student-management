import { useEffect, useMemo, useState } from "react";
import { getStudents, createStudent, updateStudent, deleteStudent } from "./api.js";

const EMPTY = { name: "", age: "", course: "" };

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setStudents(await getStudents());
      setError("");
    } catch {
      setError("Can't reach the server. Make sure the API is running on port 3001.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.course.toLowerCase().includes(q)
    );
  }, [students, search]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateStudent(editingId, form);
      } else {
        await createStudent(form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(student) {
    setEditingId(student.id);
    setForm({ name: student.name, age: String(student.age), course: student.course });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setError("");
  }

  async function handleDelete(student) {
    if (!window.confirm(`Delete ${student.name}? This can't be undone.`)) return;
    try {
      await deleteStudent(student.id);
      if (editingId === student.id) resetForm();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <header className="top">
        <h1>Student Management</h1>
        <p className="count">
          {students.length} {students.length === 1 ? "student" : "students"} enrolled
        </p>
      </header>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <div className="layout">
        <form className="panel" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit student" : "Add student"}</h2>

          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} placeholder="Juan Dela Cruz" required />
          </label>

          <label>
            Age
            <input name="age" type="number" min="1" max="120" value={form.age} onChange={handleChange} placeholder="20" required />
          </label>

          <label>
            Course
            <input name="course" value={form.course} onChange={handleChange} placeholder="BS Computer Science" required />
          </label>

          <div className="actions">
            <button type="submit" className="btn primary">
              {editingId ? "Save changes" : "Add student"}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="panel">
          <div className="list-head">
            <h2>Students</h2>
            <input
              className="search"
              type="search"
              placeholder="Search by name or course"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search students"
            />
          </div>

          {loading ? (
            <p className="empty">Loading students…</p>
          ) : filtered.length === 0 ? (
            <p className="empty">
              {students.length === 0
                ? "No students yet. Add the first one using the form."
                : "No students match your search."}
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Course</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className={s.id === editingId ? "editing" : ""}>
                      <td>{s.name}</td>
                      <td>{s.age}</td>
                      <td>{s.course}</td>
                      <td className="right">
                        <button className="btn small" onClick={() => startEdit(s)}>
                          Edit
                        </button>
                        <button className="btn small danger" onClick={() => handleDelete(s)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
