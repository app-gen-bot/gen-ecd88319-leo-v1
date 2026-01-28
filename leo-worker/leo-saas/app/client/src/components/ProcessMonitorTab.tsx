/**
 * ProcessMonitorTab Component
 *
 * Displays real-time trajectory analysis from the process monitor.
 * Shows summary, trajectory score, signals, and cumulative stats.
 */

import { useRef, useEffect } from 'react';
import type { ProcessMonitorMessage } from '../lib/wsi-client';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Zap } from 'lucide-react';

interface ProcessMonitorTabProps {
  updates: ProcessMonitorMessage[];
}

/**
 * Get color and icon for trajectory score
 */
function getScoreStyle(score: string) {
  switch (score) {
    case 'EFFICIENT':
      return {
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        icon: Zap,
        label: 'Efficient',
      };
    case 'GOOD':
      return {
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        icon: CheckCircle,
        label: 'Good',
      };
    case 'STRUGGLING':
      return {
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        icon: TrendingUp,
        label: 'Struggling',
      };
    case 'INEFFICIENT':
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        icon: AlertTriangle,
        label: 'Inefficient',
      };
    default:
      return {
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30',
        icon: Activity,
        label: score,
      };
  }
}

/**
 * Format time window for display
 */
function formatTimeWindow(start?: string, end?: string): string {
  if (!start || !end) return '';
  try {
    const startTime = new Date(start).toLocaleTimeString();
    const endTime = new Date(end).toLocaleTimeString();
    return `${startTime} - ${endTime}`;
  } catch {
    return '';
  }
}

/**
 * Format cost for display
 */
function formatCost(cost?: number): string {
  if (cost === undefined) return '$0.00';
  return `$${cost.toFixed(4)}`;
}

export default function ProcessMonitorTab({ updates }: ProcessMonitorTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new updates arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [updates]);

  if (updates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="w-12 h-12 text-leo-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-leo-text-secondary">
            Waiting for trajectory analysis...
          </p>
          <p className="text-xs text-leo-text-tertiary mt-1">
            Updates arrive every 60 seconds during generation
          </p>
        </div>
      </div>
    );
  }

  // Get latest update for summary display
  const latestUpdate = updates[updates.length - 1];
  const latestScore = latestUpdate?.trajectory?.score || 'GOOD';
  const scoreStyle = getScoreStyle(latestScore);
  const ScoreIcon = scoreStyle.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Latest Status Banner */}
      <div className={`flex-shrink-0 px-4 py-3 border-b border-leo-border ${scoreStyle.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScoreIcon className={`w-5 h-5 ${scoreStyle.color}`} />
            <span className={`font-medium ${scoreStyle.color}`}>
              Current Trajectory: {scoreStyle.label}
            </span>
          </div>
          <div className="text-xs text-leo-text-secondary">
            {updates.length} update{updates.length !== 1 ? 's' : ''}
          </div>
        </div>
        {latestUpdate?.stats && (
          <div className="mt-2 flex items-center gap-4 text-xs text-leo-text-secondary">
            <span>
              Tokens: {((latestUpdate.stats.tokens?.input || 0) + (latestUpdate.stats.tokens?.output || 0)).toLocaleString()}
            </span>
            <span>Cost: {formatCost(latestUpdate.stats.cost_usd)}</span>
            <span>Entries: {latestUpdate.stats.entry_count || 0}</span>
          </div>
        )}
      </div>

      {/* Update Cards */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {updates.map((update, index) => {
          const score = update.trajectory?.score || 'GOOD';
          const style = getScoreStyle(score);
          const Icon = style.icon;
          const timeWindow = formatTimeWindow(update.window?.start, update.window?.end);

          return (
            <div
              key={index}
              className={`rounded-lg border ${style.borderColor} ${style.bgColor} p-4`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${style.color}`} />
                  <span className={`text-sm font-medium ${style.color}`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-leo-text-tertiary">
                    #{index + 1}
                  </span>
                </div>
                {timeWindow && (
                  <span className="text-xs text-leo-text-tertiary">
                    {timeWindow}
                  </span>
                )}
              </div>

              {/* Summary */}
              {update.summary && (
                <p className="text-sm text-leo-text mb-3">
                  {update.summary}
                </p>
              )}

              {/* Signals */}
              {update.trajectory?.signals && update.trajectory.signals.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {update.trajectory.signals.map((signal, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded ${style.bgColor} ${style.color} border ${style.borderColor}`}
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              {update.stats && (
                <div className="flex items-center gap-4 text-xs text-leo-text-tertiary border-t border-leo-border/30 pt-2 mt-2">
                  <span>
                    Tokens: {((update.stats.tokens?.input || 0) + (update.stats.tokens?.output || 0)).toLocaleString()}
                  </span>
                  <span>Cost: {formatCost(update.stats.cost_usd)}</span>
                  {update.stats.tools && Object.keys(update.stats.tools).length > 0 && (
                    <span>
                      Tools: {Object.entries(update.stats.tools)
                        .map(([name, count]) => `${name}(${count})`)
                        .join(', ')}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
