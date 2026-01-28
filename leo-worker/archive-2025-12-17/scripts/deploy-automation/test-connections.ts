#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from './config.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Test Supabase API connection
 */
async function testSupabaseConnection(): Promise<boolean> {
  const spinner = ora('Testing Supabase connection...').start();
  
  try {
    const config = loadConfig();
    
    // Test API connection
    const response = await axios.get(
      `${config.supabase.apiUrl}/v1/organizations`,
      {
        headers: {
          'Authorization': `Bearer ${config.supabase.accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      spinner.succeed(chalk.green('✅ Supabase connection successful'));
      
      // Display organization info
      const orgs = response.data;
      console.log(chalk.cyan(`   Found ${orgs.length} organization(s)`));
      
      if (config.supabase.organizationId) {
        const org = orgs.find((o: any) => o.id === config.supabase.organizationId);
        if (org) {
          console.log(chalk.gray(`   Using organization: ${org.name} (${org.id})`));
        } else {
          console.log(chalk.yellow(`   ⚠️  Configured org ID not found: ${config.supabase.organizationId}`));
        }
      }
      
      return true;
    }
    
    spinner.fail(chalk.red('❌ Supabase connection failed'));
    return false;
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Supabase connection failed'));
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error(chalk.yellow('   Invalid or expired Supabase access token'));
      } else {
        console.error(chalk.yellow(`   Error: ${error.response?.data?.message || error.message}`));
      }
    } else {
      console.error(chalk.yellow(`   Error: ${error}`));
    }
    
    return false;
  }
}

/**
 * Test Railway API connection
 */
async function testRailwayConnection(): Promise<boolean> {
  const spinner = ora('Testing Railway connection...').start();
  
  try {
    const config = loadConfig();
    
    // Test GraphQL API
    const query = `
      query {
        me {
          id
          email
          name
        }
      }
    `;
    
    const response = await axios.post(
      config.railway.apiUrl,
      { query },
      {
        headers: {
          'Authorization': `Bearer ${config.railway.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.data?.me) {
      spinner.succeed(chalk.green('✅ Railway API connection successful'));
      
      const user = response.data.data.me;
      console.log(chalk.gray(`   Authenticated as: ${user.name || user.email}`));
      
      return true;
    }
    
    spinner.fail(chalk.red('❌ Railway connection failed'));
    return false;
    
  } catch (error) {
    spinner.fail(chalk.red('❌ Railway connection failed'));
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error(chalk.yellow('   Invalid or expired Railway API token'));
      } else {
        console.error(chalk.yellow(`   Error: ${error.response?.data?.message || error.message}`));
      }
    } else {
      console.error(chalk.yellow(`   Error: ${error}`));
    }
    
    return false;
  }
}

/**
 * Test Railway CLI installation
 */
async function testRailwayCLI(): Promise<boolean> {
  const spinner = ora('Testing Railway CLI...').start();
  
  try {
    const { stdout } = await execAsync('railway --version');
    const version = stdout.trim();
    
    spinner.succeed(chalk.green(`✅ Railway CLI installed (${version})`));
    
    // Check if logged in
    try {
      await execAsync('railway whoami');
      console.log(chalk.gray('   CLI is authenticated'));
    } catch {
      console.log(chalk.yellow('   ⚠️  CLI not authenticated. Run: railway login'));
    }
    
    return true;
  } catch (error) {
    spinner.warn(chalk.yellow('⚠️  Railway CLI not installed'));
    console.log(chalk.gray('   Install with: npm install -g @railway/cli'));
    console.log(chalk.gray('   Then run: railway login'));
    return false;
  }
}

/**
 * Test Supabase CLI installation
 */
async function testSupabaseCLI(): Promise<boolean> {
  const spinner = ora('Testing Supabase CLI...').start();
  
  try {
    const { stdout } = await execAsync('supabase --version');
    const version = stdout.trim();
    
    spinner.succeed(chalk.green(`✅ Supabase CLI installed (${version})`));
    return true;
  } catch (error) {
    spinner.warn(chalk.yellow('⚠️  Supabase CLI not installed'));
    console.log(chalk.gray('   Install with: npm install -g supabase'));
    return false;
  }
}

/**
 * Main test function
 */
async function testAll(): Promise<void> {
  console.log(chalk.blue('\n🔍 Testing Deployment Pipeline Connections'));
  console.log(chalk.gray('━'.repeat(50)));

  const results = {
    supabaseAPI: false,
    railwayAPI: false,
    railwayCLI: false,
    supabaseCLI: false,
  };

  console.log(chalk.cyan('\n📡 API Connections:'));
  results.supabaseAPI = await testSupabaseConnection();
  results.railwayAPI = await testRailwayConnection();

  console.log(chalk.cyan('\n🛠️  CLI Tools:'));
  results.railwayCLI = await testRailwayCLI();
  results.supabaseCLI = await testSupabaseCLI();

  // Summary
  console.log(chalk.blue('\n📊 Summary:'));
  console.log(chalk.gray('━'.repeat(50)));

  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log(chalk.green('✅ All connections successful!'));
    console.log(chalk.green('   You are ready to deploy applications.'));
  } else {
    console.log(chalk.yellow('⚠️  Some connections failed:'));
    
    if (!results.supabaseAPI) {
      console.log(chalk.red('   ❌ Supabase API - Check SUPABASE_ACCESS_TOKEN'));
    }
    if (!results.railwayAPI) {
      console.log(chalk.red('   ❌ Railway API - Check RAILWAY_API_TOKEN'));
    }
    if (!results.railwayCLI) {
      console.log(chalk.yellow('   ⚠️  Railway CLI - Optional but recommended'));
    }
    if (!results.supabaseCLI) {
      console.log(chalk.yellow('   ⚠️  Supabase CLI - Optional but recommended'));
    }

    console.log(chalk.yellow('\n📝 Next Steps:'));
    console.log('1. Add missing tokens to the root .env file');
    console.log('2. Install optional CLIs for better experience');
    console.log('3. Run this test again to verify');
  }
}

// Run tests
testAll().catch(error => {
  console.error(chalk.red(`\n❌ Test failed: ${error}`));
  process.exit(1);
});