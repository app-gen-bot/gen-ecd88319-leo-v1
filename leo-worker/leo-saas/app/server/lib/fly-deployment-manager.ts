/**
 * Fly.io Deployment Manager
 *
 * Handles automated deployment of generated apps to Fly.io.
 * Clones GitHub repos, runs flyctl commands, and reports deployment status.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

export interface DeployOptions {
  githubUrl: string;
  appName: string;
  generationId: number;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  appName?: string;
  error?: string;
  logs?: string;
}

class FlyDeploymentManager {
  private flyApiToken: string | null = null;

  constructor() {
    // Token will be initialized lazily when first needed
  }

  /**
   * Initialize Fly.io token if not already done (lazy initialization)
   */
  private ensureInitialized(): void {
    if (this.flyApiToken === null) {
      const token = process.env.FLY_API_TOKEN;
      if (token) {
        this.flyApiToken = token;
        console.log('[Fly.io] Initialized with API token');
      }
    }
  }

  /**
   * Check if Fly.io integration is enabled
   */
  isEnabled(): boolean {
    this.ensureInitialized();
    return this.flyApiToken !== null;
  }

  /**
   * Deploy an app to Fly.io
   */
  async deployApp(options: DeployOptions): Promise<DeploymentResult> {
    this.ensureInitialized();

    if (!this.flyApiToken) {
      return {
        success: false,
        error: 'Fly.io integration not configured - FLY_API_TOKEN missing',
      };
    }

    const { githubUrl, appName, generationId } = options;
    const tempDir = path.join('/tmp', `fly-deploy-${generationId}-${Date.now()}`);

    try {
      console.log(`[Fly.io] Starting deployment for ${appName}`);
      console.log(`[Fly.io] GitHub URL: ${githubUrl}`);

      // Create temp directory
      await fs.mkdir(tempDir, { recursive: true });

      // Clone the repository with authentication
      console.log(`[Fly.io] Cloning repository to ${tempDir}...`);
      const githubToken = process.env.GITHUB_BOT_TOKEN;
      if (!githubToken) {
        return {
          success: false,
          error: 'GitHub integration not configured - GITHUB_BOT_TOKEN missing',
        };
      }

      // Inject token into clone URL for authentication
      const authenticatedUrl = githubUrl.replace('https://github.com/', `https://${githubToken}@github.com/`);
      await exec(`git clone ${authenticatedUrl} ${tempDir}`, {
        env: { ...process.env },
      });
      console.log('[Fly.io] Repository cloned successfully');

      // Check if flyctl is installed
      try {
        await exec('flyctl version');
      } catch (error) {
        console.error('[Fly.io] flyctl not found in PATH');
        return {
          success: false,
          error: 'Fly.io CLI (flyctl) not installed on server. Please install: curl -L https://fly.io/install.sh | sh',
        };
      }

      // Create the app first (avoids token creation issues with launch)
      console.log('[Fly.io] Creating app...');
      try {
        await exec(`flyctl apps create ${appName} --org personal`, {
          env: {
            ...process.env,
            FLY_API_TOKEN: this.flyApiToken,
          },
        });
        console.log('[Fly.io] App created successfully');
      } catch (createError: any) {
        // Check if app already exists (case-insensitive)
        const errorMsg = createError.message.toLowerCase();
        if (!errorMsg.includes('already exists') &&
            !errorMsg.includes('name has already been taken') &&
            !errorMsg.includes('name is already taken')) {
          throw createError;
        }
        console.log('[Fly.io] App already exists, continuing with deployment...');
      }

      // Deploy to the created app
      console.log('[Fly.io] Deploying app with flyctl...');
      const { stdout, stderr } = await exec(
        `flyctl deploy --app ${appName} --now`,
        {
          cwd: tempDir,
          env: {
            ...process.env,
            FLY_API_TOKEN: this.flyApiToken,
          },
          timeout: 600000, // 10 minute timeout for deployment
        }
      );

      const combinedOutput = stdout + '\n' + stderr;
      console.log('[Fly.io] Deployment output:', combinedOutput);

      // Extract the deployed URL from output
      const url = this.extractDeployedUrl(combinedOutput, appName);

      console.log(`[Fly.io] Deployment successful: ${url}`);

      return {
        success: true,
        url,
        appName,
        logs: combinedOutput,
      };
    } catch (error: any) {
      console.error('[Fly.io] Deployment failed:', error.message);

      // Check if app already exists
      if (error.message.includes('already exists') || error.message.includes('app name is already taken')) {
        // Try to deploy to existing app instead
        try {
          console.log('[Fly.io] App exists, attempting to deploy to existing app...');
          const { stdout, stderr } = await exec('flyctl deploy --remote-only', {
            cwd: tempDir,
            env: {
              ...process.env,
              FLY_API_TOKEN: this.flyApiToken!,
            },
            timeout: 600000,
          });

          const combinedOutput = stdout + '\n' + stderr;
          const url = this.extractDeployedUrl(combinedOutput, appName);

          console.log(`[Fly.io] Deployment to existing app successful: ${url}`);

          return {
            success: true,
            url,
            appName,
            logs: combinedOutput,
          };
        } catch (deployError: any) {
          console.error('[Fly.io] Deploy to existing app also failed:', deployError.message);
          return {
            success: false,
            error: deployError.message,
            logs: deployError.stdout || deployError.stderr,
          };
        }
      }

      return {
        success: false,
        error: error.message,
        logs: error.stdout || error.stderr,
      };
    } finally {
      // Clean up temp directory
      try {
        console.log('[Fly.io] Cleaning up temp directory...');
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log('[Fly.io] Cleanup complete');
      } catch (cleanupError) {
        console.error('[Fly.io] Failed to clean up temp directory:', cleanupError);
      }
    }
  }

  /**
   * Extract the deployed URL from flyctl output
   */
  private extractDeployedUrl(output: string, appName: string): string {
    // Try to find URL in output (various patterns)
    const urlPatterns = [
      /https:\/\/[a-z0-9-]+\.fly\.dev/i,
      /Visit your newly deployed app at (https:\/\/[^\s]+)/i,
      /deployed to (https:\/\/[^\s]+)/i,
    ];

    for (const pattern of urlPatterns) {
      const match = output.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    // Fallback: construct URL from app name
    return `https://${appName}.fly.dev`;
  }

  /**
   * Check deployment status of an app
   */
  async checkStatus(appName: string): Promise<{
    deployed: boolean;
    url?: string;
    status?: string;
  }> {
    this.ensureInitialized();

    if (!this.flyApiToken) {
      return { deployed: false, status: 'Fly.io not configured' };
    }

    try {
      const { stdout } = await exec(`flyctl status --app ${appName}`, {
        env: {
          ...process.env,
          FLY_API_TOKEN: this.flyApiToken,
        },
      });

      // Check if app is running
      const isRunning = stdout.includes('running') || stdout.includes('started');
      const url = `https://${appName}.fly.dev`;

      return {
        deployed: isRunning,
        url,
        status: isRunning ? 'running' : 'stopped',
      };
    } catch (error: any) {
      if (error.message.includes('Could not find App')) {
        return { deployed: false, status: 'App not found' };
      }

      console.error('[Fly.io] Failed to check status:', error.message);
      return { deployed: false, status: 'Error checking status' };
    }
  }
}

// Singleton instance
export const flyDeploymentManager = new FlyDeploymentManager();
