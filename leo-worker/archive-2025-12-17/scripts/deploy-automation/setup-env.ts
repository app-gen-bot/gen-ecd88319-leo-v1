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

// Helper to mask sensitive input (shows asterisks)
const questionMasked = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    
    stdout.write(query);
    
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    let input = '';
    
    const onData = (char: string) => {
      if (char === '\n' || char === '\r' || char === '\u0004') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        stdout.write('\n');
        resolve(input);
      } else if (char === '\u0003') {
        // Ctrl+C
        process.exit();
      } else if (char === '\u007f' || char === '\b') {
        // Backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          stdout.write('\b \b');
        }
      } else {
        input += char;
        stdout.write('*');
      }
    };
    
    stdin.on('data', onData);
  });
};

interface EnvConfig {
  SUPABASE_ACCESS_TOKEN?: string;
  SUPABASE_ORG_ID?: string;
  RAILWAY_API_TOKEN?: string;
  [key: string]: string | undefined;
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
  const envExamplePath = path.join(__dirname, '../../.env.example');
  
  // Read the example file to get the structure
  let template = '';
  try {
    template = await fs.readFile(envExamplePath, 'utf-8');
  } catch {
    // If no example file, create a basic structure
    template = `# AI App Factory Environment Configuration

# ========================================
# DEPLOYMENT AUTOMATION
# ========================================
SUPABASE_ACCESS_TOKEN=
SUPABASE_ORG_ID=
RAILWAY_API_TOKEN=

# ========================================
# AI CONFIGURATION
# ========================================
OPENAI_API_KEY=
`;
  }
  
  // Replace values in template
  let output = template;
  for (const [key, value] of Object.entries(config)) {
    if (value) {
      // Replace the line with the key
      const regex = new RegExp(`^${key}=.*$`, 'gm');
      if (regex.test(output)) {
        output = output.replace(regex, `${key}=${value}`);
      } else {
        // If key doesn't exist in template, append it
        output += `\n${key}=${value}`;
      }
    }
  }
  
  await fs.writeFile(envPath, output);
}

async function testToken(type: 'supabase' | 'railway', token: string): Promise<boolean> {
  try {
    if (type === 'supabase') {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${token}" https://api.supabase.com/v1/organizations`);
      return stdout.trim() === '200';
    } else {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '{"query":"query { me { id } }"}' https://backboard.railway.com/graphql/v2`);
      return stdout.trim() === '200';
    }
  } catch {
    return false;
  }
}

async function main() {
  console.log(chalk.blue('\n🔧 AI App Factory - Environment Setup'));
  console.log(chalk.gray('━'.repeat(50)));
  console.log(chalk.cyan('\nThis wizard will help you set up your deployment tokens.\n'));

  // Load existing config
  const config = await loadExistingEnv();
  let hasChanges = false;

  // Supabase Setup
  console.log(chalk.yellow('\n📦 Supabase Configuration'));
  console.log(chalk.gray('━'.repeat(30)));
  
  if (config.SUPABASE_ACCESS_TOKEN && config.SUPABASE_ACCESS_TOKEN !== 'your-supabase-personal-access-token-here') {
    console.log(chalk.green('✓ Supabase Access Token already configured'));
    const update = await confirm('Do you want to update it?');
    
    if (update) {
      console.log(chalk.cyan('\n📝 Get your Personal Access Token from:'));
      console.log(chalk.white('   https://supabase.com/dashboard/account/tokens'));
      console.log(chalk.gray('   1. Click "Generate New Token"'));
      console.log(chalk.gray('   2. Name it "app-factory-deployment"'));
      console.log(chalk.gray('   3. Copy the token\n'));
      
      const token = await questionMasked('Enter your Supabase Personal Access Token: ');
      if (token) {
        console.log(chalk.gray('Testing token...'));
        const isValid = await testToken('supabase', token);
        if (isValid) {
          console.log(chalk.green('✅ Token validated successfully!'));
          config.SUPABASE_ACCESS_TOKEN = token;
          hasChanges = true;
        } else {
          console.log(chalk.red('❌ Invalid token. Please check and try again.'));
        }
      }
    }
  } else {
    console.log(chalk.cyan('\n📝 Get your Personal Access Token from:'));
    console.log(chalk.white('   https://supabase.com/dashboard/account/tokens'));
    console.log(chalk.gray('   1. Click "Generate New Token"'));
    console.log(chalk.gray('   2. Name it "app-factory-deployment"'));
    console.log(chalk.gray('   3. Copy the token\n'));
    
    const token = await questionMasked('Enter your Supabase Personal Access Token: ');
    if (token) {
      console.log(chalk.gray('Testing token...'));
      const isValid = await testToken('supabase', token);
      if (isValid) {
        console.log(chalk.green('✅ Token validated successfully!'));
        config.SUPABASE_ACCESS_TOKEN = token;
        hasChanges = true;
      } else {
        console.log(chalk.red('❌ Invalid token. Please check and try again.'));
      }
    }
  }

  // Supabase Org ID
  if (config.SUPABASE_ORG_ID && config.SUPABASE_ORG_ID !== 'your-organization-id-here') {
    console.log(chalk.green('✓ Supabase Organization ID already configured'));
  } else {
    console.log(chalk.cyan('\n📝 Get your Organization ID from:'));
    console.log(chalk.white('   https://supabase.com/dashboard/org/_/general'));
    console.log(chalk.gray('   Copy the Organization ID from the page\n'));
    
    const orgId = await question('Enter your Supabase Organization ID: ');
    if (orgId) {
      config.SUPABASE_ORG_ID = orgId;
      hasChanges = true;
    }
  }

  // Railway Setup
  console.log(chalk.yellow('\n🚂 Railway Configuration'));
  console.log(chalk.gray('━'.repeat(30)));
  
  if (config.RAILWAY_API_TOKEN && config.RAILWAY_API_TOKEN !== 'your-railway-api-token-here') {
    console.log(chalk.green('✓ Railway API Token already configured'));
    const update = await confirm('Do you want to update it?');
    
    if (update) {
      console.log(chalk.cyan('\n📝 Get your API Token from:'));
      console.log(chalk.white('   https://railway.app/account/tokens'));
      console.log(chalk.gray('   1. Click "Create Token"'));
      console.log(chalk.gray('   2. Name it "app-factory-deployment"'));
      console.log(chalk.gray('   3. Copy the token\n'));
      
      const token = await questionMasked('Enter your Railway API Token: ');
      if (token) {
        console.log(chalk.gray('Testing token...'));
        const isValid = await testToken('railway', token);
        if (isValid) {
          console.log(chalk.green('✅ Token validated successfully!'));
          config.RAILWAY_API_TOKEN = token;
          hasChanges = true;
        } else {
          console.log(chalk.red('❌ Invalid token. Please check and try again.'));
        }
      }
    }
  } else {
    console.log(chalk.cyan('\n📝 Get your API Token from:'));
    console.log(chalk.white('   https://railway.app/account/tokens'));
    console.log(chalk.gray('   1. Click "Create Token"'));
    console.log(chalk.gray('   2. Name it "app-factory-deployment"'));
    console.log(chalk.gray('   3. Copy the token\n'));
    
    const token = await questionMasked('Enter your Railway API Token: ');
    if (token) {
      console.log(chalk.gray('Testing token...'));
      const isValid = await testToken('railway', token);
      if (isValid) {
        console.log(chalk.green('✅ Token validated successfully!'));
        config.RAILWAY_API_TOKEN = token;
        hasChanges = true;
      } else {
        console.log(chalk.red('❌ Invalid token. Please check and try again.'));
      }
    }
  }

  // Optional: OpenAI API Key
  console.log(chalk.yellow('\n🤖 Optional: AI Configuration'));
  console.log(chalk.gray('━'.repeat(30)));
  
  if (config.OPENAI_API_KEY && config.OPENAI_API_KEY !== 'your-api-key-here' && config.OPENAI_API_KEY !== 'your-openai-api-key-here') {
    console.log(chalk.green('✓ OpenAI API Key already configured'));
  } else {
    const addOpenAI = await confirm('Do you want to add an OpenAI API key? (optional)');
    if (addOpenAI) {
      console.log(chalk.cyan('\n📝 Get your API Key from:'));
      console.log(chalk.white('   https://platform.openai.com/api-keys'));
      
      const apiKey = await questionMasked('Enter your OpenAI API Key: ');
      if (apiKey) {
        config.OPENAI_API_KEY = apiKey;
        hasChanges = true;
      }
    }
  }

  // Save configuration
  if (hasChanges) {
    console.log(chalk.cyan('\n💾 Saving configuration...'));
    await saveEnvFile(config);
    console.log(chalk.green('✅ Configuration saved to .env file!'));
    
    // Test connections
    console.log(chalk.cyan('\n🔍 Testing connections...'));
    const { stdout } = await execAsync('npm run test-connection', { cwd: __dirname });
    console.log(stdout);
    
    console.log(chalk.green('\n✨ Setup complete!'));
    console.log(chalk.cyan('\n🚀 You can now deploy apps with:'));
    console.log(chalk.white('   cd scripts/deploy-automation'));
    console.log(chalk.white('   npm run deploy -- quick --name "my-app" --path "../../apps/notetaker/app"'));
  } else {
    console.log(chalk.yellow('\n✅ No changes made to configuration.'));
    
    // Still test connections
    const testConnections = await confirm('\nDo you want to test your existing connections?');
    if (testConnections) {
      console.log(chalk.cyan('\n🔍 Testing connections...'));
      const { stdout } = await execAsync('npm run test-connection', { cwd: __dirname });
      console.log(stdout);
    }
  }

  rl.close();
}

// Run the setup
main().catch((error) => {
  console.error(chalk.red(`\n❌ Setup failed: ${error.message}`));
  rl.close();
  process.exit(1);
});