import { EventEmitter } from "events";
import type { WebSocketEvent, Message, Task, Notification, TypingIndicator } from "@/types";

export type WebSocketEventType = 
  | "message:new"
  | "message:update"
  | "message:delete"
  | "task:create"
  | "task:update"
  | "task:delete"
  | "notification:new"
  | "presence:update"
  | "typing:start"
  | "typing:stop"
  | "channel:update"
  | "project:update";

interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
  timestamp: string;
  channelId?: string;
  projectId?: string;
  userId?: string;
}

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private token: string | null = null;

  constructor() {
    super();
    this.setMaxListeners(100); // Increase max listeners for multiple components
  }

  connect(token: string) {
    this.token = token;
    this.attemptConnection();
  }

  private attemptConnection() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    // In production, this would be your actual WebSocket server
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
    
    try {
      // For demo purposes, we'll simulate WebSocket events
      this.simulateConnection();
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.scheduleReconnect();
    }
  }

  private simulateConnection() {
    // Simulate connection for demo
    setTimeout(() => {
      this.isConnected = true;
      this.emit("connected");
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      
      // Simulate some events
      this.simulateEvents();
    }, 500);
  }

  private simulateEvents() {
    // Simulate typing indicators
    setInterval(() => {
      if (Math.random() > 0.7) {
        const typingEvent: WebSocketMessage = {
          type: "typing:start",
          payload: {
            channel_id: "ch-1",
            user_id: "user-2",
            user: {
              id: "user-2",
              full_name: "Alice Johnson",
              avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
            },
          },
          timestamp: new Date().toISOString(),
          channelId: "ch-1",
          userId: "user-2",
        };
        this.handleMessage(typingEvent);
        
        // Stop typing after 3 seconds
        setTimeout(() => {
          const stopTypingEvent: WebSocketMessage = {
            ...typingEvent,
            type: "typing:stop",
          };
          this.handleMessage(stopTypingEvent);
        }, 3000);
      }
    }, 10000);

    // Simulate new messages
    setInterval(() => {
      if (Math.random() > 0.8) {
        const newMessageEvent: WebSocketMessage = {
          type: "message:new",
          payload: {
            id: `msg-ws-${Date.now()}`,
            channel_id: "ch-1",
            user_id: "user-3",
            content: "Just pushed a new update to the staging server!",
            is_edited: false,
            thread_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: "user-3",
              email: "bob@teamsync.com",
              full_name: "Bob Smith",
              avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
              status: "online",
              last_seen_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          timestamp: new Date().toISOString(),
          channelId: "ch-1",
        };
        this.handleMessage(newMessageEvent);
      }
    }, 15000);

    // Simulate notifications
    setInterval(() => {
      if (Math.random() > 0.9) {
        const notificationEvent: WebSocketMessage = {
          type: "notification:new",
          payload: {
            id: `notif-ws-${Date.now()}`,
            user_id: "user-1",
            type: "mention",
            title: "You were mentioned",
            description: "Alice mentioned you in #general",
            is_read: false,
            action_url: "/app/channel/ch-1",
            created_at: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        };
        this.handleMessage(notificationEvent);
      }
    }, 30000);
  }

  private handleMessage(data: WebSocketMessage) {
    // Emit specific events based on type
    this.emit(data.type, data.payload);
    
    // Also emit a general message event
    this.emit("message", data);
    
    // Emit channel-specific events
    if (data.channelId) {
      this.emit(`channel:${data.channelId}:${data.type}`, data.payload);
    }
    
    // Emit project-specific events
    if (data.projectId) {
      this.emit(`project:${data.projectId}:${data.type}`, data.payload);
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        // Send ping message
        this.send({ type: "ping" });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit("max_reconnect_attempts");
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.attemptConnection();
    }, delay);
  }

  send(data: any) {
    if (!this.isConnected) {
      console.warn("WebSocket is not connected");
      return;
    }

    // In real implementation, send via WebSocket
    console.log("Sending WebSocket message:", data);
  }

  // Subscribe to channel updates
  subscribeToChannel(channelId: string) {
    this.send({
      type: "subscribe",
      channel: `channel:${channelId}`,
    });
  }

  unsubscribeFromChannel(channelId: string) {
    this.send({
      type: "unsubscribe",
      channel: `channel:${channelId}`,
    });
  }

  // Subscribe to project updates
  subscribeToProject(projectId: string) {
    this.send({
      type: "subscribe",
      channel: `project:${projectId}`,
    });
  }

  unsubscribeFromProject(projectId: string) {
    this.send({
      type: "unsubscribe",
      channel: `project:${projectId}`,
    });
  }

  // Typing indicators
  startTyping(channelId: string) {
    this.send({
      type: "typing:start",
      channelId,
    });
  }

  stopTyping(channelId: string) {
    this.send({
      type: "typing:stop",
      channelId,
    });
  }

  disconnect() {
    this.isConnected = false;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.removeAllListeners();
  }

  getIsConnected() {
    return this.isConnected;
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// React hook for using WebSocket
import { useEffect, useRef } from "react";

export function useWebSocket(
  events: Record<string, (data: any) => void>,
  deps: any[] = []
) {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const handlers: Array<[string, (...args: any[]) => void]> = [];

    // Register event handlers
    Object.entries(eventsRef.current).forEach(([event, handler]) => {
      const wrappedHandler = (data: any) => handler(data);
      wsService.on(event, wrappedHandler);
      handlers.push([event, wrappedHandler]);
    });

    // Cleanup
    return () => {
      handlers.forEach(([event, handler]) => {
        wsService.off(event, handler);
      });
    };
  }, deps);

  return wsService;
}