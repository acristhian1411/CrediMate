import path from "node:path";
import { app } from "electron";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import pg from "pg";
import { readConfig } from "../config.js";
import * as sqliteSchema from "./schema.sqlite.js";
import * as postgresSchema from "./schema.postgres.js";

let cached = null;

const SQLITE_BOOTSTRAP_SQL = `
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc TEXT,
    name TEXT NOT NULL,
    lastname TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS credits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    fees_qty INTEGER NOT NULL,
    fee_amount REAL NOT NULL,
    interest_rate REAL NOT NULL,
    start_date TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    credit_id INTEGER NOT NULL,
    paid_at TEXT,
    receipt_number TEXT,
    status BOOLEAN DEFAULT false,
    amount REAL NOT NULL,
    amount_paid REAL DEFAULT 0,
    expirate_at TEXT NOT NULL,
    FOREIGN KEY(credit_id) REFERENCES credits(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    credit_id INTEGER NOT NULL,
    fee_id INTEGER NOT NULL,
    paid_at TEXT NOT NULL,
    receipt_number TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY(credit_id) REFERENCES credits(id),
    FOREIGN KEY(fee_id) REFERENCES fees(id)
  );
`;

const POSTGRES_BOOTSTRAP_SQL = `
  CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    doc TEXT,
    name TEXT NOT NULL,
    lastname TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS credits (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    amount DOUBLE PRECISION NOT NULL,
    fees_qty INTEGER NOT NULL,
    fee_amount DOUBLE PRECISION NOT NULL,
    interest_rate DOUBLE PRECISION NOT NULL,
    start_date TEXT NOT NULL,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    credit_id INTEGER NOT NULL REFERENCES credits(id),
    paid_at TEXT,
    receipt_number TEXT,
    status BOOLEAN DEFAULT false,
    amount DOUBLE PRECISION NOT NULL,
    amount_paid DOUBLE PRECISION DEFAULT 0,
    expirate_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    credit_id INTEGER NOT NULL REFERENCES credits(id),
    fee_id INTEGER NOT NULL REFERENCES fees(id),
    paid_at TEXT NOT NULL,
    receipt_number TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL
  );
`;

async function ensureDatabaseReady(engine, sqlite, pool) {
  if (engine === "sqlite") {
    sqlite.exec(SQLITE_BOOTSTRAP_SQL);
    return;
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        doc TEXT,
        name TEXT NOT NULL,
        lastname TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS credits (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        amount DOUBLE PRECISION NOT NULL,
        fees_qty INTEGER NOT NULL,
        fee_amount DOUBLE PRECISION NOT NULL,
        interest_rate DOUBLE PRECISION NOT NULL,
        start_date TEXT NOT NULL,
        status TEXT DEFAULT 'active'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS fees (
        id SERIAL PRIMARY KEY,
        credit_id INTEGER NOT NULL REFERENCES credits(id),
        paid_at TEXT,
        receipt_number TEXT,
        status BOOLEAN DEFAULT false,
        amount DOUBLE PRECISION NOT NULL,
        amount_paid DOUBLE PRECISION DEFAULT 0,
        expirate_at TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        credit_id INTEGER NOT NULL REFERENCES credits(id),
        fee_id INTEGER NOT NULL REFERENCES fees(id),
        paid_at TEXT NOT NULL,
        receipt_number TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL
      );
    `);
  } finally {
    client.release();
  }
}

/**
 * Crea (una sola vez) el cliente de base de datos según db-config.json.
 * sqlitePath solo se usa si el motor configurado es sqlite.
 *
 * Devuelve { db, schema, engine } — `db` es la instancia de Drizzle,
 * `schema` es el módulo de tablas correspondiente al dialecto activo.
 * El repository.js usa siempre este mismo `schema`, nunca importa
 * schema.sqlite.js / schema.postgres.js directamente.
 */
export async function getDbClient(sqlitePath) {
  if (cached) return cached;

  const config = readConfig();
  const resolvedSqlitePath =
    sqlitePath || path.join(app.getPath("userData"), "creditmate.db");

  if (!config || config.engine === "sqlite") {
    const sqlite = new Database(resolvedSqlitePath);
    sqlite.pragma("journal_mode = WAL");
    await ensureDatabaseReady("sqlite", sqlite);
    cached = {
      db: drizzleSqlite(sqlite, { schema: sqliteSchema }),
      schema: sqliteSchema,
      engine: "sqlite",
    };
    return cached;
  }

  const pool = new pg.Pool(config.postgres);
  await ensureDatabaseReady("postgres", null, pool);
  cached = {
    db: drizzlePg(pool, { schema: postgresSchema }),
    schema: postgresSchema,
    engine: "postgres",
  };
  return cached;
}
