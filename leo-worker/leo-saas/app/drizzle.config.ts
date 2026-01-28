import { defineConfig } from 'drizzle-kit';

// Use LEO_DATABASE_URL for Leo SaaS's own database (not the generated apps pool)
// Falls back to DATABASE_URL for backwards compatibility
const databaseUrl = process.env.LEO_DATABASE_URL || process.env.DATABASE_URL || '';

export default defineConfig({
  schema: './shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
