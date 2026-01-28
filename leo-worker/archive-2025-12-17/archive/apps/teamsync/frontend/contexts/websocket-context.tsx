"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { wsService } from "@/lib/websocket";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

interface WebSocketContextValue {
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<WebSocketContextValue["connectionStatus"]>("disconnected");

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket
    setConnectionStatus("connecting");
    wsService.connect(localStorage.getItem("auth_token") || "");

    // Set up event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionStatus("connected");
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
    };

    const handleError = () => {
      setIsConnected(false);
      setConnectionStatus("error");
      toast({
        title: "Connection Error",
        description: "Lost connection to server. Attempting to reconnect...",
        variant: "destructive",
      });
    };

    const handleMaxReconnectAttempts = () => {
      setConnectionStatus("error");
      toast({
        title: "Connection Failed",
        description: "Unable to connect to server. Please refresh the page.",
        variant: "destructive",
      });
    };

    wsService.on("connected", handleConnected);
    wsService.on("disconnected", handleDisconnected);
    wsService.on("error", handleError);
    wsService.on("max_reconnect_attempts", handleMaxReconnectAttempts);

    // Cleanup
    return () => {
      wsService.off("connected", handleConnected);
      wsService.off("disconnected", handleDisconnected);
      wsService.off("error", handleError);
      wsService.off("max_reconnect_attempts", handleMaxReconnectAttempts);
      wsService.disconnect();
    };
  }, [user, toast]);

  return (
    <WebSocketContext.Provider value={{ isConnected, connectionStatus }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketConnection() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocketConnection must be used within a WebSocketProvider");
  }
  return context;
}