import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';

export interface MigrationOptions {
  databaseUrl: string;
  migrationsPath: string;
  projectPath: string;
}

/**
 * Run database migrations using direct PostgreSQL connection
 * This bypasses Supabase API limitations and allows full automation
 */
export async function runMigrationsDirectly(options: MigrationOptions): Promise<void> {
  const spinner = ora('Running database migrations...').start();
  let client: Client | null = null;

  try {
    // Read migration files
    const migrationsDir = path.join(options.projectPath, options.migrationsPath);
    const migrationFiles = await fs.readdir(migrationsDir);
    const sqlFiles = migrationFiles.filter(f => f.endsWith('.sql')).sort();

    if (sqlFiles.length === 0) {
      spinner.info(chalk.yellow('No migration files found'));
      return;
    }

    spinner.text = `Found ${sqlFiles.length} migration file(s), connecting to database...`;

    console.log(chalk.gray(`   Database URL: ${options.databaseUrl.replace(/:[^:@]*@/, ':***@')}`));
    
    // Connect to database using direct connection (IPv6 ready)
    spinner.text = 'Connecting to database...';
    client = new Client({
      connectionString: options.databaseUrl,
      ssl: {
        rejectUnauthorized: false, // Accept self-signed certificates
        checkServerIdentity: () => undefined, // Skip hostname verification
        // Alternative approach for strict SSL environments
        ca: undefined, // Don't verify CA chain
        servername: undefined, // Don't verify server name
      },
    });

    await client.connect();
    spinner.text = 'Connected to database, running migrations...';

    // Run each migration
    for (const file of sqlFiles) {
      spinner.text = `Running migration: ${file}`;
      
      const sqlContent = await fs.readFile(
        path.join(migrationsDir, file),
        'utf-8'
      );

      // Execute the SQL
      await client.query(sqlContent);
      
      console.log(chalk.green(`   ✅ ${file} executed successfully`));
    }

    spinner.succeed(chalk.green(`✅ All ${sqlFiles.length} migrations completed successfully!`));

    // Test connection by querying one of the created tables
    try {
      const result = await client.query('SELECT COUNT(*) FROM notes');
      console.log(chalk.gray(`   Database ready - notes table accessible`));
    } catch (error) {
      console.log(chalk.yellow(`   ⚠️  Database created but tables may need verification`));
    }

  } catch (error) {
    spinner.fail(chalk.red('Failed to run migrations'));
    
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      
      // Provide helpful error messages
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error(chalk.yellow('   Database connection failed. Check your database URL.'));
      } else if (error.message.includes('password authentication failed')) {
        console.error(chalk.yellow('   Authentication failed. Check your database credentials.'));
      } else if (error.message.includes('already exists')) {
        console.error(chalk.yellow('   Tables may already exist. This could be expected on re-runs.'));
      }
    }
    
    throw error;
  } finally {
    // Always close the connection
    if (client) {
      try {
        await client.end();
      } catch (error) {
        // Ignore connection close errors
      }
    }
  }
}

/**
 * Get the database connection URL from Supabase project details
 */
export function constructDatabaseUrl(
  projectId: string,
  databasePassword: string,
  region = 'us-east-1'
): string {
  // Supabase database URL pattern (direct connection)
  return `postgresql://postgres:${databasePassword}@db.${projectId}.supabase.co:5432/postgres`;
}


/**
 * Test database connection without running migrations
 */
export async function testDatabaseConnection(databaseUrl: string): Promise<boolean> {
  let client: Client | null = null;
  
  try {
    client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await client.connect();
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  } finally {
    if (client) {
      try {
        await client.end();
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

// CLI interface if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectPath = process.argv[2] || process.cwd();
  const databaseUrl = process.env.DATABASE_URL || '';

  if (!databaseUrl) {
    console.error(chalk.red('❌ DATABASE_URL environment variable is required'));
    console.error(chalk.yellow('   Example: DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres'));
    process.exit(1);
  }

  runMigrationsDirectly({
    databaseUrl,
    migrationsPath: 'server/db/migrations',
    projectPath,
  })
    .then(() => {
      console.log(chalk.green('\n✅ Migration process completed successfully'));
    })
    .catch(error => {
      console.error(chalk.red(`\n❌ Migration failed: ${error.message}`));
      process.exit(1);
    });
}