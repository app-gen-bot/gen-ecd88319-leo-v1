/**
 * Fargate Container Manager for Leo Container Orchestration (Leo SaaS)
 *
 * Implements IContainerManager for AWS ECS Fargate task management.
 * Used in production mode (USE_AWS_ORCHESTRATOR=true).
 *
 * Manages the lifecycle of Leo container instances running as Fargate tasks.
 * Each task runs the leo-container image and connects to the WSI Server
 * to receive generation commands and report progress.
 *
 * Architecture:
 * - One Fargate task per generation request
 * - Tasks connect to WSI Server via WSI_PUBLIC_URL env var
 * - Environment variables configure the generation (prompt, mode, iterations)
 * - ECS task definition pre-configured with required secrets/roles
 * - Auto-cleanup on task completion
 *
 * Required Environment Variables:
 * - ECS_CLUSTER: ECS cluster ARN or name
 * - ECS_TASK_DEFINITION: Task definition ARN or family:revision
 * - ECS_SUBNETS: Comma-separated list of subnet IDs
 * - ECS_SECURITY_GROUP: Security group ID for tasks
 * - WSI_PUBLIC_URL: Public URL for WSI Server (tasks connect back to this)
 */

import {
  ECSClient,
  RunTaskCommand,
  StopTaskCommand,
  DescribeTasksCommand,
  LaunchType,
  AssignPublicIp,
} from '@aws-sdk/client-ecs';
import {
  CloudWatchLogsClient,
  GetLogEventsCommand,
  OutputLogEvent,
} from '@aws-sdk/client-cloudwatch-logs';
import { EventEmitter } from 'events';
import {
  IContainerManager,
  ContainerSpawnConfig,
  ContainerStatus,
} from './container-manager-interface.js';
import { getSupabasePoolManager, SupabaseCredentials } from './supabase-pool.js';

// ============================================================================
// FARGATE MANAGER CLASS
// ============================================================================

export class FargateContainerManager extends EventEmitter implements IContainerManager {
  private ecs: ECSClient;
  private logs: CloudWatchLogsClient;

  // Request ID -> Task ARN mapping
  private taskMap: Map<string, string> = new Map();

  // Task ARN -> Request ID reverse mapping (for status lookups)
  private taskToRequest: Map<string, string> = new Map();

  // Timeout tracking
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  // Configuration
  private readonly ECS_CLUSTER: string;
  private readonly ECS_TASK_DEFINITION: string;
  private readonly ECS_SUBNETS: string[];
  private readonly ECS_SECURITY_GROUP: string;
  private readonly WSI_PUBLIC_URL: string;
  private readonly CONTAINER_NAME: string;
  private readonly LOG_GROUP: string;
  private readonly MAX_TIMEOUT_MS: number;

  constructor() {
    super();

    const region = process.env.AWS_REGION || 'us-east-1';

    // Initialize AWS clients
    this.ecs = new ECSClient({ region });
    this.logs = new CloudWatchLogsClient({ region });

    // Configuration from environment (validated by factory)
    this.ECS_CLUSTER = process.env.ECS_CLUSTER!;
    this.ECS_TASK_DEFINITION = process.env.ECS_TASK_DEFINITION!;
    this.ECS_SUBNETS = process.env.ECS_SUBNETS!.split(',').map(s => s.trim());
    this.ECS_SECURITY_GROUP = process.env.ECS_SECURITY_GROUP!;
    this.WSI_PUBLIC_URL = process.env.WSI_PUBLIC_URL!;

    // Optional configuration
    this.CONTAINER_NAME = process.env.ECS_CONTAINER_NAME || 'leo-container';
    this.LOG_GROUP = process.env.ECS_LOG_GROUP || '/ecs/leo-container';
    this.MAX_TIMEOUT_MS = 86400000; // 24 hours

    // Log configuration
    console.log('🚀 Fargate Manager initialized');
    console.log(`   Cluster: ${this.ECS_CLUSTER}`);
    console.log(`   Task Definition: ${this.ECS_TASK_DEFINITION}`);
    console.log(`   Subnets: ${this.ECS_SUBNETS.join(', ')}`);
    console.log(`   Security Group: ${this.ECS_SECURITY_GROUP}`);
    console.log(`   WSI URL: ${this.WSI_PUBLIC_URL}`);
    console.log(`   Container Name: ${this.CONTAINER_NAME}`);
    console.log(`   Log Group: ${this.LOG_GROUP}`);
    console.log(`   Timeout: ${Math.round(this.MAX_TIMEOUT_MS / 3600000)}h`);
  }

  /** Get the configured task definition (acts as "image name" for Fargate) */
  get imageName(): string {
    return this.ECS_TASK_DEFINITION;
  }

  /**
   * Spawn a new Fargate task for app generation
   *
   * Creates and starts a Fargate task with the specified configuration.
   * The task will connect to the WSI Server and await generation commands.
   *
   * @param config Container spawn configuration
   * @returns Task ARN
   * @throws Error if task creation fails
   */
  async spawnContainer(config: ContainerSpawnConfig): Promise<string> {
    const {
      requestId,
      prompt,
      mode,
      maxIterations,
      appName,
      userId,
      appId,
      githubOwner,
      isResume,
      resumeFromPath,
      resumeSessionId,
      outputDir,
      githubUrl,
      dbRequestId,
      appCredentials,
    } = config;

    console.log(`🚀 Spawning Fargate task for request: ${requestId}`);
    console.log(`   App: ${appName}`);
    console.log(`   Mode: ${mode}`);
    console.log(`   Max iterations: ${maxIterations}`);

    try {
      // Check if task already exists for this request
      if (this.taskMap.has(requestId)) {
        throw new Error(`Task already exists for request: ${requestId}`);
      }

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
          console.error(`❌ Failed to acquire Supabase credentials:`, error);
          throw error;
        }
      }

      // Build environment overrides for the task
      // Note: PROMPT is NOT passed as env var - it's sent via WSI start_generation message
      // AWS Fargate has 8192 byte limit for container overrides, so we avoid large values
      const environment = [
        { name: 'WS_URL', value: this.WSI_PUBLIC_URL },
        { name: 'REQUEST_ID', value: requestId },
        { name: 'GENERATION_ID', value: requestId }, // Container expects GENERATION_ID
        { name: 'MODE', value: mode },
        { name: 'GENERATOR_MODE', value: 'real' },
        { name: 'MAX_ITERATIONS', value: maxIterations.toString() },
        { name: 'APP_NAME', value: appName },
        { name: 'ENABLE_EXPANSION', value: 'false' },
        { name: 'USER_ID', value: userId },
        { name: 'APP_ID', value: appId || requestId },
        { name: 'GITHUB_OWNER', value: githubOwner || 'app-gen-bot' },
        { name: 'IS_RESUME', value: isResume ? 'true' : 'false' },
      ];

      // Add database request ID for multi-session routing
      if (dbRequestId !== undefined) {
        environment.push({ name: 'DB_REQUEST_ID', value: dbRequestId.toString() });
      }

      // Add Supabase credentials based on mode
      // Priority: 1) Stored app credentials (resume), 2) Pool credentials (new generation)
      if (isResume && appCredentials && appCredentials.length > 0) {
        // Resume mode: use stored app credentials from Vault
        for (const cred of appCredentials) {
          environment.push({ name: cred.key, value: cred.value });
        }
        console.log(`   Added ${appCredentials.length} stored credentials as env vars`);
      } else if (supabaseCreds?.supabaseUrl && supabaseCreds?.supabaseAnonKey && supabaseCreds?.supabaseServiceRoleKey && supabaseCreds?.databaseUrl) {
        environment.push({ name: 'SUPABASE_URL', value: supabaseCreds.supabaseUrl });
        environment.push({ name: 'SUPABASE_ANON_KEY', value: supabaseCreds.supabaseAnonKey });
        environment.push({ name: 'SUPABASE_SERVICE_ROLE_KEY', value: supabaseCreds.supabaseServiceRoleKey });
        environment.push({ name: 'DATABASE_URL', value: supabaseCreds.databaseUrl });
        environment.push({ name: 'DATABASE_URL_POOLING', value: supabaseCreds.databaseUrl });
      } else if (supabaseCreds?.supabaseAccessToken) {
        environment.push({ name: 'SUPABASE_ACCESS_TOKEN', value: supabaseCreds.supabaseAccessToken });
      }

      // Add optional environment variables
      if (resumeFromPath) {
        environment.push({ name: 'RESUME_FROM_PATH', value: resumeFromPath });
      }
      if (resumeSessionId) {
        environment.push({ name: 'RESUME_SESSION_ID', value: resumeSessionId });
      }
      if (outputDir) {
        environment.push({ name: 'OUTPUT_DIR', value: outputDir });
      }
      if (githubUrl) {
        environment.push({ name: 'GITHUB_CLONE_URL', value: githubUrl });
        console.log(`   Cloning from: ${githubUrl}`);
      }

      // Developer's BYOT tokens override the shared platform token from task definition
      // IMPORTANT: Never log actual token values
      if (config.claudeOauthToken) {
        environment.push({ name: 'CLAUDE_CODE_OAUTH_TOKEN', value: config.claudeOauthToken });
        console.log(`   Claude: Using developer's BYOT token`);
      } else {
        console.log(`   Claude: Using shared platform token from task definition`);
      }

      // Supabase access token for per-app mode (agent creates Supabase project)
      if (config.supabaseAccessToken) {
        environment.push({ name: 'SUPABASE_ACCESS_TOKEN', value: config.supabaseAccessToken });
        console.log(`   Supabase: Using BYOT access token (per-app mode)`);
      } else {
        console.log(`   Supabase: Using pool mode (credentials from pool)`);
      }

      // Pass attachment storage credentials (Leo SaaS's Supabase for file attachments)
      // These are the platform's Supabase credentials, NOT the generated app's
      const attachmentStorageUrl = process.env.SUPABASE_URL;
      const attachmentStorageKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (attachmentStorageUrl && attachmentStorageKey) {
        environment.push({ name: 'ATTACHMENT_STORAGE_URL', value: attachmentStorageUrl });
        environment.push({ name: 'ATTACHMENT_STORAGE_KEY', value: attachmentStorageKey });
        console.log(`   Attachments: Storage credentials configured`);
      } else {
        console.warn(`   Attachments: ⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY - file attachments won't work`);
      }

      // Create RunTask command
      const command = new RunTaskCommand({
        cluster: this.ECS_CLUSTER,
        taskDefinition: this.ECS_TASK_DEFINITION,
        launchType: LaunchType.FARGATE,
        networkConfiguration: {
          awsvpcConfiguration: {
            subnets: this.ECS_SUBNETS,
            securityGroups: [this.ECS_SECURITY_GROUP],
            assignPublicIp: AssignPublicIp.ENABLED,
          },
        },
        overrides: {
          containerOverrides: [
            {
              name: this.CONTAINER_NAME,
              environment,
            },
          ],
        },
        tags: [
          { key: 'leo.saas.request-id', value: requestId },
          { key: 'leo.saas.app-name', value: appName },
          { key: 'leo.saas.mode', value: mode },
          { key: 'leo.saas.managed-by', value: 'leo-fargate-manager' },
        ],
      });

      // Run the task
      const result = await this.ecs.send(command);

      if (!result.tasks || result.tasks.length === 0) {
        const failure = result.failures?.[0];
        throw new Error(
          `Failed to start Fargate task: ${failure?.reason || 'Unknown error'}`
        );
      }

      const taskArn = result.tasks[0].taskArn!;

      console.log(`✅ Task created: ${taskArn}`);
      this.emit('spawn', requestId, taskArn);

      // Store task mapping
      this.taskMap.set(requestId, taskArn);
      this.taskToRequest.set(taskArn, requestId);

      // Emit start event (task is starting, may take a moment to reach RUNNING)
      this.emit('start', requestId, taskArn);

      // Set timeout for maximum execution time
      this.setupTimeout(requestId, taskArn);

      return taskArn;
    } catch (error) {
      console.error(`❌ Failed to spawn Fargate task for ${requestId}:`, error);
      this.emit('error', requestId, error as Error);

      // Cleanup on failure
      await this.cleanupTask(requestId).catch(err => {
        console.error(`Failed to cleanup after spawn error:`, err);
      });

      throw error;
    }
  }

  /**
   * Stop and remove a Fargate task
   *
   * Stops a running task. Fargate handles cleanup automatically.
   *
   * @param requestId Request identifier
   * @param _timeout Grace period (not used for Fargate - ECS handles gracefully)
   * @returns true if stopped successfully, false if task not found
   */
  async stopContainer(requestId: string, _timeout: number = 10): Promise<boolean> {
    console.log(`🛑 Stopping Fargate task for request: ${requestId}`);

    const taskArn = this.taskMap.get(requestId);
    if (!taskArn) {
      console.warn(`⚠️  No task found for request: ${requestId}`);
      return false;
    }

    try {
      // Clear timeout if exists
      this.clearTimeout(requestId);

      // Stop the task
      const command = new StopTaskCommand({
        cluster: this.ECS_CLUSTER,
        task: taskArn,
        reason: 'Stopped by Leo SaaS orchestrator',
      });

      await this.ecs.send(command);
      console.log(`✅ Task stopped: ${taskArn}`);
      this.emit('stop', requestId, taskArn);

      // Cleanup
      await this.cleanupTask(requestId);

      return true;
    } catch (error: any) {
      // Task might already be stopped or not exist
      if (error.name === 'InvalidParameterException' || error.name === 'ClusterNotFoundException') {
        console.warn(`⚠️  Task not found or already stopped: ${taskArn}`);
        await this.cleanupTask(requestId);
        return false;
      }

      console.error(`❌ Failed to stop task for ${requestId}:`, error);
      this.emit('error', requestId, error);
      throw error;
    }
  }

  /**
   * Get task status and information
   *
   * @param requestId Request identifier
   * @returns Task status or null if not found
   */
  async getContainerStatus(requestId: string): Promise<ContainerStatus | null> {
    const taskArn = this.taskMap.get(requestId);
    if (!taskArn) {
      return null;
    }

    try {
      const command = new DescribeTasksCommand({
        cluster: this.ECS_CLUSTER,
        tasks: [taskArn],
      });

      const result = await this.ecs.send(command);

      if (!result.tasks || result.tasks.length === 0) {
        // Task not found - cleanup
        await this.cleanupTask(requestId);
        return null;
      }

      const task = result.tasks[0];
      const container = task.containers?.find(c => c.name === this.CONTAINER_NAME);

      return {
        id: taskArn,
        requestId,
        state: task.lastStatus || 'UNKNOWN',
        startedAt: task.startedAt || null,
        finishedAt: task.stoppedAt || null,
        exitCode: container?.exitCode ?? null,
      };
    } catch (error: any) {
      if (error.name === 'ClusterNotFoundException') {
        await this.cleanupTask(requestId);
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if a task is running
   *
   * @param requestId Request identifier
   * @returns true if running, false otherwise
   */
  async isContainerRunning(requestId: string): Promise<boolean> {
    const status = await this.getContainerStatus(requestId);
    // Fargate statuses: PROVISIONING, PENDING, ACTIVATING, RUNNING, DEACTIVATING, STOPPING, DEPROVISIONING, STOPPED
    return status?.state === 'RUNNING' || status?.state === 'PENDING' || status?.state === 'PROVISIONING';
  }

  /**
   * Get task logs from CloudWatch
   *
   * @param requestId Request identifier
   * @param tail Number of lines to retrieve (default: 100)
   * @returns Log output as string
   */
  async getContainerLogs(requestId: string, tail: number = 100): Promise<string> {
    const taskArn = this.taskMap.get(requestId);
    if (!taskArn) {
      throw new Error(`Task not found for request: ${requestId}`);
    }

    // Extract task ID from ARN for log stream name
    // ARN format: arn:aws:ecs:region:account:task/cluster-name/task-id
    const taskId = taskArn.split('/').pop();
    if (!taskId) {
      throw new Error(`Failed to parse task ID from ARN: ${taskArn}`);
    }

    // CloudWatch log stream name format: prefix/container-name/task-id
    const logStreamName = `ecs/${this.CONTAINER_NAME}/${taskId}`;

    try {
      const command = new GetLogEventsCommand({
        logGroupName: this.LOG_GROUP,
        logStreamName,
        limit: tail,
        startFromHead: false, // Get most recent logs
      });

      const result = await this.logs.send(command);

      if (!result.events || result.events.length === 0) {
        return 'No logs available yet';
      }

      return result.events
        .map((event: OutputLogEvent) => `[${new Date(event.timestamp || 0).toISOString()}] ${event.message}`)
        .join('\n');
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        return 'Log stream not found - task may still be starting';
      }
      console.error(`Failed to get logs for ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Shutdown manager and cleanup all tasks
   *
   * Should be called on application shutdown to ensure clean exit.
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Fargate Manager...');

    // Clear all timeouts
    for (const requestId of this.timeouts.keys()) {
      this.clearTimeout(requestId);
    }

    // Stop all tracked tasks
    const stopPromises = Array.from(this.taskMap.keys()).map(requestId =>
      this.stopContainer(requestId).catch(err => {
        console.error(`Failed to stop task ${requestId} during shutdown:`, err);
      })
    );

    await Promise.all(stopPromises);

    console.log('✅ Fargate Manager shutdown complete');
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Setup timeout for task execution
   */
  private setupTimeout(requestId: string, taskArn: string): void {
    const timeout = setTimeout(async () => {
      console.warn(`⏰ Task timeout reached for ${requestId} (${this.MAX_TIMEOUT_MS}ms)`);
      this.emit('timeout', requestId, taskArn);

      try {
        await this.stopContainer(requestId);
      } catch (error) {
        console.error(`Failed to stop timed-out task:`, error);
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
   * Cleanup task references and resources
   */
  private async cleanupTask(requestId: string): Promise<void> {
    this.clearTimeout(requestId);

    const taskArn = this.taskMap.get(requestId);
    if (taskArn) {
      this.taskToRequest.delete(taskArn);
    }

    // Release Supabase pool lease
    const supabasePool = getSupabasePoolManager();
    supabasePool.release(requestId);

    this.taskMap.delete(requestId);
  }
}
