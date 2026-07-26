import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './electron/db/schema.sqlite.js',
  out: './electron/db/migrations/sqlite',
});
