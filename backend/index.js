import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const PORT = process.env.PORT || 3001;

// XAMPP MySQL defaults: user "root", empty password, port 3306
const DB = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "student_management",
};

// Create the database and table automatically if they don't exist yet
async function setupDatabase() {
  const conn = await mysql.createConnection({
    host: DB.host,
    port: DB.port,
    user: DB.user,
    password: DB.password,
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB.database}\``);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`${DB.database}\`.students (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      age        INT          NOT NULL,
      course     VARCHAR(100) NOT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await conn.end();
}

try {
  await setupDatabase();
} catch (err) {
  console.error("\nCould not connect to MySQL. Open the XAMPP Control Panel and start MySQL.\n");
  console.error(err.message);
  process.exit(1);
}

const pool = mysql.createPool({ ...DB, connectionLimit: 10 });

const app = express();
app.use(cors());
app.use(express.json());

// Validate and clean the incoming student data
function validate(body) {
  const name = String(body.name ?? "").trim();
  const course = String(body.course ?? "").trim();
  const age = Number(body.age);

  if (!name) return { error: "Name is required." };
  if (!course) return { error: "Course is required." };
  if (name.length > 100 || course.length > 100)
    return { error: "Name and course must be 100 characters or fewer." };
  if (!Number.isInteger(age) || age < 1 || age > 120)
    return { error: "Age must be a whole number between 1 and 120." };

  return { data: { name, age, course } };
}

// Wrap async handlers so errors return a clean 500 response
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: "Database error. Check that MySQL is running in XAMPP." });
  });

// READ all
app.get(
  "/api/students",
  wrap(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(rows);
  })
);

// CREATE
app.post(
  "/api/students",
  wrap(async (req, res) => {
    const { data, error } = validate(req.body);
    if (error) return res.status(400).json({ error });

    const [result] = await pool.execute(
      "INSERT INTO students (name, age, course) VALUES (?, ?, ?)",
      [data.name, data.age, data.course]
    );
    const [rows] = await pool.execute("SELECT * FROM students WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  })
);

// UPDATE
app.put(
  "/api/students/:id",
  wrap(async (req, res) => {
    const { data, error } = validate(req.body);
    if (error) return res.status(400).json({ error });

    const [result] = await pool.execute(
      "UPDATE students SET name = ?, age = ?, course = ? WHERE id = ?",
      [data.name, data.age, data.course, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Student not found." });

    const [rows] = await pool.execute("SELECT * FROM students WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  })
);

// DELETE
app.delete(
  "/api/students/:id",
  wrap(async (req, res) => {
    const [result] = await pool.execute("DELETE FROM students WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Student not found." });
    res.status(204).end();
  })
);

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
