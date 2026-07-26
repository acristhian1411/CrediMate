import { ipcMain } from "electron";
import pg from "pg";
import { hasConfig, readConfig, writeConfig } from "../config.js";

export function registerSetupHandlers() {
  ipcMain.handle("setup:has-config", () => hasConfig());
  ipcMain.handle("setup:get-config", () => readConfig());

  ipcMain.handle("setup:test-postgres", async (_event, postgresConfig) => {
    const client = new pg.Client({
      host: postgresConfig.host,
      port: Number(postgresConfig.port) || 5432,
      database: postgresConfig.database,
      user: postgresConfig.user,
      password: postgresConfig.password,
      ssl: postgresConfig.ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      await client.query("SELECT 1");
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  });

  ipcMain.handle("setup:save-config", (_event, config) => {
    writeConfig(config);
    return { ok: true };
  });
}
