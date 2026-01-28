/**
 * Database Connection Module
 *
 * Provides lazy-loaded database connection for direct DB access in routes.
 * Uses the same connection pattern as database-storage.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema';

// Lazy-load database connection
let client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    // Use LEO_ prefixed vars for Leo SaaS's own database
    // Prefer pooled connection for runtime, fallback to direct
    const connectionString = process.env.LEO_DATABASE_URL_POOLING || process.env.LEO_DATABASE_URL ||
                             process.env.DATABASE_URL_POOLING || process.env.DATABASE_URL || 'postgresql://placeholder';
    client = postgres(connectionString, {
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}

// Export as a getter to ensure lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
