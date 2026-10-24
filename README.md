# Student Management System

- `frontend/` : React (Vite) app, runs on http://localhost:5173
- `backend/`  : Express API, runs on http://localhost:3001
- Database    : MySQL from XAMPP (`database.sql` included)

## Requirements
- XAMPP (MySQL module running)
- Node.js 18 or newer

## Setup
1. Open the XAMPP Control Panel and click **Start** next to **MySQL**.
2. In a terminal inside this folder:
```bash
npm install                # installs concurrently at the root
npm run install:all        # installs backend and frontend dependencies
npm run dev                # starts backend (3001) and frontend (5173)
```
3. Open http://localhost:5173

You can also run them separately: `npm run backend` and `npm run frontend`.

The database `student_management` and the `students` table are created automatically on first run. View the data in phpMyAdmin at http://localhost/phpmyadmin, or import `database.sql` yourself.

## Different MySQL settings
XAMPP defaults are used (host 127.0.0.1, port 3306, user `root`, empty password). To change them, set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, or `DB_NAME` before starting the backend.

## API
| Method | Endpoint            | Purpose        |
|--------|---------------------|----------------|
| GET    | /api/students       | List students  |
| POST   | /api/students       | Add student    |
| PUT    | /api/students/:id   | Update student |
| DELETE | /api/students/:id   | Delete student |
