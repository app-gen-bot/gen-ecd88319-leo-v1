"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

interface WebSocketContextType {
  connected: boolean;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
  emit: (event: string, data: any) => void;
  lastMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    // Return a dummy context during SSR
    if (typeof window === 'undefined') {
      return {
        connected: false,
        subscribe: () => () => {},
        emit: () => {},
        lastMessage: null,
      };
    }
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const listeners = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = useCallback(async () => {
    // WebSocket connection disabled - no backend running
    return;
    
    if (status !== 'authenticated' || !session?.accessToken) return;

    try {
      const token = session.accessToken;
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
      
      ws.current = new WebSocket(`${wsUrl}/ws?token=${token}`);

      ws.current.onopen = () => {
        setConnected(true);
        
        // Clear any existing reconnect timer
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const wsMessage: WebSocketMessage = {
            type: message.type,
            data: message.data,
            timestamp: new Date(message.timestamp || Date.now()),
          };
          
          setLastMessage(wsMessage);

          // Notify all listeners for this event type
          const eventListeners = listeners.current.get(message.type);
          if (eventListeners) {
            eventListeners.forEach(callback => callback(message.data));
          }

          // Handle system messages
          if (message.type === 'notification') {
            handleNotification(message.data);
          }
        } catch (error) {
          // Failed to parse WebSocket message
        }
      };

      ws.current.onerror = () => {
        toast.error('Connection error. Retrying...');
      };

      ws.current.onclose = () => {
        setConnected(false);
        ws.current = null;

        // Attempt to reconnect after 5 seconds
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    } catch (error) {
      // Failed to connect to WebSocket
    }
  }, [status, session]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!listeners.current.has(event)) {
      listeners.current.set(event, new Set());
    }
    listeners.current.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = listeners.current.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          listeners.current.delete(event);
        }
      }
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: event,
        data,
        timestamp: new Date().toISOString(),
      }));
    } else {
      // WebSocket is not connected. Message not sent.
    }
  }, []);

  const handleNotification = (notification: any) => {
    // Display toast notifications based on type
    switch (notification.severity) {
      case 'error':
        toast.error(notification.message);
        break;
      case 'warning':
        toast.warning(notification.message);
        break;
      case 'success':
        toast.success(notification.message);
        break;
      default:
        toast.info(notification.message);
    }
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        subscribe,
        emit,
        lastMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}