/**
 * GenerationTabs Component
 *
 * Tab bar for switching between active generations.
 * Shows app name, iteration progress, and status for each active generation.
 */

import { Plus } from 'lucide-react';
import type { GenerationRequestWithApp } from '@shared/schema.zod';
import type { ConcurrencyInfo } from '../../hooks/useMultiGeneration';

interface GenerationTabsProps {
  activeGenerations: GenerationRequestWithApp[];
  activeTabId: number | null;
  onTabChange: (id: number) => void;
  onNewTab: () => void;
  concurrencyInfo: ConcurrencyInfo | null;
}

export function GenerationTabs({
  activeGenerations,
  activeTabId,
  onTabChange,
  onNewTab,
  concurrencyInfo,
}: GenerationTabsProps) {
  const canAddNew = concurrencyInfo?.canStartNew ?? false;

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-leo-bg-secondary border-b border-leo-border overflow-x-auto">
      {/* Generation Tabs */}
      {activeGenerations.map((gen) => {
        const isActive = gen.id === activeTabId;
        const iterationText = gen.currentIteration > 0
          ? `${gen.currentIteration}/${gen.maxIterations}`
          : gen.status;

        return (
          <button
            key={gen.id}
            onClick={() => onTabChange(gen.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
              transition-all duration-200 whitespace-nowrap min-w-0
              ${isActive
                ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-leo-text border border-purple-500/30'
                : 'bg-leo-bg-tertiary text-leo-text-secondary hover:bg-leo-bg-hover hover:text-leo-text'
              }
            `}
          >
            {/* Status indicator */}
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                gen.status === 'generating'
                  ? 'bg-green-500 animate-pulse'
                  : gen.status === 'queued'
                  ? 'bg-yellow-500'
                  : gen.status === 'paused'
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              }`}
            />

            {/* App name (truncated) */}
            <span className="truncate max-w-[100px]">{gen.appName}</span>

            {/* Iteration count */}
            <span className="text-[10px] text-leo-text-tertiary">
              ({iterationText})
            </span>
          </button>
        );
      })}

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        disabled={!canAddNew}
        className={`
          flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs
          transition-all duration-200
          ${canAddNew
            ? 'bg-leo-bg-tertiary text-leo-text-secondary hover:bg-leo-bg-hover hover:text-leo-text'
            : 'text-leo-text-tertiary cursor-not-allowed opacity-50'
          }
        `}
        title={canAddNew ? 'Start new generation' : `Max ${concurrencyInfo?.maxConcurrent || 0} concurrent generations`}
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">New</span>
      </button>

      {/* Concurrency info */}
      {concurrencyInfo && (
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-leo-text-tertiary px-2">
          <span>{concurrencyInfo.activeCount}/{concurrencyInfo.maxConcurrent} active</span>
          {concurrencyInfo.poolInfo.mode === 'pooled' && (
            <span className="text-leo-text-quaternary">
              ({concurrencyInfo.poolInfo.total - concurrencyInfo.poolInfo.available}/{concurrencyInfo.poolInfo.total} pools)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
