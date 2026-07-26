import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './electron/db/schema.postgres.js',
  out: './electron/db/migrations/postgres',
  dbCredentials: {
    // Solo se usa al correr `drizzle-kit generate` en tu máquina de desarrollo,
    // apuntá a cualquier Postgres local con la forma del schema.
    url: process.env.DATABASE_URL,
  },
});
