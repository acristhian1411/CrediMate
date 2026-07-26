import Database from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { readConfig } from '../config.js';
import * as sqliteSchema from './schema.sqlite.js';
import * as postgresSchema from './schema.postgres.js';

let cached = null;

/**
 * Crea (una sola vez) el cliente de base de datos según db-config.json.
 * sqlitePath solo se usa si el motor configurado es sqlite.
 *
 * Devuelve { db, schema, engine } — `db` es la instancia de Drizzle,
 * `schema` es el módulo de tablas correspondiente al dialecto activo.
 * El repository.js usa siempre este mismo `schema`, nunca importa
 * schema.sqlite.js / schema.postgres.js directamente.
 */
export function getDbClient(sqlitePath) {
  if (cached) return cached;

  const config = readConfig();

  if (!config || config.engine === 'sqlite') {
    const sqlite = new Database(sqlitePath);
    sqlite.pragma('journal_mode = WAL');
    cached = {
      db: drizzleSqlite(sqlite, { schema: sqliteSchema }),
      schema: sqliteSchema,
      engine: 'sqlite',
    };
    return cached;
  }

  const pool = new pg.Pool(config.postgres);
  cached = {
    db: drizzlePg(pool, { schema: postgresSchema }),
    schema: postgresSchema,
    engine: 'postgres',
  };
  return cached;
}
