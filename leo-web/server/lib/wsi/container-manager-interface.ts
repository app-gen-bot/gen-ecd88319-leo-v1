/**
 * Container Manager Interface
 *
 * Defines the contract for container management strategies (Docker, Fargate, etc.)
 * This enables a strategy pattern where the orchestrator mode is selected at startup.
 */

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Container spawn configuration
 */
/** Credential entry for app secrets */
export interface AppCredentialEntry {
  key: string;
  value: string;
}

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
  /** Database request ID for WSI routing (multi-session support) */
  dbRequestId?: number;
  /** Optional: Developer's Claude OAuth token (BYOT - Bring Your Own Token) */
  claudeOauthToken?: string;
  /** Optional: Developer's Supabase access token (BYOT - for per-app Supabase projects) */
  supabaseAccessToken?: string;
  /** Optional: App credentials for resume (retrieved from Vault) */
  appCredentials?: AppCredentialEntry[];
}

/**
 * Container status information
 */
export interface ContainerStatus {
  /** Container/Task ID */
  id: string;
  /** Request ID associated with this container */
  requestId: string;
  /** Container state (running, exited, RUNNING, STOPPED, etc.) */
  state: string;
  /** Container start time */
  startedAt: Date | null;
  /** Container finish time */
  finishedAt: Date | null;
  /** Exit code (if exited) */
  exitCode: number | null;
  /** Container uptime in milliseconds (Docker only) */
  uptime?: number | null;
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
// CONTAINER MANAGER INTERFACE
// ============================================================================

/**
 * Container Manager Interface
 *
 * Implementations:
 * - DockerContainerManager: Local Docker containers (development)
 * - FargateContainerManager: AWS ECS Fargate tasks (production)
 */
export interface IContainerManager {
  /**
   * Get the configured container image name or task definition
   */
  readonly imageName: string;

  /**
   * Spawn a new container for app generation
   *
   * Creates and starts a container/task with the specified configuration.
   * The container will connect to the WSI Server and await generation commands.
   *
   * @param config Container spawn configuration
   * @returns Container/Task ID
   * @throws Error if container creation or start fails
   */
  spawnContainer(config: ContainerSpawnConfig): Promise<string>;

  /**
   * Stop and remove a container
   *
   * Gracefully stops a running container, then forcefully kills it
   * if it doesn't stop within the grace period.
   *
   * @param requestId Request identifier
   * @param timeout Grace period in seconds (default: 10)
   * @returns true if stopped successfully, false if container not found
   */
  stopContainer(requestId: string, timeout?: number): Promise<boolean>;

  /**
   * Get container status and information
   *
   * @param requestId Request identifier
   * @returns Container status or null if not found
   */
  getContainerStatus(requestId: string): Promise<ContainerStatus | null>;

  /**
   * Check if a container is running
   *
   * @param requestId Request identifier
   * @returns true if running, false otherwise
   */
  isContainerRunning(requestId: string): Promise<boolean>;

  /**
   * Get container logs
   *
   * @param requestId Request identifier
   * @param tail Number of lines to retrieve (default: 100)
   * @returns Log output as string
   */
  getContainerLogs(requestId: string, tail?: number): Promise<string>;

  /**
   * Shutdown manager and cleanup all containers
   *
   * Should be called on application shutdown to ensure clean exit.
   */
  shutdown(): Promise<void>;

  /**
   * Event emitter methods (optional - for Docker compatibility)
   */
  on?(event: string, listener: (...args: any[]) => void): this;
  emit?(event: string, ...args: any[]): boolean;
}
