import { migrate as migrateSqlite } from 'drizzle-orm/better-sqlite3/migrator';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { getDbClient } from './db/client.js';

export async function runMigrations(sqlitePath) {
  const { db, engine } = getDbClient(sqlitePath);

  if (engine === 'sqlite') {
    migrateSqlite(db, { migrationsFolder: './electron/db/migrations/sqlite' });
  } else {
    await migratePg(db, { migrationsFolder: './electron/db/migrations/postgres' });
  }
}
