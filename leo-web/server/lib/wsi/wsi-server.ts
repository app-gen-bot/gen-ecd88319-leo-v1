import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { EventEmitter } from 'events';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../shared/schema.js';
import { getContainerManager } from './container-manager-factory.js';
import { storage } from '../storage/factory.js';
import { sendGenerationCompleteEmail, sendGenerationFailedEmail } from '../email-service.js';
import { deductCredits, getCreditConfig } from '../../routes/profile.js';
import { storeAppCredentials, getAppCredentials } from '../credentials-manager.js';

// Lazy-load database connection for profile lookups
let profileDbClient: ReturnType<typeof postgres> | null = null;
let profileDb: ReturnType<typeof drizzle> | null = null;

function getProfileDb() {
  if (!profileDb) {
    const connectionString =
      process.env.LEO_DATABASE_URL_POOLING ||
      process.env.LEO_DATABASE_URL ||
      process.env.DATABASE_URL_POOLING ||
      process.env.DATABASE_URL ||
      'postgresql://placeholder';
    profileDbClient = postgres(connectionString, {
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
    profileDb = drizzle(profileDbClient, { schema });
  }
  return profileDb;
}

/**
 * Get user profile for BYOT (Bring Your Own Token) resolution
 * Returns role and tokens (Claude OAuth and Supabase access token if configured)
 */
async function getUserProfileForToken(userId: string): Promise<{
  role: 'user' | 'user_plus' | 'dev' | 'admin';
  claudeOauthToken: string | null;
  supabaseAccessToken: string | null;
} | null> {
  try {
    const [profile] = await getProfileDb()
      .select({
        role: schema.profiles.role,
        claudeOauthToken: schema.profiles.claudeOauthToken,
        supabaseAccessToken: schema.profiles.supabaseAccessToken,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId));

    return profile || null;
  } catch (error) {
    console.error('[WSI] Failed to get user profile for token:', error);
    return null;
  }
}

/**
 * WSI Server - WebSocket Interface Server for Leo SaaS
 *
 * Handles BOTH browser and container connections:
 * - Browser connects to view console output and send commands
 * - Container connects to send logs/progress and receive commands
 * - Server routes messages between them
 *
 * Multi-Session Architecture:
 * - Each generation has its own session (keyed by database request_id)
 * - Browser sends messages with request_id for routing
 * - Containers are matched to sessions when they connect
 * - Messages are forwarded to browser with request_id attached
 */

// ============================================================================
// WSI MESSAGE TYPES (from Leo Remote)
// ============================================================================

export interface WSIMessage {
  type: string;
  request_id?: number; // Database ID for routing (multi-session)
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
  iteration_cost?: number; // USD cost for this iteration
  credentials?: CredentialEntry[];  // App credentials (for early persistence)
}

// Warning object from Leo Container
export interface GenerationWarning {
  code: string;
  message: string;
  details?: {
    remediation_url?: string;
  };
}

// Credential object for storing app secrets
export interface CredentialEntry {
  key: string;
  value: string;
}

export interface AllWorkCompleteMessage extends WSIMessage {
  type: 'all_work_complete';
  completion_reason: string;
  app_path: string;
  session_id?: string;
  github_url?: string;
  github_commit?: string;  // Commit SHA
  s3_url?: string;  // Deprecated - S3 no longer used
  download_url?: string;  // Deprecated - S3 no longer used
  flyio_url?: string;  // Fly.io deployed app URL
  total_iterations: number;
  total_duration?: number;  // Duration in seconds
  total_cost?: number;  // USD cost (float)
  warnings?: GenerationWarning[];  // RLS, security warnings, etc.
  credentials?: CredentialEntry[];  // App credentials (Supabase, DB) to persist
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
  id: string;
  prompt: string;
  suggested_task?: string;
  allow_editor?: boolean;
  iteration?: number;
  max_iterations?: number;
  options?: string[];
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

// Screenshot captured during testing/quality assurance (v2.2)
export interface ScreenshotMessage extends WSIMessage {
  type: 'screenshot';
  timestamp: string;  // ISO timestamp when screenshot was captured
  image_base64: string;  // data:image/png;base64,... format
  filename: string;  // Original filename (e.g., "homepage-test.png")
  description?: string;  // What the screenshot shows
  width?: number;  // Image width in pixels
  height?: number;  // Image height in pixels
  stage?: string;  // Generation stage (e.g., "quality_assurance", "iteration_1")
}

// ============================================================================
// CREDENTIAL REQUEST/RESPONSE (v2.2)
// ============================================================================

/** Specification for a single credential Leo needs from the user */
export interface CredentialSpec {
  key: string;                  // Environment variable name, e.g., "STRIPE_SECRET_KEY"
  label: string;                // Human-readable label, e.g., "Stripe Secret Key"
  description?: string;         // Help text, e.g., "Found at dashboard.stripe.com/apikeys"
  required: boolean;            // If false, user can skip this credential
  sensitive: boolean;           // If true, use password input (masked)
  validation_pattern?: string;  // Regex for client-side validation
  help_url?: string;            // URL where user can obtain this credential
}

/** User-provided credential value */
export interface CredentialValueEntry {
  key: string;                  // Matches CredentialSpec.key
  value: string;                // The actual secret value
}

/** Container requests credentials from user mid-generation (v2.2) */
export interface CredentialRequestMessage extends WSIMessage {
  type: 'credential_request';
  id: string;                   // Correlation ID for response matching
  credentials: CredentialSpec[];
  context?: string;             // Why Leo needs these, e.g., "Setting up Stripe integration"
  timeout_seconds?: number;     // Timeout before failing (default: 600 = 10 minutes)
}

/** User response to credential request (v2.2) */
export interface CredentialResponseMessage extends WSIMessage {
  type: 'credential_response';
  id: string;                   // Matches CredentialRequestMessage.id
  credentials: CredentialValueEntry[];
  cancelled: boolean;           // True if user cancelled the request
}

/** Timeout warning sent when credential request is taking too long (v2.2) */
export interface CredentialTimeoutWarningMessage extends WSIMessage {
  type: 'credential_timeout_warning';
  id: string;                   // Matches CredentialRequestMessage.id
  elapsed_seconds: number;      // How long we've been waiting
  remaining_seconds: number;    // Time until timeout
}

// Messages FROM browser (TO container)
/** Attachment metadata for context files */
export interface AttachmentInfo {
  name: string;
  storagePath: string;  // Path in Supabase Storage
  size: number;
  mimeType: string;
}

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
  /** Attachments: context files stored in Supabase Storage */
  attachments?: AttachmentInfo[];
}

export interface DecisionResponseMessage extends WSIMessage {
  type: 'decision_response';
  id: string;
  parent_id?: string;
  choice: string;
  input?: string;
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
  requestId?: number; // Database request ID (for containers)
}

// ============================================================================
// SESSION TYPE - tracks one generation
// ============================================================================

interface GenerationSession {
  requestId: number;           // Database request ID
  dockerRequestId: string;     // Docker container ID
  userId: string | null;       // For email notifications
  appName: string;             // For email notifications
  container: ConnectedClient | null;  // Connected container
  pendingGeneration: StartGenerationMessage | null;  // Queued until container ready
  shutdownTimeout: NodeJS.Timeout | null;
  shutdownPending: boolean;
  createdAt: Date;
}

// ============================================================================
// WSI SERVER CLASS
// ============================================================================

export class WSIServer extends EventEmitter {
  private wss: WebSocketServer | null = null;

  // Multi-browser support: Map of client_id -> browser connection
  // Allows multiple browser tabs/devices to receive updates simultaneously
  private browsers: Map<string, ConnectedClient> = new Map();

  // Multi-session support: Map of request_id -> session
  private sessions: Map<number, GenerationSession> = new Map();

  // Map docker request ID -> database request ID (for container identification)
  private dockerToDbId: Map<string, number> = new Map();

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

    // Initialize container manager early to start Docker Events listener
    // and run orphan cleanup (instead of waiting until first generation)
    getContainerManager();
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
      // Close all browser connections
      for (const browser of this.browsers.values()) {
        if (browser.ws) {
          browser.ws.close();
        }
      }
      this.browsers.clear();

      // Close all session containers
      for (const session of this.sessions.values()) {
        if (session.container?.ws) {
          session.container.ws.close();
        }
        if (session.shutdownTimeout) {
          clearTimeout(session.shutdownTimeout);
        }
      }
      this.sessions.clear();
      this.dockerToDbId.clear();

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
   * Check connection status
   */
  isBrowserConnected(): boolean {
    // At least one browser is connected
    for (const browser of this.browsers.values()) {
      if (browser.ws.readyState === WebSocket.OPEN) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get count of connected browsers
   */
  getBrowserCount(): number {
    let count = 0;
    for (const browser of this.browsers.values()) {
      if (browser.ws.readyState === WebSocket.OPEN) {
        count++;
      }
    }
    return count;
  }

  isContainerConnected(requestId?: number): boolean {
    if (requestId !== undefined) {
      const session = this.sessions.get(requestId);
      return session?.container !== null && session?.container?.ws.readyState === WebSocket.OPEN;
    }
    // Legacy: check if any container is connected
    for (const session of this.sessions.values()) {
      if (session.container && session.container.ws.readyState === WebSocket.OPEN) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get count of active sessions
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  // ============================================================================
  // CONNECTION HANDLING
  // ============================================================================

  private handleConnection(ws: WebSocket): void {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    console.log(`🔗 New connection: ${clientId}`);

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
      this.registerClient(client, msg);
    }

    // Route message based on type and client
    if (client.type === 'container') {
      this.handleContainerMessage(client, msg).catch(err => {
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

  private registerClient(client: ConnectedClient, msg: WSIMessage): void {
    if (client.type === 'browser') {
      // Check if this client is already registered
      if (this.browsers.has(client.id)) {
        console.log(`🌐 Browser re-registered: ${client.id}`);
        return;
      }

      // Add to browsers map (allow multiple browsers)
      this.browsers.set(client.id, client);
      console.log(`🌐 Browser connected: ${client.id} (${this.browsers.size} total)`);
      this.emit('browser_connected', client.id);

      // Send current status to THIS browser only (via direct send, not broadcast)
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'connection_status',
          browser_connected: true,
          container_connected: this.isContainerConnected(),
          active_sessions: this.sessions.size,
          browser_count: this.browsers.size,
        }));
      }
    } else if (client.type === 'container') {
      // Container connected - match to pending session
      // Container sends ready message with request_id (from DB_REQUEST_ID env var)
      const readyMsg = msg as ReadyMessage;
      const requestId = readyMsg.request_id;

      if (requestId !== undefined) {
        const session = this.sessions.get(requestId);
        if (session) {
          session.container = client;
          client.requestId = requestId;
          console.log(`📦 Container connected for session ${requestId}: ${client.id}`);
          this.emit('container_connected', { clientId: client.id, requestId });

          // Notify browser with request_id
          this.sendToBrowser({
            type: 'connection_status',
            request_id: requestId,
            browser_connected: this.isBrowserConnected(),
            container_connected: true,
          });
        } else {
          console.warn(`⚠️  Container connected with unknown request_id: ${requestId}`);
          // Close the orphan container
          client.ws.close(4002, 'Unknown request_id');
        }
      } else {
        // Fallback: match to first pending session (legacy behavior)
        const pendingSession = this.findPendingSession();
        if (pendingSession) {
          pendingSession.container = client;
          client.requestId = pendingSession.requestId;
          console.log(`📦 Container connected (legacy match) for session ${pendingSession.requestId}: ${client.id}`);
          this.emit('container_connected', { clientId: client.id, requestId: pendingSession.requestId });

          this.sendToBrowser({
            type: 'connection_status',
            request_id: pendingSession.requestId,
            browser_connected: this.isBrowserConnected(),
            container_connected: true,
          });
        } else {
          console.warn('⚠️  Container connected but no pending session - closing');
          client.ws.close(4003, 'No pending session');
        }
      }
    }
  }

  /**
   * Find first session waiting for a container
   */
  private findPendingSession(): GenerationSession | null {
    for (const session of this.sessions.values()) {
      if (!session.container && session.pendingGeneration) {
        return session;
      }
    }
    return null;
  }

  private handleDisconnect(client: ConnectedClient): void {
    if (client.type === 'browser') {
      // Remove from browsers map
      if (this.browsers.has(client.id)) {
        this.browsers.delete(client.id);
        console.log(`🌐 Browser disconnected: ${client.id} (${this.browsers.size} remaining)`);
        this.emit('browser_disconnected', client.id);
      }
    } else if (client.type === 'container') {
      const requestId = client.requestId;
      if (requestId !== undefined) {
        const session = this.sessions.get(requestId);
        if (session && session.container?.id === client.id) {
          console.log(`📦 Container disconnected for session ${requestId}: ${client.id}`);
          session.container = null;
          this.emit('container_disconnected', { clientId: client.id, requestId });

          // Cleanup container and volume
          const dockerRequestId = session.dockerRequestId;

          // Clear shutdown state
          if (session.shutdownTimeout) {
            clearTimeout(session.shutdownTimeout);
            session.shutdownTimeout = null;
          }

          // Remove session
          this.sessions.delete(requestId);
          this.dockerToDbId.delete(dockerRequestId);

          // Async cleanup - don't await, just fire and forget
          const containerManager = getContainerManager();
          containerManager.stopContainer(dockerRequestId).then(() => {
            console.log(`🧹 Cleaned up container and volume for: ${dockerRequestId}`);
          }).catch((err) => {
            console.warn(`⚠️  Cleanup failed for ${dockerRequestId}:`, err.message);
          });

          // Notify browser
          this.sendToBrowser({
            type: 'connection_status',
            request_id: requestId,
            browser_connected: this.isBrowserConnected(),
            container_connected: false,
          });
        }
      }
    }
  }

  // ============================================================================
  // MESSAGE ROUTING
  // ============================================================================

  /**
   * Handle messages FROM container → forward to browser
   */
  private async handleContainerMessage(client: ConnectedClient, msg: WSIMessage): Promise<void> {
    const requestId = client.requestId;
    if (requestId === undefined) {
      console.warn('⚠️  Container message without requestId:', msg.type);
      return;
    }

    const session = this.sessions.get(requestId);
    if (!session) {
      console.warn(`⚠️  Container message for unknown session ${requestId}:`, msg.type);
      return;
    }

    // Attach request_id to message for browser routing
    const msgWithId = { ...msg, request_id: requestId };

    switch (msg.type) {
      case 'ready':
        this.handleReady(session, msg as ReadyMessage);
        break;
      case 'shutdown_ready':
        await this.handleShutdownReady(session, msg as ShutdownReadyMessage);
        break;
      case 'shutdown_failed':
        this.handleShutdownFailed(session, msg as ShutdownFailedMessage);
        break;
      case 'log':
      case 'progress':
      case 'conversation_log':
      case 'screenshot':
        // Forward to browser with request_id
        this.sendToBrowser(msgWithId);
        this.emit(msg.type, msgWithId);
        break;
      case 'iteration_complete':
        // Forward to browser
        this.sendToBrowser(msgWithId);
        this.emit(msg.type, msgWithId);
        // Update iteration count in database
        this.updateIterationCount(session, msg as IterationCompleteMessage);
        break;
      case 'all_work_complete':
        // Forward to browser
        this.sendToBrowser(msgWithId);
        this.emit(msg.type, msgWithId);
        // Update database with completion info - MUST await before cleanup
        await this.handleAllWorkComplete(session, msg as AllWorkCompleteMessage);
        // Clean up container after generation completes
        console.log(`✅ Generation ${requestId} complete - cleaning up container`);
        this.killSessionContainer(session, 'Generation complete');
        break;
      case 'error':
        // Forward to browser
        this.sendToBrowser(msgWithId);
        this.emit(msg.type, msgWithId);
        // Update database and kill container if fatal error
        await this.handleError(session, msg as ErrorMessage);
        break;
      case 'decision_prompt':
        // Forward to browser
        this.sendToBrowser(msgWithId);
        // Also emit event for server-side handling
        this.emit(msg.type, msgWithId);
        break;
      case 'credential_request':
        // Forward credential request to browser - user needs to provide API keys
        console.log(`[WSI] Credential request from container: ${(msg as CredentialRequestMessage).id}`);
        console.log(`[WSI]   Context: ${(msg as CredentialRequestMessage).context || 'none'}`);
        console.log(`[WSI]   Keys needed: ${(msg as CredentialRequestMessage).credentials.map(c => c.key).join(', ')}`);
        this.sendToBrowser(msgWithId);
        this.emit(msg.type, msgWithId);
        break;
      case 'credential_timeout_warning':
        // Forward timeout warning to browser
        console.log(`[WSI] Credential timeout warning: ${(msg as CredentialTimeoutWarningMessage).remaining_seconds}s remaining`);
        this.sendToBrowser(msgWithId);
        this.emit(msg.type, msgWithId);
        break;
      default:
        console.warn(`⚠️  Unknown container message type: ${msg.type}`);
        // Forward anyway - browser might handle it
        this.sendToBrowser(msgWithId);
    }
  }

  /**
   * Update iteration count and append iteration data to database
   */
  private async updateIterationCount(session: GenerationSession, msg: IterationCompleteMessage): Promise<void> {
    try {
      // Build new iteration data entry (only if we have cost or duration)
      const iterationEntry = {
        iteration: msg.iteration,
        cost: msg.iteration_cost ?? 0,
        duration: msg.duration ?? 0,
      };

      // Get existing iteration data to append to
      const existingRequest = await storage.getGenerationRequestById(session.requestId);
      const existingIterationData = (existingRequest?.iterationData as Array<{iteration: number, cost: number, duration: number}>) || [];

      // Append new iteration data
      const updatedIterationData = [...existingIterationData, iterationEntry];

      await storage.updateGenerationRequest(session.requestId, {
        currentIteration: msg.iteration,
        lastSessionId: msg.session_id,
        iterationData: updatedIterationData,
      });

      const costStr = msg.iteration_cost !== undefined ? ` ($${msg.iteration_cost.toFixed(4)})` : '';
      const durationStr = msg.duration !== undefined ? ` ${msg.duration}s` : '';
      console.log(`[WSI] Updated generation ${session.requestId} iteration to ${msg.iteration}${costStr}${durationStr}`);

      // Store credentials if provided (for early persistence - in case generation crashes)
      if (msg.credentials && msg.credentials.length > 0 && existingRequest?.appRefId) {
        try {
          await storeAppCredentials(existingRequest.appRefId, msg.credentials);
          console.log(`[WSI] Stored ${msg.credentials.length} credentials for app ${existingRequest.appRefId} (iteration ${msg.iteration})`);
        } catch (credError) {
          console.error(`[WSI] Failed to store credentials:`, credError);
          // Non-fatal - continue even if credential storage fails
        }
      }
    } catch (error) {
      console.error(`[WSI] Failed to update iteration for ${session.requestId}:`, error);
    }
  }

  /**
   * Update database with completion info (github_url, deployment_url, status, cost, duration, warnings)
   *
   * Handles both normal completion and cancellation:
   * - completion_reason='cancelled' -> status='paused' (resumable)
   * - any other completion_reason -> status='completed'
   */
  private async handleAllWorkComplete(session: GenerationSession, msg: AllWorkCompleteMessage): Promise<void> {
    try {
      // Determine status based on completion_reason
      // 'cancelled' means user stopped generation -> 'paused' (resumable)
      // anything else (e.g., 'agent_complete', 'max_iterations') -> 'completed'
      const isCancelled = msg.completion_reason === 'cancelled';
      const finalStatus = isCancelled ? 'paused' : 'completed';

      // Update generation_requests status with cost, duration, commit, and warnings
      await storage.updateGenerationRequest(session.requestId, {
        status: finalStatus,
        // Only set completedAt for actual completions, not cancellations
        ...(isCancelled ? {} : { completedAt: new Date().toISOString() }),
        lastSessionId: msg.session_id,
        currentIteration: msg.total_iterations,
        // Store cost as string for precision (e.g., "0.0523")
        ...(msg.total_cost !== undefined ? { totalCost: msg.total_cost.toFixed(4) } : {}),
        // Store duration in seconds
        ...(msg.total_duration !== undefined ? { totalDuration: Math.round(msg.total_duration) } : {}),
        // Store GitHub commit SHA
        ...(msg.github_commit ? { githubCommit: msg.github_commit } : {}),
        // Store warnings (RLS, security issues, etc.)
        ...(msg.warnings && msg.warnings.length > 0 ? { warnings: msg.warnings } : {}),
      });

      // Update apps table with github_url, deployment_url, and cumulative cost
      const request = await storage.getGenerationRequestById(session.requestId);
      if (request) {
        const app = await storage.getAppById(request.appRefId);
        const currentCost = parseFloat(app?.cumulativeCost || '0');
        const newCumulativeCost = msg.total_cost !== undefined
          ? (currentCost + msg.total_cost).toFixed(4)
          : undefined;

        await storage.updateApp(request.appRefId, {
          ...(msg.github_url ? { githubUrl: msg.github_url } : {}),
          ...(msg.flyio_url ? { deploymentUrl: msg.flyio_url } : {}),
          ...(newCumulativeCost ? { cumulativeCost: newCumulativeCost } : {}),
        });
      }

      // Store credentials if provided (for persistence across sessions/resume)
      if (msg.credentials && msg.credentials.length > 0 && request?.appRefId) {
        try {
          await storeAppCredentials(request.appRefId, msg.credentials);
          console.log(`[WSI] Stored ${msg.credentials.length} credentials for app ${request.appRefId}`);
        } catch (credError) {
          console.error(`[WSI] Failed to store credentials:`, credError);
          // Non-fatal - generation is still successful
        }
      }

      console.log(`[WSI] Updated generation ${session.requestId} to '${finalStatus}'${isCancelled ? ' (resumable)' : ''}`);
      console.log(`   Reason: ${msg.completion_reason}`);
      console.log(`   GitHub: ${msg.github_url}`);
      console.log(`   Commit: ${msg.github_commit || 'N/A'}`);
      console.log(`   Deployment: ${msg.flyio_url}`);
      console.log(`   Total Cost: $${msg.total_cost?.toFixed(4) || 'N/A'}`);
      console.log(`   Duration: ${msg.total_duration ? Math.round(msg.total_duration) + 's' : 'N/A'}`);
      console.log(`   Session: ${msg.session_id || 'N/A'}`);
      if (msg.warnings && msg.warnings.length > 0) {
        console.log(`   Warnings: ${msg.warnings.length} (${msg.warnings.map(w => w.code).join(', ')})`);
      }

      // Deduct credits after successful generation (not for cancelled)
      // Cancelled generations don't count as completed - user can resume
      if (session.userId && !isCancelled) {
        try {
          const creditConfig = await getCreditConfig();
          const deducted = await deductCredits(
            session.userId,
            creditConfig.creditsPerGeneration,
            `Generation completed: ${session.appName || 'app'} (ID: ${session.requestId})`,
            session.requestId
          );
          if (deducted) {
            console.log(`[WSI] Deducted ${creditConfig.creditsPerGeneration} credit(s) from user ${session.userId}`);
          } else {
            console.warn(`[WSI] Failed to deduct credits from user ${session.userId} (insufficient balance?)`);
          }
        } catch (creditError) {
          console.error(`[WSI] Error deducting credits:`, creditError);
          // Don't fail the completion - generation was successful
        }
      } else if (isCancelled) {
        console.log(`[WSI] Skipping credit deduction for cancelled generation (resumable)`);
      }

      // Send email notification for completed generation (not for cancelled)
      if (session.userId && !isCancelled) {
        sendGenerationCompleteEmail(session.userId, {
          appName: session.appName || 'generated-app',
          totalIterations: msg.total_iterations,
          totalCost: msg.total_cost,
          totalDuration: msg.total_duration ? Math.round(msg.total_duration) : undefined,
          githubUrl: msg.github_url,
          deploymentUrl: msg.flyio_url,
          generationId: session.requestId,
        }).catch(err => console.error('[WSI] Failed to send completion email:', err));
      }
    } catch (error) {
      console.error(`[WSI] Failed to update completion for ${session.requestId}:`, error);
    }
  }

  /**
   * Handle container error - update database and kill container if fatal
   *
   * Per WSI Protocol v2.1:
   * - Fatal errors: Update DB to 'failed', stop container
   * - Non-fatal errors: Log warning, continue (container handles recovery)
   */
  private async handleError(session: GenerationSession, msg: ErrorMessage): Promise<void> {
    // Default fatal=true per protocol spec (line 753: "default: true")
    const isFatal = msg.fatal !== false;

    if (!isFatal) {
      // Non-fatal: just log, container will handle recovery
      console.log(`[WSI] Non-fatal error (session ${session.requestId}): ${msg.message}${msg.error_code ? ` (${msg.error_code})` : ''}`);
      return;
    }

    // Fatal error - update database and kill container
    console.error(`[WSI] Fatal error (session ${session.requestId}): ${msg.message}${msg.error_code ? ` (${msg.error_code})` : ''}`);

    try {
      await storage.updateGenerationRequest(session.requestId, {
        status: 'failed',
        errorMessage: msg.error_code
          ? `${msg.error_code}: ${msg.message}`
          : msg.message,
      });
      console.log(`[WSI] Updated generation ${session.requestId} to 'failed'`);

      // Send email notification for failed generation
      if (session.userId) {
        sendGenerationFailedEmail(session.userId, {
          appName: session.appName || 'generated-app',
          errorMessage: msg.error_code
            ? `${msg.error_code}: ${msg.message}`
            : msg.message,
          generationId: session.requestId,
        }).catch(err => console.error('[WSI] Failed to send failure email:', err));
      }
    } catch (error) {
      console.error(`[WSI] Failed to update error status for ${session.requestId}:`, error);
    }

    // Kill the container after fatal error (per protocol: call stopContainer)
    this.killSessionContainer(session, `Fatal error: ${msg.message}`);
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
      case 'credential_response':
      case 'control_command':
        // Forward to correct container based on request_id
        const requestId = msg.request_id;
        if (requestId !== undefined) {
          const session = this.sessions.get(requestId);
          if (session && session.container) {
            this.sendToContainer(session.container, msg);
          } else {
            this.sendToBrowser({
              type: 'error',
              request_id: requestId,
              message: 'No container connected for this generation',
            });
          }
        } else {
          this.sendToBrowser({
            type: 'error',
            message: 'Missing request_id in message',
          });
        }
        // Emit event for server-side handling
        this.emit(msg.type, msg);
        break;
      default:
        console.warn(`⚠️  Unknown browser message type: ${msg.type}`);
    }
  }

  private handleReady(session: GenerationSession, msg: ReadyMessage): void {
    console.log(`✅ Container ready for session ${session.requestId}: ${msg.container_id}`);
    console.log(`   Workspace: ${msg.workspace}`);
    console.log(`   Mode: ${msg.generator_mode}`);

    // Forward to browser with request_id
    this.sendToBrowser({ ...msg, request_id: session.requestId });
    this.emit('ready', { ...msg, request_id: session.requestId });

    // Send queued generation if any
    if (session.pendingGeneration && session.container) {
      console.log(`📤 Sending queued start_generation for session ${session.requestId}`);
      this.sendToContainer(session.container, session.pendingGeneration);
      session.pendingGeneration = null;
    }
  }

  /**
   * Handle start_generation: spawn container and create session
   *
   * The request_id comes from the database (created via POST /api/generations).
   * This method creates a new session and spawns a dedicated container.
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

    const requestId = msg.request_id;

    // Check if session already exists
    if (this.sessions.has(requestId)) {
      console.warn(`⚠️  Session ${requestId} already exists - ignoring duplicate start_generation`);
      return;
    }

    // Update database status to 'generating'
    try {
      await storage.updateGenerationRequest(requestId, {
        status: 'generating',
      });
      console.log(`[WSI] Updated generation ${requestId} status to 'generating'`);
    } catch (error) {
      console.error(`[WSI] Failed to update status for ${requestId}:`, error);
      // Continue anyway - generation should still work, just status tracking will be off
    }

    // Generate a unique Docker request ID (separate from database ID)
    const dockerRequestId = `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Augment prompt if user attached context files
    if (msg.attachments && msg.attachments.length > 0) {
      const contextNote = `\n\n---\nUser has attached ${msg.attachments.length} context file(s). They are available at /workspace/app/.context/`;
      msg.prompt = msg.prompt + contextNote;
      console.log(`📎 Augmented prompt with ${msg.attachments.length} attachment(s)`);
    }

    // Create session BEFORE spawning container
    const session: GenerationSession = {
      requestId,
      dockerRequestId,
      userId: msg.user_id || null,
      appName: msg.app_name || 'generated-app',
      container: null,
      pendingGeneration: msg, // Queue until container connects
      shutdownTimeout: null,
      shutdownPending: false,
      createdAt: new Date(),
    };

    this.sessions.set(requestId, session);
    this.dockerToDbId.set(dockerRequestId, requestId);

    console.log(`📋 Created session ${requestId} (Docker: ${dockerRequestId}) - Active sessions: ${this.sessions.size}`);

    // Resolve BYOT tokens based on user role (Bring Your Own Token)
    let claudeOauthToken: string | undefined;
    let supabaseAccessToken: string | undefined;
    try {
      const profile = await getUserProfileForToken(msg.user_id);
      if (profile) {
        const isDeveloper = profile.role === 'dev' || profile.role === 'admin';
        if (isDeveloper) {
          // Developers MUST have their own Claude token configured
          if (!profile.claudeOauthToken) {
            console.error(`[WSI] Developer ${msg.user_id} has no Claude token configured`);
            this.sessions.delete(requestId);
            this.dockerToDbId.delete(dockerRequestId);

            // Update database status to 'failed'
            await storage.updateGenerationRequest(requestId, {
              status: 'failed',
              errorMessage: 'Claude token required. Please configure your token in Settings.',
            });

            this.sendToBrowser({
              type: 'error',
              request_id: requestId,
              message: 'Claude token required. Please configure your token in Settings.',
              fatal: true,
              error_code: 'MISSING_DEVELOPER_TOKEN',
            });
            return;
          }
          claudeOauthToken = profile.claudeOauthToken;
          console.log(`[WSI] Using developer's BYOT Claude token for user ${msg.user_id}`);
        } else {
          // Regular users use the shared platform token
          console.log(`[WSI] Using shared platform Claude token for user ${msg.user_id}`);
        }

        // Supabase access token is optional but recommended for per-app mode
        if (profile.supabaseAccessToken) {
          supabaseAccessToken = profile.supabaseAccessToken;
          console.log(`[WSI] Using BYOT Supabase access token for user ${msg.user_id}`);
        } else {
          console.log(`[WSI] No Supabase access token configured for user ${msg.user_id} - will use pool mode`);
        }
      }
    } catch (error) {
      console.error(`[WSI] Failed to resolve BYOT tokens for user ${msg.user_id}:`, error);
      // Continue with shared token as fallback
    }

    // Notify browser we're spawning
    this.sendToBrowser({
      type: 'status',
      request_id: requestId,
      message: 'Spawning container...',
    });

    // For resume, look up stored app credentials
    let appCredentials: Array<{ key: string; value: string }> | undefined;
    const isResume = !!msg.github_url;
    if (isResume) {
      try {
        // Get generation request to find appRefId
        const genRequest = await storage.getGenerationRequestById(requestId);
        if (genRequest?.appRefId) {
          appCredentials = await getAppCredentials(genRequest.appRefId);
          if (appCredentials.length > 0) {
            console.log(`[WSI] Retrieved ${appCredentials.length} stored credentials for resume (app ${genRequest.appRefId})`);
          }
        }
      } catch (credError) {
        console.error(`[WSI] Failed to retrieve stored credentials for resume:`, credError);
        // Continue without credentials - container will try to set up new Supabase project
      }
    }

    try {
      // Spawn container via Container Manager (Docker or Fargate)
      const containerManager = getContainerManager();

      console.log(`🚀 Spawning container for generation: ${dockerRequestId} (DB ID: ${requestId})`);
      console.log(`   App: ${msg.app_name}`);
      console.log(`   Mode: ${msg.mode}`);
      if (isResume && appCredentials?.length) {
        console.log(`   Resume: using ${appCredentials.length} stored credentials`);
      }

      await containerManager.spawnContainer({
        requestId: dockerRequestId,
        prompt: msg.prompt,
        mode: msg.mode,
        maxIterations: msg.max_iterations || 10,
        appName: msg.app_name || 'generated-app',
        outputDir: msg.output_dir,
        userId: msg.user_id,
        appId: msg.app_id,
        githubUrl: msg.github_url, // For resume - container will clone this repo
        isResume, // If github_url provided, this is a resume
        resumeSessionId: msg.resume_session_id,
        // Pass database request ID for container identification
        dbRequestId: requestId,
        // Developer's BYOT tokens (undefined = use shared platform token / pool mode)
        claudeOauthToken,
        supabaseAccessToken,
        // App credentials for resume (from Vault)
        appCredentials,
      });

      this.sendToBrowser({
        type: 'status',
        request_id: requestId,
        message: 'Container started, waiting for connection...',
      });

      this.emit('start_generation', msg);
    } catch (error: any) {
      console.error('❌ Failed to spawn container:', error);

      // Remove session
      this.sessions.delete(requestId);
      this.dockerToDbId.delete(dockerRequestId);

      // Update database status to 'failed'
      try {
        await storage.updateGenerationRequest(requestId, {
          status: 'failed',
          errorMessage: `Failed to spawn container: ${error.message}`,
        });
      } catch (dbError) {
        console.error(`[WSI] Failed to update error status for ${requestId}:`, dbError);
      }

      // Notify browser of failure
      this.sendToBrowser({
        type: 'error',
        request_id: requestId,
        message: `Failed to spawn container: ${error.message}`,
        fatal: true,
      });
    }
  }

  // ============================================================================
  // GRACEFUL SHUTDOWN PROTOCOL
  // ============================================================================

  /**
   * Handle stop_request from browser - initiate graceful shutdown for a session
   */
  private handleStopRequest(msg: ControlCommandMessage): void {
    const requestId = msg.request_id;
    if (requestId === undefined) {
      this.sendToBrowser({
        type: 'error',
        message: 'Missing request_id in stop_request',
      });
      return;
    }

    const session = this.sessions.get(requestId);
    if (!session) {
      this.sendToBrowser({
        type: 'error',
        request_id: requestId,
        message: 'No active session for this generation',
      });
      return;
    }

    if (!session.container) {
      this.sendToBrowser({
        type: 'error',
        request_id: requestId,
        message: 'No container connected to stop',
      });
      return;
    }

    if (session.shutdownPending) {
      console.log(`⚠️  Shutdown already in progress for session ${requestId}`);
      this.sendToBrowser({
        type: 'status',
        request_id: requestId,
        message: 'Shutdown already in progress...',
      });
      return;
    }

    console.log(`🛑 Graceful shutdown requested for session ${requestId}`);
    session.shutdownPending = true;

    // Notify browser that shutdown is starting
    this.sendToBrowser({
      type: 'shutdown_initiated',
      request_id: requestId,
      message: 'Saving your work before stopping...',
      timeout_seconds: this.SHUTDOWN_TIMEOUT_MS / 1000,
    });

    // Send prepare_shutdown to container
    this.sendToContainer(session.container, {
      type: 'control_command',
      command: 'prepare_shutdown',
      reason: msg.reason || 'User requested stop',
    });

    // Start timeout - force kill if container doesn't respond
    session.shutdownTimeout = setTimeout(() => {
      console.warn(`⚠️  Shutdown timeout for session ${requestId} - force killing container`);
      this.forceKillSessionContainer(session, 'Timeout waiting for graceful shutdown');
    }, this.SHUTDOWN_TIMEOUT_MS);

    this.emit('stop_request', { ...msg, request_id: requestId });
  }

  /**
   * Handle shutdown_ready from container - work has been saved
   */
  private async handleShutdownReady(session: GenerationSession, msg: ShutdownReadyMessage): Promise<void> {
    console.log(`✅ Container ready for shutdown (session ${session.requestId})`);
    if (msg.commit_hash) {
      console.log(`   Commit: ${msg.commit_hash}`);
    }
    if (msg.pushed) {
      console.log('   Pushed to GitHub: Yes');
    }

    // Clear the timeout
    if (session.shutdownTimeout) {
      clearTimeout(session.shutdownTimeout);
      session.shutdownTimeout = null;
    }

    // Update database status to completed (cancelled gracefully)
    try {
      await storage.updateGenerationRequest(session.requestId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      console.log(`[WSI] Updated generation ${session.requestId} status to completed (cancelled gracefully)`);
    } catch (error) {
      console.error(`[WSI] Failed to update status for ${session.requestId}:`, error);
    }

    // Notify browser
    this.sendToBrowser({
      type: 'shutdown_ready',
      request_id: session.requestId,
      message: msg.message || 'Work saved successfully',
      commit_hash: msg.commit_hash,
      pushed: msg.pushed,
    });

    // Now kill the container gracefully
    this.killSessionContainer(session, 'Graceful shutdown complete');
  }

  /**
   * Handle shutdown_failed from container - couldn't save work
   */
  private handleShutdownFailed(session: GenerationSession, msg: ShutdownFailedMessage): void {
    console.error(`❌ Container shutdown failed (session ${session.requestId}):`, msg.reason);

    // Clear the timeout
    if (session.shutdownTimeout) {
      clearTimeout(session.shutdownTimeout);
      session.shutdownTimeout = null;
    }

    // Notify browser - let them decide whether to force kill
    this.sendToBrowser({
      type: 'shutdown_failed',
      request_id: session.requestId,
      reason: msg.reason,
      message: 'Failed to save work. You can force stop (work may be lost) or cancel.',
    });

    // Don't auto-kill - let the user decide
    session.shutdownPending = false;

    this.emit('shutdown_failed', { ...msg, request_id: session.requestId });
  }

  /**
   * Force kill container after timeout (work may be lost)
   */
  private async forceKillSessionContainer(session: GenerationSession, reason: string): Promise<void> {
    // Update database first - mark as failed since work may be lost
    try {
      await storage.updateGenerationRequest(session.requestId, {
        status: 'failed',
        errorMessage: reason,
      });
      console.log(`[WSI] Updated generation ${session.requestId} status to failed (force killed)`);
    } catch (error) {
      console.error(`[WSI] Failed to update status for ${session.requestId}:`, error);
    }

    // Notify browser
    this.sendToBrowser({
      type: 'shutdown_timeout',
      request_id: session.requestId,
      message: `Force stopping: ${reason}`,
    });

    await this.killSessionContainer(session, reason);
  }

  /**
   * Actually terminate a session's container and cleanup
   */
  private async killSessionContainer(session: GenerationSession, reason: string): Promise<void> {
    console.log(`🛑 Killing container for session ${session.requestId}: ${reason}`);

    // Reset shutdown state
    session.shutdownPending = false;
    if (session.shutdownTimeout) {
      clearTimeout(session.shutdownTimeout);
      session.shutdownTimeout = null;
    }

    // Close container WebSocket (triggers cleanup in handleDisconnect)
    if (session.container?.ws) {
      session.container.ws.close(4001, reason);
    }

    this.emit('generation_stopped', { request_id: session.requestId, reason });
  }

  /**
   * Public method to request graceful stop (for Express routes)
   */
  public requestStop(requestId: number, reason?: string): void {
    this.handleStopRequest({
      type: 'control_command',
      command: 'stop_request',
      request_id: requestId,
      reason,
    });
  }

  // ============================================================================
  // SEND HELPERS
  // ============================================================================

  /**
   * Broadcast message to ALL connected browsers
   * Each browser filters by request_id on the client side
   */
  private sendToBrowser(msg: WSIMessage): void {
    const msgStr = JSON.stringify(msg);
    let sentCount = 0;

    for (const browser of this.browsers.values()) {
      if (browser.ws.readyState === WebSocket.OPEN) {
        browser.ws.send(msgStr);
        sentCount++;
      }
    }

    // Log if no browsers received the message (for debugging)
    if (sentCount === 0 && this.browsers.size > 0) {
      console.warn(`⚠️  Message ${msg.type} not sent - no browsers in OPEN state`);
    }
  }

  private sendToContainer(container: ConnectedClient, msg: WSIMessage): void {
    if (container && container.ws.readyState === WebSocket.OPEN) {
      container.ws.send(JSON.stringify(msg));
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
