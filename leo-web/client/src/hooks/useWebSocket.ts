import { useEffect, useState, useCallback } from 'react';
import { wsManager } from '../lib/websocket';
import { supabase } from '../lib/supabase-client';

interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: string;
  [key: string]: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (type: string, payload: any) => void;
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
  messages: WebSocketMessage[];
  clearMessages: () => void;
}

/**
 * useWebSocket Hook
 *
 * React hook for WebSocket integration.
 * Features:
 * - Auto-connect on mount with JWT token
 * - Track connection status
 * - Store incoming messages
 * - Send messages to server
 * - Join/leave session rooms
 *
 * @returns WebSocket utilities and state
 */
export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    // Get JWT token and connect
    const initWebSocket = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        wsManager.connect(token);
      }
    };

    initWebSocket();

    // Subscribe to connection events
    const unsubConnected = wsManager.on('connected', () => {
      setIsConnected(true);
    });

    const unsubDisconnected = wsManager.on('disconnected', () => {
      setIsConnected(false);
    });

    const unsubMessage = wsManager.on('message', (message: WebSocketMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubMessage();
    };
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    wsManager.send(type, payload);
  }, []);

  const joinSession = useCallback((sessionId: string) => {
    wsManager.joinSession(sessionId);
  }, []);

  const leaveSession = useCallback((sessionId: string) => {
    wsManager.leaveSession(sessionId);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    sendMessage,
    joinSession,
    leaveSession,
    messages,
    clearMessages,
  };
}
