"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      // Hide the "back online" message after 3 seconds
      setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-2 duration-300">
      <Alert
        className={cn(
          "rounded-none border-x-0 border-t-0",
          isOnline
            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
            : "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
        )}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          )}
          <AlertDescription
            className={cn(
              "font-medium",
              isOnline
                ? "text-green-800 dark:text-green-200"
                : "text-orange-800 dark:text-orange-200"
            )}
          >
            {isOnline
              ? "You're back online"
              : "You're offline. Some features may be unavailable."}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}

// Hook to check online status in components
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}