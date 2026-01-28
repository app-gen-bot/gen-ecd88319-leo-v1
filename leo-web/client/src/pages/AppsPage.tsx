import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  AlertCircle,
  FileCode,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  PauseCircle,
  Search,
  MessageSquarePlus,
  Github,
  ExternalLink,
  Trash2,
  Plus,
  ArrowRight,
  LayoutGrid,
  Play,
  DollarSign,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FeedbackModal } from '@/components/FeedbackModal';
import { getAuthToken } from '@/lib/auth-helpers';
import type { GenerationRequestWithApp } from '@shared/schema.zod';

// Grouped app with aggregated data
interface AppGroup {
  appRefId: number;
  appName: string;
  appUuid: string;
  githubUrl: string | null;
  deploymentUrl: string | null;
  latestGeneration: GenerationRequestWithApp;
  versionCount: number;
  lastUpdated: string;
  hasActiveGeneration: boolean;
  cumulativeCost: string | null;
}

type StatusFilter = 'all' | 'generating' | 'completed' | 'failed';

export default function AppsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [deletingAppId, setDeletingAppId] = useState<number | null>(null);

  // Fetch all generation requests
  const { data: generations, isLoading, error, isFetching } = useQuery({
    queryKey: ['generations'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch('/api/generations', {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch generations');
      }
      return response.json() as Promise<GenerationRequestWithApp[]>;
    },
    refetchInterval: (query) => {
      // Only poll if there are active generations
      const data = query.state.data;
      if (!data || !Array.isArray(data)) return false;
      const hasActiveGenerations = data.some(
        (gen: GenerationRequestWithApp) =>
          gen.status === 'queued' || gen.status === 'generating' || gen.status === 'paused'
      );
      return hasActiveGenerations ? 5000 : false;
    },
    retry: 1,
    staleTime: 2000,
    throwOnError: false,
  });

  // Delete app mutation
  const deleteAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      const token = getAuthToken();
      const response = await fetch(`/api/apps/${appId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete app');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setDeletingAppId(null);
    },
    onError: () => {
      setDeletingAppId(null);
    },
  });

  const handleDeleteApp = (app: AppGroup) => {
    if (window.confirm(`Are you sure you want to delete "${app.appName}"?\n\nThis will permanently remove the app and all ${app.versionCount} version${app.versionCount !== 1 ? 's' : ''}.`)) {
      setDeletingAppId(app.appRefId);
      deleteAppMutation.mutate(app.appRefId);
    }
  };

  // Group generations by app
  const appGroups = useMemo(() => {
    if (!generations || !Array.isArray(generations)) return [];

    const grouped = new Map<number, GenerationRequestWithApp[]>();

    for (const gen of generations) {
      const existing = grouped.get(gen.appRefId) || [];
      existing.push(gen);
      grouped.set(gen.appRefId, existing);
    }

    const apps: AppGroup[] = [];

    for (const [appRefId, gens] of grouped) {
      gens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const latest = gens[0];
      const hasActiveGeneration = gens.some(
        g => g.status === 'queued' || g.status === 'generating' || g.status === 'paused'
      );

      apps.push({
        appRefId,
        appName: latest.appName,
        appUuid: latest.appUuid,
        githubUrl: latest.githubUrl,
        deploymentUrl: latest.deploymentUrl,
        latestGeneration: latest,
        versionCount: gens.length,
        lastUpdated: latest.updatedAt,
        hasActiveGeneration,
        cumulativeCost: latest.cumulativeCost,
      });
    }

    apps.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

    return apps;
  }, [generations]);

  // Filter apps based on search and status
  const filteredApps = useMemo(() => {
    return appGroups.filter((app) => {
      const matchesSearch = searchQuery.trim() === '' ||
        app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.latestGeneration.prompt.toLowerCase().includes(searchQuery.toLowerCase());

      const status = app.latestGeneration.status;
      const matchesStatus = statusFilter === 'all' || (() => {
        switch (statusFilter) {
          case 'generating':
            return status === 'generating' || status === 'queued' || status === 'paused';
          case 'completed':
            return status === 'completed';
          case 'failed':
            return status === 'failed';
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus;
    });
  }, [appGroups, searchQuery, statusFilter]);

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
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'generating':
        return <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'paused':
        return <PauseCircle className="h-5 w-5 text-cyan-400" />;
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

  const showError = error && !isFetching && !generations;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-purple-400" />
                </div>
                <h1 className="text-4xl font-bold text-leo-text">My Apps</h1>
              </div>
              <p className="text-lg text-leo-text-secondary">
                Your AI-generated applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setFeedbackModalOpen(true)}
                className="text-leo-text-secondary hover:text-leo-text hover:bg-white/5"
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Feedback
              </Button>
              <Link href="/console">
                <Button className="leo-btn-primary px-5 py-2.5 text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New App
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        {!isLoading && !showError && appGroups.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-leo-text-tertiary" />
              <Input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-white/5 border-white/10 text-leo-text placeholder:text-leo-text-tertiary focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'generating', 'completed', 'failed'] as StatusFilter[]).map((status) => (
                <Button
                  key={status}
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 rounded-lg transition-all duration-200 ${
                    statusFilter === status
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'text-leo-text-secondary hover:text-leo-text hover:bg-white/5'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="leo-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 bg-white/5 mb-2" />
                    <Skeleton className="h-4 w-1/2 bg-white/5" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-10 w-full bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {showError && (
          <div className="leo-card p-8 border-red-500/30 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-leo-text mb-1">Unable to load apps</h3>
                <p className="text-leo-text-secondary">
                  {error instanceof Error && error.message.includes('401')
                    ? 'Please log in to view your apps'
                    : error instanceof Error
                      ? error.message
                      : 'Please try refreshing the page'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !showError && appGroups.length === 0 && (
          <div className="leo-card p-16 text-center border-dashed animate-fade-in-up">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center shadow-glow-sm">
                <FileCode className="h-12 w-12 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-leo-text">No apps yet</h3>
                <p className="text-leo-text-secondary max-w-md">
                  Start by creating your first AI-generated app. Describe your idea and Leo will build it for you.
                </p>
              </div>
              <Link href="/console">
                <Button className="leo-btn-primary px-8 py-6 text-lg rounded-2xl group mt-4">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Your First App
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Apps Grid */}
        {!isLoading && !showError && appGroups.length > 0 && (
          <>
            {/* No results */}
            {filteredApps.length === 0 && (
              <div className="leo-card p-12 text-center animate-fade-in-up">
                <Search className="h-12 w-12 text-leo-text-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-leo-text mb-2">No apps found</h3>
                <p className="text-leo-text-secondary mb-4">Try adjusting your search or filter</p>
                <Button
                  variant="ghost"
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* App Cards */}
            {filteredApps.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
                {filteredApps.map((app) => (
                  <Link key={app.appRefId} href={`/apps/${app.appRefId}`}>
                    <div className="leo-card group cursor-pointer h-full">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:shadow-glow-sm transition-shadow">
                          {getStatusIcon(app.latestGeneration.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-semibold text-leo-text truncate group-hover:text-purple-400 transition-colors" title={app.appName}>
                              {app.appName}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteApp(app);
                              }}
                              disabled={deletingAppId === app.appRefId}
                              className="h-7 w-7 p-0 text-leo-text-tertiary hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                              {deletingAppId === app.appRefId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(app.latestGeneration.status)}
                            <span className="text-xs text-leo-text-tertiary">
                              {app.versionCount} version{app.versionCount !== 1 ? 's' : ''}
                            </span>
                            {/* Show iteration progress for active generations */}
                            {app.hasActiveGeneration && app.latestGeneration.currentIteration > 0 && (
                              <span className="text-xs text-purple-400">
                                ({app.latestGeneration.currentIteration}/{app.latestGeneration.maxIterations})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Prompt preview */}
                      <p className="text-sm text-leo-text-secondary line-clamp-2 mb-4" title={app.latestGeneration.prompt}>
                        "{app.latestGeneration.prompt}"
                      </p>

                      {/* Meta info */}
                      <div className="flex items-center justify-between text-xs text-leo-text-tertiary mb-4">
                        <div className="flex items-center gap-3">
                          <span>{formatRelativeTime(app.lastUpdated)}</span>
                          {app.cumulativeCost && parseFloat(app.cumulativeCost) > 0 && (
                            <span className="flex items-center gap-0.5 text-cyan-400" title="Total cost">
                              <DollarSign className="h-3 w-3" />
                              {parseFloat(app.cumulativeCost).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {app.githubUrl && (
                            <a
                              href={app.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              <Github className="h-3 w-3" />
                            </a>
                          )}
                          {app.deploymentUrl && (
                            <a
                              href={app.deploymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Link href={`/console/${app.appRefId}`} onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            className="flex-1 justify-center text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 group/btn"
                          >
                            <Play className="h-4 w-4 mr-1.5" />
                            <span>Resume</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="flex-1 justify-between text-leo-text-secondary hover:text-purple-400 hover:bg-purple-500/10 group/btn"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        sourcePage="apps"
      />
    </AppLayout>
  );
}
