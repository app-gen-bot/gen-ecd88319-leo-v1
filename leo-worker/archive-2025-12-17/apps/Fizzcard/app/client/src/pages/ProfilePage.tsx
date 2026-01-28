import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Settings } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { FizzCoinDisplay } from '@/components/ui/FizzCoinDisplay';
import { Skeleton } from '@/components/ui/Skeleton';
import { BadgeCard } from '@/components/ui/BadgeIcon';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

/**
 * ProfilePage component
 * User profile with stats, badges, and settings
 */
export function ProfilePage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const result = await apiClient.fizzCoin.getWallet();
      if (result.status !== 200) throw new Error('Failed to fetch wallet');
      return result.body;
    },
  });

  // Fetch badges
  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['my-badges'],
    queryFn: async () => {
      const result = await apiClient.badges.getMyBadges();
      if (result.status !== 200) return [];
      return result.body;
    },
  });

  // Fetch leaderboard rank
  const { data: rankData, isLoading: rankLoading } = useQuery({
    queryKey: ['my-rank'],
    queryFn: async () => {
      const result = await apiClient.leaderboard.getMyRank();
      if (result.status !== 200) return null;
      return result.body;
    },
  });

  // Fetch connections count
  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections', { limit: 1 }],
    queryFn: async () => {
      const result = await apiClient.connections.getAll({
        query: { limit: 1 }
      });
      if (result.status !== 200) return null;
      return result.body;
    },
  });

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <GlassCard className="p-8 mb-8 text-center">
          <Avatar
            src={user?.avatarUrl}
            alt={user?.name || 'User'}
            size="3xl"
            className="mx-auto mb-4"
          />

          <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
          {user?.title && (
            <p className="text-lg text-text-secondary mb-2">{user.title}</p>
          )}
          {user?.company && (
            <p className="text-text-secondary mb-4">{user.company}</p>
          )}

          {user?.isVerified && (
            <div className="flex justify-center mb-4">
              <Badge variant="verified">Verified</Badge>
            </div>
          )}

          {walletLoading ? (
            <Skeleton className="h-12 w-48 mx-auto" />
          ) : (
            <FizzCoinDisplay
              amount={wallet?.balance || 0}
              size="lg"
              className="justify-center"
            />
          )}
        </GlassCard>

        {/* Stats */}
        <GlassCard className="p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Stats</h2>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              {connectionsLoading ? (
                <Skeleton className="h-10 w-16 mx-auto mb-2" />
              ) : (
                <p className="text-4xl font-bold mb-2">
                  {connectionsData?.pagination.total || 0}
                </p>
              )}
              <p className="text-sm text-text-secondary">Connections</p>
            </div>

            <div className="text-center">
              {walletLoading ? (
                <Skeleton className="h-10 w-16 mx-auto mb-2" />
              ) : (
                <p className="text-4xl font-bold mb-2">
                  {wallet?.balance || 0}
                </p>
              )}
              <p className="text-sm text-text-secondary">FizzCoins</p>
            </div>

            <div className="text-center">
              {rankLoading ? (
                <Skeleton className="h-10 w-16 mx-auto mb-2" />
              ) : rankData ? (
                <p className="text-4xl font-bold mb-2">#{rankData.rank}</p>
              ) : (
                <p className="text-4xl font-bold mb-2">-</p>
              )}
              <p className="text-sm text-text-secondary">Rank</p>
            </div>
          </div>

          {rankData && (
            <div className="mt-6 pt-6 border-t border-border-default">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-fizzCoin-500">
                    {wallet?.totalEarned || 0}
                  </p>
                  <p className="text-xs text-text-secondary">Total Earned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-500">
                    Top {rankData.percentile.toFixed(1)}%
                  </p>
                  <p className="text-xs text-text-secondary">Percentile</p>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Badges */}
        <GlassCard className="p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Badges</h2>

          {badgesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : badges && badges.length > 0 ? (
            <div className="space-y-4">
              {badges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badgeType={badge.badgeType}
                  earnedAt={badge.earnedAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-text-secondary py-8">
              <p className="mb-2">No badges earned yet.</p>
              <p className="text-sm">
                Keep networking to unlock badges!
              </p>
            </div>
          )}
        </GlassCard>

        {/* Settings & Actions */}
        <div className="space-y-4">
          <Button
            variant="secondary"
            size="lg"
            className="w-full justify-start gap-3"
            onClick={() => setLocation('/settings')}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full justify-start gap-3 text-error-500 hover:bg-error-500/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
