import { useEffect, useState, useRef, useCallback } from 'react';

export interface GenerationLog {
  timestamp: string;
  line: string;
}

export interface StatusChangeCallback {
  (status: string): void;
}

export function useGenerationLogs(
  requestId: number | null,
  onStatusChange?: StatusChangeCallback
) {
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!requestId) {
      console.log('[WebSocket Client] No requestId provided, skipping connection');
      return;
    }

    if (wsRef.current) {
      console.log('[WebSocket Client] Already connected, skipping');
      return;
    }

    // Determine WebSocket URL (ws:// for http://, wss:// for https://)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Use port 5013 for local development, but use default port (80/443) for production
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const port = isLocal ? ':5013' : '';
    const wsUrl = `${protocol}//${window.location.hostname}${port}/ws/logs/${requestId}`;

    console.log('[WebSocket Client] Connecting to:', wsUrl);
    console.log('[WebSocket Client] Request ID:', requestId);
    console.log('[WebSocket Client] Environment:', isLocal ? 'local' : 'production');

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket Client] ✅ Connected to log stream for request:', requestId);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      console.log('[WebSocket Client] Received message:', event.data);
      try {
        const message = JSON.parse(event.data);
        console.log('[WebSocket Client] Parsed message:', message);

        if (message.type === 'logs') {
          // Initial bulk logs
          console.log('[WebSocket Client] Received bulk logs:', message.logs.length);
          setLogs(message.logs);
        } else if (message.type === 'log') {
          // New single log
          console.log('[WebSocket Client] Received new log:', message.log);
          setLogs((prev) => [...prev, message.log]);
        } else if (message.type === 'status_change') {
          // Status changed (e.g., completed)
          console.log('[WebSocket Client] Status changed to:', message.status);
          if (onStatusChange) {
            onStatusChange(message.status);
          }
        } else {
          console.warn('[WebSocket Client] Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('[WebSocket Client] Failed to parse message:', error);
        console.error('[WebSocket Client] Raw message data:', event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket Client] ❌ WebSocket error:', error);
      console.error('[WebSocket Client] WebSocket state:', ws?.readyState ?? 'unknown');
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log('[WebSocket Client] Disconnected from log stream');
      console.log('[WebSocket Client] Close code:', event.code, 'Reason:', event.reason);
      setIsConnected(false);
      wsRef.current = null;
    };
  }, [requestId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      console.log('[WebSocket Client] Disconnecting...');
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect, onStatusChange]);

  return { logs, isConnected };
}
