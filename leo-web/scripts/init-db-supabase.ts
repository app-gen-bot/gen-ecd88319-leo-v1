#!/usr/bin/env tsx
/**
 * Database Initialization Script (via Supabase Client)
 * Creates the generation_requests table using Supabase's management API
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const projectId = process.env.SUPABASE_PROJECT_ID;

  if (!supabaseUrl || !supabaseServiceKey || !projectId) {
    console.error('❌ ERROR: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_PROJECT_ID not found');
    process.exit(1);
  }

  console.log('📄 Reading SQL file...');
  const sqlFile = join(__dirname, '..', 'init-database.sql');
  const sqlContent = readFileSync(sqlFile, 'utf-8');

  console.log('\n' + '='.repeat(80));
  console.log(' MANUAL STEP REQUIRED: Execute SQL in Supabase Dashboard');
  console.log('='.repeat(80));
  console.log('\n📋 Instructions:');
  console.log(`   1. Open: https://supabase.com/dashboard/project/${projectId}/sql/new`);
  console.log(`   2. Copy the SQL below`);
  console.log(`   3. Paste into Supabase SQL Editor`);
  console.log(`   4. Click "Run" button`);
  console.log('\n' + '─'.repeat(80));
  console.log('SQL TO EXECUTE:');
  console.log('─'.repeat(80) + '\n');
  console.log(sqlContent);
  console.log('\n' + '─'.repeat(80));
  console.log('\n💡 After running the SQL, press Ctrl+C and continue with deployment');
  console.log('='.repeat(80) + '\n');

  // Keep the process alive to show the message
  await new Promise(() => {});
}

initDatabase();
