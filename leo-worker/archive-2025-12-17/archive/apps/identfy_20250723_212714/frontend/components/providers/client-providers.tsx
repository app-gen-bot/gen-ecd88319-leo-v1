"use client";

import { useEffect, useState } from "react";
import { WebSocketProvider } from "@/contexts/websocket-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { SessionTimeoutModal } from "@/components/session-timeout-modal";
import { OfflineIndicator } from "@/components/offline-indicator";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { Toaster } from "@/components/ui/sonner";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // During SSR, render children without providers
  if (!mounted) {
    return <>{children}</>;
  }
  
  return (
    <WebSocketProvider>
      <NotificationProvider>
        <OfflineIndicator />
        {children}
        <Toaster />
        <SessionTimeoutModal />
        <KeyboardShortcuts />
      </NotificationProvider>
    </WebSocketProvider>
  );
}