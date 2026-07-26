import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { initDB, dbAPI } from "./db.js";
import { printContract, printReceipt } from "./print.js";
import Database from "better-sqlite3";
import { registerSetupHandlers } from "./ipc/setup.js";
import { hasConfig } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !!process.env.VITE_DEV_SERVER_URL;

let win;
let db;

function getStartRoute() {
  return hasConfig() ? "/" : "/setup";
}

const resolveTemplatePath = (...p) => {
  // En build, templates van a resources/templates
  return app.isPackaged
    ? path.join(process.resourcesPath, "templates", ...p)
    : path.join(__dirname, "templates", ...p);
};

async function runMigrations(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 📌 Ruta completa al archivo .db
  const dbPath = path.join(dir, "creditmate.db");
  const db = new Database(dbPath);
  const migrationsDir = path.join(process.cwd(), "electron/migrations");

  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  ).run();

  // function runMigrations() {
  const files = fs.readdirSync(migrationsDir).sort();
  const executed = new Set(
    db
      .prepare("SELECT name FROM migrations")
      .all()
      .map((r) => r.name),
  );

  for (const file of files) {
    if (!executed.has(file)) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      db.exec(sql);
      db.prepare("INSERT INTO migrations (name) VALUES (?)").run(file);
    }
  }
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (isDev) {
    await win.loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${getStartRoute()}`);
    // Open the DevTools in development mode
    win.webContents.openDevTools();
  } else {
    await win.loadFile(path.join(process.cwd(), "frontend", "index.html"));
    win.webContents.executeJavaScript(
      `window.location.hash = '${getStartRoute()}'`,
    );
  }
}

app.whenReady().then(async () => {
  registerSetupHandlers();

  // DB en ruta de usuario (portable y segura)
  const dbDir = app.getPath("userData");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, "creditmate.db");
  db = await initDB(dbPath);
  // console.log('DB Inicializada: ', db)
  runMigrations(dbDir); // Corre migraciones pendientes

  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// IPCs (DB)
ipcMain.handle("clients:list", () => dbAPI.listClients(db));
ipcMain.handle("clients:create", (_e, payload) => {
  return dbAPI.createClient(db, payload);
});
ipcMain.handle("clients:search", (_e, searchTerm) =>
  dbAPI.searchClients(db, searchTerm),
);
ipcMain.handle("clients:update", (_e, payload) =>
  dbAPI.updateClient(db, payload),
);
ipcMain.handle("clients:remove", (_e, id) => dbAPI.removeClient(db, id));
ipcMain.handle("clients:getById", (_e, id) => dbAPI.getClientById(db, id));

ipcMain.handle("credits:listByClient", (_e, clientId) =>
  dbAPI.listCreditsByClient(db, clientId),
);
ipcMain.handle("credits:listAll", () => dbAPI.listAllCredits(db));
ipcMain.handle("credits:search", (_e, searchTerm) =>
  dbAPI.searchCredits(db, searchTerm),
);
ipcMain.handle("credits:getById", (_e, id) => dbAPI.getCreditById(db, id));
ipcMain.handle("credits:create", (_e, payload) =>
  dbAPI.createCredit(db, payload),
);
ipcMain.handle("credits:update", (_e, payload) =>
  dbAPI.updateCredit(db, payload),
);
ipcMain.handle("credits:updateStatus", (_e, payload) =>
  dbAPI.updateCreditStatus(db, payload),
);

ipcMain.handle("fees:listByCredit", (_e, creditId) =>
  dbAPI.listFeesByCredit(db, creditId),
);
ipcMain.handle("fees:getAllByCredit", (_e, creditId) =>
  dbAPI.listFeesByCredit(db, creditId),
);
ipcMain.handle("fees:getByClient", (_e, clientId) =>
  dbAPI.getFeesByClient(db, clientId),
);
ipcMain.handle("fees:updateStatus", (_e, payload) =>
  dbAPI.updateFeeStatus(db, payload),
);
ipcMain.handle("fees:create", (_e, payload) => dbAPI.createFees(db, payload));
ipcMain.handle("fees:update", (_e, payload) => dbAPI.updateFees(db, payload));

ipcMain.handle("payments:listByCredit", (_e, creditId) =>
  dbAPI.listPaymentsByCredit(db, creditId),
);
ipcMain.handle("payments:register", (_e, payload) =>
  dbAPI.registerPayment(db, payload),
);

// IPCs (Print)
ipcMain.handle("print:contract", async (_e, data) => {
  const template = fs.readFileSync(resolveTemplatePath("contract.hbs"), "utf8");
  const pdfPath = await printContract({ template, data, app });
  return pdfPath;
});
ipcMain.handle("print:receipt", async (_e, data) => {
  const template = fs.readFileSync(resolveTemplatePath("receipt.hbs"), "utf8");
  const pdfPath = await printReceipt({ template, data, app });
  return pdfPath;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
