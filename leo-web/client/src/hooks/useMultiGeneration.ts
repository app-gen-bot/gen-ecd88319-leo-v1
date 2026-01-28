/**
 * useMultiGeneration Hook - Multi-generation state management
 *
 * Manages multiple concurrent generations with:
 * - Tab tracking for active generations
 * - Per-generation message and state storage
 * - Coordination with useWsi for active tab
 *
 * Usage:
 *   const {
 *     activeGenerations,
 *     activeTabId,
 *     setActiveTabId,
 *     concurrencyInfo,
 *     refreshActiveGenerations,
 *   } = useMultiGeneration();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { GenerationRequestWithApp } from '@shared/schema.zod';

export interface ConcurrencyInfo {
  activeCount: number;
  maxConcurrent: number;
  canStartNew: boolean;
  poolInfo: {
    available: number;
    total: number;
    mode: 'pooled' | 'per-app';
  };
}

export interface MultiGenerationState {
  activeGenerations: GenerationRequestWithApp[];
  activeTabId: number | null;
  setActiveTabId: (id: number | null) => void;
  concurrencyInfo: ConcurrencyInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshActiveGenerations: () => void;
}

export function useMultiGeneration(): MultiGenerationState {
  const [activeTabId, setActiveTabId] = useState<number | null>(null);

  // Track the previous active generations to detect new ones
  const previousActiveRef = useRef<Set<number>>(new Set());

  // Query for active generations
  const {
    data: activeData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['generations', 'active'],
    queryFn: async () => {
      const response = await apiClient.generations.getActive();
      if (response.status === 200) {
        return response.body;
      }
      throw new Error('Failed to fetch active generations');
    },
    refetchInterval: 5000, // Poll every 5 seconds
    retry: 1,
  });

  // Extract data from query response
  const activeGenerations = activeData?.active || [];
  const concurrencyInfo: ConcurrencyInfo | null = activeData
    ? {
        activeCount: activeData.activeCount,
        maxConcurrent: activeData.maxConcurrent,
        canStartNew: activeData.canStartNew,
        poolInfo: activeData.poolInfo,
      }
    : null;

  // Auto-select first active generation if none selected
  useEffect(() => {
    const currentActiveIds = new Set(activeGenerations.map(g => g.id));

    // If a new generation appears, switch to it
    for (const gen of activeGenerations) {
      if (!previousActiveRef.current.has(gen.id)) {
        // New generation detected, switch to it
        setActiveTabId(gen.id);
        break;
      }
    }

    // If current tab is no longer active, switch to first available
    if (activeTabId !== null && !currentActiveIds.has(activeTabId)) {
      setActiveTabId(activeGenerations.length > 0 ? activeGenerations[0].id : null);
    }

    // If no tab selected but there are active generations, select first
    if (activeTabId === null && activeGenerations.length > 0) {
      setActiveTabId(activeGenerations[0].id);
    }

    // Update previous for next comparison
    previousActiveRef.current = currentActiveIds;
  }, [activeGenerations, activeTabId]);

  // Refresh function
  const refreshActiveGenerations = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    activeGenerations,
    activeTabId,
    setActiveTabId,
    concurrencyInfo,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refreshActiveGenerations,
  };
}

// Helper to get generation by ID from active list
export function getActiveGeneration(
  activeGenerations: GenerationRequestWithApp[],
  id: number | null
): GenerationRequestWithApp | null {
  if (id === null) return null;
  return activeGenerations.find(g => g.id === id) || null;
}
