import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { UserPlus, Filter, Trophy, X, Check, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { FizzCoinDisplay } from '@/components/ui/FizzCoinDisplay';
import { apiClient } from '@/lib/api-client';

type StatusFilter = 'all' | 'pending' | 'completed' | 'declined';

/**
 * IntroductionsPage component
 * Display introductions made by the user (as introducer)
 */
export function IntroductionsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  // Fetch introductions made by user
  const { data: introductionsData, isLoading, isError, error } = useQuery({
    queryKey: ['introductions', 'made', { status: statusFilter, page }],
    queryFn: async () => {
      const result = await apiClient.introductions.getMade({
        query: {
          status: statusFilter === 'all' ? undefined : statusFilter,
          page,
          limit: 20,
        },
      });
      if (result.status !== 200) throw new Error('Failed to fetch introductions');
      return result.body;
    },
  });

  const introductions = introductionsData?.data || [];
  const pagination = introductionsData?.pagination;

  // Calculate stats
  const stats = {
    total: introductions.length,
    pending: introductions.filter((i) => i.status === 'pending').length,
    completed: introductions.filter((i) => i.status === 'completed').length,
    declined: introductions.filter((i) => i.status === 'declined').length,
    totalEarned: introductions
      .filter((i) => i.status === 'completed')
      .reduce((sum, i) => sum + i.fizzcoinReward, 0),
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-success-500" />;
      case 'declined':
        return <X className="w-4 h-4 text-error-500" />;
      default:
        return <Clock className="w-4 h-4 text-warning-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-500/20 text-success-500';
      case 'declined':
        return 'bg-error-500/20 text-error-500';
      default:
        return 'bg-warning-500/20 text-warning-500';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Introductions</h1>
          <p className="text-text-secondary">
            Track introductions you've made and FizzCoins earned
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4">
            <p className="text-sm text-text-secondary mb-1">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-sm text-text-secondary mb-1">Pending</p>
            <p className="text-2xl font-bold text-warning-500">{stats.pending}</p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-sm text-text-secondary mb-1">Completed</p>
            <p className="text-2xl font-bold text-success-500">{stats.completed}</p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-sm text-text-secondary mb-1">Earned</p>
            <FizzCoinDisplay amount={stats.totalEarned} size="sm" />
          </GlassCard>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/introductions/create">
            <a className="flex-1">
              <Button variant="primary" className="w-full">
                <UserPlus className="w-5 h-5 mr-2" />
                Make New Introduction
              </Button>
            </a>
          </Link>
        </div>

        {/* Status Filter */}
        <GlassCard className="p-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-text-secondary" />
            <span className="text-sm font-medium mr-2">Filter:</span>
            {(['all', 'pending', 'completed', 'declined'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </GlassCard>

        {/* Introductions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <GlassCard className="p-8 text-center">
            <p className="text-error-500 mb-4">{error.message}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </GlassCard>
        ) : introductions.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <UserPlus className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary mb-4">
              {statusFilter !== 'all'
                ? `No ${statusFilter} introductions yet`
                : 'No introductions yet. Connect two of your contacts!'}
            </p>
            <Link href="/introductions/create">
              <a>
                <Button variant="primary">Make Introduction</Button>
              </a>
            </Link>
          </GlassCard>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {introductions.map((intro) => (
                <GlassCard key={intro.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                          intro.status
                        )}`}
                      >
                        {getStatusIcon(intro.status)}
                        {intro.status.charAt(0).toUpperCase() + intro.status.slice(1)}
                      </span>
                      {intro.status === 'completed' && intro.fizzcoinReward > 0 && (
                        <div className="flex items-center gap-1 bg-fizzCoin-500/20 px-2 py-1 rounded-full">
                          <Trophy className="w-3 h-3 text-fizzCoin-500" />
                          <span className="text-xs font-semibold text-fizzCoin-500">
                            +{intro.fizzcoinReward} FC
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">
                      {format(new Date(intro.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Person A */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar
                          src={intro.personAAvatar}
                          alt={intro.personAName}
                          size="md"
                        />
                        <div>
                          <h3 className="font-semibold">{intro.personAName}</h3>
                          {intro.personATitle && (
                            <p className="text-sm text-text-secondary">
                              {intro.personATitle}
                              {intro.personACompany && ` at ${intro.personACompany}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center px-4 py-2">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                    </div>

                    {/* Person B */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar
                          src={intro.personBAvatar}
                          alt={intro.personBName}
                          size="md"
                        />
                        <div>
                          <h3 className="font-semibold">{intro.personBName}</h3>
                          {intro.personBTitle && (
                            <p className="text-sm text-text-secondary">
                              {intro.personBTitle}
                              {intro.personBCompany && ` at ${intro.personBCompany}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Context */}
                  {intro.context && (
                    <div className="mt-4 p-3 bg-background-glass border border-border-default rounded-lg">
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold">Context:</span> {intro.context}
                      </p>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-text-secondary">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
