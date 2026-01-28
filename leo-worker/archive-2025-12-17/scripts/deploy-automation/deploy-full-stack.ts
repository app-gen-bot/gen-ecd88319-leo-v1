#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { createSupabaseProject, getSupabaseProjectKeys } from './create-supabase-project.js';
import { createRailwayProject, setRailwayEnvironmentVariables, deployToRailway } from './create-railway-project.js';
import { runMigrationsDirectly, constructDatabaseUrl } from './run-migrations-direct.js';
import { loadConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DeploymentOptions {
  appName: string;
  appPath: string;
  region?: string;
  skipSupabase?: boolean;
  skipRailway?: boolean;
  supabaseProjectId?: string;
  supabaseDatabasePassword?: string;
  railwayProjectId?: string;
}

interface DeploymentResult {
  success: boolean;
  appName: string;
  supabase?: {
    projectId: string;
    url: string;
    anonKey: string;
    serviceRoleKey: string;
    databasePassword?: string;
  };
  railway?: {
    projectId: string;
    deploymentUrl?: string;
  };
  errors: string[];
}

/**
 * Main deployment orchestration function
 */
async function deployFullStack(options: DeploymentOptions): Promise<DeploymentResult> {
  const result: DeploymentResult = {
    success: false,
    appName: options.appName,
    errors: [],
  };

  console.log(chalk.blue('\n🚀 Starting Full-Stack Deployment Pipeline'));
  console.log(chalk.gray('━'.repeat(50)));

  try {
    // Validate app path exists
    await validateAppPath(options.appPath);

    // Step 1: Create or use existing Supabase project
    if (!options.skipSupabase) {
      console.log(chalk.cyan('\n📦 Step 1: Supabase Setup'));
      
      let supabaseProject;
      if (options.supabaseProjectId) {
        // Use existing project
        console.log(chalk.gray(`Using existing project: ${options.supabaseProjectId}`));
        const keys = await getSupabaseProjectKeys(options.supabaseProjectId);
        
        if (!options.supabaseDatabasePassword) {
          throw new Error('Database password is required when using existing Supabase project. Use --supabase-password option.');
        }
        
        supabaseProject = {
          id: options.supabaseProjectId,
          url: `https://${options.supabaseProjectId}.supabase.co`,
          anonKey: keys.anonKey,
          serviceRoleKey: keys.serviceRoleKey,
          databasePassword: options.supabaseDatabasePassword,
        };
      } else {
        // Create new project
        const project = await createSupabaseProject({
          name: options.appName,
          region: options.region,
        });
        
        supabaseProject = {
          id: project.id,
          url: project.url,
          anonKey: project.anonKey,
          serviceRoleKey: project.serviceRoleKey,
          databasePassword: project.databasePassword,
        };
      }

      result.supabase = supabaseProject;

      // Step 2: Run database migrations using direct PostgreSQL connection
      console.log(chalk.cyan('\n📊 Step 2: Database Migrations'));
      
      // Get database URL from Supabase project
      const databaseUrl = constructDatabaseUrl(
        supabaseProject.id,
        supabaseProject.databasePassword!
      );
      
      await runMigrationsDirectly({
        databaseUrl,
        migrationsPath: 'server/db/migrations',
        projectPath: options.appPath,
      });

      // Step 3: Update app .env file
      console.log(chalk.cyan('\n🔧 Step 3: Configuring Application'));
      
      await updateAppEnvironment(options.appPath, {
        SUPABASE_URL: supabaseProject.url,
        SUPABASE_ANON_KEY: supabaseProject.anonKey,
        SUPABASE_SERVICE_ROLE_KEY: supabaseProject.serviceRoleKey,
      });
    }

    // Step 4: Create Railway project and deploy
    if (!options.skipRailway) {
      console.log(chalk.cyan('\n🚂 Step 4: Railway Deployment'));
      
      let railwayProject;
      if (options.railwayProjectId) {
        // Use existing project
        console.log(chalk.gray(`Using existing project: ${options.railwayProjectId}`));
        railwayProject = {
          id: options.railwayProjectId,
          environments: [{ id: 'production', name: 'production' }],
        };
      } else {
        // Create new project
        railwayProject = await createRailwayProject({
          name: options.appName,
          projectPath: options.appPath,
        });
      }

      // Set environment variables
      if (result.supabase) {
        const envVars = {
          SUPABASE_URL: result.supabase.url,
          SUPABASE_ANON_KEY: result.supabase.anonKey,
          NODE_ENV: 'production',
        };

        await setRailwayEnvironmentVariables(
          railwayProject.id,
          railwayProject.environments[0].id,
          envVars
        );
      }

      // Deploy to Railway
      console.log(chalk.cyan('\n🚀 Step 5: Deploying Application'));
      
      const deployment = await deployToRailway(
        options.appPath,
        railwayProject.id
      );

      result.railway = {
        projectId: railwayProject.id,
        deploymentUrl: deployment.deploymentUrl,
      };
    }

    result.success = true;

    // Print success summary
    printDeploymentSummary(result);

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    
    console.error(chalk.red('\n❌ Deployment failed:'));
    console.error(chalk.red(result.errors.join('\n')));
  }

  return result;
}

/**
 * Validate that the app path exists and contains necessary files
 */
async function validateAppPath(appPath: string): Promise<void> {
  try {
    const stats = await fs.stat(appPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${appPath}`);
    }

    // Check for package.json
    const packageJsonPath = path.join(appPath, 'package.json');
    await fs.access(packageJsonPath);

  } catch (error) {
    throw new Error(`Invalid app path: ${appPath}`);
  }
}

/**
 * Update the app's .env file with new values
 */
async function updateAppEnvironment(appPath: string, variables: Record<string, string>): Promise<void> {
  const envPath = path.join(appPath, '.env');
  
  try {
    // Read existing .env if it exists
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch {
      // File doesn't exist, create new
    }

    // Update or add variables
    const lines = envContent.split('\n');
    const updatedLines: string[] = [];
    const addedKeys = new Set<string>();

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || trimmed === '') {
        updatedLines.push(line);
        continue;
      }

      const [key] = line.split('=');
      if (key && variables[key.trim()]) {
        updatedLines.push(`${key.trim()}=${variables[key.trim()]}`);
        addedKeys.add(key.trim());
      } else {
        updatedLines.push(line);
      }
    }

    // Add any new variables
    for (const [key, value] of Object.entries(variables)) {
      if (!addedKeys.has(key)) {
        updatedLines.push(`${key}=${value}`);
      }
    }

    // Write back to file
    await fs.writeFile(envPath, updatedLines.join('\n'));
    
    console.log(chalk.green(`   ✅ Updated .env file with ${Object.keys(variables).length} variables`));
  } catch (error) {
    console.warn(chalk.yellow(`   ⚠️  Could not update .env file: ${error}`));
  }
}

/**
 * Print deployment summary
 */
function printDeploymentSummary(result: DeploymentResult): void {
  console.log(chalk.green('\n✨ Deployment Complete!'));
  console.log(chalk.gray('━'.repeat(50)));
  
  console.log(chalk.white('\n📋 Deployment Summary:'));
  console.log(chalk.cyan(`   App Name: ${result.appName}`));
  
  if (result.supabase) {
    console.log(chalk.cyan('\n   Supabase:'));
    console.log(chalk.gray(`     Project ID: ${result.supabase.projectId}`));
    console.log(chalk.gray(`     URL: ${result.supabase.url}`));
    console.log(chalk.yellow(`     Dashboard: https://supabase.com/dashboard/project/${result.supabase.projectId}`));
  }
  
  if (result.railway) {
    console.log(chalk.cyan('\n   Railway:'));
    console.log(chalk.gray(`     Project ID: ${result.railway.projectId}`));
    if (result.railway.deploymentUrl) {
      console.log(chalk.green(`     🌐 Live URL: ${result.railway.deploymentUrl}`));
    }
    console.log(chalk.yellow(`     Dashboard: https://railway.app/project/${result.railway.projectId}`));
  }

  console.log(chalk.blue('\n🎉 Your app is now live!'));
  console.log(chalk.gray('━'.repeat(50)));
}

// CLI interface
const program = new Command();

program
  .name('deploy-full-stack')
  .description('Deploy an AI-generated app to Supabase and Railway')
  .version('1.0.0');

program
  .command('deploy')
  .description('Deploy an application')
  .requiredOption('-n, --name <name>', 'Application name')
  .requiredOption('-p, --path <path>', 'Path to application directory')
  .option('-r, --region <region>', 'Deployment region', 'us-east-1')
  .option('--skip-supabase', 'Skip Supabase setup')
  .option('--skip-railway', 'Skip Railway deployment')
  .option('--supabase-project <id>', 'Use existing Supabase project')
  .option('--supabase-password <password>', 'Database password for existing Supabase project')
  .option('--railway-project <id>', 'Use existing Railway project')
  .action(async (options) => {
    try {
      // Load config to validate tokens
      loadConfig();

      const result = await deployFullStack({
        appName: options.name,
        appPath: path.resolve(options.path),
        region: options.region,
        skipSupabase: options.skipSupabase,
        skipRailway: options.skipRailway,
        supabaseProjectId: options.supabaseProject,
        supabaseDatabasePassword: options.supabasePassword,
        railwayProjectId: options.railwayProject,
      });

      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error}`));
      process.exit(1);
    }
  });

// Quick deploy command for common use case
program
  .command('quick')
  .description('Quick deploy with defaults')
  .requiredOption('-n, --name <name>', 'Application name')
  .requiredOption('-p, --path <path>', 'Path to application directory')
  .action(async (options) => {
    try {
      loadConfig();

      const result = await deployFullStack({
        appName: options.name,
        appPath: path.resolve(options.path),
      });

      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error}`));
      process.exit(1);
    }
  });

program.parse();

// Export for use as a module
export { deployFullStack, DeploymentResult };