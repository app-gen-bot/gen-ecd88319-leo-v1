/**
 * ScreenshotPreview Component
 *
 * Displays screenshots streamed from the container during quality assurance testing.
 * Shows the most recent screenshot with navigation for viewing previous ones.
 *
 * Features:
 * - Auto-updates when new screenshots arrive
 * - Navigation (prev/next) through screenshot history
 * - Shows screenshot metadata (filename, timestamp, stage)
 * - Lightbox view for full-size images
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Maximize2,
  X,
  ImageIcon,
  Clock,
} from 'lucide-react';
import type { ScreenshotMessage } from '../../lib/wsi-client';

// Minimum time (ms) to display each screenshot before auto-advancing
const MIN_DISPLAY_TIME = 2000;

interface ScreenshotPreviewProps {
  screenshots: ScreenshotMessage[];
  className?: string;
}

export function ScreenshotPreview({ screenshots, className = '' }: ScreenshotPreviewProps) {
  // Current screenshot index (default to most recent)
  const [currentIndex, setCurrentIndex] = useState(0);
  // Lightbox (full-screen view)
  const [showLightbox, setShowLightbox] = useState(false);
  // Auto-follow mode (automatically show newest screenshot)
  const [autoFollow, setAutoFollow] = useState(true);
  // Track pending screenshot count (for debounced updates)
  const [pendingCount, setPendingCount] = useState(0);
  // Last update time for debouncing
  const lastUpdateRef = useRef<number>(0);
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-update to newest screenshot when new ones arrive (if in auto-follow mode)
  // Uses debouncing to ensure minimum display time per screenshot
  useEffect(() => {
    if (!autoFollow || screenshots.length === 0) return;

    const targetIndex = screenshots.length - 1;
    if (currentIndex === targetIndex) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // Clear any pending timeout
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }

    if (timeSinceLastUpdate >= MIN_DISPLAY_TIME) {
      // Enough time has passed, update immediately
      setCurrentIndex(targetIndex);
      lastUpdateRef.current = now;
      setPendingCount(0);
    } else {
      // Schedule update after remaining time
      const delay = MIN_DISPLAY_TIME - timeSinceLastUpdate;
      setPendingCount(targetIndex - currentIndex);
      pendingTimeoutRef.current = setTimeout(() => {
        setCurrentIndex(targetIndex);
        lastUpdateRef.current = Date.now();
        setPendingCount(0);
      }, delay);
    }

    return () => {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, [screenshots.length, autoFollow, currentIndex]);

  // Current screenshot
  const currentScreenshot = screenshots[currentIndex];

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setAutoFollow(false); // Disable auto-follow when manually navigating
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < screenshots.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Re-enable auto-follow if we're at the latest
      if (currentIndex + 1 === screenshots.length - 1) {
        setAutoFollow(true);
      }
    }
  }, [currentIndex, screenshots.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape' && showLightbox) {
        setShowLightbox(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, showLightbox]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  // Empty state
  if (screenshots.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-leo-bg-tertiary flex items-center justify-center shadow-glow-sm">
            <Camera className="w-8 h-8 text-leo-text-tertiary" />
          </div>
          <p className="text-leo-text-secondary text-sm mb-2">
            No screenshots yet
          </p>
          <p className="text-leo-text-tertiary text-xs max-w-md">
            Screenshots will appear here during quality assurance testing
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col h-full ${className}`}>
        {/* Header with navigation */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-leo-border bg-leo-bg-secondary">
          {/* Left: Screenshot info */}
          <div className="flex items-center gap-2 text-xs text-leo-text-secondary">
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="font-medium">{currentScreenshot?.filename || 'screenshot'}</span>
            {currentScreenshot?.stage && (
              <span className="px-1.5 py-0.5 bg-leo-primary/20 text-leo-primary rounded text-[10px]">
                {currentScreenshot.stage}
              </span>
            )}
          </div>

          {/* Right: Navigation + actions */}
          <div className="flex items-center gap-2">
            {/* Timestamp */}
            {currentScreenshot?.timestamp && (
              <span className="flex items-center gap-1 text-xs text-leo-text-tertiary">
                <Clock className="w-3 h-3" />
                {formatTime(currentScreenshot.timestamp)}
              </span>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-1 px-2 py-1 bg-leo-bg-tertiary rounded-lg">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="p-0.5 hover:bg-leo-bg-hover rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous screenshot"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-leo-text-secondary min-w-[3rem] text-center">
                {currentIndex + 1} / {screenshots.length}
              </span>
              <button
                onClick={goToNext}
                disabled={currentIndex === screenshots.length - 1}
                className="p-0.5 hover:bg-leo-bg-hover rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next screenshot"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Auto-follow indicator / pending count */}
            {!autoFollow ? (
              <button
                onClick={() => {
                  setAutoFollow(true);
                  setCurrentIndex(screenshots.length - 1);
                  lastUpdateRef.current = Date.now();
                }}
                className="text-xs text-leo-primary hover:underline"
                title="Jump to latest screenshot"
              >
                Live
              </button>
            ) : pendingCount > 0 ? (
              <span className="text-xs text-leo-text-tertiary animate-pulse">
                +{pendingCount} pending
              </span>
            ) : null}

            {/* Expand button */}
            <button
              onClick={() => setShowLightbox(true)}
              className="p-1 hover:bg-leo-bg-tertiary rounded transition-colors"
              title="View full size"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Screenshot display */}
        <div className="flex-1 overflow-hidden bg-[#09090b] flex items-center justify-center p-4">
          {currentScreenshot && (
            <img
              src={currentScreenshot.image_base64}
              alt={currentScreenshot.description || currentScreenshot.filename}
              className="max-w-full max-h-full object-contain rounded shadow-lg cursor-pointer"
              onClick={() => setShowLightbox(true)}
            />
          )}
        </div>

        {/* Description footer */}
        {currentScreenshot?.description && (
          <div className="px-3 py-2 border-t border-leo-border bg-leo-bg-secondary">
            <p className="text-xs text-leo-text-secondary">{currentScreenshot.description}</p>
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      {showLightbox && currentScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            disabled={currentIndex === 0}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            disabled={currentIndex === screenshots.length - 1}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          {/* Image */}
          <img
            src={currentScreenshot.image_base64}
            alt={currentScreenshot.description || currentScreenshot.filename}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Info overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-black/50 rounded-lg text-white text-sm">
            <span>{currentScreenshot.filename}</span>
            {currentScreenshot.width && currentScreenshot.height && (
              <span className="text-white/60">
                {currentScreenshot.width} x {currentScreenshot.height}
              </span>
            )}
            <span className="text-white/60">
              {currentIndex + 1} / {screenshots.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
