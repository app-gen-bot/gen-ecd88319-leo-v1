/**
 * ResizableDivider Component
 *
 * A draggable vertical divider that allows resizing adjacent panels.
 * Provides visual feedback on hover and during drag.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizableDividerProps {
  /** Current position as percentage (0-100) of the container width for the left panel */
  position: number;
  /** Callback when position changes */
  onPositionChange: (position: number) => void;
  /** Minimum position percentage (default: 20) */
  minPosition?: number;
  /** Maximum position percentage (default: 80) */
  maxPosition?: number;
  /** Optional className for styling */
  className?: string;
}

export function ResizableDivider({
  position,
  onPositionChange,
  minPosition = 20,
  maxPosition = 80,
  className = '',
}: ResizableDividerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Handle mouse down to start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      // Get the parent container (flex container)
      const container = containerRef.current?.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;

      // Clamp to min/max bounds
      const clampedPosition = Math.min(Math.max(newPosition, minPosition), maxPosition);
      onPositionChange(clampedPosition);
    },
    [isDragging, minPosition, maxPosition, onPositionChange]
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isActive = isDragging || isHovered;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex-shrink-0 w-1 cursor-col-resize
        transition-colors duration-150
        ${isActive ? 'bg-leo-primary/50' : 'bg-leo-border hover:bg-leo-primary/30'}
        ${className}
      `}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={position}
      aria-valuemin={minPosition}
      aria-valuemax={maxPosition}
    >
      {/* Larger hit area for easier grabbing */}
      <div className="absolute inset-y-0 -left-1 -right-1 z-10" />

      {/* Visual indicator line that appears on hover/drag */}
      <div
        className={`
          absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2
          transition-all duration-150
          ${isActive ? 'bg-leo-primary shadow-glow-sm scale-y-100' : 'bg-transparent scale-y-0'}
        `}
      />

      {/* Drag handle dots (visible on hover) */}
      <div
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          flex flex-col gap-1 transition-opacity duration-150
          ${isActive ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div className="w-1 h-1 rounded-full bg-leo-primary" />
        <div className="w-1 h-1 rounded-full bg-leo-primary" />
        <div className="w-1 h-1 rounded-full bg-leo-primary" />
      </div>
    </div>
  );
}

/**
 * Custom hook for managing resizable panel state with localStorage persistence
 */
export function useResizablePanel(
  storageKey: string,
  defaultPosition: number = 50
): [number, (position: number) => void] {
  const [position, setPosition] = useState<number>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          return parsed;
        }
      }
    }
    return defaultPosition;
  });

  // Persist to localStorage when position changes
  const handlePositionChange = useCallback(
    (newPosition: number) => {
      setPosition(newPosition);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newPosition.toString());
      }
    },
    [storageKey]
  );

  return [position, handlePositionChange];
}
