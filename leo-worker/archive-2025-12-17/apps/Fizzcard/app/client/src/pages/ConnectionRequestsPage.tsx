import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { celebrateConnection, celebrateReward } from '@/lib/confetti';

/**
 * ConnectionRequestsPage component
 * Display and manage pending connection requests
 */
export function ConnectionRequestsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch received connection requests
  const { data: requestsData, isLoading, isError, error } = useQuery({
    queryKey: ['connection-requests', { page }],
    queryFn: async () => {
      const result = await apiClient.contactExchanges.getReceived({
        query: {
          status: 'pending',
          page,
          limit: 20,
        },
      });
      if (result.status !== 200) throw new Error('Failed to fetch connection requests');
      return result.body;
    },
  });

  // Accept exchange mutation
  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiClient.contactExchanges.accept({
        params: { id },
        body: {},
      });
      if (result.status !== 200) throw new Error('Failed to accept connection');
      return result.body;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });

      // Celebrate new connection!
      celebrateConnection();

      // Add reward celebration if FizzCoins earned
      if (data.fizzcoinsEarned > 0) {
        setTimeout(() => celebrateReward(), 500);
      }

      toast.success(
        `Connection accepted! +${data.fizzcoinsEarned} FizzCoins earned!`,
        {
          duration: 4000,
          icon: '🎉',
        }
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept connection');
    },
  });

  // Reject exchange mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiClient.contactExchanges.reject({
        params: { id },
        body: {},
      });
      if (result.status !== 200) throw new Error('Failed to reject connection');
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      toast.success('Connection request rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject connection');
    },
  });

  const requests = requestsData?.data || [];
  const pagination = requestsData?.pagination;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Connection Requests</h1>
          <p className="text-text-secondary">
            Review and respond to connection requests
          </p>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <GlassCard className="p-8 text-center">
            <p className="text-error-500 mb-4">{error.message}</p>
            <Button
              variant="primary"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['connection-requests'] })}
            >
              Try Again
            </Button>
          </GlassCard>
        ) : requests.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-text-secondary mb-4">
              No pending connection requests
            </p>
            <p className="text-sm text-text-secondary">
              Share your FizzCard to receive connection requests!
            </p>
          </GlassCard>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {requests.map((request) => (
                <GlassCard key={request.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={request.senderAvatar}
                      alt={request.senderName || 'User'}
                      size="lg"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold mb-1">
                        {request.senderName || 'Unknown User'}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-4">
                        {request.locationName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.locationName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(request.metAt), 'MMM d, yyyy')}
                        </span>
                        <span className="capitalize">
                          via {request.method.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-fizzCoin-500/10 border border-fizzCoin-500/30 mb-4">
                        <p className="text-fizzCoin-500 font-semibold text-sm">
                          Accept to earn +25 FizzCoins!
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => acceptMutation.mutate(request.id)}
                          disabled={
                            acceptMutation.isPending || rejectMutation.isPending
                          }
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="md"
                          onClick={() => rejectMutation.mutate(request.id)}
                          disabled={
                            acceptMutation.isPending || rejectMutation.isPending
                          }
                          className="gap-2 text-error-500 hover:bg-error-500/10"
                        >
                          <X className="w-4 h-4" />
                          {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </div>
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
