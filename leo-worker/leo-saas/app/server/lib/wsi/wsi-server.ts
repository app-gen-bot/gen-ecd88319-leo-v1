import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { EventEmitter } from 'events';
import { getDockerManager } from './container-manager.js';
import { storage } from '../storage/factory.js';

/**
 * WSI Server - WebSocket Interface Server for Leo SaaS
 *
 * Handles BOTH browser and container connections:
 * - Browser connects to view console output and send commands
 * - Container connects to send logs/progress and receive commands
 * - Server routes messages between them
 *
 * MVP: 1:1 (one browser, one container)
 * Future: Multi-session support using V2's joinSession pattern
 *         (see apps/leo-saas/app/server/lib/websocket-server.ts)
 */

// ============================================================================
// WSI MESSAGE TYPES (from Leo Remote)
// ============================================================================

export interface WSIMessage {
  type: string;
  [key: string]: unknown;
}

// Messages FROM container
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
  s3_url?: string;  // Deprecated - S3 no longer used
  download_url?: string;  // Deprecated - S3 no longer used
  flyio_url?: string;  // Fly.io deployed app URL
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

export interface DecisionPromptMessage extends WSIMessage {
  type: 'decision_prompt';
  prompt_id: string;
  question: string;
  options?: string[];
  allow_custom?: boolean;
}

// Real-time conversation log from agent
export interface ConversationLogMessage extends WSIMessage {
  type: 'conversation_log';
  timestamp: string;
  entry_type: 'user_prompt' | 'assistant_message' | 'result' | 'error' | 'system';
  agent: string;
  // Entry-specific fields
  content?: string;  // user_prompt content
  text_blocks?: string[];  // assistant text blocks
  thinking_blocks?: string[];  // assistant thinking blocks
  tool_uses?: Array<{ name: string; id: string; input: unknown }>;  // assistant tool uses
  turn?: string;  // e.g., "3/10"
  success?: boolean;  // result success
  termination_reason?: string;  // result termination reason
  cost_usd?: number;  // result cost
  duration_ms?: number;  // result duration
  input_tokens?: number;  // result tokens
  output_tokens?: number;  // result tokens
  error_type?: string;  // error type name
  error_message?: string;  // error message
  level?: string;  // system log level
  message?: string;  // system message
}

// Messages FROM browser (TO container)
export interface StartGenerationMessage extends WSIMessage {
  type: 'start_generation';
  /** Database ID from POST /api/generations - REQUIRED for status tracking */
  request_id: number;
  prompt: string;
  /** Mode: 'autonomous' (reprompter runs until max_iterations) or 'confirm_first' (user confirms each iteration) */
  mode: 'autonomous' | 'confirm_first';
  /** Max iterations (required for autonomous mode) */
  max_iterations: number;
  /** Resume existing app if provided */
  app_path?: string;
  /** Required for new apps */
  app_name?: string;
  /** Resume specific session for context continuity */
  resume_session_id?: string;
  /** Enable specialized subagents (default: true) */
  enable_subagents?: boolean;
  /** Custom output directory */
  output_dir?: string;
  /** User ID (UUID) - REQUIRED for GitHub repo naming (privacy) */
  user_id: string;
  /** App ID (UUID) - for GitHub repo naming */
  app_id?: string;
  /** GitHub URL of existing app to resume (will clone to workspace) */
  github_url?: string;
}

export interface DecisionResponseMessage extends WSIMessage {
  type: 'decision_response';
  prompt_id: string;
  response: string;
}

export interface ControlCommandMessage extends WSIMessage {
  type: 'control_command';
  command: 'pause' | 'resume' | 'cancel' | 'stop_request' | 'prepare_shutdown';
  reason?: string;
}

// Graceful shutdown response from container
export interface ShutdownReadyMessage extends WSIMessage {
  type: 'shutdown_ready';
  commit_hash?: string;
  pushed?: boolean;
  message?: string;
}

export interface ShutdownFailedMessage extends WSIMessage {
  type: 'shutdown_failed';
  reason: string;
}

// Browser identification message
export interface BrowserConnectMessage extends WSIMessage {
  type: 'browser_connect';
  token?: string; // JWT for auth (future)
}

// ============================================================================
// CLIENT TYPES
// ============================================================================

type ClientType = 'browser' | 'container' | 'unknown';

interface ConnectedClient {
  ws: WebSocket;
  type: ClientType;
  id: string;
  connectedAt: Date;
}

// ============================================================================
// WSI SERVER CLASS
// ============================================================================

export class WSIServer extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private browser: ConnectedClient | null = null;
  private container: ConnectedClient | null = null;
  private pendingGeneration: StartGenerationMessage | null = null;
  private currentRequestId: number | null = null; // Database ID of active generation for status tracking
  private currentDockerRequestId: string | null = null; // Docker request ID for container cleanup
  private shutdownTimeout: NodeJS.Timeout | null = null; // Timeout for graceful shutdown
  private shutdownPending: boolean = false; // Whether shutdown is in progress

  private readonly SHUTDOWN_TIMEOUT_MS = 60000; // 60 seconds to save work and push to GitHub before force kill

  /**
   * Attach WSI Server to an existing HTTP server (Express)
   */
  attach(server: HttpServer, path: string = '/wsi'): void {
    this.wss = new WebSocketServer({ server, path });

    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    this.wss.on('error', (error) => {
      console.error('❌ WSI Server error:', error);
      this.emit('error', error);
    });

    console.log(`🔌 WSI Server attached at ${path}`);
  }

  /**
   * Start standalone WebSocket server (for testing)
   */
  async startStandalone(port: number = 5013): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port });

        this.wss.on('listening', () => {
          console.log(`🔌 WSI Server listening on ws://localhost:${port}`);
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
      if (this.browser?.ws) {
        this.browser.ws.close();
        this.browser = null;
      }
      if (this.container?.ws) {
        this.container.ws.close();
        this.container = null;
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
   * Get WebSocket URL for containers (Docker internal)
   */
  getContainerConnectionUrl(port: number): string {
    return `ws://host.docker.internal:${port}/wsi`;
  }

  /**
   * Queue a generation to send when container connects
   */
  queueGeneration(config: StartGenerationMessage): void {
    this.pendingGeneration = config;
  }

  /**
   * Check connection status
   */
  isBrowserConnected(): boolean {
    return this.browser !== null && this.browser.ws.readyState === WebSocket.OPEN;
  }

  isContainerConnected(): boolean {
    return this.container !== null && this.container.ws.readyState === WebSocket.OPEN;
  }

  // ============================================================================
  // CONNECTION HANDLING
  // ============================================================================

  private handleConnection(ws: WebSocket): void {
    const clientId = `client-${Date.now()}`;
    const existingBrowserId = this.browser?.id || 'none';
    console.log(`🔗 New connection: ${clientId} (existing browser: ${existingBrowserId})`);

    // Start as unknown, first message determines type
    const client: ConnectedClient = {
      ws,
      type: 'unknown',
      id: clientId,
      connectedAt: new Date(),
    };

    ws.on('message', (data: Buffer) => {
      this.handleMessage(client, data.toString());
    });

    ws.on('close', () => {
      this.handleDisconnect(client);
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error (${client.id}):`, error);
    });
  }

  private handleMessage(client: ConnectedClient, data: string): void {
    let msg: WSIMessage;
    try {
      msg = JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to parse message:', data);
      return;
    }

    // Identify client type from first meaningful message
    if (client.type === 'unknown') {
      client.type = this.identifyClientType(msg);
      this.registerClient(client);
    }

    // Route message based on type and client
    if (client.type === 'container') {
      this.handleContainerMessage(msg).catch(err => {
        console.error('❌ Error handling container message:', err);
      });
    } else if (client.type === 'browser') {
      this.handleBrowserMessage(msg);
    }
  }

  private identifyClientType(msg: WSIMessage): ClientType {
    // Container sends 'ready' as first message
    if (msg.type === 'ready') {
      return 'container';
    }
    // Browser sends 'browser_connect' or 'start_generation'
    if (msg.type === 'browser_connect' || msg.type === 'start_generation') {
      return 'browser';
    }
    // Default to browser for other messages (UI interactions)
    return 'browser';
  }

  private registerClient(client: ConnectedClient): void {
    if (client.type === 'browser') {
      if (this.browser && this.browser.ws !== client.ws) {
        // Only log as warning if replacing a different connection
        console.warn('⚠️  Replacing existing browser connection');
        this.browser.ws.close(4000, 'Replaced by new connection');
      } else if (this.browser) {
        // Same connection re-registering (shouldn't happen, but handle gracefully)
        console.log(`🌐 Browser re-registered: ${client.id}`);
        return;
      }
      this.browser = client;
      console.log(`🌐 Browser connected: ${client.id}`);
      this.emit('browser_connected', client.id);

      // Send current status to browser
      this.sendToBrowser({
        type: 'connection_status',
        browser_connected: true,
        container_connected: this.isContainerConnected(),
      });
    } else if (client.type === 'container') {
      if (this.container) {
        console.warn('⚠️  Replacing existing container connection');
        this.container.ws.close(4000, 'Replaced by new connection');
      }
      this.container = client;
      console.log(`📦 Container connected: ${client.id}`);
      this.emit('container_connected', client.id);

      // Notify browser
      this.sendToBrowser({
        type: 'connection_status',
        browser_connected: this.isBrowserConnected(),
        container_connected: true,
      });
    }
  }

  private handleDisconnect(client: ConnectedClient): void {
    if (client.type === 'browser' && this.browser?.id === client.id) {
      console.log(`🌐 Browser disconnected: ${client.id}`);
      this.browser = null;
      this.emit('browser_disconnected', client.id);
    } else if (client.type === 'container' && this.container?.id === client.id) {
      console.log(`📦 Container disconnected: ${client.id}`);
      this.container = null;
      this.emit('container_disconnected', client.id);

      // Cleanup container and volume
      if (this.currentDockerRequestId) {
        const dockerRequestId = this.currentDockerRequestId;
        this.currentDockerRequestId = null;
        this.currentRequestId = null;

        // Async cleanup - don't await, just fire and forget
        const dockerManager = getDockerManager();
        dockerManager.stopContainer(dockerRequestId).then(() => {
          console.log(`🧹 Cleaned up container and volume for: ${dockerRequestId}`);
        }).catch((err) => {
          console.warn(`⚠️  Cleanup failed for ${dockerRequestId}:`, err.message);
        });
      }

      // Notify browser
      this.sendToBrowser({
        type: 'connection_status',
        browser_connected: this.isBrowserConnected(),
        container_connected: false,
      });
    }
  }

  // ============================================================================
  // MESSAGE ROUTING
  // ============================================================================

  /**
   * Handle messages FROM container → forward to browser
   */
  private async handleContainerMessage(msg: WSIMessage): Promise<void> {
    switch (msg.type) {
      case 'ready':
        this.handleReady(msg as ReadyMessage);
        break;
      case 'shutdown_ready':
        this.handleShutdownReady(msg as ShutdownReadyMessage);
        break;
      case 'shutdown_failed':
        this.handleShutdownFailed(msg as ShutdownFailedMessage);
        break;
      case 'log':
      case 'progress':
      case 'conversation_log':
      case 'process_monitor':
        // Forward to browser
        this.sendToBrowser(msg);
        this.emit(msg.type, msg);
        break;
      case 'iteration_complete':
        // Forward to browser
        this.sendToBrowser(msg);
        this.emit(msg.type, msg);
        // Update iteration count in database
        this.updateIterationCount(msg as IterationCompleteMessage);
        break;
      case 'all_work_complete':
        // Forward to browser
        this.sendToBrowser(msg);
        this.emit(msg.type, msg);
        // Update database with completion info - MUST await before cleanup
        // (otherwise currentRequestId is set to null before DB update completes)
        await this.handleAllWorkComplete(msg as AllWorkCompleteMessage);
        // Clean up container after generation completes
        console.log('✅ Generation complete - cleaning up container');
        this.killContainer('Generation complete');
        break;
      case 'error':
        // Forward to browser
        this.sendToBrowser(msg);
        this.emit(msg.type, msg);
        // Update database if fatal error
        this.handleError(msg as ErrorMessage);
        break;
      case 'decision_prompt':
        // Forward to browser
        this.sendToBrowser(msg);
        // Also emit event for server-side handling
        this.emit(msg.type, msg);
        break;
      default:
        console.warn(`⚠️  Unknown container message type: ${msg.type}`);
        // Forward anyway - browser might handle it
        this.sendToBrowser(msg);
    }
  }

  /**
   * Update iteration count in database
   */
  private async updateIterationCount(msg: IterationCompleteMessage): Promise<void> {
    if (!this.currentRequestId) return;

    try {
      await storage.updateGenerationRequest(this.currentRequestId, {
        currentIteration: msg.iteration,
        lastSessionId: msg.session_id,
      });
      console.log(`[WSI] Updated generation ${this.currentRequestId} iteration to ${msg.iteration}`);
    } catch (error) {
      console.error(`[WSI] Failed to update iteration for ${this.currentRequestId}:`, error);
    }
  }

  /**
   * Update database with completion info (github_url, deployment_url, status)
   */
  private async handleAllWorkComplete(msg: AllWorkCompleteMessage): Promise<void> {
    if (!this.currentRequestId) return;

    try {
      await storage.updateGenerationRequest(this.currentRequestId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        githubUrl: msg.github_url,
        deploymentUrl: msg.flyio_url,  // Fly.io URL from container
        lastSessionId: msg.session_id,
      });
      console.log(`[WSI] Updated generation ${this.currentRequestId} to 'completed'`);
      console.log(`   GitHub: ${msg.github_url}`);
      console.log(`   Deployment: ${msg.flyio_url}`);
    } catch (error) {
      console.error(`[WSI] Failed to update completion for ${this.currentRequestId}:`, error);
    }
  }

  /**
   * Update database on fatal error
   */
  private async handleError(msg: ErrorMessage): Promise<void> {
    if (!this.currentRequestId || !msg.fatal) return;

    try {
      await storage.updateGenerationRequest(this.currentRequestId, {
        status: 'failed',
        errorMessage: msg.message,
      });
      console.log(`[WSI] Updated generation ${this.currentRequestId} to 'failed': ${msg.message}`);
    } catch (error) {
      console.error(`[WSI] Failed to update error status for ${this.currentRequestId}:`, error);
    }
  }

  /**
   * Handle messages FROM browser → forward to container
   */
  private handleBrowserMessage(msg: WSIMessage): void {
    switch (msg.type) {
      case 'browser_connect':
        // Already handled in identifyClientType
        break;
      case 'start_generation':
        // Spawn container and queue generation
        this.handleStartGeneration(msg as StartGenerationMessage);
        break;
      case 'stop_request':
        // User requested graceful stop - initiate shutdown handshake
        this.handleStopRequest(msg as ControlCommandMessage);
        break;
      case 'decision_response':
      case 'control_command':
        // Forward to container
        if (this.isContainerConnected()) {
          this.sendToContainer(msg);
        } else {
          this.sendToBrowser({
            type: 'error',
            message: 'No container connected',
          });
        }
        // Emit event for server-side handling
        this.emit(msg.type, msg);
        break;
      default:
        console.warn(`⚠️  Unknown browser message type: ${msg.type}`);
    }
  }

  private handleReady(msg: ReadyMessage): void {
    console.log(`✅ Container ready: ${msg.container_id}`);
    console.log(`   Workspace: ${msg.workspace}`);
    console.log(`   Mode: ${msg.generator_mode}`);

    // Forward to browser
    this.sendToBrowser(msg);
    this.emit('ready', msg);

    // Send queued generation if any
    if (this.pendingGeneration) {
      console.log('📤 Sending queued start_generation');
      this.sendToContainer(this.pendingGeneration);
      this.pendingGeneration = null;
    }
  }

  /**
   * Handle start_generation: spawn container if needed, queue generation
   *
   * The request_id comes from the database (created via POST /api/generations).
   * This method updates the database status and tracks the generation.
   */
  private async handleStartGeneration(msg: StartGenerationMessage): Promise<void> {
    // Validate request_id is present (required for Option B architecture)
    if (!msg.request_id) {
      console.error('❌ start_generation missing request_id - frontend must call POST /api/generations first');
      this.sendToBrowser({
        type: 'error',
        message: 'Invalid request: missing request_id. Please refresh and try again.',
        fatal: true,
      });
      return;
    }

    // Track the database request ID for status updates
    this.currentRequestId = msg.request_id;

    // Update database status to 'generating'
    try {
      await storage.updateGenerationRequest(msg.request_id, {
        status: 'generating',
      });
      console.log(`[WSI] Updated generation ${msg.request_id} status to 'generating'`);
    } catch (error) {
      console.error(`[WSI] Failed to update status for ${msg.request_id}:`, error);
      // Continue anyway - generation should still work, just status tracking will be off
    }

    // If container already connected, forward directly
    if (this.isContainerConnected()) {
      console.log('📤 Forwarding start_generation to connected container');
      this.sendToContainer(msg);
      this.emit('start_generation', msg);
      return;
    }

    // Queue the generation for when container connects
    this.queueGeneration(msg);

    // Notify browser we're spawning
    this.sendToBrowser({
      type: 'status',
      message: 'Spawning container...',
    });

    // Generate a unique Docker request ID (separate from database ID)
    const dockerRequestId = `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      // Spawn container via Docker Manager
      const dockerManager = getDockerManager();

      console.log(`🚀 Spawning container for generation: ${dockerRequestId} (DB ID: ${msg.request_id})`);
      console.log(`   App: ${msg.app_name}`);
      console.log(`   Mode: ${msg.mode}`);

      await dockerManager.spawnContainer({
        requestId: dockerRequestId,
        prompt: msg.prompt,
        mode: msg.mode,
        maxIterations: msg.max_iterations || 10,
        appName: msg.app_name || 'generated-app',
        outputDir: msg.output_dir,
        userId: msg.user_id,
        appId: msg.app_id,
        githubUrl: msg.github_url, // For resume - container will clone this repo
        isResume: !!msg.github_url, // If github_url provided, this is a resume
        resumeSessionId: msg.resume_session_id,
      });

      // Track Docker ID for cleanup when container disconnects
      this.currentDockerRequestId = dockerRequestId;

      this.sendToBrowser({
        type: 'status',
        message: 'Container started, waiting for connection...',
      });

      this.emit('start_generation', msg);
    } catch (error: any) {
      console.error('❌ Failed to spawn container:', error);

      // Clear the queued generation
      this.pendingGeneration = null;

      // Update database status to 'failed'
      try {
        await storage.updateGenerationRequest(msg.request_id, {
          status: 'failed',
          errorMessage: `Failed to spawn container: ${error.message}`,
        });
      } catch (dbError) {
        console.error(`[WSI] Failed to update error status for ${msg.request_id}:`, dbError);
      }

      // Notify browser of failure
      this.sendToBrowser({
        type: 'error',
        message: `Failed to spawn container: ${error.message}`,
        fatal: true,
      });
    }
  }

  // ============================================================================
  // GRACEFUL SHUTDOWN PROTOCOL
  // ============================================================================

  /**
   * Handle stop_request from browser - initiate graceful shutdown
   *
   * Protocol:
   * 1. Browser sends stop_request (user clicked Stop button)
   * 2. Server sends prepare_shutdown to container
   * 3. Container saves work (git commit/push), sends shutdown_ready
   * 4. Server terminates container and cleans up
   *
   * Timeout: If container doesn't respond within SHUTDOWN_TIMEOUT_MS,
   * server force-kills the container (work may be lost)
   */
  private handleStopRequest(msg: ControlCommandMessage): void {
    if (!this.isContainerConnected()) {
      this.sendToBrowser({
        type: 'error',
        message: 'No container connected to stop',
      });
      return;
    }

    if (this.shutdownPending) {
      console.log('⚠️  Shutdown already in progress');
      this.sendToBrowser({
        type: 'status',
        message: 'Shutdown already in progress...',
      });
      return;
    }

    console.log('🛑 Graceful shutdown requested');
    this.shutdownPending = true;

    // Notify browser that shutdown is starting
    this.sendToBrowser({
      type: 'shutdown_initiated',
      message: 'Saving your work before stopping...',
      timeout_seconds: this.SHUTDOWN_TIMEOUT_MS / 1000,
    });

    // Send prepare_shutdown to container
    this.sendToContainer({
      type: 'control_command',
      command: 'prepare_shutdown',
      reason: msg.reason || 'User requested stop',
    });

    // Start timeout - force kill if container doesn't respond
    this.shutdownTimeout = setTimeout(() => {
      console.warn('⚠️  Shutdown timeout - force killing container');
      this.forceKillContainer('Timeout waiting for graceful shutdown');
    }, this.SHUTDOWN_TIMEOUT_MS);

    this.emit('stop_request', msg);
  }

  /**
   * Handle shutdown_ready from container - work has been saved
   */
  private handleShutdownReady(msg: ShutdownReadyMessage): void {
    console.log('✅ Container ready for shutdown');
    if (msg.commit_hash) {
      console.log(`   Commit: ${msg.commit_hash}`);
    }
    if (msg.pushed) {
      console.log('   Pushed to GitHub: Yes');
    }

    // Clear the timeout
    if (this.shutdownTimeout) {
      clearTimeout(this.shutdownTimeout);
      this.shutdownTimeout = null;
    }

    // Notify browser
    this.sendToBrowser({
      type: 'shutdown_ready',
      message: msg.message || 'Work saved successfully',
      commit_hash: msg.commit_hash,
      pushed: msg.pushed,
    });

    // Now kill the container gracefully
    this.killContainer('Graceful shutdown complete');
  }

  /**
   * Handle shutdown_failed from container - couldn't save work
   */
  private handleShutdownFailed(msg: ShutdownFailedMessage): void {
    console.error('❌ Container shutdown failed:', msg.reason);

    // Clear the timeout
    if (this.shutdownTimeout) {
      clearTimeout(this.shutdownTimeout);
      this.shutdownTimeout = null;
    }

    // Notify browser - let them decide whether to force kill
    this.sendToBrowser({
      type: 'shutdown_failed',
      reason: msg.reason,
      message: 'Failed to save work. You can force stop (work may be lost) or cancel.',
    });

    // Don't auto-kill - let the user decide
    // They can send another stop_request to force it
    this.shutdownPending = false;

    this.emit('shutdown_failed', msg);
  }

  /**
   * Force kill container after timeout (work may be lost)
   */
  private forceKillContainer(reason: string): void {
    this.sendToBrowser({
      type: 'shutdown_timeout',
      message: `Force stopping: ${reason}`,
    });

    this.killContainer(reason);
  }

  /**
   * Actually terminate the container and cleanup
   */
  private async killContainer(reason: string): Promise<void> {
    console.log(`🛑 Killing container: ${reason}`);

    // Reset shutdown state
    this.shutdownPending = false;
    if (this.shutdownTimeout) {
      clearTimeout(this.shutdownTimeout);
      this.shutdownTimeout = null;
    }

    // Close container WebSocket (triggers cleanup in handleDisconnect)
    if (this.container?.ws) {
      this.container.ws.close(4001, reason);
    }

    // The handleDisconnect will take care of Docker cleanup via currentRequestId
    // We just need to notify the browser
    this.sendToBrowser({
      type: 'generation_stopped',
      message: 'Generation stopped',
      reason,
    });

    this.emit('generation_stopped', { reason });
  }

  /**
   * Public method to request graceful stop (for Express routes)
   */
  public requestStop(reason?: string): void {
    this.handleStopRequest({
      type: 'control_command',
      command: 'stop_request',
      reason,
    });
  }

  // ============================================================================
  // SEND HELPERS
  // ============================================================================

  private sendToBrowser(msg: WSIMessage): void {
    if (this.browser && this.browser.ws.readyState === WebSocket.OPEN) {
      this.browser.ws.send(JSON.stringify(msg));
    }
  }

  private sendToContainer(msg: WSIMessage): void {
    if (this.container && this.container.ws.readyState === WebSocket.OPEN) {
      this.container.ws.send(JSON.stringify(msg));
    } else {
      console.warn('⚠️  Cannot send to container - not connected');
    }
  }

  /**
   * Send message to browser (public API for Express routes)
   */
  public notifyBrowser(msg: WSIMessage): void {
    this.sendToBrowser(msg);
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let instance: WSIServer | null = null;

export function getWSIServer(): WSIServer {
  if (!instance) {
    instance = new WSIServer();
  }
  return instance;
}
