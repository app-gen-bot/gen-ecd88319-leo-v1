#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper to ask questions
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Helper to ask yes/no questions
const confirm = async (query: string): Promise<boolean> => {
  const answer = await question(`${query} (y/n): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
};

interface EnvConfig {
  [key: string]: string;
}

async function loadExistingEnv(): Promise<EnvConfig> {
  const envPath = path.join(__dirname, '../../.env');
  const config: EnvConfig = {};
  
  try {
    const content = await fs.readFile(envPath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  } catch (error) {
    // File doesn't exist yet, that's OK
  }
  
  return config;
}

async function saveEnvFile(config: EnvConfig): Promise<void> {
  const envPath = path.join(__dirname, '../../.env');
  
  // Read existing file to preserve structure and comments
  let existingContent = '';
  try {
    existingContent = await fs.readFile(envPath, 'utf-8');
  } catch {
    // File doesn't exist, create basic structure
    existingContent = `# AI App Factory Environment Configuration

# Deployment Automation
SUPABASE_ACCESS_TOKEN=
SUPABASE_ORG_ID=
RAILWAY_API_TOKEN=

`;
  }
  
  let output = existingContent;
  
  // Update or add each configuration value
  for (const [key, value] of Object.entries(config)) {
    if (value) {
      const regex = new RegExp(`^${key}=.*$`, 'gm');
      if (regex.test(output)) {
        // Replace existing line
        output = output.replace(regex, `${key}=${value}`);
      } else {
        // Add new line at the end
        if (!output.endsWith('\n')) output += '\n';
        output += `${key}=${value}\n`;
      }
    }
  }
  
  await fs.writeFile(envPath, output);
}

async function testToken(type: 'supabase' | 'railway', token: string): Promise<boolean> {
  try {
    if (type === 'supabase') {
      const response = await fetch('https://api.supabase.com/v1/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } else {
      const response = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'query { me { id } }' })
      });
      return response.ok;
    }
  } catch {
    return false;
  }
}

async function main() {
  console.log(chalk.blue('\n🔧 AI App Factory - Environment Setup (Simple)'));
  console.log(chalk.gray('━'.repeat(50)));
  console.log(chalk.cyan('\nThis wizard will help you set up your deployment tokens.\n'));

  // Create backup first
  const envPath = path.join(__dirname, '../../.env');
  const backupPath = path.join(__dirname, '../../.env.backup');
  
  try {
    await fs.copyFile(envPath, backupPath);
    console.log(chalk.green('✅ Created backup: .env.backup'));
  } catch {
    console.log(chalk.yellow('⚠️  No existing .env file to backup'));
  }

  // Load existing config
  const config = await loadExistingEnv();
  let hasChanges = false;

  // Display current status
  console.log(chalk.yellow('\n📋 Current Configuration:'));
  console.log(chalk.gray('━'.repeat(30)));
  console.log(`SUPABASE_ACCESS_TOKEN: ${config.SUPABASE_ACCESS_TOKEN ? chalk.green('✓ Set') : chalk.red('✗ Missing')}`);
  console.log(`SUPABASE_ORG_ID: ${config.SUPABASE_ORG_ID ? chalk.green('✓ Set') : chalk.red('✗ Missing')}`);
  console.log(`RAILWAY_API_TOKEN: ${config.RAILWAY_API_TOKEN ? chalk.green('✓ Set') : chalk.red('✗ Missing')}`);

  // Supabase Access Token
  console.log(chalk.yellow('\n📦 Supabase Personal Access Token'));
  console.log(chalk.gray('━'.repeat(40)));
  
  if (config.SUPABASE_ACCESS_TOKEN && !config.SUPABASE_ACCESS_TOKEN.includes('your-')) {
    const update = await confirm('Supabase token already set. Update it?');
    if (!update) {
      console.log(chalk.green('✓ Keeping existing Supabase token'));
    } else {
      console.log(chalk.cyan('\n📝 Get from: https://supabase.com/dashboard/account/tokens'));
      const token = await question('Enter your Supabase Personal Access Token: ');
      if (token.trim()) {
        process.stdout.write('Testing token... ');
        const isValid = await testToken('supabase', token.trim());
        if (isValid) {
          console.log(chalk.green('✅ Valid!'));
          config.SUPABASE_ACCESS_TOKEN = token.trim();
          hasChanges = true;
        } else {
          console.log(chalk.red('❌ Invalid token'));
        }
      }
    }
  } else {
    console.log(chalk.cyan('📝 Get from: https://supabase.com/dashboard/account/tokens'));
    const token = await question('Enter your Supabase Personal Access Token: ');
    if (token.trim()) {
      process.stdout.write('Testing token... ');
      const isValid = await testToken('supabase', token.trim());
      if (isValid) {
        console.log(chalk.green('✅ Valid!'));
        config.SUPABASE_ACCESS_TOKEN = token.trim();
        hasChanges = true;
      } else {
        console.log(chalk.red('❌ Invalid token'));
      }
    }
  }

  // Supabase Organization ID
  console.log(chalk.yellow('\n📦 Supabase Organization ID'));
  console.log(chalk.gray('━'.repeat(30)));
  
  if (config.SUPABASE_ORG_ID && !config.SUPABASE_ORG_ID.includes('your-')) {
    const update = await confirm('Organization ID already set. Update it?');
    if (!update) {
      console.log(chalk.green('✓ Keeping existing Organization ID'));
    } else {
      console.log(chalk.cyan('📝 Get from: https://supabase.com/dashboard/org/_/general'));
      const orgId = await question('Enter your Supabase Organization ID: ');
      if (orgId.trim()) {
        config.SUPABASE_ORG_ID = orgId.trim();
        hasChanges = true;
      }
    }
  } else {
    console.log(chalk.cyan('📝 Get from: https://supabase.com/dashboard/org/_/general'));
    const orgId = await question('Enter your Supabase Organization ID: ');
    if (orgId.trim()) {
      config.SUPABASE_ORG_ID = orgId.trim();
      hasChanges = true;
    }
  }

  // Railway API Token
  console.log(chalk.yellow('\n🚂 Railway API Token'));
  console.log(chalk.gray('━'.repeat(25)));
  
  if (config.RAILWAY_API_TOKEN && !config.RAILWAY_API_TOKEN.includes('your-')) {
    const update = await confirm('Railway token already set. Update it?');
    if (!update) {
      console.log(chalk.green('✓ Keeping existing Railway token'));
    } else {
      console.log(chalk.cyan('📝 Get from: https://railway.app/account/tokens'));
      const token = await question('Enter your Railway API Token: ');
      if (token.trim()) {
        process.stdout.write('Testing token... ');
        const isValid = await testToken('railway', token.trim());
        if (isValid) {
          console.log(chalk.green('✅ Valid!'));
          config.RAILWAY_API_TOKEN = token.trim();
          hasChanges = true;
        } else {
          console.log(chalk.red('❌ Invalid token'));
        }
      }
    }
  } else {
    console.log(chalk.cyan('📝 Get from: https://railway.app/account/tokens'));
    const token = await question('Enter your Railway API Token: ');
    if (token.trim()) {
      process.stdout.write('Testing token... ');
      const isValid = await testToken('railway', token.trim());
      if (isValid) {
        console.log(chalk.green('✅ Valid!'));
        config.RAILWAY_API_TOKEN = token.trim();
        hasChanges = true;
      } else {
        console.log(chalk.red('❌ Invalid token'));
      }
    }
  }

  // Save configuration
  if (hasChanges) {
    console.log(chalk.cyan('\n💾 Saving configuration to .env file...'));
    await saveEnvFile(config);
    console.log(chalk.green('✅ Configuration saved!'));
    
    // Test connections
    console.log(chalk.cyan('\n🔍 Testing all connections...'));
    try {
      const { stdout } = await execAsync('npm run test-connection', { cwd: __dirname });
      console.log(stdout);
    } catch (error) {
      console.log(chalk.yellow('⚠️  Connection test had issues, but tokens were saved'));
    }
    
    console.log(chalk.green('\n✨ Setup complete!'));
    console.log(chalk.cyan('\n🚀 Next step - Deploy the notetaker app:'));
    console.log(chalk.white('   npm run deploy -- quick --name "notetaker" --path "../../apps/notetaker/app"'));
  } else {
    console.log(chalk.yellow('\n✅ No changes made to configuration.'));
  }

  rl.close();
}

// Run the setup
main().catch((error) => {
  console.error(chalk.red(`\n❌ Setup failed: ${error.message}`));
  rl.close();
  process.exit(1);
});