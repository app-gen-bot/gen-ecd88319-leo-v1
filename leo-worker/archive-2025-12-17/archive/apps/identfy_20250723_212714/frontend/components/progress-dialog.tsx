"use client";

import { useEffect, useState } from "react";
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
import { AlertCircle, CheckCircle, FileDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  progress: number;
  status: "idle" | "processing" | "completed" | "error" | "cancelled";
  error?: string;
  canCancel?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
  estimatedTime?: number; // in seconds
  processedItems?: number;
  totalItems?: number;
  downloadUrl?: string;
  fileName?: string;
}

export function ProgressDialog({
  open,
  onOpenChange,
  title,
  description,
  progress,
  status,
  error,
  canCancel = true,
  onCancel,
  onComplete,
  estimatedTime,
  processedItems,
  totalItems,
  downloadUrl,
  fileName,
}: ProgressDialogProps) {
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);

  useEffect(() => {
    if (estimatedTime && status === "processing") {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (!prev || prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [estimatedTime, status]);

  const formatTime = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "cancelled":
        return <X className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-600 dark:bg-green-400";
      case "error":
        return "bg-red-600 dark:bg-red-400";
      case "cancelled":
        return "bg-gray-400 dark:bg-gray-600";
      default:
        return "";
    }
  };

  const handleClose = () => {
    if (status === "processing" && !canCancel) return;
    onOpenChange(false);
    if (status === "completed" && onComplete) {
      onComplete();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleClose}
    >
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (status === "processing" && !canCancel) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (status === "processing" && !canCancel) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {status === "processing" && processedItems && totalItems
                  ? `Processing ${processedItems} of ${totalItems} items`
                  : status === "completed"
                  ? "Operation completed"
                  : status === "error"
                  ? "Operation failed"
                  : status === "cancelled"
                  ? "Operation cancelled"
                  : "Preparing..."}
              </span>
              <span className="font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress 
              value={progress} 
              className={cn("h-2", getProgressColor())}
            />
            {status === "processing" && timeRemaining !== undefined && timeRemaining > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Estimated time remaining: {formatTime(timeRemaining)}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          {status === "completed" && downloadUrl && (
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Download {fileName || "File"}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          {status === "processing" && canCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!canCancel}
            >
              Cancel
            </Button>
          )}
          {(status === "completed" || status === "error" || status === "cancelled") && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage progress operations
export function useProgressOperation() {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "error" | "cancelled">("idle");
  const [error, setError] = useState<string>();
  const [downloadUrl, setDownloadUrl] = useState<string>();

  const start = () => {
    setIsOpen(true);
    setProgress(0);
    setStatus("processing");
    setError(undefined);
    setDownloadUrl(undefined);
  };

  const updateProgress = (value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  };

  const complete = (url?: string) => {
    setProgress(100);
    setStatus("completed");
    if (url) {
      setDownloadUrl(url);
    }
  };

  const fail = (errorMessage: string) => {
    setStatus("error");
    setError(errorMessage);
  };

  const cancel = () => {
    setStatus("cancelled");
  };

  const reset = () => {
    setIsOpen(false);
    setProgress(0);
    setStatus("idle");
    setError(undefined);
    setDownloadUrl(undefined);
  };

  return {
    isOpen,
    setIsOpen,
    progress,
    status,
    error,
    downloadUrl,
    start,
    updateProgress,
    complete,
    fail,
    cancel,
    reset,
  };
}