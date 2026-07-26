import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

const CONFIG_PATH = path.join(app.getPath("userData"), "db-config.json");

export function hasConfig() {
  return fs.existsSync(CONFIG_PATH);
}

export function readConfig() {
  if (!hasConfig()) return null;
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

export function writeConfig(config) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export function getConfigPath() {
  return CONFIG_PATH;
}
