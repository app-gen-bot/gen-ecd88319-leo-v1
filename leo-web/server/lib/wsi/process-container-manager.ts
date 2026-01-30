/**
 * Process Container Manager
 *
 * Implements IContainerManager by spawning the stub as a plain Python process.
 * Used when Docker-in-Docker is not possible (e.g., leo-web running in a container).
 *
 * Selection:
 * - LEO_CONTAINER=true             -> Process mode (auto-detected)
 * - USE_PROCESS_ORCHESTRATOR=true  -> Process mode (explicit)
 * - USE_AWS_ORCHESTRATOR=true      -> Fargate mode
 * - (default)                      -> Docker mode
 *
 * Configuration:
 * - PROCESS_STUB_PATH: Path to mock_worker.py (optional if LEO_CONTAINER, defaults to ./stub/mock_worker.py)
 * - WS_BASE_URL: WebSocket URL for stub to connect to (optional, auto-detected)
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  IContainerManager,
  ContainerSpawnConfig,
  ContainerStatus,
} from './container-manager-interface.js';

// ============================================================================
// PROCESS MANAGER CLASS
// ============================================================================

interface ProcessInfo {
  process: ChildProcess;
  requestId: string;
  startedAt: Date;
  logs: string[];
  maxLogLines: number;
}

export class ProcessContainerManager extends EventEmitter implements IContainerManager {
  private processes: Map<string, ProcessInfo>;
  private timeouts: Map<string, NodeJS.Timeout>;

  // Configuration
  private readonly STUB_PATH: string;
  private readonly WS_BASE_URL: string;
  private readonly MAX_TIMEOUT_MS: number;
  private readonly MAX_LOG_LINES: number;

  constructor() {
    super();

    // Process tracking
    this.processes = new Map();
    this.timeouts = new Map();

    // Configuration - resolve stub path
    // Priority: PROCESS_STUB_PATH env var > default (./stub/mock_worker.ts relative to app root)
    let stubPath = process.env.PROCESS_STUB_PATH;
    if (!stubPath) {
      // Default: stub/mock_worker.ts relative to app root (3 levels up from this file)
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      stubPath = path.resolve(__dirname, '../../../stub/mock_worker.ts');
    }
    this.STUB_PATH = stubPath;

    // WebSocket URL - process connects to WSI Server
    const port = process.env.PORT || '5013';
    this.WS_BASE_URL = process.env.WS_BASE_URL || `ws://localhost:${port}/wsi`;

    this.MAX_TIMEOUT_MS = 86400000; // 24 hours
    this.MAX_LOG_LINES = 1000; // Keep last 1000 lines per process

    // Log configuration
    console.log('🐍 Process Manager initialized');
    console.log(`   Stub: ${this.STUB_PATH}`);
    console.log(`   WebSocket: ${this.WS_BASE_URL}`);
    console.log(`   Timeout: ${Math.round(this.MAX_TIMEOUT_MS / 3600000)}h`);
  }

  /** Get the configured "image" name (stub path for process mode) */
  get imageName(): string {
    return `process:${this.STUB_PATH}`;
  }

  /**
   * Spawn a new process for app generation
   *
   * Creates and starts a Python subprocess running the stub.
   * The process will connect to the WSI Server and simulate generation.
   *
   * @param config Container spawn configuration
   * @returns Process ID as string
   * @throws Error if process creation fails
   */
  async spawnContainer(config: ContainerSpawnConfig): Promise<string> {
    const { requestId, prompt, mode, maxIterations, appName, userId, appId, dbRequestId } = config;

    console.log(`🚀 Spawning process for request: ${requestId}`);
    console.log(`   App: ${appName}`);
    console.log(`   Mode: ${mode}`);
    console.log(`   Max iterations: ${maxIterations}`);

    try {
      // Check if process already exists for this request
      if (this.processes.has(requestId)) {
        throw new Error(`Process already exists for request: ${requestId}`);
      }

      // Build environment variables (subset of what Docker passes)
      const env: Record<string, string> = {
        ...process.env as Record<string, string>,
        WS_URL: this.WS_BASE_URL,
        REQUEST_ID: requestId,
        GENERATION_ID: requestId,
        PROMPT: prompt,
        MODE: mode,
        GENERATOR_MODE: 'real', // Always real mode (not mock)
        MAX_ITERATIONS: String(maxIterations),
        APP_NAME: appName,
        USER_ID: userId,
        APP_ID: appId || requestId,
        IS_RESUME: config.isResume ? 'true' : 'false',
        AGENT_MODE: process.env.AGENT_MODE || 'leo', // Leo-Lite mode support
      };

      // Add database request ID if provided
      if (dbRequestId !== undefined) {
        env.DB_REQUEST_ID = String(dbRequestId);
      }

      // Spawn Python worker directly
      console.log(`   Command: python ${this.STUB_PATH}`);

      const child = spawn('python', [this.STUB_PATH], {
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      });

      const pid = child.pid;
      if (!pid) {
        throw new Error('Failed to spawn process - no PID returned');
      }

      const processId = String(pid);
      console.log(`✅ Process spawned: PID ${processId}`);

      // Store process info
      const processInfo: ProcessInfo = {
        process: child,
        requestId,
        startedAt: new Date(),
        logs: [],
        maxLogLines: this.MAX_LOG_LINES,
      };
      this.processes.set(requestId, processInfo);

      // Capture stdout
      child.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        for (const line of lines) {
          this.appendLog(requestId, `[stdout] ${line}`);
        }
      });

      // Capture stderr
      child.stderr?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        for (const line of lines) {
          this.appendLog(requestId, `[stderr] ${line}`);
        }
      });

      // Handle process exit
      child.on('exit', (code, signal) => {
        console.log(`🔔 Process exited: PID ${processId} (code: ${code}, signal: ${signal})`);
        this.handleProcessExit(requestId, code, signal);
      });

      // Handle process error
      child.on('error', (error) => {
        console.error(`❌ Process error for ${requestId}:`, error);
        this.emit('error', requestId, error);
      });

      this.emit('spawn', requestId, processId);
      this.emit('start', requestId, processId);

      // Set timeout
      this.setupTimeout(requestId, processId);

      return processId;
    } catch (error) {
      console.error(`❌ Failed to spawn process for ${requestId}:`, error);
      this.emit('error', requestId, error as Error);
      throw error;
    }
  }

  /**
   * Stop and cleanup a process
   *
   * @param requestId Request identifier
   * @param timeout Grace period in seconds (default: 10)
   * @returns true if stopped successfully, false if not found
   */
  async stopContainer(requestId: string, timeout: number = 10): Promise<boolean> {
    console.log(`🛑 Stopping process for request: ${requestId}`);

    const processInfo = this.processes.get(requestId);
    if (!processInfo) {
      console.warn(`⚠️  No process found for request: ${requestId}`);
      return false;
    }

    try {
      // Clear timeout
      this.clearTimeout(requestId);

      const child = processInfo.process;
      const pid = child.pid;

      // Try graceful termination first (SIGTERM)
      child.kill('SIGTERM');

      // Wait for graceful exit
      const exited = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => {
          resolve(false);
        }, timeout * 1000);

        child.once('exit', () => {
          clearTimeout(timer);
          resolve(true);
        });
      });

      // Force kill if didn't exit gracefully
      if (!exited) {
        console.warn(`⚠️  Process ${pid} didn't exit gracefully, sending SIGKILL`);
        child.kill('SIGKILL');
      }

      console.log(`✅ Process stopped: PID ${pid}`);
      this.emit('stop', requestId, String(pid));

      // Cleanup
      this.processes.delete(requestId);

      return true;
    } catch (error: any) {
      console.error(`❌ Failed to stop process for ${requestId}:`, error);
      this.emit('error', requestId, error);
      throw error;
    }
  }

  /**
   * Get process status
   *
   * @param requestId Request identifier
   * @returns Process status or null if not found
   */
  async getContainerStatus(requestId: string): Promise<ContainerStatus | null> {
    const processInfo = this.processes.get(requestId);
    if (!processInfo) {
      return null;
    }

    const child = processInfo.process;
    const isRunning = child.exitCode === null && !child.killed;

    return {
      id: String(child.pid),
      requestId,
      state: isRunning ? 'running' : 'exited',
      startedAt: processInfo.startedAt,
      finishedAt: isRunning ? null : new Date(),
      exitCode: child.exitCode,
      uptime: isRunning ? Date.now() - processInfo.startedAt.getTime() : null,
    };
  }

  /**
   * Check if a process is running
   *
   * @param requestId Request identifier
   * @returns true if running, false otherwise
   */
  async isContainerRunning(requestId: string): Promise<boolean> {
    const status = await this.getContainerStatus(requestId);
    return status?.state === 'running';
  }

  /**
   * Get process logs
   *
   * @param requestId Request identifier
   * @param tail Number of lines to retrieve (default: 100)
   * @returns Log output as string
   */
  async getContainerLogs(requestId: string, tail: number = 100): Promise<string> {
    const processInfo = this.processes.get(requestId);
    if (!processInfo) {
      throw new Error(`Process not found for request: ${requestId}`);
    }

    const logs = processInfo.logs.slice(-tail);
    return logs.join('\n');
  }

  /**
   * Shutdown manager and cleanup all processes
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Process Manager...');

    // Clear all timeouts
    for (const requestId of this.timeouts.keys()) {
      this.clearTimeout(requestId);
    }

    // Stop all processes
    const stopPromises = Array.from(this.processes.keys()).map(requestId =>
      this.stopContainer(requestId, 5).catch(err => {
        console.error(`Failed to stop process ${requestId} during shutdown:`, err);
      })
    );

    await Promise.all(stopPromises);

    console.log('✅ Process Manager shutdown complete');
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Append log line to process info (with circular buffer)
   */
  private appendLog(requestId: string, line: string): void {
    const processInfo = this.processes.get(requestId);
    if (!processInfo) return;

    const timestamp = new Date().toISOString();
    processInfo.logs.push(`${timestamp} ${line}`);

    // Trim to max lines
    if (processInfo.logs.length > processInfo.maxLogLines) {
      processInfo.logs = processInfo.logs.slice(-processInfo.maxLogLines);
    }
  }

  /**
   * Handle process exit
   */
  private handleProcessExit(requestId: string, code: number | null, _signal: string | null): void {
    this.clearTimeout(requestId);

    const processInfo = this.processes.get(requestId);
    if (processInfo) {
      this.emit('died', requestId, String(processInfo.process.pid), code || 0);
    }

    // Don't delete immediately - keep for log retrieval
    // Will be cleaned up on next spawn or shutdown
  }

  /**
   * Setup timeout for process execution
   */
  private setupTimeout(requestId: string, processId: string): void {
    const timeout = setTimeout(async () => {
      console.warn(`⏰ Process timeout reached for ${requestId} (${this.MAX_TIMEOUT_MS}ms)`);
      this.emit('timeout', requestId, processId);

      try {
        await this.stopContainer(requestId, 5);
      } catch (error) {
        console.error(`Failed to stop timed-out process:`, error);
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
}
