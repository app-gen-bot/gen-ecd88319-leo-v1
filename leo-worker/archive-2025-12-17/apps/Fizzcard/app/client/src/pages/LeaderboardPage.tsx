import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { FizzCoinDisplay } from '@/components/ui/FizzCoinDisplay';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

const BADGE_ICONS: Record<string, string> = {
  super_connector: '🌟',
  early_adopter: '🚀',
  top_earner: '💰',
  event_host: '🎉',
  verified: '✓',
};

/**
 * LeaderboardPage component
 * Display global leaderboard with rankings
 */
export function LeaderboardPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'global' | 'location' | 'time'>('global');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [page, setPage] = useState(1);

  // Fetch leaderboard
  const { data: leaderboardData, isLoading, isError } = useQuery({
    queryKey: ['leaderboard', { filter, timeRange, page }],
    queryFn: async () => {
      const result = await apiClient.leaderboard.getLeaderboard({
        query: {
          filter,
          timeRange,
          page,
          limit: 50,
        },
      });
      if (result.status !== 200) throw new Error('Failed to fetch leaderboard');
      return result.body;
    },
  });

  // Fetch my rank
  const { data: myRank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: async () => {
      const result = await apiClient.leaderboard.getMyRank();
      if (result.status !== 200) return null;
      return result.body;
    },
  });

  const leaders = leaderboardData?.data || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-fizzCoin-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-text-secondary font-bold">#{rank}</span>;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-text-secondary">
            See how you rank among top networkers
          </p>
        </div>

        {/* My Rank Card */}
        {myRank && (
          <GlassCard className="p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Your Rank</p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-primary-500">#{myRank.rank}</p>
                  <div>
                    <p className="text-sm text-text-secondary">
                      Top {myRank.percentile.toFixed(1)}%
                    </p>
                    <p className="text-xs text-text-secondary">
                      of {myRank.totalUsers.toLocaleString()} users
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <FizzCoinDisplay amount={myRank.fizzCoinBalance} size="md" />
                <p className="text-xs text-text-secondary mt-1">
                  {myRank.connectionCount} connections
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Filters */}
        <GlassCard className="p-4 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filter By</label>
              <select
                className="w-full px-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as typeof filter);
                  setPage(1);
                }}
              >
                <option value="global">Global</option>
                <option value="location">Location</option>
                <option value="time">Time Period</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Range</label>
              <select
                className="w-full px-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value as typeof timeRange);
                  setPage(1);
                }}
              >
                <option value="all">All Time</option>
                <option value="year">This Year</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Leaderboard List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : isError ? (
          <GlassCard className="p-8 text-center">
            <p className="text-error-500 mb-4">Failed to load leaderboard</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </GlassCard>
        ) : leaders.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-text-secondary">No data available for this filter</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader) => {
              const isCurrentUser = user?.id === leader.userId;
              return (
                <GlassCard
                  key={leader.userId}
                  className={`p-4 ${isCurrentUser ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-center flex-shrink-0">
                      {getRankIcon(leader.rank)}
                    </div>

                    <Avatar
                      src={leader.avatarUrl}
                      alt={leader.name}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {leader.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary-500">(You)</span>
                          )}
                        </h3>
                        {leader.badges.length > 0 && (
                          <div className="flex gap-1">
                            {leader.badges.slice(0, 3).map((badge) => (
                              <span key={badge} className="text-sm">
                                {BADGE_ICONS[badge] || '🏆'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {leader.title && (
                        <p className="text-sm text-text-secondary truncate">
                          {leader.title}
                          {leader.company && ` at ${leader.company}`}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <span className="text-lg font-bold text-fizzCoin-500">
                          {leader.fizzCoinBalance}
                        </span>
                        <TrendingUp className="w-4 h-4 text-fizzCoin-500" />
                      </div>
                      <p className="text-xs text-text-secondary">
                        {leader.connectionCount} connections
                      </p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
