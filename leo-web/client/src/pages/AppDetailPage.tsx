import { useState } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  PauseCircle,
  Play,
  Github,
  ExternalLink,
  AlertTriangle,
  DollarSign,
  Timer,
  Repeat,
  Plane,
  StopCircle,
  GitCommit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DeployModal } from '@/components/DeployModal';
import { getAuthToken } from '@/lib/auth-helpers';
import type { GenerationRequestWithApp } from '@shared/schema.zod';

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const appId = parseInt(id || '0', 10);

  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<GenerationRequestWithApp | null>(null);
  const [expandedCostBreakdowns, setExpandedCostBreakdowns] = useState<Set<number>>(new Set());

  // Toggle cost breakdown expansion
  const toggleCostBreakdown = (genId: number) => {
    setExpandedCostBreakdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(genId)) {
        newSet.delete(genId);
      } else {
        newSet.add(genId);
      }
      return newSet;
    });
  };

  // Fetch app details (from the first generation which contains app info)
  const { data: generations, isLoading, error } = useQuery({
    queryKey: ['app-generations', appId],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`/api/apps/${appId}/generations`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch app generations');
      }
      return response.json() as Promise<GenerationRequestWithApp[]>;
    },
    enabled: appId > 0,
  });

  // Mark as failed mutation
  const [markingFailedId, setMarkingFailedId] = useState<number | null>(null);
  const markFailedMutation = useMutation({
    mutationFn: async (genId: number) => {
      const token = getAuthToken();
      const response = await fetch(`/api/generations/${genId}/mark-failed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Marked as failed by user (orphaned generation)' }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to mark as failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-generations', appId] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setMarkingFailedId(null);
    },
    onError: () => {
      setMarkingFailedId(null);
    },
  });

  // Cancel mutation
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const cancelMutation = useMutation({
    mutationFn: async (genId: number) => {
      const token = getAuthToken();
      const response = await fetch(`/api/generations/${genId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel generation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-generations', appId] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setCancellingId(null);
    },
    onError: () => {
      setCancellingId(null);
    },
  });

  const handleMarkFailed = (gen: GenerationRequestWithApp) => {
    if (window.confirm(`Mark this generation as failed?\n\nThis will clear the stuck "Generating" status.`)) {
      setMarkingFailedId(gen.id);
      markFailedMutation.mutate(gen.id);
    }
  };

  const handleCancel = (gen: GenerationRequestWithApp) => {
    if (window.confirm(`Are you sure you want to cancel this generation?`)) {
      setCancellingId(gen.id);
      cancelMutation.mutate(gen.id);
    }
  };

  const handleDeploy = (gen: GenerationRequestWithApp) => {
    setSelectedGeneration(gen);
    setDeployModalOpen(true);
  };

  // Format duration in human readable format (seconds rounded to integers)
  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return 'N/A';
    // Round to integer seconds to avoid floating point display issues
    const roundedSeconds = Math.round(seconds);
    if (roundedSeconds < 60) return `${roundedSeconds}s`;
    if (roundedSeconds < 3600) {
      const mins = Math.floor(roundedSeconds / 60);
      const secs = roundedSeconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    if (roundedSeconds < 86400) {
      const hours = Math.floor(roundedSeconds / 3600);
      const mins = Math.floor((roundedSeconds % 3600) / 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    const days = Math.floor(roundedSeconds / 86400);
    const hours = Math.floor((roundedSeconds % 86400) / 3600);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  };

  // Format cost in USD (use integer cents internally for precision, display 2 decimal places)
  const formatCost = (cost: string | number | null | undefined): string => {
    if (cost === null || cost === undefined) return 'N/A';
    const num = typeof cost === 'number' ? cost : parseFloat(cost);
    if (isNaN(num)) return 'N/A';
    // Round to cents to avoid floating point display issues
    const cents = Math.round(num * 100);
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Format cost number only (for inline display, rounds to cents)
  const formatCostValue = (cost: number): string => {
    const cents = Math.round(cost * 100);
    return (cents / 100).toFixed(2);
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (status: GenerationRequestWithApp['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'generating':
        return <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-cyan-400" />;
    }
  };

  const getStatusBadge = (status: GenerationRequestWithApp['status']) => {
    const styles: Record<typeof status, string> = {
      queued: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      generating: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      failed: 'bg-red-500/10 text-red-400 border-red-500/30',
      paused: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    };

    return (
      <Badge className={`${styles[status]} font-medium border text-xs`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  // Get app info from first generation
  const appInfo = generations?.[0];
  const latestGeneration = generations?.[0];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/apps">
          <Button variant="ghost" className="text-leo-text-secondary hover:text-leo-text hover:bg-white/5 -ml-2 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Apps
          </Button>
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-64 bg-white/5" />
              <Skeleton className="h-10 w-32 bg-white/5" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="leo-card p-8 border-red-500/30 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-leo-text text-lg">Unable to load app</p>
                <p className="text-leo-text-secondary">
                  {error instanceof Error ? error.message : 'Please try refreshing the page'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/apps')}
                  className="mt-4 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  Back to Apps
                  </Button>
                </div>
              </div>
          </div>
        )}

        {/* App Header */}
        {!isLoading && !error && appInfo && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 animate-fade-in-up">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight leo-gradient-text">
                  {appInfo.appName}
                </h1>
                <p className="text-lg text-leo-text-secondary">
                  {generations?.length || 0} version{generations?.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {appInfo.githubUrl && (
                  <a
                    href={appInfo.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-leo-text-secondary hover:bg-white/10 hover:text-leo-text transition-all"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {appInfo.deploymentUrl ? (
                  <a
                    href={appInfo.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-glow-emerald rounded-xl px-5 py-2.5">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Live
                    </Button>
                  </a>
                ) : appInfo.githubUrl && latestGeneration?.status === 'completed' ? (
                  <Button
                    onClick={() => handleDeploy(latestGeneration)}
                    className="leo-btn-primary rounded-xl px-5 py-2.5"
                  >
                    <Plane className="h-4 w-4 mr-2" />
                    Deploy
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Version History */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-leo-text mb-4">Version History</h2>

              {generations?.map((gen, index) => (
                <div
                  key={gen.id}
                  className="leo-card group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Version Number */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 flex items-center justify-center group-hover:shadow-glow-sm transition-shadow">
                      <span className="text-lg font-bold text-purple-400">
                        v{generations.length - index}
                      </span>
                    </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Header: Prompt + Status + Time */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getStatusIcon(gen.status)}
                            <p className="text-leo-text font-medium truncate" title={gen.prompt}>
                              "{gen.prompt.length > 80 ? `${gen.prompt.substring(0, 80)}...` : gen.prompt}"
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {getStatusBadge(gen.status)}
                            <span className="text-sm text-leo-text-tertiary">
                              {formatRelativeTime(gen.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-leo-text-tertiary">
                          {gen.currentIteration > 0 && (
                            <div className="flex items-center gap-1.5" title="Iterations">
                              <Repeat className="h-3.5 w-3.5" />
                              <span>{gen.currentIteration} iterations</span>
                            </div>
                          )}
                          {gen.totalDuration && (
                            <div className="flex items-center gap-1.5" title="Duration">
                              <Timer className="h-3.5 w-3.5" />
                              <span>{formatDuration(gen.totalDuration / 1000)}</span>
                            </div>
                          )}
                          {(gen.iterationData || gen.totalCost) && (
                            <div className="flex items-center gap-1.5" title="Cost">
                              <DollarSign className="h-3.5 w-3.5" />
                              <span>{formatCost(
                                // iterationData stores cumulative costs - use last value as true total
                                gen.iterationData && Array.isArray(gen.iterationData) && gen.iterationData.length > 0
                                  ? (gen.iterationData as Array<{cost: number}>)[gen.iterationData.length - 1]?.cost ?? 0
                                  : parseFloat(gen.totalCost || '0')
                              )}</span>
                            </div>
                          )}
                          {gen.githubCommit && (
                            gen.githubUrl ? (
                              <a
                                href={`${gen.githubUrl}/commit/${gen.githubCommit}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 hover:text-leo-primary transition-colors"
                                title={`View commit ${gen.githubCommit}`}
                              >
                                <GitCommit className="h-3.5 w-3.5" />
                                <span className="underline underline-offset-2">{gen.githubCommit.substring(0, 8)}</span>
                              </a>
                            ) : (
                              <div className="flex items-center gap-1.5" title="Commit">
                                <GitCommit className="h-3.5 w-3.5" />
                                <span>{gen.githubCommit.substring(0, 8)}</span>
                              </div>
                            )
                          )}
                        </div>

                        {/* Warnings */}
                        {gen.warnings && gen.warnings.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {gen.warnings.map((warning: { code: string; message: string; details?: { remediation_url?: string } }, wIdx: number) => (
                              <div
                                key={wIdx}
                                className="p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2"
                              >
                                <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-yellow-400">{warning.message}</p>
                                  {warning.details?.remediation_url && (
                                    <a
                                      href={warning.details.remediation_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-yellow-500 hover:text-yellow-400 underline underline-offset-2 mt-1 inline-block"
                                    >
                                      Learn how to fix →
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Cost Breakdown (Expandable) */}
                        {gen.iterationData && Array.isArray(gen.iterationData) && gen.iterationData.length > 0 && (
                          <div className="mt-3">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleCostBreakdown(gen.id);
                              }}
                              className="flex items-center gap-2 text-xs text-leo-text-secondary hover:text-leo-text transition-colors"
                            >
                              {expandedCostBreakdowns.has(gen.id) ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                              <span>Cost Breakdown ({gen.iterationData.length} iterations)</span>
                            </button>

                            {expandedCostBreakdowns.has(gen.id) && (
                              <div className="mt-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-leo-text-secondary border-b border-purple-500/20">
                                      <th className="text-left py-1.5 font-medium">Iteration</th>
                                      <th className="text-right py-1.5 font-medium">Cost</th>
                                      <th className="text-right py-1.5 font-medium">Duration</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(gen.iterationData as Array<{iteration: number, cost: number, duration: number}>).map((item, idx, arr) => {
                                      // Costs are stored as cumulative totals - calculate per-iteration delta
                                      const iterationCost = idx === 0 ? item.cost : item.cost - arr[idx - 1].cost;
                                      return (
                                        <tr key={idx} className="border-b border-purple-500/10 last:border-0">
                                          <td className="py-1.5 text-leo-text">{item.iteration}</td>
                                          <td className="py-1.5 text-right text-cyan-400">${formatCostValue(iterationCost)}</td>
                                          <td className="py-1.5 text-right text-leo-text-secondary">{formatDuration(item.duration / 1000)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot>
                                    <tr className="border-t border-purple-500/30 font-medium">
                                      <td className="py-2 text-leo-text">Total</td>
                                      <td className="py-2 text-right text-cyan-400">
                                        ${formatCostValue((gen.iterationData as Array<{cost: number}>)[gen.iterationData.length - 1]?.cost ?? 0)}
                                      </td>
                                      <td className="py-2 text-right text-leo-text-secondary">
                                        {formatDuration((gen.iterationData as Array<{duration: number}>).reduce((sum, item) => sum + item.duration, 0) / 1000)}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Error Message */}
                        {gen.status === 'failed' && gen.errorMessage && (
                          <div className="p-2 rounded-md bg-red-500/10 border border-red-500/20 mt-2">
                            <p className="text-xs text-red-400 line-clamp-2">{gen.errorMessage}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          {/* Resume/View buttons for completed */}
                          {gen.status === 'completed' && (
                            <Link href={`/console/${gen.appRefId}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-leo-bg-tertiary border-leo-border text-leo-primary hover:bg-leo-bg-hover hover:border-leo-primary"
                              >
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Resume
                              </Button>
                            </Link>
                          )}

                          {/* View logs for active generations */}
                          {(gen.status === 'queued' || gen.status === 'generating' || gen.status === 'paused') && (
                            <>
                              <Link href={`/console/${gen.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-leo-bg-tertiary border-leo-border text-leo-primary hover:bg-leo-bg-hover hover:border-leo-primary"
                                >
                                  View Live Logs
                                </Button>
                              </Link>
                              {(gen.status === 'generating' || gen.status === 'paused') && (
                                <>
                                  <Button
                                    onClick={() => handleCancel(gen)}
                                    disabled={cancellingId === gen.id}
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                                    title="Cancel"
                                  >
                                    {cancellingId === gen.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <StopCircle className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => handleMarkFailed(gen)}
                                    disabled={markingFailedId === gen.id}
                                    size="sm"
                                    variant="outline"
                                    className="bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20"
                                    title="Mark as failed"
                                  >
                                    {markingFailedId === gen.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <AlertTriangle className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </>
                              )}
                            </>
                          )}

                          {/* Retry for failed */}
                          {gen.status === 'failed' && gen.githubUrl && (
                            <Link href={`/console/${gen.appRefId}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-leo-bg-tertiary border-leo-border text-leo-primary hover:bg-leo-bg-hover hover:border-leo-primary"
                              >
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Retry
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Deploy Modal */}
      {selectedGeneration && selectedGeneration.githubUrl && (
        <DeployModal
          isOpen={deployModalOpen}
          onClose={() => setDeployModalOpen(false)}
          githubUrl={selectedGeneration.githubUrl}
          generationId={selectedGeneration.id}
          deploymentUrl={selectedGeneration.deploymentUrl}
          onDeploy={() => {/* TODO: Implement deploy */}}
          isDeploying={false}
          deployError={undefined}
          deploySuccess={false}
        />
      )}
    </AppLayout>
  );
}
