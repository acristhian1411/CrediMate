# Migración a Drizzle — integración

## 1. Dependencias

```bash
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit
```

## 2. Archivos

- `electron/db/schema.sqlite.js` y `schema.postgres.js` — definición de tablas, un archivo por dialecto, mismos nombres de columnas en camelCase
- `electron/db/client.js` — crea el cliente Drizzle correcto según `db-config.json` (el que ya guarda el onboarding)
- `electron/db/repository.js` — reemplaza tu `dbAPI`. Cada función recibe `(db, schema, ...args)` y usa el query builder de Drizzle, que es idéntico para ambos dialectos
- `drizzle.config.sqlite.js` / `drizzle.config.postgres.js` — configuración de `drizzle-kit` para generar migraciones por dialecto
- `electron/migrate.js` — corre las migraciones según el motor activo

## 3. Generar las migraciones iniciales

```bash
npx drizzle-kit generate --config drizzle.config.sqlite.js
npx drizzle-kit generate --config drizzle.config.postgres.js
```

Esto crea el SQL de las 4 tablas en `electron/db/migrations/sqlite` y `.../postgres`
a partir de los schemas. Revisalo antes de aplicarlo — especialmente los tipos
que cambian entre dialectos (`AUTOINCREMENT` → `SERIAL`, `BOOLEAN` real en
Postgres vs 0/1 en SQLite).

## 4. Uso en tus IPC handlers

Antes:

```js
import { dbAPI } from "./db.js";
const clients = dbAPI.listClients(db);
```

Ahora:

```js
import { getDbClient } from "./db/client.js";
import { repository } from "./db/repository.js";

const { db, schema } = getDbClient(sqlitePath);
const clients = await repository.listClients(db, schema);
```

Como todas las funciones del repository son `async`, esto funciona igual
sea SQLite (el driver responde sync, pero `await` sobre un valor no-promise
se resuelve solo) o Postgres (driver real async). No necesitás ramificar
el código en ningún IPC handler.

Un patrón cómodo para no repetir `db, schema` en cada llamada: armá un
wrapper fino en el arranque de la app —

```js
const { db, schema } = getDbClient(sqlitePath);
const dbAPI = Object.fromEntries(
  Object.entries(repository).map(([name, fn]) => [
    name,
    (...args) => fn(db, schema, ...args),
  ]),
);
// dbAPI.listClients() ahora tiene la misma firma que tu dbAPI actual
```

## 5. Al arrancar la app

```js
import { runMigrations } from "./migrate.js";

await runMigrations(sqlitePath); // corre después de que el onboarding guardó la config
```

## Notas

- `expirate_at` quedó como `text` en ambos dialectos para no romper el
  ordenamiting/comparaciones que ya tenías con fechas en formato ISO string.
  Si más adelante querés fechas reales de Postgres, es un cambio de columna
  aislado en `schema.postgres.js`.
- `status` de `fees` es `integer` (0/1) en SQLite y `boolean` nativo en
  Postgres — Drizzle traduce esto solo, tu código de repository no distingue.
- Todo el resto de tu app (React, IPC) no necesita saber qué motor está
  activo — solo habla con `repository`.
