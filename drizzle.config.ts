import { defineConfig } from 'drizzle-kit';
import { env } from './src/env.ts';

export default defineConfig({
  dialect: 'postgresql',
  casing: 'snake_case',
  schema: './src/config/db/schemas/**.ts',
  out: './src/config/db/migrations',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
