import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import electron from 'electron'
import { createRequire } from "module";
import os from "os";
const homeDir = os.homedir();
// Carpeta de datos de la app en base al sistema operativo
let dbDir;
switch (process.platform) {
  case "win32":
    dbDir = path.join(process.env.APPDATA || path.join(homeDir, "AppData", "Roaming"), "creditmate");
    break;
  case "darwin": // macOS
    dbDir = path.join(homeDir, "Library", "Application Support", "creditmate");
    break;
  default: // linux y demás
    dbDir = path.join(homeDir, ".config", "creditmate");
    break;
}


// const dbDir = app.getPath('userData')
const dbPath = path.join(dbDir, 'creditmate.db')
const db = new Database(dbPath);
const migrationsDir = path.join(process.cwd(), "migrations");

db.prepare(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

function runMigrations() {
  const files = fs.readdirSync(migrationsDir).sort();
  const executed = new Set(
    db.prepare("SELECT name FROM migrations").all().map(r => r.name)
  );

  for (const file of files) {
    if (!executed.has(file)) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      db.exec(sql);
      db.prepare("INSERT INTO migrations (name) VALUES (?)").run(file);
      console.log(`✅ Ejecutada: ${file}`);
    } else {
      console.log(`⏩ Ya ejecutada: ${file}`);
    }
  }
}

runMigrations();
