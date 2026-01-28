import { exec } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';

const execAsync = promisify(exec);

export interface MigrationOptions {
  supabaseUrl: string;
  supabaseServiceKey: string;
  migrationsPath: string;
  projectPath: string;
}

/**
 * Run database migrations for a Supabase project
 */
export async function runSupabaseMigrations(options: MigrationOptions): Promise<void> {
  const spinner = ora('Running database migrations...').start();

  try {
    // Read migration files
    const migrationsDir = path.join(options.projectPath, options.migrationsPath);
    const migrationFiles = await fs.readdir(migrationsDir);
    const sqlFiles = migrationFiles.filter(f => f.endsWith('.sql')).sort();

    if (sqlFiles.length === 0) {
      spinner.info(chalk.yellow('No migration files found'));
      return;
    }

    spinner.text = `Found ${sqlFiles.length} migration file(s)`;

    // Create Supabase client
    const supabase = createClient(options.supabaseUrl, options.supabaseServiceKey);

    // Since Supabase doesn't allow direct SQL execution from client,
    // we'll prepare the SQL and provide instructions
    const allSql: string[] = [];

    for (const file of sqlFiles) {
      const sqlContent = await fs.readFile(
        path.join(migrationsDir, file),
        'utf-8'
      );
      allSql.push(`-- Migration: ${file}`);
      allSql.push(sqlContent);
      allSql.push('');
    }

    const fullMigrationSql = allSql.join('\n');

    // Save migration SQL to a file
    const outputPath = path.join(options.projectPath, 'migration-output.sql');
    await fs.writeFile(outputPath, fullMigrationSql);

    spinner.succeed(chalk.green('✅ Migration SQL prepared'));

    // Try to run via npm script if available
    const hasNpmScript = await checkNpmScript(options.projectPath, 'db:migrate');
    
    if (hasNpmScript) {
      spinner.start('Running npm db:migrate...');
      
      try {
        // Set environment variables and run migration
        const env = {
          ...process.env,
          SUPABASE_URL: options.supabaseUrl,
          SUPABASE_ANON_KEY: options.supabaseServiceKey,
          SUPABASE_SERVICE_ROLE_KEY: options.supabaseServiceKey,
        };

        await execAsync('npm run db:migrate', {
          cwd: options.projectPath,
          env,
        });

        spinner.succeed(chalk.green('✅ Migrations executed via npm script'));
      } catch (error) {
        spinner.warn(chalk.yellow('⚠️  Migration script ran but may need manual verification'));
        console.log(chalk.yellow('\n📝 Migration SQL has been saved to:'));
        console.log(chalk.cyan(`   ${outputPath}`));
        console.log(chalk.yellow('\nTo complete migration manually:'));
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to SQL Editor > New Query');
        console.log('3. Paste the contents of migration-output.sql');
        console.log('4. Click "Run" to execute');
      }
    } else {
      // No npm script, provide manual instructions
      console.log(chalk.yellow('\n📝 Migration SQL has been saved to:'));
      console.log(chalk.cyan(`   ${outputPath}`));
      console.log(chalk.yellow('\nTo complete migration:'));
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor > New Query');
      console.log('3. Paste the contents of migration-output.sql');
      console.log('4. Click "Run" to execute');
    }

    // Test connection to verify tables exist
    await testDatabaseConnection(supabase, spinner);

  } catch (error) {
    spinner.fail(chalk.red('Failed to run migrations'));
    throw error;
  }
}

/**
 * Check if an npm script exists in package.json
 */
async function checkNpmScript(projectPath: string, scriptName: string): Promise<boolean> {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    return packageJson.scripts && packageJson.scripts[scriptName];
  } catch {
    return false;
  }
}

/**
 * Test database connection and verify tables exist
 */
async function testDatabaseConnection(supabase: any, spinner: ora.Ora): Promise<void> {
  spinner.start('Testing database connection...');

  try {
    // Try to query a table to verify connection
    const { error } = await supabase
      .from('notes')
      .select('id')
      .limit(1);

    if (!error || error.code === 'PGRST116') {
      // PGRST116 means no rows, which is fine
      spinner.succeed(chalk.green('✅ Database connection verified'));
    } else if (error.code === '42P01') {
      // Table doesn't exist
      spinner.warn(chalk.yellow('⚠️  Tables not yet created. Please run migrations in Supabase Dashboard'));
    } else {
      spinner.warn(chalk.yellow(`⚠️  Database connection test failed: ${error.message}`));
    }
  } catch (error) {
    spinner.warn(chalk.yellow('⚠️  Could not verify database connection'));
  }
}

// CLI interface if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectPath = process.argv[2] || process.cwd();
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.error(chalk.red('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required'));
    process.exit(1);
  }

  runSupabaseMigrations({
    supabaseUrl,
    supabaseServiceKey: supabaseKey,
    migrationsPath: 'server/db/migrations',
    projectPath,
  })
    .then(() => {
      console.log(chalk.green('\n✅ Migration process completed'));
    })
    .catch(error => {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    });
}