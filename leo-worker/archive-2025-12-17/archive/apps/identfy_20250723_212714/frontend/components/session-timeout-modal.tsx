"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle } from "lucide-react";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
const UPDATE_INTERVAL = 1000; // Update countdown every second

export function SessionTimeoutModal() {
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(WARNING_TIME);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Reset activity timestamp on user interaction
  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Check for timeout
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const checkTimeout = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilTimeout = SESSION_TIMEOUT - timeSinceActivity;

      if (timeUntilTimeout <= 0) {
        // Session expired
        signOut();
      } else if (timeUntilTimeout <= WARNING_TIME && !showWarning) {
        // Show warning
        setShowWarning(true);
        setTimeRemaining(timeUntilTimeout);
      } else if (showWarning && timeUntilTimeout > WARNING_TIME) {
        // User was active, hide warning
        setShowWarning(false);
      }

      if (showWarning) {
        setTimeRemaining(timeUntilTimeout);
      }
    };

    const interval = setInterval(checkTimeout, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn, lastActivity, showWarning]);

  // Listen for user activity
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => {
      const now = Date.now();
      // Only update if it's been more than 10 seconds since last activity
      if (now - lastActivity > 10000) {
        resetActivity();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isLoaded, isSignedIn, lastActivity, resetActivity]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleStaySignedIn = () => {
    resetActivity();
    // You could also make an API call here to refresh the session token
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/sign-in" });
  };

  const progressValue = (timeRemaining / WARNING_TIME) * 100;

  if (!showWarning) return null;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <DialogTitle>Session Timeout Warning</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            Your session will expire in <strong>{formatTime(timeRemaining)}</strong> due to inactivity.
            Would you like to stay signed in?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Progress value={progressValue} className="h-2" />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full sm:w-auto"
          >
            Sign Out
          </Button>
          <Button
            onClick={handleStaySignedIn}
            className="w-full sm:w-auto"
          >
            Stay Signed In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}