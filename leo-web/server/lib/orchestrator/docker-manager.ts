import Docker from 'dockerode';
import path from 'path';
import fs from 'fs/promises';
import * as tar from 'tar';
import { wsManager } from '../websocket-server.js';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/tmp/generations';
const GENERATOR_IMAGE = process.env.GENERATOR_IMAGE || 'leo-websocket';  // V2 generator with native REPL protocol

// Get the WebSocket URL for containers to connect to
// In Docker, containers can reach host via host.docker.internal
const getWebSocketUrl = (jobId: string): string => {
  const host = process.env.WS_HOST || 'host.docker.internal';
  const port = process.env.PORT || '5013';
  return `ws://${host}:${port}/ws/${jobId}`;
};

export class DockerManager {
  private docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async runGeneration(generationId: number, prompt: string, mode?: string): Promise<string> {
    const containerName = `gen_${generationId}`;
    const jobId = `job_${generationId}`;
    const wsUrl = getWebSocketUrl(jobId);
    const interactionMode = mode || process.env.GENERATOR_MODE || 'autonomous';

    console.log(`[DockerManager] Creating container ${containerName}`);
    console.log(`[DockerManager] WebSocket URL: ${wsUrl}`);
    console.log(`[DockerManager] Interaction Mode: ${interactionMode}`);
    console.log(`[DockerManager] Prompt: ${prompt.substring(0, 100)}...`);

    // Pre-register WebSocket session before starting container
    // This prevents race condition where waitForReady() runs before WebSocket connects
    wsManager.registerSession(jobId);

    // Environment variables for generator container
    // AWS credentials are mounted as volume (see Binds below) for Secrets Manager access
    // Container loads CLAUDE_CODE_OAUTH_TOKEN automatically from AWS Secrets Manager on startup
    const env = [
      'PYTHONUNBUFFERED=1',
      `WS_URL=${wsUrl}`,
      `GENERATION_ID=${generationId}`,
      `PROMPT=${prompt}`,
      // MODE controls interaction level for leo-websocket: interactive, confirm_first, or autonomous
      `MODE=${interactionMode}`,
      // GENERATOR_MODE controls mock vs real Claude Code generation (hardcoded to real)
      'GENERATOR_MODE=real',
      // AWS configuration for Secrets Manager SDK (matches orchestrator pattern)
      `AWS_REGION=${process.env.AWS_REGION || 'us-east-1'}`,
      `AWS_PROFILE=${process.env.AWS_PROFILE || 'default'}`,
      // Set HOME so boto3 can find credentials at /home/leouser/.aws
      'HOME=/home/leouser',
    ];

    try {
      const container = await this.docker.createContainer({
        Image: GENERATOR_IMAGE,
        name: containerName,
        Tty: false,
        Env: env,
        HostConfig: {
          NetworkMode: process.env.DOCKER_NETWORK || 'bridge',
          // Map host.docker.internal to host gateway (for Mac/Linux)
          ExtraHosts: ['host.docker.internal:host-gateway'],
          // Mount AWS credentials for Secrets Manager access
          // Note: Must mount from actual host path (passed via HOST_AWS_CREDENTIALS_PATH)
          // Generator container runs as 'leo-user' user, so mount to /home/leo-user/.aws
          Binds: [
            `${process.env.HOST_AWS_CREDENTIALS_PATH || '/root/.aws'}:/home/leo-user/.aws:ro`,
          ],
        },
      });

      console.log(`[DockerManager] Starting container ${containerName}`);
      await container.start();

      // Wait for container to connect via WebSocket
      console.log(`[DockerManager] Waiting for container to connect...`);
      await wsManager.waitForReady(jobId, 30000);

      // Send the initial prompt with mode
      console.log(`[DockerManager] Sending initial prompt to container with mode=${interactionMode}...`);
      const sent = wsManager.sendCommand(jobId, prompt, interactionMode);
      if (!sent) {
        throw new Error('Failed to send prompt to container');
      }

      return container.id;
    } catch (error) {
      console.error(`[DockerManager] Failed to create/start container:`, error);
      // Cleanup WebSocket session if container failed to start
      wsManager.cleanup(jobId);
      throw error;
    }
  }

  async waitForCompletion(_containerId: string, generationId: number, timeoutMs: number = 3600000): Promise<boolean> {
    const jobId = `job_${generationId}`;

    try {
      // Wait for WebSocket to signal completion
      await wsManager.waitForCompletion(jobId, timeoutMs);
      console.log(`[DockerManager] Generation ${jobId} completed successfully`);
      return true;
    } catch (error) {
      console.error(`[DockerManager] Generation ${jobId} failed:`, error);
      return false;
    }
  }

  async extractFiles(generationId: number, containerId: string): Promise<string> {
    const container = this.docker.getContainer(containerId);
    const workspacePath = path.join(WORKSPACE_DIR, generationId.toString());
    const appPath = path.join(workspacePath, 'app');

    // Create workspace directory for extracted files
    await fs.mkdir(workspacePath, { recursive: true });

    try {
      console.log(`[DockerManager] Extracting files from container ${containerId}`);

      // Copy /workspace/app from container to host
      const stream = await container.getArchive({ path: '/workspace/app' });

      // Extract tar stream to host directory
      await new Promise<void>((resolve, reject) => {
        stream.pipe(
          tar.extract({
            cwd: workspacePath,
            strip: 0, // Keep directory structure
          })
        )
        .on('finish', () => resolve())
        .on('error', reject);
      });

      console.log(`[DockerManager] Files extracted to: ${appPath}`);
      return appPath;
    } catch (error) {
      console.error(`[DockerManager] Failed to extract files from container:`, error);
      throw error;
    }
  }

  async stopContainer(containerId: string, generationId: number): Promise<void> {
    const container = this.docker.getContainer(containerId);
    const jobId = `job_${generationId}`;

    try {
      const info = await container.inspect();
      if (info.State.Running) {
        console.log(`[DockerManager] Stopping container ${containerId}`);
        await container.stop({ t: 10 }); // 10 second grace period
      }

      // TODO: TEMPORARY - Container removal disabled for debugging
      // TODO: Re-enable container.remove() after debugging is complete
      // Remove container after stopping
      // console.log(`[DockerManager] Removing container ${containerId}`);
      // await container.remove();
      console.log(`[DockerManager] ⚠️  Container ${containerId} stopped but NOT removed (debugging mode)`);
    } catch (error) {
      console.error(`[DockerManager] Failed to stop/remove container:`, error);
      // Don't throw - cleanup is best effort
    } finally {
      // Always cleanup WebSocket session
      wsManager.cleanup(jobId);
    }
  }

  async getGenerationLogs(generationId: number): Promise<string[]> {
    const jobId = `job_${generationId}`;
    const logs = wsManager.getLogs(jobId);
    return logs.map(log => `[${log.timestamp}] ${log.line}`);
  }

  async getContainerLogs(containerId: string): Promise<string> {
    const container = this.docker.getContainer(containerId);

    try {
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        timestamps: true,
      });
      return logs.toString();
    } catch (error) {
      console.error(`[DockerManager] Failed to get container logs:`, error);
      return 'Failed to retrieve logs';
    }
  }
}

export const dockerManager = new DockerManager();
