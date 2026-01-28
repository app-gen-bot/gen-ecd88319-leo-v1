import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { QrCode, Scan, TrendingUp, Users, UserPlus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { FizzCoinDisplay } from '@/components/ui/FizzCoinDisplay';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';

/**
 * DashboardPage component
 * Main dashboard with quick actions and stats
 */
export function DashboardPage() {
  const { user } = useAuth();

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading, isError: walletError } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const result = await apiClient.fizzCoin.getWallet();
      if (result.status !== 200) throw new Error('Failed to fetch wallet');
      return result.body;
    },
  });

  // Fetch recent connections
  const { data: connectionsData, isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections', { limit: 5 }],
    queryFn: async () => {
      const result = await apiClient.connections.getAll({
        query: { limit: 5, sortBy: 'recent' }
      });
      if (result.status !== 200) throw new Error('Failed to fetch connections');
      return result.body;
    },
  });

  // Fetch leaderboard rank
  const { data: rankData } = useQuery({
    queryKey: ['my-rank'],
    queryFn: async () => {
      const result = await apiClient.leaderboard.getMyRank();
      if (result.status !== 200) return null;
      return result.body;
    },
  });

  const connections = connectionsData?.data || [];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-text-secondary">
            Ready to grow your network today?
          </p>
        </div>

        {/* FizzCoin Balance Hero */}
        <GlassCard className="p-8 mb-8 text-center">
          <h2 className="text-sm text-text-secondary uppercase tracking-wider mb-4">
            Your Balance
          </h2>
          {walletLoading ? (
            <Skeleton className="h-16 w-48 mx-auto mb-4" />
          ) : walletError ? (
            <p className="text-error-500 mb-4">Failed to load balance</p>
          ) : (
            <>
              <FizzCoinDisplay
                amount={wallet?.balance || 0}
                size="xl"
                className="justify-center"
              />
              <p className="mt-4 text-text-secondary">
                <span className="text-success-500 font-semibold">
                  +{wallet?.totalEarned || 0}
                </span>{' '}
                total earned
              </p>
            </>
          )}
        </GlassCard>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/my-fizzcard">
            <a>
              <GlassCard
                variant="interactive"
                className="p-6 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Share My FizzCard</h3>
                  <p className="text-sm text-text-secondary">
                    Generate QR code to share
                  </p>
                </div>
              </GlassCard>
            </a>
          </Link>

          <Link href="/scan">
            <a>
              <GlassCard
                variant="interactive"
                className="p-6 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                  <Scan className="w-6 h-6 text-accent-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Scan QR Code</h3>
                  <p className="text-sm text-text-secondary">
                    Add a new connection
                  </p>
                </div>
              </GlassCard>
            </a>
          </Link>

          <Link href="/introductions/create">
            <a>
              <GlassCard
                variant="interactive"
                className="p-6 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-fizzCoin-500/20 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-6 h-6 text-fizzCoin-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Make Introduction</h3>
                  <p className="text-sm text-text-secondary">
                    Connect two contacts
                  </p>
                </div>
              </GlassCard>
            </a>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-text-secondary text-sm uppercase tracking-wider">
                Connections
              </h3>
            </div>
            {connectionsLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold">
                {connectionsData?.pagination.total || 0}
              </p>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-success-500" />
              <h3 className="font-semibold text-text-secondary text-sm uppercase tracking-wider">
                FizzCoins
              </h3>
            </div>
            {walletLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <p className="text-4xl font-bold">{wallet?.balance || 0}</p>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-fizzCoin-500" />
              <h3 className="font-semibold text-text-secondary text-sm uppercase tracking-wider">
                Rank
              </h3>
            </div>
            {rankData ? (
              <p className="text-4xl font-bold">#{rankData.rank}</p>
            ) : (
              <p className="text-4xl font-bold">-</p>
            )}
          </GlassCard>
        </div>

        {/* Recent Connections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Connections</h2>
            <Link href="/connections">
              <a>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </a>
            </Link>
          </div>

          {connectionsLoading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : connections.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-text-secondary mb-4">
                No connections yet. Scan your first QR code to get started!
              </p>
              <Link href="/scan">
                <a>
                  <Button variant="primary">Scan QR Code</Button>
                </a>
              </Link>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <GlassCard key={connection.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={connection.connectedUserAvatar}
                      alt={connection.connectedUserName}
                      size="md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{connection.connectedUserName}</h3>
                      {connection.connectedUserTitle && (
                        <p className="text-sm text-text-secondary">
                          {connection.connectedUserTitle}
                          {connection.connectedUserCompany && ` at ${connection.connectedUserCompany}`}
                        </p>
                      )}
                      {connection.metAt && (
                        <p className="text-xs text-text-secondary mt-1">
                          Met {connection.locationName && `in ${connection.locationName} `}
                          on {format(new Date(connection.metAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
