import fs from "node:fs";
import path from "node:path";
import { asc, sql } from "drizzle-orm";
import { app } from "electron";
import { getDbClientFromConfig, closeDbClient } from "./client.js";

function normalizeTargetConfig(config) {
  if (!config || config.engine === "sqlite") {
    return { engine: "sqlite" };
  }

  return {
    engine: "postgres",
    postgres: {
      host: config.postgres?.host,
      port: Number(config.postgres?.port) || 5432,
      database: config.postgres?.database,
      user: config.postgres?.user,
      password: config.postgres?.password,
      ssl: !!config.postgres?.ssl,
    },
  };
}

function sameConfig(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function exportData(context) {
  const { db, schema } = context;
  const clients = await db
    .select()
    .from(schema.clients)
    .orderBy(asc(schema.clients.id));
  const credits = await db
    .select()
    .from(schema.credits)
    .orderBy(asc(schema.credits.id));
  const fees = await db.select().from(schema.fees).orderBy(asc(schema.fees.id));
  const payments = await db
    .select()
    .from(schema.payments)
    .orderBy(asc(schema.payments.id));

  return { clients, credits, fees, payments };
}

function countRows(data) {
  return {
    clients: data.clients.length,
    credits: data.credits.length,
    fees: data.fees.length,
    payments: data.payments.length,
  };
}

function toDateOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoStringOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.toISOString();

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return String(value);
}

function normalizeRowsForTargetEngine(targetEngine, data) {
  const clients = data.clients.map((row) => {
    if (targetEngine === "postgres") {
      return {
        ...row,
        createdAt: toDateOrNull(row.createdAt),
      };
    }

    return {
      ...row,
      createdAt: toIsoStringOrNull(row.createdAt),
    };
  });

  return {
    ...data,
    clients,
  };
}

async function clearTarget(context) {
  const { db, schema, engine, raw } = context;

  if (engine === "postgres") {
    await db.execute(
      sql`TRUNCATE TABLE payments, fees, credits, clients RESTART IDENTITY CASCADE`,
    );
    return;
  }

  await db.delete(schema.payments);
  await db.delete(schema.fees);
  await db.delete(schema.credits);
  await db.delete(schema.clients);

  if (raw?.exec) {
    raw.exec("DELETE FROM sqlite_sequence");
  }
}

async function importData(context, data) {
  const { db, schema, engine } = context;
  const normalizedData = normalizeRowsForTargetEngine(engine, data);

  if (normalizedData.clients.length > 0) {
    await db.insert(schema.clients).values(normalizedData.clients);
  }
  if (normalizedData.credits.length > 0) {
    await db.insert(schema.credits).values(normalizedData.credits);
  }
  if (normalizedData.fees.length > 0) {
    await db.insert(schema.fees).values(normalizedData.fees);
  }
  if (normalizedData.payments.length > 0) {
    await db.insert(schema.payments).values(normalizedData.payments);
  }

  if (engine === "postgres") {
    await db.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('clients', 'id'),
        COALESCE((SELECT MAX(id) FROM clients), 1),
        (SELECT COUNT(*) > 0 FROM clients)
      )
    `);
    await db.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('credits', 'id'),
        COALESCE((SELECT MAX(id) FROM credits), 1),
        (SELECT COUNT(*) > 0 FROM credits)
      )
    `);
    await db.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('fees', 'id'),
        COALESCE((SELECT MAX(id) FROM fees), 1),
        (SELECT COUNT(*) > 0 FROM fees)
      )
    `);
    await db.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('payments', 'id'),
        COALESCE((SELECT MAX(id) FROM payments), 1),
        (SELECT COUNT(*) > 0 FROM payments)
      )
    `);
  }
}

async function createSqliteBackup(sqlitePath) {
  if (!fs.existsSync(sqlitePath)) {
    return null;
  }

  const backupDir = path.join(app.getPath("userData"), "backups");
  fs.mkdirSync(backupDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[.:]/g, "-");
  const backupPath = path.join(backupDir, `creditmate-${stamp}.db`);
  fs.copyFileSync(sqlitePath, backupPath);
  return backupPath;
}

export async function migrateConnection({
  currentContext,
  currentConfig,
  targetConfig,
  sqlitePath,
  overwriteDestination,
}) {
  if (!overwriteDestination) {
    throw new Error("Migration requires overwriteDestination=true");
  }

  const normalizedTarget = normalizeTargetConfig(targetConfig);
  const normalizedCurrent = normalizeTargetConfig(currentConfig);

  if (
    normalizedCurrent.engine === "sqlite" &&
    normalizedTarget.engine === "sqlite"
  ) {
    throw new Error("SQLite to SQLite migration is not supported.");
  }

  if (sameConfig(normalizedCurrent, normalizedTarget)) {
    throw new Error("Current and target connections are identical.");
  }

  const sourceData = await exportData(currentContext);
  const sourceCounts = countRows(sourceData);
  const backupPath =
    normalizedCurrent.engine === "sqlite"
      ? await createSqliteBackup(sqlitePath)
      : null;

  const targetContext = await getDbClientFromConfig(
    normalizedTarget,
    sqlitePath,
  );

  try {
    await clearTarget(targetContext);
    await importData(targetContext, sourceData);

    const importedData = await exportData(targetContext);
    const targetCounts = countRows(importedData);

    if (JSON.stringify(sourceCounts) !== JSON.stringify(targetCounts)) {
      throw new Error("Data verification failed after migration.");
    }

    return {
      ok: true,
      sourceEngine: normalizedCurrent.engine,
      targetEngine: normalizedTarget.engine,
      counts: sourceCounts,
      backupPath,
    };
  } finally {
    await closeDbClient(targetContext);
  }
}
