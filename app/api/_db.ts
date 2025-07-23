// @ts-ignore
import Database from 'better-sqlite3';

const db = new Database('fifi.sqlite');

// Przykład: tworzenie tabeli jeśli nie istnieje
// db.prepare(`CREATE TABLE IF NOT EXISTS contact (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   name TEXT,
//   email TEXT,
//   message TEXT,
//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
// )`).run();

export default db; 