import Docker from 'dockerode';
import { EventEmitter } from 'events';
import { getSupabasePoolManager, SupabaseCredentials } from './supabase-pool.js';

/**
 * Docker Manager for Leo Container Orchestration (Leo SaaS)
 *
 * Manages the lifecycle of Leo container instances for app generation.
 * Each container runs the leo-container image and connects to the WSI Server
 * to receive generation commands and report progress.
 *
 * Architecture:
 * - One container per generation request
 * - Containers connect to WSI Server at ws://host:port/wsi
 * - Environment variables configure the generation (prompt, mode, iterations)
 * - Named volumes persist workspace data
 * - Auto-cleanup on exit with configurable timeout
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Container spawn configuration
 */
export interface ContainerSpawnConfig {
  /** Unique request identifier for WebSocket routing */
  requestId: string;
  /** User's app generation prompt */
  prompt: string;
  /** Generation mode: interactive, confirm_first, or autonomous */
  mode: 'interactive' | 'confirm_first' | 'autonomous';
  /** Maximum iterations for autonomous mode */
  maxIterations: number;
  /** Application name (used for directory/repo naming) */
  appName: string;
  /** User ID (UUID) - REQUIRED for GitHub repo naming (privacy) */
  userId: string;
  /** App ID (UUID) - for GitHub repo naming */
  appId?: string;
  /** GitHub repo owner (default: app-gen-bot) */
  githubOwner?: string;
  /** Is this a resume (not new generation)? */
  isResume?: boolean;
  /** Optional: Resume from existing app path */
  resumeFromPath?: string;
  /** Optional: Resume from specific session ID */
  resumeSessionId?: string;
  /** Optional: Custom output directory (default: /workspace/app) */
  outputDir?: string;
  /** Optional: GitHub URL to clone for resume (container will clone to workspace) */
  githubUrl?: string;
}

/**
 * Container status information
 */
export interface ContainerStatus {
  /** Container ID */
  id: string;
  /** Request ID associated with this container */
  requestId: string;
  /** Container state (running, exited, etc.) */
  state: string;
  /** Container start time */
  startedAt: Date | null;
  /** Container finish time */
  finishedAt: Date | null;
  /** Exit code (if exited) */
  exitCode: number | null;
  /** Container uptime in milliseconds */
  uptime: number | null;
}

/**
 * Container lifecycle events
 */
export interface ContainerEvents {
  spawn: (requestId: string, containerId: string) => void;
  start: (requestId: string, containerId: string) => void;
  stop: (requestId: string, containerId: string) => void;
  error: (requestId: string, error: Error) => void;
  timeout: (requestId: string, containerId: string) => void;
}

// ============================================================================
// DOCKER MANAGER CLASS
// ============================================================================

export class DockerManager extends EventEmitter {
  private docker: Docker;
  private containers: Map<string, Docker.Container>;
  private timeouts: Map<string, NodeJS.Timeout>;

  // Configuration
  private readonly IMAGE_NAME: string;
  private readonly WS_BASE_URL: string;
  private readonly MAX_TIMEOUT_MS: number;
  private readonly NETWORK_MODE: string;
  private readonly CPU_LIMIT: number;
  private readonly MEMORY_LIMIT: number;

  constructor() {
    super();

    // Initialize Docker client
    this.docker = new Docker({
      socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
    });

    // Container tracking
    this.containers = new Map();
    this.timeouts = new Map();

    // Configuration - use environment or defaults
    // Image: Use LEO_CONTAINER_IMAGE env var or default to latest build
    this.IMAGE_NAME = process.env.LEO_CONTAINER_IMAGE || 'leo-container:dev';

    // WebSocket URL: Container connects to WSI Server at /wsi path
    // For leo-saas: WSI Server runs in Express, container connects via host.docker.internal
    const port = process.env.PORT || '5013';
    this.WS_BASE_URL = process.env.WS_BASE_URL || `ws://host.docker.internal:${port}/wsi`;

    this.MAX_TIMEOUT_MS = 86400000; // 24 hours (long-running generations)
    this.NETWORK_MODE = 'bridge';
    this.CPU_LIMIT = 2.0;
    this.MEMORY_LIMIT = 4294967296; // 4GB

    // Log configuration
    console.log('🐳 Docker Manager initialized');
    console.log(`   Image: ${this.IMAGE_NAME}`);
    console.log(`   WebSocket: ${this.WS_BASE_URL}`);
    console.log(`   Timeout: ${Math.round(this.MAX_TIMEOUT_MS / 3600000)}h`);
    console.log(`   Resources: ${this.CPU_LIMIT} CPUs, ${Math.round(this.MEMORY_LIMIT / 1024 / 1024 / 1024)}GB RAM`);
  }

  /** Get the configured container image name */
  get imageName(): string {
    return this.IMAGE_NAME;
  }

  /**
   * Spawn a new Leo container for app generation
   *
   * Creates and starts a Docker container with the specified configuration.
   * The container will connect to the WSI Server and await generation commands.
   *
   * @param config Container spawn configuration
   * @returns Container ID
   * @throws Error if container creation or start fails
   */
  async spawnContainer(config: ContainerSpawnConfig): Promise<string> {
    const { requestId, prompt, mode, maxIterations, appName, userId, appId, githubOwner, isResume, resumeFromPath, resumeSessionId, outputDir, githubUrl } = config;

    console.log(`🚀 Spawning container for request: ${requestId}`);
    console.log(`   App: ${appName}`);
    console.log(`   Mode: ${mode}`);
    console.log(`   Max iterations: ${maxIterations}`);

    try {
      // Check if container already exists for this request
      if (this.containers.has(requestId)) {
        throw new Error(`Container already exists for request: ${requestId}`);
      }

      // WSI Server URL - container connects directly to /wsi endpoint
      const wsUrl = this.WS_BASE_URL;

      // Acquire Supabase credentials from pool manager (optional for local dev)
      const supabasePool = getSupabasePoolManager();
      let supabaseCreds: SupabaseCredentials | null = null;

      try {
        supabaseCreds = supabasePool.acquire(requestId);
      } catch (error) {
        // In local dev mode, Supabase is optional
        if (process.env.LOCAL_DEV === 'true') {
          console.warn(`⚠️  No Supabase credentials (local dev mode) - container will run without database`);
        } else {
          console.error(`❌ Failed to acquire Supabase credentials:`, error);
          throw error;
        }
      }

      // Prepare environment variables
      // NOTE: Container loads platform secrets from AWS Secrets Manager
      // User secrets (CLAUDE_CODE_OAUTH_TOKEN) come from .env file mounted into container
      const env = [
        `WS_URL=${wsUrl}`,
        `REQUEST_ID=${requestId}`,
        `GENERATION_ID=${requestId}`, // Container expects GENERATION_ID
        `PROMPT=${prompt}`,
        `MODE=${mode}`, // Execution mode: autonomous, interactive, confirm_first
        `GENERATOR_MODE=real`, // Use real Leo AppGeneratorAgent (not mock)
        `MAX_ITERATIONS=${maxIterations}`,
        `APP_NAME=${appName}`,
        `ENABLE_EXPANSION=false`, // Always false for WSI protocol
        // User and App IDs for GitHub repo naming (UUIDs required for privacy)
        `USER_ID=${userId}`,
        `APP_ID=${appId || requestId}`,
        // GitHub configuration
        `GITHUB_OWNER=${githubOwner || 'app-gen-bot'}`,
        `GITHUB_BOT_TOKEN=${process.env.GITHUB_BOT_TOKEN || ''}`,
        `IS_RESUME=${isResume ? 'true' : 'false'}`,
        // AWS config - hardcoded profile for platform secrets
        `AWS_REGION=${process.env.AWS_REGION || 'us-east-1'}`,
        `AWS_PROFILE=jake-dev`,
        // User secret - passed from environment (loaded from .env by run script)
        `CLAUDE_CODE_OAUTH_TOKEN=${process.env.CLAUDE_CODE_OAUTH_TOKEN || ''}`,
      ];

      // Add Supabase credentials based on mode (if available)
      if (supabaseCreds?.supabaseUrl) {
        // Pooled mode: pass direct credentials
        env.push(`SUPABASE_URL=${supabaseCreds.supabaseUrl}`);
        env.push(`SUPABASE_ANON_KEY=${supabaseCreds.supabaseAnonKey}`);
        env.push(`SUPABASE_SERVICE_ROLE_KEY=${supabaseCreds.supabaseServiceRoleKey}`);
        // Pass both database URLs from Leo Pipeline Configuration
        // DATABASE_URL (direct, port 5432) - for migrations
        // DATABASE_URL_POOLING (pooled, port 6543) - for runtime
        env.push(`DATABASE_URL=${process.env.DATABASE_URL || supabaseCreds.databaseUrl}`);
        if (process.env.DATABASE_URL_POOLING) {
          env.push(`DATABASE_URL_POOLING=${process.env.DATABASE_URL_POOLING}`);
        }
      } else if (supabaseCreds?.supabaseAccessToken) {
        // Per-app mode: pass access token for agent to create project
        env.push(`SUPABASE_ACCESS_TOKEN=${supabaseCreds.supabaseAccessToken}`);
      }

      // Add optional environment variables
      if (resumeFromPath) {
        env.push(`RESUME_FROM_PATH=${resumeFromPath}`);
      }
      if (resumeSessionId) {
        env.push(`RESUME_SESSION_ID=${resumeSessionId}`);
      }
      if (outputDir) {
        env.push(`OUTPUT_DIR=${outputDir}`);
      }
      // Resume from GitHub - container will clone the repo to workspace
      if (githubUrl) {
        env.push(`GITHUB_CLONE_URL=${githubUrl}`);
        console.log(`   Cloning from: ${githubUrl}`);
      }

      // Create named volume for workspace persistence
      const volumeName = `leo-workspace-${requestId}`;

      // Build HostConfig - ExtraHosts only needed on Linux (Docker Desktop handles it on macOS/Windows)
      const isLinux = process.platform === 'linux';
      const extraHosts: string[] = [];
      if (isLinux) {
        // On Linux, host.docker.internal doesn't exist by default
        const dockerHostIp = process.env.DOCKER_HOST_IP || '172.17.0.1';
        extraHosts.push(`host.docker.internal:${dockerHostIp}`);
      }

      // Container configuration
      const containerConfig: Docker.ContainerCreateOptions = {
        Image: this.IMAGE_NAME,
        name: `leo-gen-${requestId}`,
        Env: env,
        HostConfig: {
          // Network configuration
          NetworkMode: this.NETWORK_MODE,

          // Linux Docker compatibility: map host.docker.internal to docker0
          // On macOS/Windows Docker Desktop, this is handled automatically
          ...(extraHosts.length > 0 && { ExtraHosts: extraHosts }),

          // Volume mounting for workspace persistence
          Binds: [
            `${volumeName}:/workspace`,
            // Mount AWS credentials for local development (container will load secrets from AWS Secrets Manager)
            // In Fargate, ECS task role provides credentials automatically
            // Note: Container runs as leo-user (UID 1000), so mount to /home/leo-user/.aws
            `${process.env.HOME}/.aws:/home/leo-user/.aws:ro`,
          ],

          // Auto-remove container on exit
          AutoRemove: false, // Temporarily disabled for debugging

          // Resource limits
          NanoCpus: Math.round(this.CPU_LIMIT * 1e9), // Convert to nanocpus
          Memory: this.MEMORY_LIMIT,

          // Security: read-only root filesystem except /workspace and /tmp
          ReadonlyRootfs: false, // Set to true in production with proper volume mounts

          // Prevent privilege escalation
          SecurityOpt: ['no-new-privileges'],
        },
        Labels: {
          'leo.saas.request-id': requestId,
          'leo.saas.app-name': appName,
          'leo.saas.mode': mode,
          'leo.saas.managed-by': 'leo-docker-manager',
        },
        // Attach stdin/stdout for logging (optional)
        AttachStdout: true,
        AttachStderr: true,
      };

      // Create container
      const container = await this.docker.createContainer(containerConfig);
      const containerId = container.id;

      console.log(`✅ Container created: ${containerId}`);
      this.emit('spawn', requestId, containerId);

      // Store container reference
      this.containers.set(requestId, container);

      // Start container
      await container.start();
      console.log(`▶️  Container started: ${containerId}`);
      this.emit('start', requestId, containerId);

      // Set timeout for maximum execution time
      this.setupTimeout(requestId, containerId);

      return containerId;
    } catch (error) {
      console.error(`❌ Failed to spawn container for ${requestId}:`, error);
      this.emit('error', requestId, error as Error);

      // Cleanup on failure
      await this.cleanupContainer(requestId).catch(err => {
        console.error(`Failed to cleanup after spawn error:`, err);
      });

      throw error;
    }
  }

  /**
   * Stop and remove a container
   *
   * Gracefully stops a running container with SIGTERM, then forcefully kills
   * it if it doesn't stop within the grace period.
   *
   * @param requestId Request identifier
   * @param timeout Grace period in seconds (default: 10)
   * @returns true if stopped successfully, false if container not found
   */
  async stopContainer(requestId: string, timeout: number = 10): Promise<boolean> {
    console.log(`🛑 Stopping container for request: ${requestId}`);

    const container = this.containers.get(requestId);
    if (!container) {
      console.warn(`⚠️  No container found for request: ${requestId}`);
      return false;
    }

    try {
      // Clear timeout if exists
      this.clearTimeout(requestId);

      // Stop container with grace period
      await container.stop({ t: timeout });
      console.log(`✅ Container stopped: ${container.id}`);
      this.emit('stop', requestId, container.id);

      // Cleanup
      await this.cleanupContainer(requestId);

      return true;
    } catch (error: any) {
      // Container might already be stopped
      if (error.statusCode === 304) {
        console.log(`ℹ️  Container already stopped: ${container.id}`);
        await this.cleanupContainer(requestId);
        return true;
      }

      // Container might not exist
      if (error.statusCode === 404) {
        console.warn(`⚠️  Container not found: ${container.id}`);
        await this.cleanupContainer(requestId);
        return false;
      }

      console.error(`❌ Failed to stop container for ${requestId}:`, error);
      this.emit('error', requestId, error);
      throw error;
    }
  }

  /**
   * Get container status and information
   *
   * @param requestId Request identifier
   * @returns Container status or null if not found
   */
  async getContainerStatus(requestId: string): Promise<ContainerStatus | null> {
    const container = this.containers.get(requestId);
    if (!container) {
      return null;
    }

    try {
      const info = await container.inspect();

      const startedAt = info.State.StartedAt ? new Date(info.State.StartedAt) : null;
      const finishedAt = info.State.FinishedAt ? new Date(info.State.FinishedAt) : null;

      let uptime: number | null = null;
      if (startedAt && info.State.Running) {
        uptime = Date.now() - startedAt.getTime();
      }

      return {
        id: container.id,
        requestId,
        state: info.State.Status,
        startedAt,
        finishedAt,
        exitCode: info.State.ExitCode,
        uptime,
      };
    } catch (error: any) {
      if (error.statusCode === 404) {
        // Container no longer exists
        await this.cleanupContainer(requestId);
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if a container is running
   *
   * @param requestId Request identifier
   * @returns true if running, false otherwise
   */
  async isContainerRunning(requestId: string): Promise<boolean> {
    const status = await this.getContainerStatus(requestId);
    return status?.state === 'running';
  }

  /**
   * List all Leo containers managed by this instance
   *
   * @returns Array of container statuses
   */
  async listContainers(): Promise<ContainerStatus[]> {
    const statuses: ContainerStatus[] = [];

    for (const requestId of this.containers.keys()) {
      const status = await this.getContainerStatus(requestId);
      if (status) {
        statuses.push(status);
      }
    }

    return statuses;
  }

  /**
   * List all Leo containers from Docker (including untracked ones)
   *
   * Useful for finding orphaned containers or recovering from manager restart.
   *
   * @returns Array of container info
   */
  async listAllLeoContainers(): Promise<Docker.ContainerInfo[]> {
    const containers = await this.docker.listContainers({
      all: true,
      filters: {
        label: ['leo.saas.managed-by=leo-docker-manager'],
      },
    });

    return containers;
  }

  /**
   * Get container logs
   *
   * @param requestId Request identifier
   * @param tail Number of lines to retrieve (default: 100)
   * @returns Log output as string
   */
  async getContainerLogs(requestId: string, tail: number = 100): Promise<string> {
    const container = this.containers.get(requestId);
    if (!container) {
      throw new Error(`Container not found for request: ${requestId}`);
    }

    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: true,
    });

    return logs.toString('utf-8');
  }

  /**
   * Cleanup orphaned containers
   *
   * Finds and removes containers that are no longer tracked but still exist.
   * Useful for recovering from unexpected shutdowns or manager restarts.
   *
   * @param olderThanHours Only cleanup containers older than this (default: 24)
   * @returns Number of containers cleaned up
   */
  async cleanupOrphanedContainers(olderThanHours: number = 24): Promise<number> {
    console.log('🧹 Cleaning up orphaned containers...');

    const allContainers = await this.listAllLeoContainers();
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
    let cleanedCount = 0;

    for (const containerInfo of allContainers) {
      const createdAt = containerInfo.Created * 1000; // Convert to ms

      // Skip if too recent
      if (createdAt > cutoffTime) {
        continue;
      }

      // Extract request ID from labels
      const requestId = containerInfo.Labels?.['leo.saas.request-id'];
      if (!requestId) {
        continue;
      }

      // Skip if still tracked
      if (this.containers.has(requestId)) {
        continue;
      }

      // Stop and remove orphaned container
      try {
        const container = this.docker.getContainer(containerInfo.Id);

        if (containerInfo.State === 'running') {
          await container.stop({ t: 5 });
        }

        // Note: AutoRemove should handle removal, but ensure cleanup
        console.log(`✅ Cleaned up orphaned container: ${containerInfo.Id} (request: ${requestId})`);
        cleanedCount++;
      } catch (error) {
        console.error(`Failed to cleanup container ${containerInfo.Id}:`, error);
      }
    }

    console.log(`🧹 Cleaned up ${cleanedCount} orphaned containers`);
    return cleanedCount;
  }

  /**
   * Shutdown manager and cleanup all containers
   *
   * Should be called on application shutdown to ensure clean exit.
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Docker Manager...');

    // Clear all timeouts
    for (const requestId of this.timeouts.keys()) {
      this.clearTimeout(requestId);
    }

    // Stop all tracked containers
    const stopPromises = Array.from(this.containers.keys()).map(requestId =>
      this.stopContainer(requestId, 5).catch(err => {
        console.error(`Failed to stop container ${requestId} during shutdown:`, err);
      })
    );

    await Promise.all(stopPromises);

    console.log('✅ Docker Manager shutdown complete');
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Setup timeout for container execution
   */
  private setupTimeout(requestId: string, containerId: string): void {
    const timeout = setTimeout(async () => {
      console.warn(`⏰ Container timeout reached for ${requestId} (${this.MAX_TIMEOUT_MS}ms)`);
      this.emit('timeout', requestId, containerId);

      try {
        await this.stopContainer(requestId, 5);
      } catch (error) {
        console.error(`Failed to stop timed-out container:`, error);
      }
    }, this.MAX_TIMEOUT_MS);

    this.timeouts.set(requestId, timeout);
  }

  /**
   * Clear timeout for a request
   */
  private clearTimeout(requestId: string): void {
    const timeout = this.timeouts.get(requestId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(requestId);
    }
  }

  /**
   * Cleanup container references and resources
   */
  private async cleanupContainer(requestId: string): Promise<void> {
    this.clearTimeout(requestId);

    const container = this.containers.get(requestId);
    if (container) {
      try {
        // Remove the container (force if still running)
        await container.remove({ force: true, v: true }); // v: true removes anonymous volumes
        console.log(`🗑️  Container removed: ${container.id.substring(0, 12)}`);
      } catch (error: any) {
        // Ignore 404 (already removed)
        if (error.statusCode !== 404) {
          console.warn(`⚠️  Failed to remove container: ${error.message}`);
        }
      }

      // Also remove the named volume
      const volumeName = `leo-workspace-${requestId}`;
      try {
        const volume = this.docker.getVolume(volumeName);
        await volume.remove();
        console.log(`🗑️  Volume removed: ${volumeName}`);
      } catch (error: any) {
        // Ignore 404 (doesn't exist) or in-use errors
        if (error.statusCode !== 404 && error.statusCode !== 409) {
          console.warn(`⚠️  Failed to remove volume: ${error.message}`);
        }
      }
    }

    // Release Supabase pool lease
    const supabasePool = getSupabasePoolManager();
    supabasePool.release(requestId);

    this.containers.delete(requestId);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Singleton Docker Manager instance
 *
 * Use this instance throughout the application to manage containers.
 * The instance is lazily initialized on first access.
 */
let instance: DockerManager | null = null;

export function getDockerManager(): DockerManager {
  if (!instance) {
    instance = new DockerManager();
  }
  return instance;
}

/**
 * Shutdown hook for graceful cleanup
 */
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal');
  if (instance) {
    await instance.shutdown();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT signal');
  if (instance) {
    await instance.shutdown();
  }
  process.exit(0);
});
