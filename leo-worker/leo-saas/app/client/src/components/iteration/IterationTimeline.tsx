/**
 * IterationTimeline Component
 *
 * Displays a vertical timeline of iteration snapshots with visual indicators
 * for snapshot type (automatic, manual, checkpoint) and selection state.
 */

import { useEffect, useRef } from 'react';
import { Circle, Star, Flag } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { IterationSnapshot } from '@shared/schema.zod';

interface IterationTimelineProps {
  iterations: IterationSnapshot[];
  selectedIterationId: number | null;
  currentIteration: number;
  onSelect: (snapshot: IterationSnapshot) => void;
}

export default function IterationTimeline({
  iterations,
  selectedIterationId,
  currentIteration,
  onSelect,
}: IterationTimelineProps) {
  const currentRef = useRef<HTMLDivElement>(null);

  // Scroll to current iteration on mount
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  if (iterations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-leo-text-tertiary">
        <p className="text-sm">No iterations yet</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative px-4 py-6">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-leo-border" />

        {/* Timeline items */}
        <div className="space-y-4">
          {iterations.map((snapshot) => {
            const isSelected = snapshot.id === selectedIterationId;
            const isCurrent = snapshot.iterationNumber === currentIteration;
            const promptPreview = snapshot.promptUsed.slice(0, 50) + (snapshot.promptUsed.length > 50 ? '...' : '');

            return (
              <div
                key={snapshot.id}
                ref={isCurrent ? currentRef : null}
                onClick={() => onSelect(snapshot)}
                className={cn(
                  'relative pl-12 cursor-pointer transition-all',
                  isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                )}
              >
                {/* Timeline dot with icon */}
                <div
                  className={cn(
                    'absolute left-6 -ml-2 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all',
                    isCurrent
                      ? 'bg-leo-primary border-leo-primary shadow-glow-sm'
                      : isSelected
                      ? 'bg-leo-bg-secondary border-leo-primary'
                      : 'bg-leo-bg-tertiary border-leo-border'
                  )}
                >
                  {snapshot.snapshotType === 'manual' && (
                    <Star className={cn('w-3 h-3', isCurrent ? 'text-white' : 'text-leo-primary')} />
                  )}
                  {snapshot.snapshotType === 'checkpoint' && (
                    <Flag className={cn('w-3 h-3', isCurrent ? 'text-white' : 'text-leo-primary')} />
                  )}
                  {snapshot.snapshotType === 'automatic' && (
                    <Circle className={cn('w-2 h-2', isCurrent ? 'text-white fill-white' : 'text-leo-primary fill-leo-primary')} />
                  )}
                </div>

                {/* Content card */}
                <div
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    isSelected
                      ? 'bg-leo-bg-secondary border-leo-primary shadow-glow-sm'
                      : 'bg-leo-bg-tertiary border-leo-border hover:border-leo-primary/50'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium', isCurrent ? 'text-leo-primary' : 'text-leo-text')}>
                        Iteration {snapshot.iterationNumber}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-leo-primary/20 text-leo-primary rounded">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-leo-text-tertiary">
                      {new Date(snapshot.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Prompt preview */}
                  <p className="text-xs text-leo-text-secondary line-clamp-2">{promptPreview}</p>

                  {/* Metadata badges */}
                  {snapshot.metadata && (
                    <div className="flex gap-2 mt-2">
                      {snapshot.metadata.tokensUsed && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-leo-bg border border-leo-border rounded text-leo-text-tertiary">
                          {snapshot.metadata.tokensUsed.toLocaleString()} tokens
                        </span>
                      )}
                      {snapshot.metadata.duration && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-leo-bg border border-leo-border rounded text-leo-text-tertiary">
                          {Math.round(snapshot.metadata.duration / 1000)}s
                        </span>
                      )}
                      {snapshot.metadata.changedFiles && snapshot.metadata.changedFiles.length > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-leo-bg border border-leo-border rounded text-leo-text-tertiary">
                          {snapshot.metadata.changedFiles.length} files
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
