/**
 * WSI Client - Browser WebSocket Interface Client
 *
 * Browser-side WSI client that connects to the Express WSI Server.
 * Speaks WSI protocol natively - same as Leo Remote CLI, just in browser.
 *
 * Usage:
 *   import { wsiClient } from '@/lib/wsi-client';
 *
 *   // Connect (usually on app mount)
 *   wsiClient.connect();
 *
 *   // Subscribe to messages
 *   const unsub = wsiClient.on('log', (msg) => console.log(msg.line));
 *
 *   // Start a generation
 *   wsiClient.startGeneration({
 *     prompt: 'Create a todo app',
 *     mode: 'autonomous',
 *     appName: 'my-todo',
 *   });
 *
 *   // Cleanup
 *   unsub();
 *   wsiClient.disconnect();
 */

// ============================================================================
// WSI MESSAGE TYPES (matching server/lib/wsi/wsi-server.ts)
// ============================================================================

export interface WSIMessage {
  type: string;
  [key: string]: unknown;
}

// Messages FROM server (container → browser)
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

export interface DecisionPromptMessage extends WSIMessage {
  type: 'decision_prompt';
  prompt_id: string;
  question: string;
  options?: string[];
  allow_custom?: boolean;
}

// Real-time conversation log from agent (agent reasoning, tool use, etc.)
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

// Process monitor - trajectory analysis from Haiku
export interface ProcessMonitorMessage extends WSIMessage {
  type: 'process_monitor';
  generation_id?: string;
  window?: { start: string; end: string };
  summary?: string;
  trajectory?: {
    score: 'EFFICIENT' | 'GOOD' | 'STRUGGLING' | 'INEFFICIENT';
    signals: string[];
  };
  stats?: {
    tokens?: { input: number; output: number };
    cost_usd?: number;
    tools?: Record<string, number>;
    entry_count?: number;
  };
}

export interface ConnectionStatusMessage extends WSIMessage {
  type: 'connection_status';
  browser_connected: boolean;
  container_connected: boolean;
}

export interface StatusMessage extends WSIMessage {
  type: 'status';
  message: string;
}

// Shutdown protocol messages
export interface ShutdownInitiatedMessage extends WSIMessage {
  type: 'shutdown_initiated';
  message: string;
  timeout_seconds: number;
}

export interface ShutdownReadyMessage extends WSIMessage {
  type: 'shutdown_ready';
  message: string;
  commit_hash?: string;
  pushed?: boolean;
}

export interface ShutdownFailedMessage extends WSIMessage {
  type: 'shutdown_failed';
  reason: string;
  message: string;
}

export interface ShutdownTimeoutMessage extends WSIMessage {
  type: 'shutdown_timeout';
  message: string;
}

export interface GenerationStoppedMessage extends WSIMessage {
  type: 'generation_stopped';
  message: string;
  reason: string;
}

// Messages TO server (browser → container)
export interface StartGenerationConfig {
  /** Database ID of the generation request (from POST /api/generations) */
  requestId: number;
  prompt: string;
  /** Mode: 'autonomous' (reprompter runs until maxIterations) or 'confirm_first' (user confirms each) */
  mode: 'autonomous' | 'confirm_first';
  /** App name (required for new apps) */
  appName: string;
  /** User ID (UUID) - REQUIRED for GitHub repo naming (privacy) */
  userId: string;
  /** App ID (UUID) - for GitHub repo naming */
  appId?: string;
  /** Max iterations (required for autonomous mode) */
  maxIterations: number;
  /** Resume existing app if provided */
  appPath?: string;
  /** Resume specific session for context continuity */
  resumeSessionId?: string;
  /** Enable specialized subagents (default: true) */
  enableSubagents?: boolean;
  /** Custom output directory */
  outputDir?: string;
  /** GitHub URL of existing app to resume (will clone to workspace) */
  githubUrl?: string;
}

// ============================================================================
// WSI EVENT TYPES
// ============================================================================

export type WSIEventType =
  | 'connected'
  | 'disconnected'
  | 'ready'
  | 'log'
  | 'progress'
  | 'iteration_complete'
  | 'all_work_complete'
  | 'error'
  | 'decision_prompt'
  | 'conversation_log'
  | 'process_monitor'
  | 'connection_status'
  | 'status'
  | 'shutdown_initiated'
  | 'shutdown_ready'
  | 'shutdown_failed'
  | 'shutdown_timeout'
  | 'generation_stopped'
  | 'message'; // Catch-all for any message

type WSIEventHandler<T = WSIMessage> = (data: T) => void;

// ============================================================================
// WSI CLIENT CLASS
// ============================================================================

// Session storage key for message persistence
const STORAGE_KEY = 'wsi_messages';

class WSIClient {
  private ws: WebSocket | null = null;
  private listeners: Map<WSIEventType, Set<WSIEventHandler<any>>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private url: string;

  // Message storage - survives HMR via singleton, survives refresh via sessionStorage
  private _messages: WSIMessage[] = [];

  constructor() {
    // Default to same host as page, /wsi path
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = import.meta.env.VITE_WSI_URL || `${protocol}//${host}/wsi`;

    // Hydrate messages from sessionStorage
    this.loadMessages();
  }

  /**
   * Get all stored messages
   */
  get messages(): WSIMessage[] {
    return this._messages;
  }

  /**
   * Clear stored messages (call when starting new generation)
   */
  clearMessages(): void {
    this._messages = [];
    this.saveMessages();
  }

  /**
   * Store a message (called internally on receive)
   */
  private storeMessage(msg: WSIMessage): void {
    this._messages.push(msg);
    this.saveMessages();
  }

  private loadMessages(): void {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        this._messages = JSON.parse(cached);
      }
    } catch (e) {
      console.warn('[WSI] Failed to load messages from sessionStorage:', e);
    }
  }

  private saveMessages(): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this._messages));
    } catch (e) {
      console.warn('[WSI] Failed to save messages to sessionStorage:', e);
    }
  }

  /**
   * Connect to WSI Server
   */
  connect(): void {
    // Guard against multiple connections
    if (this.isConnecting) {
      return;
    }
    if (this.ws) {
      const state = this.ws.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        return;
      }
    }

    this.isConnecting = true;
    console.log(`[WSI] Connecting to ${this.url}`);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log('[WSI] Connected');

        // Send browser identification
        this.send({ type: 'browser_connect' });

        this.emit('connected', { type: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WSIMessage = JSON.parse(event.data);
          console.log('[WSI] Received:', msg.type, msg);

          // Store message for persistence (skip connection status messages)
          if (msg.type !== 'connection_status' && msg.type !== 'connected' && msg.type !== 'disconnected') {
            this.storeMessage(msg);
          }

          // Emit specific event
          this.emit(msg.type as WSIEventType, msg);

          // Also emit catch-all 'message' event
          this.emit('message', msg);
        } catch (error) {
          console.error('[WSI] Failed to parse message:', event.data);
        }
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        console.error('[WSI] Error:', error);
        this.emit('error', { type: 'error', message: 'WebSocket error' });
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        console.log(`[WSI] Disconnected (code: ${event.code}, reason: ${event.reason})`);
        this.emit('disconnected', { type: 'disconnected' });

        // Don't reconnect if intentionally replaced by server (code 4000)
        // This prevents reconnection loop when browser opens multiple connections
        if (event.code === 4000) {
          console.log('[WSI] Connection replaced - not reconnecting');
          return;
        }

        this.attemptReconnect();
      };
    } catch (error) {
      this.isConnecting = false;
      console.error('[WSI] Connection failed:', error);
    }
  }

  /**
   * Disconnect from WSI Server
   */
  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ==========================================================================
  // MESSAGE SENDING
  // ==========================================================================

  /**
   * Start a new generation
   */
  startGeneration(config: StartGenerationConfig): void {
    // Clear previous messages when starting new generation
    this.clearMessages();

    this.send({
      type: 'start_generation',
      request_id: config.requestId, // Database ID for status tracking
      prompt: config.prompt,
      mode: config.mode,
      app_name: config.appName,
      max_iterations: config.maxIterations,
      app_path: config.appPath,
      resume_session_id: config.resumeSessionId,
      enable_subagents: config.enableSubagents ?? true,
      output_dir: config.outputDir,
      user_id: config.userId,
      app_id: config.appId,
      github_url: config.githubUrl,
    });
  }

  /**
   * Send response to a decision prompt
   */
  sendDecisionResponse(promptId: string, response: string): void {
    this.send({
      type: 'decision_response',
      prompt_id: promptId,
      response,
    });
  }

  /**
   * Send control command (pause, resume, cancel)
   */
  sendControlCommand(command: 'pause' | 'resume' | 'cancel', reason?: string): void {
    this.send({
      type: 'control_command',
      command,
      reason,
    });
  }

  /**
   * Request graceful stop - saves work to GitHub before terminating
   */
  requestStop(reason?: string): void {
    this.send({
      type: 'stop_request',
      reason: reason || 'User cancelled generation',
    });
  }

  // ==========================================================================
  // EVENT SUBSCRIPTION
  // ==========================================================================

  /**
   * Subscribe to WSI events
   * @returns Unsubscribe function
   */
  on<T extends WSIMessage = WSIMessage>(
    event: WSIEventType,
    handler: WSIEventHandler<T>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private send(msg: WSIMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WSI] Sending:', msg.type, msg);
      this.ws.send(JSON.stringify(msg));
    } else {
      console.warn('[WSI] Cannot send - not connected');
    }
  }

  private emit<T extends WSIMessage>(event: WSIEventType, data: T): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[WSI] Error in ${event} handler:`, error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WSI] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WSI] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }
}

// ============================================================================
// SINGLETON EXPORT (HMR-safe)
// ============================================================================

// Store singleton in globalThis to survive HMR
declare global {
  // eslint-disable-next-line no-var
  var __wsiClient: WSIClient | undefined;
}

if (!globalThis.__wsiClient) {
  globalThis.__wsiClient = new WSIClient();
}

export const wsiClient = globalThis.__wsiClient;
