import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

/**
 * WSI Server - WebSocket Interface Server for Leo Remote CLI
 *
 * Accepts connections from Leo containers and handles WSI Protocol v2.1 messages.
 * Reusable in Leo SaaS - just wire up to Express instead of CLI.
 */

// ============================================================================
// WSI MESSAGE TYPES
// ============================================================================

export interface WSIMessage {
  type: string;
  [key: string]: unknown;
}

export interface ReadyMessage extends WSIMessage {
  type: 'ready';
  container_id?: string;
  workspace?: string;
  generator_mode?: string;
}

export interface LogMessage extends WSIMessage {
  type: 'log';
  line: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

export interface ProgressMessage extends WSIMessage {
  type: 'progress';
  stage?: string;
  step?: string;
  percentage?: number;
  iteration?: number;
  total_iterations?: number;
}

export interface IterationCompleteMessage extends WSIMessage {
  type: 'iteration_complete';
  iteration: number;
  app_path: string;
  session_id?: string;
  session_saved?: boolean;
  duration?: number;
}

export interface AllWorkCompleteMessage extends WSIMessage {
  type: 'all_work_complete';
  completion_reason: string;
  app_path: string;
  session_id?: string;
  github_url?: string;
  s3_url?: string;
  download_url?: string;
  total_iterations: number;
  total_duration?: number;
}

export interface ErrorMessage extends WSIMessage {
  type: 'error';
  message: string;
  error_code?: string;
  fatal?: boolean;
  recovery_hint?: string;
}

export interface StartGenerationMessage extends WSIMessage {
  type: 'start_generation';
  prompt: string;
  mode: 'interactive' | 'confirm_first' | 'autonomous';
  max_iterations?: number;
  app_path?: string;
  app_name?: string;
  enable_expansion?: boolean;
  enable_subagents?: boolean;
  output_dir?: string;
}

// ============================================================================
// WSI SERVER EVENTS
// ============================================================================

export interface WSIServerEvents {
  ready: (msg: ReadyMessage) => void;
  log: (msg: LogMessage) => void;
  progress: (msg: ProgressMessage) => void;
  iteration_complete: (msg: IterationCompleteMessage) => void;
  all_work_complete: (msg: AllWorkCompleteMessage) => void;
  error: (msg: ErrorMessage) => void;
  connected: (containerId: string) => void;
  disconnected: (containerId: string) => void;
}

// ============================================================================
// WSI SERVER CLASS
// ============================================================================

export class WSIServer extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private client: WebSocket | null = null;
  private containerId: string | null = null;
  private port: number;
  private pendingGeneration: StartGenerationMessage | null = null;

  constructor(port: number = 5013) {
    super();
    this.port = port;
  }

  /**
   * Start the WebSocket server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port: this.port });

        this.wss.on('listening', () => {
          console.log(`🔌 WSI Server listening on ws://localhost:${this.port}`);
          resolve();
        });

        this.wss.on('connection', (ws: WebSocket) => {
          this.handleConnection(ws);
        });

        this.wss.on('error', (error) => {
          console.error('❌ WSI Server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the WebSocket server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.close();
        this.client = null;
      }
      if (this.wss) {
        this.wss.close(() => {
          console.log('🔌 WSI Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get the WebSocket URL for containers to connect to
   */
  getConnectionUrl(): string {
    return `ws://host.docker.internal:${this.port}`;
  }

  /**
   * Queue a generation request to send when container connects
   */
  queueGeneration(config: {
    prompt: string;
    mode: 'interactive' | 'confirm_first' | 'autonomous';
    appName: string;
    maxIterations?: number;
    appPath?: string;
    enableSubagents?: boolean;
    outputDir?: string;
  }): void {
    this.pendingGeneration = {
      type: 'start_generation',
      prompt: config.prompt,
      mode: config.mode,
      app_name: config.appName,
      max_iterations: config.maxIterations ?? 10,
      app_path: config.appPath,
      enable_expansion: false, // Always false for WSI
      enable_subagents: config.enableSubagents ?? true,
      output_dir: config.outputDir,
    };
  }

  /**
   * Send start_generation message to connected container
   */
  sendStartGeneration(config: StartGenerationMessage): void {
    if (!this.client) {
      throw new Error('No container connected');
    }
    this.send(config);
  }

  /**
   * Check if a container is connected
   */
  isConnected(): boolean {
    return this.client !== null && this.client.readyState === WebSocket.OPEN;
  }

  /**
   * Get connected container ID
   */
  getContainerId(): string | null {
    return this.containerId;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private handleConnection(ws: WebSocket): void {
    // Only accept one connection at a time
    if (this.client) {
      console.warn('⚠️  Rejecting connection - already have a client');
      ws.close(4000, 'Only one client allowed');
      return;
    }

    console.log('🔗 Container connected');
    this.client = ws;

    ws.on('message', (data: Buffer) => {
      this.handleMessage(data.toString());
    });

    ws.on('close', () => {
      console.log('🔌 Container disconnected');
      const containerId = this.containerId;
      this.client = null;
      this.containerId = null;
      if (containerId) {
        this.emit('disconnected', containerId);
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  private handleMessage(data: string): void {
    let msg: WSIMessage;
    try {
      msg = JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to parse message:', data);
      return;
    }

    switch (msg.type) {
      case 'ready':
        this.handleReady(msg as ReadyMessage);
        break;
      case 'log':
        this.handleLog(msg as LogMessage);
        break;
      case 'progress':
        this.handleProgress(msg as ProgressMessage);
        break;
      case 'iteration_complete':
        this.handleIterationComplete(msg as IterationCompleteMessage);
        break;
      case 'all_work_complete':
        this.handleAllWorkComplete(msg as AllWorkCompleteMessage);
        break;
      case 'error':
        this.handleError(msg as ErrorMessage);
        break;
      default:
        console.warn(`⚠️  Unknown message type: ${msg.type}`);
    }
  }

  private handleReady(msg: ReadyMessage): void {
    this.containerId = msg.container_id ?? 'unknown';
    console.log(`✅ Container ready: ${this.containerId}`);
    console.log(`   Workspace: ${msg.workspace}`);
    console.log(`   Mode: ${msg.generator_mode}`);

    this.emit('ready', msg);
    this.emit('connected', this.containerId);

    // Send queued generation if any
    if (this.pendingGeneration) {
      console.log('📤 Sending queued start_generation');
      this.send(this.pendingGeneration);
      this.pendingGeneration = null;
    }
  }

  private handleLog(msg: LogMessage): void {
    this.emit('log', msg);
  }

  private handleProgress(msg: ProgressMessage): void {
    this.emit('progress', msg);
  }

  private handleIterationComplete(msg: IterationCompleteMessage): void {
    console.log(`✅ Iteration ${msg.iteration} complete`);
    this.emit('iteration_complete', msg);
  }

  private handleAllWorkComplete(msg: AllWorkCompleteMessage): void {
    console.log(`🎉 All work complete: ${msg.completion_reason}`);
    console.log(`   App: ${msg.app_path}`);
    console.log(`   Iterations: ${msg.total_iterations}`);
    if (msg.github_url) console.log(`   GitHub: ${msg.github_url}`);
    if (msg.s3_url) console.log(`   S3: ${msg.s3_url}`);
    this.emit('all_work_complete', msg);
  }

  private handleError(msg: ErrorMessage): void {
    console.error(`❌ Error from container: ${msg.message}`);
    if (msg.error_code) console.error(`   Code: ${msg.error_code}`);
    if (msg.fatal) console.error(`   Fatal: yes`);
    this.emit('error', msg);
  }

  private send(msg: WSIMessage): void {
    if (!this.client || this.client.readyState !== WebSocket.OPEN) {
      throw new Error('Cannot send - no client connected');
    }
    this.client.send(JSON.stringify(msg));
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let instance: WSIServer | null = null;

export function getWSIServer(port?: number): WSIServer {
  if (!instance) {
    instance = new WSIServer(port);
  }
  return instance;
}
