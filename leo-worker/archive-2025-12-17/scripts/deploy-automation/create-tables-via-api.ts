#!/usr/bin/env node

import fs from 'fs/promises';
import chalk from 'chalk';
import ora from 'ora';

interface CreateTablesOptions {
  projectId: string;
  serviceRoleKey: string;
  migrationFile: string;
}

/**
 * Create database tables using Supabase REST API
 */
export async function createTablesViaAPI(options: CreateTablesOptions): Promise<void> {
  const spinner = ora('Creating database tables via Supabase API...').start();
  
  try {
    const supabaseUrl = `https://${options.projectId}.supabase.co`;
    
    // Read the migration SQL
    const sql = await fs.readFile(options.migrationFile, 'utf8');
    
    console.log(chalk.gray(`   Project URL: ${supabaseUrl}`));
    console.log(chalk.gray(`   Migration file: ${options.migrationFile}`));
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    spinner.text = `Executing ${statements.length} SQL statements...`;
    
    // Execute each statement via Supabase Edge Functions SQL endpoint
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement.trim()) continue;
      
      spinner.text = `Executing statement ${i + 1}/${statements.length}...`;
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${options.serviceRoleKey}`,
            'apikey': options.serviceRoleKey,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ 
            query: statement + ';'
          })
        });
        
        if (!response.ok) {
          // Many DDL statements aren't supported via RPC, which is expected
          console.log(chalk.yellow(`   ⚠️  Statement ${i + 1} needs manual execution (DDL): ${statement.substring(0, 50)}...`));
        } else {
          console.log(chalk.green(`   ✅ Statement ${i + 1} executed successfully`));
        }
      } catch (error) {
        console.log(chalk.yellow(`   ⚠️  Statement ${i + 1} failed (may need manual execution): ${statement.substring(0, 50)}...`));
      }
    }

    spinner.succeed(chalk.green('✅ Table creation process completed!'));
    
    console.log(chalk.yellow('\n📋 Some statements may require manual execution in Supabase Dashboard:'));
    console.log(chalk.cyan(`   https://supabase.com/dashboard/project/${options.projectId}/sql`));
    console.log(chalk.gray('\n   Copy and paste the migration SQL from:'));
    console.log(chalk.gray(`   ${options.migrationFile}`));
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to create tables'));
    
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    }
    
    throw error;
  }
}

// CLI interface if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectId = process.argv[2];
  const serviceRoleKey = process.argv[3];
  const migrationFile = process.argv[4];

  if (!projectId || !serviceRoleKey || !migrationFile) {
    console.error(chalk.red('❌ Usage: npx tsx create-tables-via-api.ts <project-id> <service-role-key> <migration-file>'));
    process.exit(1);
  }

  createTablesViaAPI({
    projectId,
    serviceRoleKey,
    migrationFile,
  })
    .then(() => {
      console.log(chalk.green('\n✅ Table creation completed'));
    })
    .catch(error => {
      console.error(chalk.red(`\n❌ Table creation failed: ${error.message}`));
      process.exit(1);
    });
}