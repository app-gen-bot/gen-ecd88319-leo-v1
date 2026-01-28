import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
import { loadConfig, sanitizeProjectName } from './config.js';
import path from 'path';

const execAsync = promisify(exec);

export interface RailwayProject {
  id: string;
  name: string;
  createdAt: string;
  environments: {
    id: string;
    name: string;
  }[];
  deploymentUrl?: string;
}

export interface CreateRailwayProjectOptions {
  name: string;
  environment?: string;
  variables?: Record<string, string>;
  projectPath?: string;
}

/**
 * Create a new Railway project using the CLI or GraphQL API
 */
export async function createRailwayProject(options: CreateRailwayProjectOptions): Promise<RailwayProject> {
  const config = loadConfig();
  const spinner = ora('Creating Railway project...').start();

  try {
    const projectName = sanitizeProjectName(options.name);
    
    // Method 1: Try using Railway CLI if available
    const cliProject = await createViaRailwayCLI(projectName, spinner);
    if (cliProject) {
      return cliProject;
    }

    // Method 2: Use Railway GraphQL API
    spinner.text = 'Creating project via Railway API...';
    return await createViaRailwayAPI(projectName, config.railway.apiToken, spinner);
  } catch (error) {
    spinner.fail(chalk.red('Failed to create Railway project'));
    
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    }
    
    throw error;
  }
}

/**
 * Create project using Railway CLI
 */
async function createViaRailwayCLI(projectName: string, spinner: ora.Ora): Promise<RailwayProject | null> {
  try {
    // Check if Railway CLI is installed
    await execAsync('railway --version');
    
    spinner.text = `Creating project "${projectName}" via Railway CLI...`;
    
    // Create project with JSON output
    const { stdout } = await execAsync(`railway init --name "${projectName}" --json`, {
      env: {
        ...process.env,
        RAILWAY_NO_OPEN: 'true', // Prevent opening browser
      },
    });

    const project = JSON.parse(stdout);
    
    spinner.succeed(chalk.green(`✅ Railway project "${projectName}" created via CLI!`));
    
    return {
      id: project.id,
      name: project.name,
      createdAt: new Date().toISOString(),
      environments: project.environments || [
        { id: project.environmentId, name: 'production' }
      ],
    };
  } catch (error) {
    // CLI not available or failed, return null to try API method
    return null;
  }
}

/**
 * Create project using Railway GraphQL API
 */
async function createViaRailwayAPI(
  projectName: string,
  apiToken: string,
  spinner: ora.Ora
): Promise<RailwayProject> {
  const query = `
    mutation CreateProject($name: String!) {
      projectCreate(input: { name: $name }) {
        id
        name
        createdAt
        environments {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    'https://backboard.railway.com/graphql/v2',
    {
      query,
      variables: { name: projectName },
    },
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.data.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
  }

  const project = response.data.data.projectCreate;
  
  spinner.succeed(chalk.green(`✅ Railway project "${projectName}" created via API!`));
  
  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    environments: project.environments.edges.map((e: any) => ({
      id: e.node.id,
      name: e.node.name,
    })),
  };
}

/**
 * Set environment variables for a Railway project
 */
export async function setRailwayEnvironmentVariables(
  projectId: string,
  environmentId: string,
  variables: Record<string, string>
): Promise<void> {
  const config = loadConfig();
  const spinner = ora('Setting environment variables...').start();

  try {
    // Try CLI first
    const cliSuccess = await setVariablesViaCLI(variables);
    if (cliSuccess) {
      spinner.succeed(chalk.green('✅ Environment variables set via CLI'));
      return;
    }

    // Fallback to API
    await setVariablesViaAPI(projectId, environmentId, variables, config.railway.apiToken);
    spinner.succeed(chalk.green('✅ Environment variables set via API'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to set environment variables'));
    throw error;
  }
}

async function setVariablesViaCLI(variables: Record<string, string>): Promise<boolean> {
  try {
    for (const [key, value] of Object.entries(variables)) {
      await execAsync(`railway variables set "${key}=${value}"`);
    }
    return true;
  } catch {
    return false;
  }
}

async function setVariablesViaAPI(
  projectId: string,
  environmentId: string,
  variables: Record<string, string>,
  apiToken: string
): Promise<void> {
  const query = `
    mutation SetVariables($projectId: String!, $environmentId: String!, $variables: VariableCollectionInput!) {
      variableCollectionUpsert(
        projectId: $projectId,
        environmentId: $environmentId,
        variables: $variables
      )
    }
  `;

  await axios.post(
    'https://backboard.railway.com/graphql/v2',
    {
      query,
      variables: {
        projectId,
        environmentId,
        variables,
      },
    },
    {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Deploy a project to Railway
 */
export async function deployToRailway(
  projectPath: string,
  projectId?: string
): Promise<{ deploymentId: string; deploymentUrl?: string }> {
  const spinner = ora('Deploying to Railway...').start();

  try {
    // Change to project directory
    process.chdir(projectPath);

    // Link project if ID provided
    if (projectId) {
      await execAsync(`railway link ${projectId}`);
    }

    // Deploy using Railway CLI
    const { stdout } = await execAsync('railway up --json', {
      env: {
        ...process.env,
        RAILWAY_NO_OPEN: 'true',
      },
    });

    const deployment = JSON.parse(stdout);
    
    spinner.succeed(chalk.green('✅ Deployed to Railway successfully!'));
    
    // Get deployment URL
    const urlResult = await execAsync('railway domain').catch(() => null);
    const deploymentUrl = urlResult?.stdout?.trim();

    return {
      deploymentId: deployment.id || 'unknown',
      deploymentUrl,
    };
  } catch (error) {
    spinner.fail(chalk.red('Failed to deploy to Railway'));
    throw error;
  }
}

// CLI interface if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectName = process.argv[2] || 'test-project';
  
  createRailwayProject({ name: projectName })
    .then(project => {
      console.log(chalk.green('\n📋 Railway Project Details:'));
      console.log(chalk.cyan(`   ID: ${project.id}`));
      console.log(chalk.cyan(`   Name: ${project.name}`));
      console.log(chalk.cyan(`   Environments: ${project.environments.map(e => e.name).join(', ')}`));
    })
    .catch(error => {
      process.exit(1);
    });
}