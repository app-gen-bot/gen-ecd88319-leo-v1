import Docker from 'dockerode';
import { EventEmitter } from 'events';
import { getSupabasePoolManager, SupabaseCredentials } from './supabase-pool.js';
import {
  IContainerManager,
  ContainerSpawnConfig,
  ContainerStatus,
  ContainerEvents,
} from './container-manager-interface.js';

// Re-export types for backwards compatibility
export type { ContainerSpawnConfig, ContainerStatus, ContainerEvents };

/**
 * Docker Container Manager for Leo Container Orchestration (Leo SaaS)
 *
 * Implements IContainerManager for local Docker container management.
 * Used in development mode (USE_AWS_ORCHESTRATOR=false).
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
// DOCKER MANAGER CLASS
// ============================================================================

export class DockerContainerManager extends EventEmitter implements IContainerManager {
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
    // Image: Use GENERATOR_IMAGE env var - NO FALLBACK (fail fast if not set)
    const generatorImage = process.env.GENERATOR_IMAGE;
    if (!generatorImage) {
      throw new Error('FATAL: GENERATOR_IMAGE not set. Set in .env.local (e.g., leo-container:abc123)');
    }
    this.IMAGE_NAME = generatorImage;

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

    // Initialize Docker Events listener (Layer 2: real-time container death detection)
    this.initDockerEvents();

    // Startup orphan cleanup (Layer 4: clean up containers from previous runs)
    this.cleanupOrphanedContainersOnStartup();
  }

  /**
   * Initialize Docker Events listener for real-time container death detection
   *
   * Layer 2 of cleanup: When a container dies (crashes, exits, is killed),
   * Docker sends an event. We catch it and clean up resources immediately.
   * This catches containers that crash before WSI disconnect can trigger cleanup.
   */
  private async initDockerEvents(): Promise<void> {
    try {
      const stream = await this.docker.getEvents({
        filters: {
          type: ['container'],
          event: ['die'],
          label: ['leo.saas.managed-by=leo-docker-manager'],
        },
      });

      stream.on('data', (chunk: Buffer) => {
        try {
          const event = JSON.parse(chunk.toString());
          const requestId = event.Actor?.Attributes?.['leo.saas.request-id'];
          const containerId = event.Actor?.ID;
          const exitCode = event.Actor?.Attributes?.exitCode;

          if (requestId) {
            console.log(`🔔 Docker Event: Container died for request ${requestId} (exit code: ${exitCode})`);

            // Clean up resources - volume and pool lease
            // Note: Container itself is auto-removed by AutoRemove: true
            this.handleContainerDeath(requestId, containerId, exitCode);
          }
        } catch (parseError) {
          // Ignore parse errors on event stream
        }
      });

      stream.on('error', (err: Error) => {
        console.error('❌ Docker Events stream error:', err.message);
        // Reconnect after delay
        setTimeout(() => this.initDockerEvents(), 5000);
      });

      stream.on('end', () => {
        console.warn('⚠️ Docker Events stream ended, reconnecting...');
        setTimeout(() => this.initDockerEvents(), 1000);
      });

      console.log('👂 Docker Events listener started (monitoring container deaths)');
    } catch (error) {
      console.error('❌ Failed to initialize Docker Events listener:', error);
      // Retry after delay
      setTimeout(() => this.initDockerEvents(), 5000);
    }
  }

  /**
   * Handle container death event - cleanup resources
   *
   * Called when Docker notifies us a container has died.
   * AutoRemove handles container removal, we handle:
   * - Removing the workspace volume
   * - Releasing the Supabase pool lease
   * - Cleaning up internal tracking state
   */
  private async handleContainerDeath(requestId: string, containerId: string, exitCode: string): Promise<void> {
    // Clear any pending timeout
    this.clearTimeout(requestId);

    // Remove from tracking (container may already be removed by AutoRemove)
    this.containers.delete(requestId);

    // Emit event for any listeners (like WSI server)
    this.emit('died', requestId, containerId, parseInt(exitCode) || 0);

    // Clean up the workspace volume (with retry for race condition)
    const volumeName = `leo-workspace-${requestId}`;
    const removeVolume = async (attempt: number = 1): Promise<void> => {
      try {
        const volume = this.docker.getVolume(volumeName);
        await volume.remove();
        console.log(`🗑️  Volume removed (on death): ${volumeName}`);
      } catch (error: any) {
        if (error.statusCode === 404) {
          // Volume doesn't exist - already cleaned up
          return;
        }
        if (error.statusCode === 409 && attempt < 3) {
          // Volume in use - retry after delay
          console.log(`   Volume busy, retrying in 500ms (attempt ${attempt}/3)`);
          await new Promise(resolve => setTimeout(resolve, 500));
          return removeVolume(attempt + 1);
        }
        console.warn(`⚠️  Failed to remove volume on death: ${error.message}`);
      }
    };
    await removeVolume();

    // Release Supabase pool lease
    const supabasePool = getSupabasePoolManager();
    supabasePool.release(requestId);
  }

  /**
   * Cleanup orphaned containers on startup
   *
   * Layer 4 of cleanup: When SaaS restarts, there may be containers from
   * a previous run that are still around. Clean them up immediately.
   */
  private async cleanupOrphanedContainersOnStartup(): Promise<void> {
    try {
      // Find all Leo containers (including stopped ones)
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: ['leo.saas.managed-by=leo-docker-manager'],
        },
      });

      if (containers.length === 0) {
        console.log('🧹 Startup cleanup: No orphaned containers found');
        return;
      }

      console.log(`🧹 Startup cleanup: Found ${containers.length} orphaned container(s)`);

      for (const containerInfo of containers) {
        const requestId = containerInfo.Labels?.['leo.saas.request-id'];
        const appName = containerInfo.Labels?.['leo.saas.app-name'] || 'unknown';
        const state = containerInfo.State;

        try {
          const container = this.docker.getContainer(containerInfo.Id);

          // Stop if running
          if (state === 'running') {
            console.log(`   Stopping running orphan: ${appName} (${requestId})`);
            await container.stop({ t: 5 }).catch(() => {});
          }

          // Remove container (may fail if AutoRemove already got it)
          await container.remove({ force: true, v: true }).catch(() => {});

          // Small delay to let Docker fully release volume
          await new Promise(resolve => setTimeout(resolve, 500));

          // Remove associated volume
          const volumeName = `leo-workspace-${requestId}`;
          try {
            const volume = this.docker.getVolume(volumeName);
            await volume.remove();
            console.log(`   🗑️ Volume removed: ${volumeName}`);
          } catch (volErr: any) {
            if (volErr.statusCode !== 404) {
              console.warn(`   ⚠️ Volume removal failed: ${volErr.message}`);
            }
          }

          // Release pool lease if any
          const supabasePool = getSupabasePoolManager();
          supabasePool.release(requestId!);

          console.log(`   ✅ Cleaned up: ${appName} (${requestId})`);
        } catch (error: any) {
          console.warn(`   ⚠️ Failed to clean ${containerInfo.Id}: ${error.message}`);
        }
      }

      console.log('🧹 Startup cleanup complete');
    } catch (error) {
      console.error('❌ Startup cleanup failed:', error);
    }
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
    const { requestId, prompt, mode, maxIterations, appName, userId, appId, githubOwner, isResume, resumeFromPath, resumeSessionId, outputDir, githubUrl, dbRequestId, appCredentials } = config;

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

      // For resume with stored credentials, use those instead of pool
      // For new generations, acquire from pool
      const supabasePool = getSupabasePoolManager();
      let supabaseCreds: SupabaseCredentials | null = null;

      if (isResume && appCredentials && appCredentials.length > 0) {
        // Resume mode with stored credentials - skip pool acquisition
        console.log(`   Using ${appCredentials.length} stored app credentials for resume`);
      } else {
        // New generation or resume without stored credentials - use pool
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
        `FLY_API_TOKEN=${process.env.FLY_API_TOKEN || ''}`,
        `IS_RESUME=${isResume ? 'true' : 'false'}`,
        // Agent mode: 'leo' (full) or 'leo-lite' (simple HTML)
        `AGENT_MODE=${process.env.AGENT_MODE || 'leo'}`,
        // Database request ID for WSI multi-session routing
        ...(dbRequestId !== undefined ? [`DB_REQUEST_ID=${dbRequestId}`] : []),
        // AWS credentials - injected as env vars (matches Fargate behavior)
        // In Fargate: ECS task role provides credentials via instance metadata
        // Locally: Credentials passed as env vars from run script
        `AWS_REGION=${process.env.AWS_REGION || 'us-east-1'}`,
        // User secret - use developer's token if provided (BYOT), otherwise fall back to shared token
        // IMPORTANT: Never log the actual token value
        `CLAUDE_CODE_OAUTH_TOKEN=${config.claudeOauthToken || process.env.CLAUDE_CODE_OAUTH_TOKEN || ''}`,
      ];

      // Log Claude token source (not the actual value)
      if (config.claudeOauthToken) {
        console.log(`   Claude: Using developer's BYOT token`);
      } else if (process.env.CLAUDE_CODE_OAUTH_TOKEN) {
        console.log(`   Claude: Using shared platform token`);
      } else {
        console.warn(`   Claude: ⚠️ No Claude token configured!`);
      }

      // Add OpenAI API key for trajectory analysis (optional)
      if (process.env.OPENAI_API_KEY) {
        env.push(`OPENAI_API_KEY=${process.env.OPENAI_API_KEY}`);
      }

      // Add AWS credentials if available (for boto3/AWS SDK in generator)
      if (process.env.AWS_ACCESS_KEY_ID) {
        env.push(`AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}`);
        env.push(`AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY}`);
        if (process.env.AWS_SESSION_TOKEN) {
          env.push(`AWS_SESSION_TOKEN=${process.env.AWS_SESSION_TOKEN}`);
        }
      }

      // Add Supabase credentials based on mode
      // Priority: 1) Stored app credentials (resume), 2) BYOT access token (per-app), 3) Pool credentials
      if (isResume && appCredentials && appCredentials.length > 0) {
        // Resume mode: use stored app credentials from Vault
        for (const cred of appCredentials) {
          env.push(`${cred.key}=${cred.value}`);
        }
        console.log(`   Supabase: Added ${appCredentials.length} stored credentials as env vars`);
      } else if (config.supabaseAccessToken) {
        // BYOT per-app mode: pass user's access token for agent to create project
        env.push(`SUPABASE_ACCESS_TOKEN=${config.supabaseAccessToken}`);
        console.log(`   Supabase: Using BYOT access token (per-app mode)`);
      } else if (supabaseCreds?.supabaseUrl) {
        // Pooled mode: pass direct credentials from the pool
        // IMPORTANT: Always use pool credentials, NOT process.env.DATABASE_URL
        // (process.env.DATABASE_URL is the SaaS's own database, not for generated apps)
        env.push(`SUPABASE_URL=${supabaseCreds.supabaseUrl}`);
        env.push(`SUPABASE_ANON_KEY=${supabaseCreds.supabaseAnonKey}`);
        env.push(`SUPABASE_SERVICE_ROLE_KEY=${supabaseCreds.supabaseServiceRoleKey}`);
        env.push(`DATABASE_URL=${supabaseCreds.databaseUrl}`);
        // Also pass as DATABASE_URL_POOLING for runtime operations
        env.push(`DATABASE_URL_POOLING=${supabaseCreds.databaseUrl}`);
        console.log(`   Supabase: Using pool mode`);
      } else if (supabaseCreds?.supabaseAccessToken) {
        // Per-app mode from pool: pass access token for agent to create project
        env.push(`SUPABASE_ACCESS_TOKEN=${supabaseCreds.supabaseAccessToken}`);
        console.log(`   Supabase: Using pool access token (per-app mode)`);
      } else {
        console.warn(`   Supabase: ⚠️ No credentials configured!`);
      }

      // Pass attachment storage credentials (Leo SaaS's Supabase)
      // These are separate from the app's Supabase credentials
      // FAIL FAST: These are required - validated at startup but be explicit here
      const attachmentStorageUrl = process.env.SUPABASE_URL;
      const attachmentStorageKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!attachmentStorageUrl || !attachmentStorageKey) {
        throw new Error(
          'FATAL: Missing attachment storage credentials. ' +
          'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. ' +
          'This should have been caught at startup - check env validation.'
        );
      }
      env.push(`ATTACHMENT_STORAGE_URL=${attachmentStorageUrl}`);
      env.push(`ATTACHMENT_STORAGE_KEY=${attachmentStorageKey}`);

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
          // NOTE: AWS credentials are now passed as env vars (no file mounts needed)
          // This matches Fargate behavior where ECS task role provides credentials
          //
          // EFS simulation for local development:
          // Set LEO_EFS_PATH env var to mount a local directory as /efs
          // Example: LEO_EFS_PATH=~/.leo-efs → mounts ~/.leo-efs:/efs
          // This enables testing EFS persistent storage locally before Fargate deploy
          Binds: [
            `${volumeName}:/workspace`,
            // Optional EFS mount for local dev (matches Fargate EFS volume)
            ...(process.env.LEO_EFS_PATH ? [`${process.env.LEO_EFS_PATH}:/efs`] : []),
          ],

          // Auto-remove container on exit - Docker removes container when it stops
          // This is Layer 1 of cleanup: if container exits normally, Docker removes it
          AutoRemove: true,

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
// BACKWARDS COMPATIBILITY
// ============================================================================

/**
 * Alias for backwards compatibility
 * @deprecated Use DockerContainerManager directly
 */
export const DockerManager = DockerContainerManager;

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Singleton Docker Container Manager instance
 *
 * Use this instance throughout the application to manage containers.
 * The instance is lazily initialized on first access.
 *
 * @deprecated Use getContainerManager() from container-manager-factory.ts instead
 */
let instance: DockerContainerManager | null = null;

export function getDockerManager(): DockerContainerManager {
  if (!instance) {
    instance = new DockerContainerManager();
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
