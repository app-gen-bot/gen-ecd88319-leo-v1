#!/usr/bin/env tsx
/**
 * Database Initialization Script
 * Creates the generation_requests table in Supabase PostgreSQL database
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  // Read database connection details from environment
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  const projectId = process.env.SUPABASE_PROJECT_ID;

  if (!dbPassword || !projectId) {
    console.error('❌ ERROR: SUPABASE_DB_PASSWORD or SUPABASE_PROJECT_ID not found in environment');
    console.error('Make sure to set these in your .env file');
    process.exit(1);
  }

  // Construct the direct connection string (not pooler) with the actual password
  const connectionString = `postgresql://postgres:${dbPassword}@db.${projectId}.supabase.co:5432/postgres`;

  console.log('🔌 Connecting to Supabase database (direct connection)...');

  // Create postgres client
  const sql = postgres(connectionString);

  try {
    // Read SQL file
    const sqlFile = join(__dirname, '..', 'init-database.sql');
    const sqlContent = readFileSync(sqlFile, 'utf-8');

    console.log('📄 Loaded init-database.sql');
    console.log('🚀 Executing SQL commands...\n');

    // Split SQL file by semicolons and execute each statement
    // This handles multi-statement SQL files properly
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('SELECT') && statement.includes('information_schema')) {
        // This is the verification query at the end
        console.log('✅ Verifying table structure...\n');
        const result = await sql.unsafe(statement);
        console.table(result);
      } else if (statement.length > 10) {
        // Execute other statements
        await sql.unsafe(statement);
      }
    }

    console.log('\n✅ Database initialization completed successfully!');
    console.log('📊 Table "generation_requests" is ready to use');

  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the initialization
initDatabase();
