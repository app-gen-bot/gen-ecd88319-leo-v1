#!/usr/bin/env tsx
/**
 * Database Initialization Script (via Supabase API)
 * Creates the generation_requests table using Supabase's REST API
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  // Read Supabase connection details from environment
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment');
    console.error('Make sure to set these in your .env file');
    process.exit(1);
  }

  console.log('🔌 Connecting to Supabase via REST API...');

  try {
    // Read SQL file
    const sqlFile = join(__dirname, '..', 'init-database.sql');
    const sqlContent = readFileSync(sqlFile, 'utf-8');

    console.log('📄 Loaded init-database.sql');
    console.log('🚀 Executing SQL commands via Supabase API...\n');

    // Execute SQL using Supabase's PostgREST query endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });

    if (!response.ok) {
      // Try direct SQL execution endpoint
      console.log('⚠️  RPC endpoint not available, trying direct SQL execution...\n');

      // Use Supabase CLI-style SQL execution
      const result = await executeSQLStatements(supabaseUrl, supabaseServiceKey, sqlContent);

      if (result.success) {
        console.log('\n✅ Database initialization completed successfully!');
        console.log('📊 Table "generation_requests" is ready to use');
      } else {
        throw new Error(result.error);
      }
    } else {
      const data = await response.json();
      console.log('✅ Database initialization completed successfully!');
      console.log('📊 Table "generation_requests" is ready to use');
      console.log('Response:', data);
    }

  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error);
    console.error('\n💡 Alternative: Run the SQL manually in Supabase Dashboard');
    console.error(`   1. Go to: ${process.env.SUPABASE_URL?.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`);
    console.error('   2. Copy and paste the contents of init-database.sql');
    console.error('   3. Click "Run"');
    process.exit(1);
  }
}

async function executeSQLStatements(supabaseUrl: string, serviceKey: string, sql: string) {
  // Split into individual statements and execute them one by one
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

    try {
      // Create a temporary function to execute arbitrary SQL
      const createFn = `
        CREATE OR REPLACE FUNCTION exec_temp_sql_${i}()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          ${statement};
        END;
        $$;
      `;

      const executeFn = `SELECT exec_temp_sql_${i}();`;
      const dropFn = `DROP FUNCTION IF EXISTS exec_temp_sql_${i}();`;

      // This won't work either without proper database access
      // We need to provide the SQL file for manual execution
    } catch (error) {
      return { success: false, error: `Failed at statement ${i + 1}: ${error}` };
    }
  }

  return { success: false, error: 'Direct API execution not supported' };
}

// Run the initialization
initDatabase();
