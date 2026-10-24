-- Optional: import this in phpMyAdmin (http://localhost/phpmyadmin).
-- The server also creates these automatically on first run.
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

CREATE TABLE IF NOT EXISTS students (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  age        INT          NOT NULL,
  course     VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
