/**
 * Admin Analytics Dashboard
 *
 * Shows usage metrics, generation statistics, and user activity.
 * Requires admin or dev role to access.
 */

import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Coins,
} from 'lucide-react';
import { getAuthToken } from '@/lib/auth-helpers';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

// Types matching server response
interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  totalGenerations: number;
  completedGenerations: number;
  failedGenerations: number;
  successRate: number;
  totalApps: number;
  deployedApps: number;
  totalCreditsUsed: number;
  avgGenerationDuration: number;
  avgGenerationCost: number;
}

interface TimeSeriesPoint {
  date: string;
  count: number;
}

interface GenerationsByStatus {
  status: string;
  count: number;
}

interface TopUser {
  userId: string;
  email: string;
  name: string | null;
  generationCount: number;
  successCount: number;
  totalCost: number;
}

interface RecentGeneration {
  id: number;
  appName: string;
  userEmail: string;
  status: string;
  duration: number | null;
  cost: number | null;
  createdAt: string;
}

interface AnalyticsDashboard {
  overview: OverviewMetrics;
  generationsByDay: TimeSeriesPoint[];
  generationsByStatus: GenerationsByStatus[];
  topUsers: TopUser[];
  recentGenerations: RecentGeneration[];
}

// Metric Card Component
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'default',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const colorClasses = {
    default: 'from-purple-500/20 to-cyan-500/20 border-purple-500/30',
    success: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    warning: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    danger: 'from-red-500/20 to-rose-500/20 border-red-500/30',
  };

  const iconColors = {
    default: 'text-purple-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-leo-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-leo-text mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-leo-text-tertiary mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-black/20 ${iconColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
          <TrendingUp className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    completed: { color: 'bg-green-500/20 text-green-400', label: 'Completed' },
    generating: { color: 'bg-blue-500/20 text-blue-400', label: 'Generating' },
    queued: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Queued' },
    failed: { color: 'bg-red-500/20 text-red-400', label: 'Failed' },
    cancelled: { color: 'bg-gray-500/20 text-gray-400', label: 'Cancelled' },
    paused: { color: 'bg-purple-500/20 text-purple-400', label: 'Paused' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-500/20 text-gray-400', label: status };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// Simple Bar Chart Component
function SimpleBarChart({ data, maxBars = 14 }: { data: TimeSeriesPoint[]; maxBars?: number }) {
  // Take last N days
  const chartData = data.slice(-maxBars);
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-32">
      {chartData.map((point, i) => {
        const height = (point.count / maxCount) * 100;
        const date = new Date(point.date);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

        return (
          <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center">
              <span className="text-[10px] text-leo-text-tertiary mb-1">
                {point.count > 0 ? point.count : ''}
              </span>
              <div
                className="w-full bg-gradient-to-t from-purple-500/60 to-cyan-500/60 rounded-t"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
            </div>
            {i % 2 === 0 && (
              <span className="text-[9px] text-leo-text-tertiary">{dayLabel}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch analytics data
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch analytics');
      }
      const result = await response.json();
      return result.data as AnalyticsDashboard;
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
    enabled: !authLoading && (profile?.role === 'admin' || profile?.role === 'dev'),
  });

  // Redirect non-admin users
  if (!authLoading && profile && profile.role !== 'admin' && profile.role !== 'dev') {
    setLocation('/apps');
    return null;
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-leo-text mb-2">Access Denied</h2>
            <p className="text-leo-text-secondary mb-4">
              {error instanceof Error ? error.message : 'Failed to load analytics'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-leo-bg-tertiary hover:bg-leo-bg-hover rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const overview = data?.overview;
  const generationsByDay = data?.generationsByDay || [];
  const generationsByStatus = data?.generationsByStatus || [];
  const topUsers = data?.topUsers || [];
  const recentGenerations = data?.recentGenerations || [];

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-leo-text">Analytics Dashboard</h1>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Admin
              </Badge>
            </div>
            <p className="text-leo-text-secondary mt-1">
              Usage metrics and generation statistics
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 bg-leo-bg-tertiary hover:bg-leo-bg-hover rounded-lg text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Users"
            value={overview?.totalUsers || 0}
            subtitle={`${overview?.approvedUsers || 0} approved, ${overview?.pendingUsers || 0} pending`}
            icon={Users}
          />
          <MetricCard
            title="Total Generations"
            value={overview?.totalGenerations || 0}
            subtitle={`${overview?.successRate?.toFixed(1) || 0}% success rate`}
            icon={Zap}
            color="success"
          />
          <MetricCard
            title="Credits Used"
            value={overview?.totalCreditsUsed || 0}
            subtitle={`Across ${overview?.activeUsers || 0} active users`}
            icon={Coins}
            color="warning"
          />
          <MetricCard
            title="Avg Duration"
            value={`${Math.round((overview?.avgGenerationDuration || 0) / 60)}m`}
            subtitle={`${overview?.deployedApps || 0} apps deployed`}
            icon={Clock}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Generations Over Time */}
          <div className="bg-leo-bg-secondary border border-leo-border rounded-xl p-4">
            <h3 className="text-lg font-semibold text-leo-text mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Generations (Last 14 Days)
            </h3>
            {generationsByDay.length > 0 ? (
              <SimpleBarChart data={generationsByDay} maxBars={14} />
            ) : (
              <div className="h-32 flex items-center justify-center text-leo-text-tertiary">
                No data available
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-leo-bg-secondary border border-leo-border rounded-xl p-4">
            <h3 className="text-lg font-semibold text-leo-text mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Status Distribution
            </h3>
            <div className="space-y-3">
              {generationsByStatus.map(item => {
                const total = generationsByStatus.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;

                return (
                  <div key={item.status} className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <div className="flex-1 h-2 bg-leo-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'failed' ? 'bg-red-500' :
                          item.status === 'generating' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-leo-text-secondary w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Users */}
          <div className="bg-leo-bg-secondary border border-leo-border rounded-xl p-4">
            <h3 className="text-lg font-semibold text-leo-text mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" />
              Top Users
            </h3>
            <div className="space-y-2">
              {topUsers.length > 0 ? (
                topUsers.slice(0, 5).map((user, i) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-leo-bg-tertiary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-medium text-purple-400">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm text-leo-text font-medium truncate max-w-[180px]">
                          {user.email}
                        </p>
                        <p className="text-xs text-leo-text-tertiary">
                          {user.name || 'No name'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-leo-text">{user.generationCount}</p>
                      <p className="text-xs text-leo-text-tertiary">
                        {user.successCount} success
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-leo-text-tertiary py-4">No users yet</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-leo-bg-secondary border border-leo-border rounded-xl p-4">
            <h3 className="text-lg font-semibold text-leo-text mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              Recent Generations
            </h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {recentGenerations.length > 0 ? (
                recentGenerations.slice(0, 10).map(gen => (
                  <div
                    key={gen.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-leo-bg-tertiary transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-leo-text font-medium truncate">
                          {gen.appName}
                        </p>
                        <StatusBadge status={gen.status} />
                      </div>
                      <p className="text-xs text-leo-text-tertiary truncate">
                        {gen.userEmail}
                      </p>
                    </div>
                    <div className="text-right text-xs text-leo-text-tertiary ml-2">
                      {new Date(gen.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-leo-text-tertiary py-4">No generations yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-leo-bg-secondary border border-leo-border rounded-lg p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-leo-text">{overview?.completedGenerations || 0}</p>
            <p className="text-xs text-leo-text-tertiary">Completed</p>
          </div>
          <div className="bg-leo-bg-secondary border border-leo-border rounded-lg p-3 text-center">
            <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-leo-text">{overview?.failedGenerations || 0}</p>
            <p className="text-xs text-leo-text-tertiary">Failed</p>
          </div>
          <div className="bg-leo-bg-secondary border border-leo-border rounded-lg p-3 text-center">
            <Activity className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-leo-text">{overview?.totalApps || 0}</p>
            <p className="text-xs text-leo-text-tertiary">Total Apps</p>
          </div>
          <div className="bg-leo-bg-secondary border border-leo-border rounded-lg p-3 text-center">
            <DollarSign className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-leo-text">${(overview?.avgGenerationCost || 0).toFixed(4)}</p>
            <p className="text-xs text-leo-text-tertiary">Avg Cost</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
