import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { createClient } from '@supabase/supabase-js';
import { storage } from './storage/factory';
import { orchestrator } from './orchestrator/factory';

export interface GenerationLog {
  timestamp: string;
  line: string;
}

export interface GenerationSession {
  jobId: string;
  ws: WebSocket;
  logs: GenerationLog[];
  status: 'connecting' | 'ready' | 'generating' | 'completed' | 'failed';
  appPath?: string;
  error?: string;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private sessions: Map<string, GenerationSession> = new Map();
  private clientConnections: Map<string, Set<WebSocket>> = new Map(); // requestId -> client WebSockets
  private replConnections: Map<string, WebSocket> = new Map(); // sessionId -> REPL WebSocket
  private sessionToRequestMap: Map<string, number> = new Map(); // sessionId -> requestId mapping (persistent across reconnects)
  private supabaseAdmin: ReturnType<typeof createClient> | null = null;

  /**
   * Get Supabase admin client (lazy initialization)
   */
  private getSupabaseAdmin() {
    if (!this.supabaseAdmin) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase credentials');
      }

      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      console.log('[WebSocket] Supabase admin client initialized');
    }
    return this.supabaseAdmin;
  }

  /**
   * Validate JWT token and return user info
   */
  private async validateToken(token: string): Promise<{ id: string; email: string } | null> {
    try {
      const { data: { user }, error } = await this.getSupabaseAdmin().auth.getUser(token);

      if (error || !user) {
        console.log(`[WebSocket:Auth] Token validation failed: ${error?.message || 'No user'}`);
        return null;
      }

      console.log(`[WebSocket:Auth] User authenticated: ${user.id} (${user.email})`);
      return { id: user.id, email: user.email! };
    } catch (error) {
      console.error('[WebSocket:Auth] Exception during validation:', error);
      return null;
    }
  }

  /**
   * Pre-register a session before container starts
   * This prevents race conditions where waitForReady() is called before the WebSocket connects
   */
  registerSession(jobId: string): void {
    console.log(`[WebSocket] Pre-registering session for job: ${jobId}`);
    this.sessions.set(jobId, {
      jobId,
      ws: null as any, // Will be set when WebSocket connects
      logs: [],
      status: 'connecting',
    });
  }

  initialize(server: Server) {
    this.wss = new WebSocketServer({ noServer: true });

    // Handle upgrade requests
    server.on('upgrade', (request, socket, head) => {
      const url = request.url || '';

      // Container connection: /ws/job_123
      const containerMatch = url.match(/^\/ws\/job_(.+)$/);
      if (containerMatch) {
        const jobId = `job_${containerMatch[1]}`;
        console.log(`[WebSocket] Accepting container connection for: ${jobId}`);

        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          (request as any).type = 'container';
          (request as any).jobId = jobId;
          this.wss!.emit('connection', ws, request);
        });
        return;
      }

      // Client connection: /ws/logs/123 (requestId)
      const clientMatch = url.match(/^\/ws\/logs\/(\d+)$/);
      if (clientMatch) {
        const requestId = clientMatch[1];
        console.log(`[WebSocket] Accepting client connection for request: ${requestId}`);

        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          (request as any).type = 'client';
          (request as any).requestId = requestId;
          this.wss!.emit('connection', ws, request);
        });
        return;
      }

      // REPL console connection: /ws (V1 console compatibility)
      if (url === '/ws' || url.startsWith('/ws?')) {
        console.log(`[WebSocket] Accepting REPL console connection`);

        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          (request as any).type = 'repl';
          this.wss!.emit('connection', ws, request);
        });
        return;
      }

      console.error('[WebSocket] Invalid connection path:', url);
      socket.destroy();
    });

    this.wss.on('connection', (ws, req) => {
      const type = (req as any).type;

      if (type === 'container') {
        this.handleContainerConnection(ws, req);
      } else if (type === 'client') {
        this.handleClientConnection(ws, req);
      } else if (type === 'repl') {
        this.handleREPLConnection(ws, req);
      }
    });

    console.log('[WebSocket] Server initialized on paths: /ws/job_*, /ws/logs/*, /ws (REPL)');
  }

  private handleContainerConnection(ws: WebSocket, req: any) {
    const jobId = req.jobId as string;
    console.log(`[WebSocket] Container connected for job: ${jobId}`);

    // Get existing session (pre-registered) or create new one
    let session = this.sessions.get(jobId);
    if (!session) {
      console.warn(`[WebSocket] No pre-registered session for ${jobId}, creating new one`);
      session = {
        jobId,
        ws,
        logs: [],
        status: 'connecting',
      };
      this.sessions.set(jobId, session);
    } else {
      // Update pre-registered session with WebSocket connection
      session.ws = ws;
      console.log(`[WebSocket] Updated pre-registered session for ${jobId}`);
    }

    // Heartbeat mechanism to keep connection alive during long operations (like npm install)
    // Send ping every 30 seconds
    const heartbeatInterval = setInterval(() => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.ping();
          console.log(`[WebSocket] Sent heartbeat ping to ${jobId}`);
        } else {
          clearInterval(heartbeatInterval);
        }
      } catch (error) {
        console.error(`[WebSocket] Heartbeat error for ${jobId}:`, error);
        clearInterval(heartbeatInterval);
      }
    }, 30000);

    // Handle pong responses
    ws.on('pong', () => {
      console.log(`[WebSocket] Received pong from ${jobId}`);
    });

    // Handle messages from container
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleContainerMessage(jobId, message);
      } catch (error) {
        console.error(`[WebSocket] Failed to parse message from ${jobId}:`, error);
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      console.log(`[WebSocket] Container disconnected for job: ${jobId}`);
      clearInterval(heartbeatInterval);
      const session = this.sessions.get(jobId);
      if (session && session.status === 'generating') {
        session.status = 'failed';
        session.error = 'Container disconnected unexpectedly';
      }
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`[WebSocket] Error for job ${jobId}:`, error);
      clearInterval(heartbeatInterval);
      const session = this.sessions.get(jobId);
      if (session) {
        session.status = 'failed';
        session.error = error.message;
      }
    });
  }

  private handleClientConnection(ws: WebSocket, req: any) {
    const requestId = req.requestId as string;
    console.log(`[WebSocket] ✅ Client subscribed to logs for request: ${requestId}`);

    // Add client to connections map
    if (!this.clientConnections.has(requestId)) {
      this.clientConnections.set(requestId, new Set());
      console.log(`[WebSocket] Created new client connection set for request: ${requestId}`);
    }
    this.clientConnections.get(requestId)!.add(ws);
    console.log(`[WebSocket] Total clients for request ${requestId}: ${this.clientConnections.get(requestId)!.size}`);

    // Send existing logs immediately
    const jobId = `job_${requestId}`;
    const session = this.sessions.get(jobId);
    console.log(`[WebSocket] Looking for session: ${jobId}, found:`, !!session);
    if (session && session.logs.length > 0) {
      console.log(`[WebSocket] Sending ${session.logs.length} existing logs to client`);
      ws.send(JSON.stringify({
        type: 'logs',
        logs: session.logs,
      }));
    } else if (session) {
      console.log(`[WebSocket] Session exists but no logs yet for ${jobId}`);
    } else {
      console.log(`[WebSocket] No session found for ${jobId}`);
    }

    // Heartbeat mechanism for client connections
    const heartbeatInterval = setInterval(() => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(heartbeatInterval);
        }
      } catch (error) {
        console.error(`[WebSocket] Client heartbeat error for request ${requestId}:`, error);
        clearInterval(heartbeatInterval);
      }
    }, 30000);

    // Handle disconnect
    ws.on('close', () => {
      console.log(`[WebSocket] Client unsubscribed from request: ${requestId}`);
      clearInterval(heartbeatInterval);
      const connections = this.clientConnections.get(requestId);
      if (connections) {
        connections.delete(ws);
        if (connections.size === 0) {
          this.clientConnections.delete(requestId);
        }
      }
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`[WebSocket] Client error for request ${requestId}:`, error);
      clearInterval(heartbeatInterval);
    });
  }

  private async handleContainerMessage(jobId: string, message: any) {
    const session = this.sessions.get(jobId);
    if (!session) {
      console.error(`[WebSocket] No session found for job: ${jobId}`);
      return;
    }

    switch (message.type) {
      case 'log':
        // Store log line with timestamp
        const logEntry: GenerationLog = {
          timestamp: new Date().toISOString(),
          line: message.line,
        };
        session.logs.push(logEntry);
        console.log(`[WebSocket:${jobId}] ${message.line}`);

        // Broadcast to connected clients
        const requestId = jobId.replace('job_', '');
        this.broadcastToClients(requestId, {
          type: 'log',
          log: logEntry,
        });
        break;

      case 'ready':
        session.status = 'ready';
        session.appPath = message.app_path;
        console.log(`[WebSocket:${jobId}] Container ready, app at: ${message.app_path}`);
        break;

      case 'completed':
        session.status = 'completed';
        session.appPath = message.app_path;
        console.log(`[WebSocket:${jobId}] ✅ Generation completed successfully, app at: ${message.app_path}`);
        // NOTE: Broadcast moved to orchestrator AFTER database update to prevent race condition
        // where client refetches before downloadUrl is available
        break;

      case 'waiting_for_input':
        session.status = 'completed';
        console.log(`[WebSocket:${jobId}] Generation completed, waiting for input`);
        break;

      case 'error':
        session.status = 'failed';
        session.error = message.message;
        console.error(`[WebSocket:${jobId}] Error: ${message.message}`);
        break;

      case 'progress':
        // Handle progress messages from container (stage, step, percentage)
        const progressLog: GenerationLog = {
          timestamp: new Date().toISOString(),
          line: `[${message.stage || 'progress'}] ${message.step || 'Working...'} (${message.percentage || 0}%)`,
        };
        session.logs.push(progressLog);
        console.log(`[WebSocket:${jobId}] Progress: ${message.stage} - ${message.step} (${message.percentage}%)`);

        // Broadcast progress to connected clients
        const progressRequestId = jobId.replace('job_', '');
        this.broadcastToClients(progressRequestId, {
          type: 'log',
          log: progressLog,
        });
        break;

      case 'iteration_progress':
        {
          const requestId = jobId.replace('job_', '');
          console.log(`[WebSocket:${jobId}] Iteration ${message.current} of ${message.total}`);

          try {
            // Update database with current iteration
            await storage.updateGenerationRequest(parseInt(requestId), {
              currentIteration: message.current,
            });

            // Create iteration snapshot (automatic)
            if (message.filesSnapshot) {
              await storage.createIterationSnapshot({
                generationRequestId: parseInt(requestId),
                iterationNumber: message.current,
                snapshotType: 'automatic',
                filesSnapshot: typeof message.filesSnapshot === 'string'
                  ? message.filesSnapshot
                  : JSON.stringify(message.filesSnapshot),
                promptUsed: message.promptUsed || message.taskDescription || 'Autonomous iteration',
                metadata: {
                  tokensUsed: message.tokensUsed,
                  duration: message.duration,
                  changedFiles: message.changedFiles,
                  summary: message.summary,
                },
              });
              console.log(`[WebSocket:${jobId}] Created snapshot for iteration ${message.current}`);
            } else {
              console.log(`[WebSocket:${jobId}] No filesSnapshot provided, skipping snapshot creation`);
            }
          } catch (error) {
            console.error(`[WebSocket:${jobId}] Failed to update iteration or create snapshot:`, error);
          }

          // Broadcast to connected clients
          this.broadcastToClients(requestId, {
            type: 'iteration_progress',
            current: message.current,
            total: message.total,
            taskDescription: message.taskDescription,
            snapshotCreated: !!message.filesSnapshot,
          });
        }
        break;

      case 'paused':
        {
          const pausedRequestId = jobId.replace('job_', '');
          session.status = 'completed'; // Mark session as paused
          console.log(`[WebSocket:${jobId}] Paused at iteration ${message.iteration || 'unknown'}`);

          // Update database
          try {
            await storage.updateGenerationRequest(parseInt(pausedRequestId), {
              status: 'paused',
            });
          } catch (error) {
            console.error(`[WebSocket:${jobId}] Failed to update paused status:`, error);
          }

          // Broadcast to clients
          this.broadcastToClients(pausedRequestId, {
            type: 'status',
            status: 'paused',
            checkpointId: message.checkpointId,
            message: message.message,
          });
        }
        break;

      case 'resumed':
        {
          const resumedRequestId = jobId.replace('job_', '');
          session.status = 'generating';
          console.log(`[WebSocket:${jobId}] Resumed from iteration ${message.iteration || 'unknown'}`);

          // Update database
          try {
            await storage.updateGenerationRequest(parseInt(resumedRequestId), {
              status: 'generating',
            });
          } catch (error) {
            console.error(`[WebSocket:${jobId}] Failed to update resumed status:`, error);
          }

          // Broadcast to clients
          this.broadcastToClients(resumedRequestId, {
            type: 'status',
            status: 'generating',
            checkpointId: message.checkpointId,
            message: message.message,
          });
        }
        break;

      case 'cancelled':
        {
          const cancelledRequestId = jobId.replace('job_', '');
          session.status = 'completed';
          console.log(`[WebSocket:${jobId}] Cancelled with partial results`);

          // Update database
          try {
            await storage.updateGenerationRequest(parseInt(cancelledRequestId), {
              status: 'completed',
              errorMessage: 'Cancelled by user',
            });
          } catch (error) {
            console.error(`[WebSocket:${jobId}] Failed to update cancelled status:`, error);
          }

          // Broadcast to clients
          this.broadcastToClients(cancelledRequestId, {
            type: 'status',
            status: 'cancelled',
            partialResults: message.partialResults,
            message: message.message,
          });
        }
        break;

      default:
        console.warn(`[WebSocket:${jobId}] Unknown message type: ${message.type}`);
    }
  }

  broadcastToClients(requestId: string, message: any) {
    const clients = this.clientConnections.get(requestId);
    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    // Broadcast to regular log viewer clients
    if (clients && clients.size > 0) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
          sentCount++;
        }
      });
    }

    // Also broadcast to REPL console clients
    // Find REPL clients that are monitoring this requestId
    this.replConnections.forEach((replWs, _sessionId) => {
      if (replWs.readyState === WebSocket.OPEN) {
        const replRequestId = (replWs as any).requestId;
        if (replRequestId === parseInt(requestId)) {
          // Forward log to REPL client
          replWs.send(messageStr);
          sentCount++;
        }
      }
    });

    console.log(`[WebSocket] Broadcasted message to ${sentCount} clients (REST + REPL) for request ${requestId}`);
  }

  sendCommand(jobId: string, command: string, mode?: string): boolean {
    const session = this.sessions.get(jobId);

    // Enhanced logging to debug null reference errors
    console.log(`[WebSocket:sendCommand] jobId=${jobId}, session exists=${!!session}`);
    if (session) {
      console.log(`[WebSocket:sendCommand] session.ws exists=${!!session.ws}, ws type=${typeof session.ws}`);
      if (session.ws) {
        console.log(`[WebSocket:sendCommand] session.ws.readyState=${session.ws.readyState}`);
      }
    }

    if (!session) {
      console.error(`[WebSocket] Cannot send command to ${jobId}: no session found`);
      return false;
    }

    if (!session.ws) {
      console.error(`[WebSocket] Cannot send command to ${jobId}: session.ws is null/undefined`);
      return false;
    }

    if (session.ws.readyState !== WebSocket.OPEN) {
      console.error(`[WebSocket] Cannot send command to ${jobId}: WebSocket not OPEN (readyState=${session.ws.readyState})`);
      return false;
    }

    try {
      session.ws.send(JSON.stringify({
        type: 'command',
        data: command,
        mode: mode, // Pass mode to override container's environment MODE
      }));
      session.status = 'generating';
      console.log(`[WebSocket:${jobId}] Sent command with mode=${mode}: ${command.substring(0, 100)}...`);
      return true;
    } catch (error) {
      console.error(`[WebSocket] Failed to send command to ${jobId}:`, error);
      return false;
    }
  }

  getSession(jobId: string): GenerationSession | undefined {
    return this.sessions.get(jobId);
  }

  getLogs(jobId: string): GenerationLog[] {
    const session = this.sessions.get(jobId);
    return session?.logs || [];
  }

  getStatus(jobId: string): GenerationSession['status'] | null {
    const session = this.sessions.get(jobId);
    return session?.status || null;
  }

  waitForReady(jobId: string, timeoutMs: number = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkReady = () => {
        const session = this.sessions.get(jobId);

        if (!session) {
          return reject(new Error(`No session found for job: ${jobId}`));
        }

        if (session.status === 'failed') {
          return reject(new Error(session.error || 'Container failed'));
        }

        // Ready if WebSocket is connected and in valid state
        if (session.ws && session.ws.readyState === WebSocket.OPEN) {
          console.log(`[WebSocket] Container ${jobId} is ready (WebSocket connected)`);
          return resolve();
        }

        if (Date.now() - startTime > timeoutMs) {
          return reject(new Error(`Timeout waiting for container to be ready`));
        }

        // Check again in 500ms
        setTimeout(checkReady, 500);
      };

      checkReady();
    });
  }

  waitForCompletion(jobId: string, timeoutMs: number = 3600000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkComplete = () => {
        const session = this.sessions.get(jobId);

        if (!session) {
          return reject(new Error(`No session found for job: ${jobId}`));
        }

        if (session.status === 'failed') {
          return reject(new Error(session.error || 'Generation failed'));
        }

        if (session.status === 'completed') {
          return resolve();
        }

        if (Date.now() - startTime > timeoutMs) {
          return reject(new Error(`Timeout waiting for generation to complete`));
        }

        // Check again in 1 second
        setTimeout(checkComplete, 1000);
      };

      checkComplete();
    });
  }

  cleanup(jobId: string) {
    const session = this.sessions.get(jobId);
    if (session) {
      if (session.ws && session.ws.readyState === WebSocket.OPEN) {
        session.ws.close();
      }
      this.sessions.delete(jobId);
      console.log(`[WebSocket] Cleaned up session for job: ${jobId}`);
    }
  }

  /**
   * Handle REPL console connections (V1 console compatibility)
   * Provides a minimal bridge between V1's REPL protocol and V2's generation system
   */
  private handleREPLConnection(ws: WebSocket, _req: any) {
    console.log(`[WebSocket:REPL] New REPL console connection`);

    let authenticated = false;
    let currentSessionId: string | null = null;

    // Send connection acknowledgment
    ws.send(JSON.stringify({
      type: 'connected',
      timestamp: Date.now(),
    }));

    // Handle messages from REPL client
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`[WebSocket:REPL] Received message:`, message.type);

        switch (message.type) {
          case 'authenticate':
            {
              const user = await this.validateToken(message.token);
              if (!user) {
                ws.send(JSON.stringify({
                  type: 'error',
                  error: 'Authentication failed',
                  timestamp: Date.now(),
                }));
                ws.close();
                return;
              }

              authenticated = true;
              (ws as any).userId = user.id;
              ws.send(JSON.stringify({
                type: 'authenticated',
                userId: user.id,
                email: user.email,
                timestamp: Date.now(),
              }));
              console.log(`[WebSocket:REPL] Client authenticated: ${user.id}`);
            }
            break;

          case 'join_session':
            if (!authenticated) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Not authenticated',
                timestamp: Date.now(),
              }));
              return;
            }

            if (!message.sessionId) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'sessionId is required',
                timestamp: Date.now(),
              }));
              return;
            }

            currentSessionId = message.sessionId;
            this.replConnections.set(message.sessionId, ws);

            // Restore requestId from persistent mapping (survives reconnects)
            const associatedRequestId = currentSessionId ? this.sessionToRequestMap.get(currentSessionId) : undefined;
            if (associatedRequestId) {
              (ws as any).requestId = associatedRequestId;
              console.log(`[WebSocket:REPL] Client joined session: ${currentSessionId}, restored requestId: ${associatedRequestId}`);
            } else {
              console.log(`[WebSocket:REPL] Client joined session: ${currentSessionId}`);
            }

            // Subscribe to logs for this session if it exists
            const jobId = `job_${currentSessionId}`;
            const session = this.sessions.get(jobId);
            if (session && session.logs.length > 0) {
              // Send existing logs
              for (const log of session.logs) {
                ws.send(JSON.stringify({
                  type: 'log',
                  sessionId: currentSessionId,
                  line: log.line,
                  timestamp: log.timestamp,
                }));
              }
            }
            break;

          case 'leave_session':
            if (currentSessionId) {
              this.replConnections.delete(currentSessionId);
            }
            console.log(`[WebSocket:REPL] Client left session: ${currentSessionId}`);
            currentSessionId = null;
            break;

          case 'start_generation':
            {
              if (!authenticated || !currentSessionId) {
                ws.send(JSON.stringify({
                  type: 'error',
                  error: 'Not authenticated or no session',
                  timestamp: Date.now(),
                }));
                return;
              }

              const userId = (ws as any).userId;
              // Extract fields from message - frontend creates DB record via REST API first
              const requestId = message.request_id;
              const prompt = message.prompt;
              const mode = message.mode || 'autonomous';
              const githubUrl = message.github_url; // For resume - container will clone from here

              if (!requestId) {
                ws.send(JSON.stringify({
                  type: 'error',
                  error: 'request_id is required (create generation via REST API first)',
                  timestamp: Date.now(),
                }));
                return;
              }

              if (!prompt) {
                ws.send(JSON.stringify({
                  type: 'error',
                  error: 'Prompt is required',
                  timestamp: Date.now(),
                }));
                return;
              }

              try {
                // WebSocket is relay-only - DB record already created via REST API
                // Just verify the record exists and belongs to this user
                const request = await storage.getGenerationRequestById(requestId);
                if (!request) {
                  ws.send(JSON.stringify({
                    type: 'error',
                    error: `Generation request ${requestId} not found`,
                    timestamp: Date.now(),
                  }));
                  return;
                }

                if (request.userId !== userId) {
                  ws.send(JSON.stringify({
                    type: 'error',
                    error: 'Unauthorized - request belongs to different user',
                    timestamp: Date.now(),
                  }));
                  return;
                }

                console.log(`[WebSocket:REPL] Starting generation for request: ${requestId}, session: ${currentSessionId}, mode: ${mode}, githubUrl: ${githubUrl || 'none'}`);

                // Map sessionId to requestId for log forwarding (persistent across reconnects)
                this.sessionToRequestMap.set(currentSessionId, requestId);
                (ws as any).requestId = requestId;

                // Send acknowledgment
                ws.send(JSON.stringify({
                  type: 'generation_started',
                  sessionId: currentSessionId,
                  requestId: requestId,
                  generationId: requestId,
                  mode,
                  timestamp: Date.now(),
                }));

                // Start generation in background - orchestrator handles container lifecycle
                // For resume: githubUrl tells container where to clone from
                orchestrator.startGeneration(requestId, userId, prompt, mode)
                  .catch(error => {
                    console.error(`[WebSocket:REPL] Generation error:`, error);
                    ws.send(JSON.stringify({
                      type: 'error',
                      sessionId: currentSessionId,
                      error: error.message,
                      timestamp: Date.now(),
                    }));
                  });

              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to start generation';
                console.error(`[WebSocket:REPL] Start generation error:`, errorMessage);
                ws.send(JSON.stringify({
                  type: 'error',
                  error: errorMessage,
                  timestamp: Date.now(),
                }));
              }
            }
            break;

          default:
            console.warn(`[WebSocket:REPL] Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error(`[WebSocket:REPL] Failed to parse message:`, error);
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      console.log(`[WebSocket:REPL] Client disconnected`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`[WebSocket:REPL] Client error:`, error);
    });
  }
}

export const wsManager = new WebSocketManager();
