#!/usr/bin/env tsx
/**
 * Automated Database Schema Push
 * Uses the same database connection approach as the application code
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { sql as drizzleSql } from 'drizzle-orm';

async function pushSchema() {
  console.log('🔧 Automated Database Schema Push');
  console.log('==================================\n');

  // Read database connection string from environment (same as app code)
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL not found in environment');
    console.error('Make sure to set DATABASE_URL in your .env file');
    process.exit(1);
  }

  console.log('🔌 Connecting to Supabase database...');

  // Create postgres client (same as database-storage.ts)
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    console.log('📊 Creating enum type...\n');

    // Create enum type
    await client.unsafe(`
      DO $$ BEGIN
          CREATE TYPE generation_status AS ENUM ('queued', 'generating', 'completed', 'failed');
      EXCEPTION
          WHEN duplicate_object THEN
              RAISE NOTICE 'Type generation_status already exists, skipping creation';
      END $$;
    `);

    console.log('✅ Enum type ready');

    console.log('📊 Creating generation_requests table...\n');

    // Create table
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS generation_requests (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        prompt TEXT NOT NULL,
        status generation_status NOT NULL DEFAULT 'queued',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        download_url TEXT,
        error_message TEXT
      );
    `);

    console.log('✅ Table created');

    console.log('📊 Creating indexes...\n');

    // Create indexes
    await client.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_generation_requests_user_id ON generation_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_generation_requests_status ON generation_requests(status);
      CREATE INDEX IF NOT EXISTS idx_generation_requests_created_at ON generation_requests(created_at);
    `);

    console.log('✅ Indexes created');

    // Verify table structure
    const result = await client.unsafe(`
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'generation_requests'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Table structure:');
    console.table(result);

    console.log('\n✅ Database schema has been pushed successfully!');
    console.log('📊 The generation_requests table is now ready to use');

  } catch (error) {
    console.error('\n❌ Database schema push failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the schema push
pushSchema();
