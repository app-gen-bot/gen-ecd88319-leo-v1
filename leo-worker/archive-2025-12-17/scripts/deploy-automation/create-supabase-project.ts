import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig, generatePassword, sanitizeProjectName } from './config.js';

export interface SupabaseProject {
  id: string;
  name: string;
  organizationId: string;
  region: string;
  createdAt: string;
  databaseHost: string;
  databasePassword: string;
  databaseUser: string;
  databasePort: number;
  databaseName: string;
  anonKey: string;
  serviceRoleKey: string;
  url: string;
}

export interface CreateSupabaseProjectOptions {
  name: string;
  organizationId?: string;
  region?: string;
  plan?: string;
  dbPassword?: string;
}

/**
 * Create a new Supabase project using the Management API
 */
export async function createSupabaseProject(options: CreateSupabaseProjectOptions): Promise<SupabaseProject> {
  const config = loadConfig();
  const spinner = ora('Creating Supabase project...').start();

  try {
    // Sanitize project name
    const projectName = sanitizeProjectName(options.name);
    
    // Generate secure database password if not provided
    const dbPassword = options.dbPassword || generatePassword(32);
    
    // Use provided org ID or from config
    const organizationId = options.organizationId || config.supabase.organizationId;
    
    if (!organizationId) {
      throw new Error('Organization ID is required. Set SUPABASE_ORG_ID in .env or provide it as an option.');
    }

    spinner.text = `Creating project "${projectName}" in Supabase...`;

    // Create project via Management API
    const response = await axios.post(
      `${config.supabase.apiUrl}/v1/projects`,
      {
        name: projectName,
        organization_id: organizationId,
        region: options.region || config.deployment.region,
        plan: options.plan || config.deployment.plan,
        db_pass: dbPassword,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.supabase.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const project = response.data;

    spinner.text = 'Waiting for project to be ready...';

    // Poll for project status
    let isReady = false;
    let retries = 0;
    const maxRetries = 60; // 5 minutes maximum wait

    while (!isReady && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      try {
        const statusResponse = await axios.get(
          `${config.supabase.apiUrl}/v1/projects/${project.id}`,
          {
            headers: {
              'Authorization': `Bearer ${config.supabase.accessToken}`,
            },
          }
        );

        const projectStatus = statusResponse.data;
        
        if (projectStatus.status === 'ACTIVE_HEALTHY') {
          isReady = true;
          spinner.succeed(chalk.green(`✅ Supabase project "${projectName}" created successfully!`));
          
          // Return project details
          return {
            id: project.id,
            name: project.name,
            organizationId: project.organization_id,
            region: project.region,
            createdAt: project.created_at,
            databaseHost: projectStatus.database?.host || `db.${project.id}.supabase.co`,
            databasePassword: dbPassword,
            databaseUser: 'postgres',
            databasePort: projectStatus.database?.port || 5432,
            databaseName: 'postgres',
            anonKey: projectStatus.anon_key || '',
            serviceRoleKey: projectStatus.service_role_key || '',
            url: `https://${project.id}.supabase.co`,
          };
        }

        retries++;
        spinner.text = `Waiting for project to be ready... (${retries * 5}s elapsed)`;
      } catch (error) {
        retries++;
        // Continue polling even if status check fails initially
      }
    }

    throw new Error('Project creation timed out. Please check the Supabase dashboard.');
  } catch (error) {
    spinner.fail(chalk.red('Failed to create Supabase project'));
    
    if (axios.isAxiosError(error)) {
      console.error(chalk.red('\n❌ API Error:'));
      console.error(chalk.yellow(`   Status: ${error.response?.status}`));
      console.error(chalk.yellow(`   Message: ${error.response?.data?.message || error.message}`));
      
      if (error.response?.status === 401) {
        console.error(chalk.yellow('\n📝 Please check your SUPABASE_ACCESS_TOKEN in the .env file'));
      }
    } else {
      console.error(chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
    
    throw error;
  }
}

/**
 * Get API keys for an existing Supabase project
 */
export async function getSupabaseProjectKeys(projectId: string): Promise<{ anonKey: string; serviceRoleKey: string }> {
  const config = loadConfig();
  
  try {
    const response = await axios.get(
      `${config.supabase.apiUrl}/v1/projects/${projectId}/api-keys`,
      {
        headers: {
          'Authorization': `Bearer ${config.supabase.accessToken}`,
        },
      }
    );

    const keys = response.data;
    
    return {
      anonKey: keys.find((k: any) => k.name === 'anon')?.api_key || '',
      serviceRoleKey: keys.find((k: any) => k.name === 'service_role')?.api_key || '',
    };
  } catch (error) {
    console.error(chalk.red('Failed to get project API keys'));
    throw error;
  }
}

// CLI interface if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectName = process.argv[2] || 'test-project';
  
  createSupabaseProject({ name: projectName })
    .then(project => {
      console.log(chalk.green('\n📋 Project Details:'));
      console.log(chalk.cyan(`   ID: ${project.id}`));
      console.log(chalk.cyan(`   URL: ${project.url}`));
      console.log(chalk.cyan(`   Region: ${project.region}`));
      console.log(chalk.cyan(`   Database Host: ${project.databaseHost}`));
      console.log(chalk.yellow('\n⚠️  Save these credentials securely:'));
      console.log(chalk.yellow(`   Database Password: ${project.databasePassword}`));
      console.log(chalk.yellow(`   Anon Key: ${project.anonKey}`));
      console.log(chalk.yellow(`   Service Role Key: ${project.serviceRoleKey}`));
    })
    .catch(error => {
      process.exit(1);
    });
}