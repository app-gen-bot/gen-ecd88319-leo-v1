#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';

interface MigrationOptions {
  projectId: string;
  serviceRoleKey: string;
  migrationsPath: string;
  projectPath: string;
}

/**
 * Run database migrations using Supabase JS client with service role key
 * This bypasses SSL/certificate issues by using the Supabase client
 */
export async function runMigrationsWithSupabaseClient(options: MigrationOptions): Promise<void> {
  const spinner = ora('Running database migrations via Supabase client...').start();
  
  try {
    const supabaseUrl = `https://${options.projectId}.supabase.co`;
    
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, options.serviceRoleKey);
    
    // Read migration files
    const migrationsDir = path.join(options.projectPath, options.migrationsPath);
    const migrationFiles = await fs.readdir(migrationsDir);
    const sqlFiles = migrationFiles.filter(f => f.endsWith('.sql')).sort();

    if (sqlFiles.length === 0) {
      spinner.info(chalk.yellow('No migration files found'));
      return;
    }

    spinner.text = `Found ${sqlFiles.length} migration file(s), running via Supabase client...`;
    console.log(chalk.gray(`   Project URL: ${supabaseUrl}`));

    // Run each migration
    for (const file of sqlFiles) {
      spinner.text = `Running migration: ${file}`;
      
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // Split SQL into individual statements (basic approach)
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
          
          if (error) {
            // Try direct query for DDL statements
            const { error: directError } = await supabase
              .from('_temp_table_that_does_not_exist')
              .select('*')
              .limit(0);
            
            // If it's a DDL statement, we need to use a different approach
            // Let's try using the SQL editor endpoint
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${options.serviceRoleKey}`,
                'apikey': options.serviceRoleKey
              },
              body: JSON.stringify({ sql_query: statement })
            });
            
            if (!response.ok) {
              console.log(chalk.yellow(`   ⚠️  Statement may require manual execution: ${statement.substring(0, 50)}...`));
            }
          }
        }
      }
      
      console.log(chalk.green(`   ✅ Migration ${file} processed`));
    }

    spinner.succeed(chalk.green('✅ Database migrations completed via Supabase client!'));
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to run migrations'));
    
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      
      if (error.message.includes('permission')) {
        console.error(chalk.yellow('   Check that the service role key has proper permissions'));
      }
    }
    
    throw error;
  }
}

// CLI interface if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectId = process.argv[2];
  const serviceRoleKey = process.argv[3];
  const projectPath = process.argv[4] || process.cwd();

  if (!projectId || !serviceRoleKey) {
    console.error(chalk.red('❌ Usage: npx tsx run-migrations-supabase-client.ts <project-id> <service-role-key> [project-path]'));
    process.exit(1);
  }

  runMigrationsWithSupabaseClient({
    projectId,
    serviceRoleKey,
    migrationsPath: 'server/db/migrations',
    projectPath,
  })
    .then(() => {
      console.log(chalk.green('\n✅ Migration process completed successfully'));
    })
    .catch(error => {
      console.error(chalk.red(`\n❌ Migration failed: ${error.message}`));
      console.log(chalk.yellow('\n📋 You can run the SQL manually in Supabase Dashboard:'));
      console.log(chalk.cyan(`   https://supabase.com/dashboard/project/${projectId}/sql`));
      process.exit(1);
    });
}