/**
 * WebSocket Manager
 *
 * Handles WebSocket connection lifecycle and message routing.
 * Features:
 * - Auto-reconnect on disconnect
 * - JWT authentication
 * - Message queue for offline state
 * - Event emitter for React components
 * - Mode-specific message handlers
 */

import type {
  InteractiveQuestion,
  InteractiveResponse,
  SuggestionGroup,
  SuggestionResponse,
  ProgressUpdate,
  ControlCommandMessage,
  StatusChangeMessage,
} from '../types/messages';

type WebSocketEventType =
  | 'connected'
  | 'disconnected'
  | 'message'
  | 'error'
  | 'interactive_question'
  | 'ai_suggestions'
  | 'progress_update'
  | 'status_change'
  | 'session_restored';
type WebSocketEventHandler = (data?: any) => void;

interface QueuedMessage {
  type: string;
  payload?: any;
  [key: string]: any;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private listeners: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: QueuedMessage[] = [];
  private isConnecting = false;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server with JWT authentication
   */
  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.token = token;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Send authentication message
        if (this.token) {
          const authMsg = { type: 'authenticate', token: this.token };
          if (this.ws) this.ws.send(JSON.stringify(authMsg));
        }

        // Process queued messages
        this.flushMessageQueue();

        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        console.log('[WebSocketManager] Raw message received:', event.data);
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocketManager] Parsed message:', message);
          this.emit('message', message);

          // Route mode-specific messages
          this.routeModeSpecificMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      this.isConnecting = false;
      console.error('WebSocket connection error:', error);
      this.emit('error', error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message to the server
   * If offline, message is queued for later
   *
   * Note: This is a generic wrapper that adds a 'payload' field.
   * For messages that require direct fields (like join_session),
   * use sendDirect() or send the message directly.
   */
  send(type: string, payload: any): void {
    const message = { type, payload };
    console.log('[WebSocketManager] Sending message:', message);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('[WebSocketManager] WebSocket not open, queueing message');
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  /**
   * Send a message directly without wrapping in payload
   * Used for messages where fields are at the top level
   */
  private sendDirect(message: QueuedMessage): void {
    console.log('[WebSocketManager] Sending direct message:', message);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('[WebSocketManager] WebSocket not open, queueing direct message');
      this.messageQueue.push(message);
    }
  }

  /**
   * Join a specific session room
   */
  joinSession(sessionId: string): void {
    // Send join_session with sessionId at top level (not wrapped in payload)
    this.sendDirect({ type: 'join_session', sessionId });
  }

  /**
   * Leave current session room
   */
  leaveSession(sessionId: string): void {
    // Send leave_session with sessionId at top level (not wrapped in payload)
    this.sendDirect({ type: 'leave_session', sessionId });
  }

  /**
   * Subscribe to WebSocket events
   */
  on(event: WebSocketEventType, handler: WebSocketEventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: WebSocketEventType, data?: any): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Attempt to reconnect after disconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Send all queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Check if WebSocket is connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Route mode-specific messages to appropriate event handlers
   */
  private routeModeSpecificMessage(message: any): void {
    switch (message.type) {
      case 'interactive_question':
        this.emit('interactive_question', message as InteractiveQuestion);
        break;
      case 'ai_suggestions':
        this.emit('ai_suggestions', message as SuggestionGroup);
        break;
      case 'progress_update':
        this.emit('progress_update', message as ProgressUpdate);
        break;
      case 'status_change':
        this.emit('status_change', message as StatusChangeMessage);
        break;
    }
  }

  // ============================================================================
  // MODE-SPECIFIC MESSAGE HANDLERS
  // ============================================================================

  /**
   * Send interactive response to a question
   */
  sendInteractiveResponse(questionId: string, response: string | string[], customValue?: string): void {
    const payload: Omit<InteractiveResponse, 'sessionId'> = {
      type: 'interactive_response',
      questionId,
      response,
      customValue,
    };
    this.send('interactive_response', payload);
  }

  /**
   * Send approval for all suggestions
   */
  sendApproval(suggestionGroupId: string, _suggestionIds: string[]): void {
    const payload: Omit<SuggestionResponse, 'sessionId'> = {
      type: 'suggestion_response',
      suggestionGroupId,
      action: 'approve_all',
    };
    this.send('suggestion_response', payload);
  }

  /**
   * Send rejection for all suggestions with optional feedback
   */
  sendRejection(suggestionGroupId: string, _suggestionIds: string[], feedback?: string): void {
    const payload: Omit<SuggestionResponse, 'sessionId'> = {
      type: 'suggestion_response',
      suggestionGroupId,
      action: 'reject_all',
      feedback,
    };
    this.send('suggestion_response', payload);
  }

  /**
   * Send modified suggestions
   */
  sendModifications(
    suggestionGroupId: string,
    modifications: Array<{ suggestionId: string; changes: Record<string, any> }>
  ): void {
    const payload: Omit<SuggestionResponse, 'sessionId'> = {
      type: 'suggestion_response',
      suggestionGroupId,
      action: 'modify',
      modifications,
    };
    this.send('suggestion_response', payload);
  }

  /**
   * Request alternative suggestions
   */
  sendRequestAlternative(suggestionGroupId: string, feedback?: string): void {
    const payload: Omit<SuggestionResponse, 'sessionId'> = {
      type: 'suggestion_response',
      suggestionGroupId,
      action: 'request_alternative',
      feedback,
    };
    this.send('suggestion_response', payload);
  }

  /**
   * Send pause command (autonomous mode)
   */
  sendPauseCommand(_sessionId: string, reason?: string): void {
    const payload: Omit<ControlCommandMessage, 'sessionId'> = {
      type: 'control_command',
      command: 'pause',
      payload: { reason },
    };
    this.send('control_command', payload);
  }

  /**
   * Send resume command (autonomous mode)
   */
  sendResumeCommand(_sessionId: string): void {
    const payload: Omit<ControlCommandMessage, 'sessionId'> = {
      type: 'control_command',
      command: 'resume',
    };
    this.send('control_command', payload);
  }

  /**
   * Send cancel command
   */
  sendCancelCommand(_sessionId: string, reason?: string): void {
    const payload: Omit<ControlCommandMessage, 'sessionId'> = {
      type: 'control_command',
      command: 'cancel',
      payload: { reason },
    };
    this.send('control_command', payload);
  }

  /**
   * Send checkpoint command
   */
  sendCheckpointCommand(_sessionId: string, checkpointName?: string): void {
    const payload: Omit<ControlCommandMessage, 'sessionId'> = {
      type: 'control_command',
      command: 'checkpoint',
      payload: { checkpointName },
    };
    this.send('control_command', payload);
  }

  /**
   * Send restore command
   */
  sendRestoreCommand(_sessionId: string, checkpointId: string): void {
    const payload: Omit<ControlCommandMessage, 'sessionId'> = {
      type: 'control_command',
      command: 'restore',
      payload: { checkpointId },
    };
    this.send('control_command', payload);
  }
}

// Create singleton instance
// Default to port 5013 (same as Express server) for integrated WebSocket
const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:5013`;
export const wsManager = new WebSocketManager(wsUrl);
