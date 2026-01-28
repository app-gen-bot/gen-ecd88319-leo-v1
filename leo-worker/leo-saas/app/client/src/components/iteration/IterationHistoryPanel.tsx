/**
 * IterationHistoryPanel Component
 *
 * Main container component that combines timeline and details views.
 * Fetches iterations from API and manages selection state.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import IterationTimeline from './IterationTimeline';
import IterationDetails from './IterationDetails';
import IterationComparisonModal from './IterationComparisonModal';
import { apiClient } from '../../lib/api-client';
import type { IterationSnapshot } from '@shared/schema.zod';

interface IterationHistoryPanelProps {
  generationId: number;
  currentIteration: number;
}

export default function IterationHistoryPanel({
  generationId,
  currentIteration,
}: IterationHistoryPanelProps) {
  const queryClient = useQueryClient();
  const [selectedSnapshot, setSelectedSnapshot] = useState<IterationSnapshot | null>(null);
  const [compareSnapshotA, setCompareSnapshotA] = useState<IterationSnapshot | null>(null);
  const [compareSnapshotB, setCompareSnapshotB] = useState<IterationSnapshot | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Fetch iterations
  const {
    data: iterations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['iterations', generationId],
    queryFn: async () => {
      const response = await apiClient.iterations.listByGeneration({
        params: { id: String(generationId) },
      });

      if (response.status === 200) {
        return response.body;
      }
      throw new Error('Failed to fetch iterations');
    },
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (snapshotId: number) => {
      const response = await apiClient.iterations.rollback({
        params: { id: String(generationId) },
        body: { snapshotId },
      });

      if (response.status !== 200) {
        throw new Error('Failed to rollback');
      }
      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iterations', generationId] });
      queryClient.invalidateQueries({ queryKey: ['generations', generationId] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (snapshotId: number) => {
      const response = await apiClient.iterations.delete({
        params: { snapshotId: String(snapshotId) },
      });

      if (response.status !== 200) {
        throw new Error('Failed to delete snapshot');
      }
      return response.body;
    },
    onSuccess: () => {
      setSelectedSnapshot(null);
      queryClient.invalidateQueries({ queryKey: ['iterations', generationId] });
    },
  });

  const handleSelectSnapshot = (snapshot: IterationSnapshot) => {
    setSelectedSnapshot(snapshot);
  };

  const handleRollback = (snapshotId: number) => {
    rollbackMutation.mutate(snapshotId);
  };

  const handleCompare = (snapshotId: number) => {
    const snapshot = iterations?.find((s) => s.id === snapshotId);
    if (!snapshot) return;

    if (!compareSnapshotA) {
      setCompareSnapshotA(snapshot);
    } else {
      setCompareSnapshotB(snapshot);
      setIsCompareModalOpen(true);
    }
  };

  const handleCloseCompare = () => {
    setIsCompareModalOpen(false);
    setCompareSnapshotA(null);
    setCompareSnapshotB(null);
  };

  const handleDelete = (snapshotId: number) => {
    deleteMutation.mutate(snapshotId);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex">
        <div className="w-1/3 border-r border-leo-border p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-leo-text mb-2">Failed to load iterations</h3>
          <p className="text-sm text-leo-text-secondary mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!iterations || iterations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-leo-bg-tertiary flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-leo-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-leo-text mb-2">No iterations yet</h3>
          <p className="text-sm text-leo-text-secondary max-w-md mb-4">
            Iteration snapshots will appear here as your generation progresses through autonomous mode.
          </p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex">
        {/* Left: Timeline */}
        <div className="w-1/3 border-r border-leo-border bg-leo-bg">
          <div className="h-full flex flex-col">
            {/* Timeline Header */}
            <div className="flex-shrink-0 p-4 border-b border-leo-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-leo-text">
                Iterations ({iterations.length})
              </h2>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Timeline List */}
            <div className="flex-1 overflow-hidden">
              <IterationTimeline
                iterations={iterations}
                selectedIterationId={selectedSnapshot?.id || null}
                currentIteration={currentIteration}
                onSelect={handleSelectSnapshot}
              />
            </div>

            {/* Compare indicator */}
            {compareSnapshotA && !compareSnapshotB && (
              <div className="flex-shrink-0 p-3 bg-leo-primary/10 border-t border-leo-primary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-leo-primary">
                      Comparing: Iteration {compareSnapshotA.iterationNumber}
                    </p>
                    <p className="text-[10px] text-leo-text-tertiary">
                      Select another iteration to compare
                    </p>
                  </div>
                  <Button
                    onClick={() => setCompareSnapshotA(null)}
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex-1 bg-leo-bg-secondary">
          <IterationDetails
            snapshot={selectedSnapshot}
            onRollback={handleRollback}
            onCompare={handleCompare}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Comparison Modal */}
      <IterationComparisonModal
        snapshotA={compareSnapshotA}
        snapshotB={compareSnapshotB}
        isOpen={isCompareModalOpen}
        onClose={handleCloseCompare}
      />
    </>
  );
}
