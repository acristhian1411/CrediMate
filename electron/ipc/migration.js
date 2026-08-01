import { app, ipcMain } from "electron";
import path from "node:path";
import { readConfig, writeConfig } from "../config.js";
import { migrateConnection } from "../db/connectionMigration.js";

function currentConfigOrDefault() {
  return readConfig() || { engine: "sqlite" };
}

export function registerMigrationHandlers({ getDbContext }) {
  const sqlitePath = path.join(app.getPath("userData"), "creditmate.db");

  ipcMain.handle("migration:get-current-config", () => {
    return currentConfigOrDefault();
  });

  ipcMain.handle("migration:run", async (_event, payload) => {
    const currentContext = getDbContext();
    if (!currentContext) {
      return { ok: false, error: "Database context is not initialized." };
    }

    try {
      const targetConfig = payload?.targetConfig;
      const overwriteDestination = payload?.overwriteDestination === true;

      const result = await migrateConnection({
        currentContext,
        currentConfig: currentConfigOrDefault(),
        targetConfig,
        sqlitePath,
        overwriteDestination,
      });

      writeConfig(targetConfig);

      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 600);

      return {
        ok: true,
        restartScheduled: true,
        ...result,
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "Migration failed",
      };
    }
  });
}
