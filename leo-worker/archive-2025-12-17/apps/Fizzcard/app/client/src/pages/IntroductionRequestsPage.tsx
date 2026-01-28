import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Check, X, Clock, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * IntroductionRequestsPage component
 * Display introduction requests where user is personA or personB
 */
export function IntroductionRequestsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  // Fetch introduction requests
  const { data: introductionsData, isLoading, isError, error } = useQuery({
    queryKey: ['introductions', 'received', { page }],
    queryFn: async () => {
      const result = await apiClient.introductions.getReceived({
        query: {
          status: 'pending', // Only show pending requests
          page,
          limit: 20,
        },
      });
      if (result.status !== 200) throw new Error('Failed to fetch introduction requests');
      return result.body;
    },
  });

  // Accept introduction mutation
  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiClient.introductions.accept({
        params: { id },
        body: {},
      });
      if (result.status !== 200) {
        throw new Error('Failed to accept introduction');
      }
      return result.body;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['introductions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });

      // Show success message with FizzCoin reward
      if (data.fizzcoinsAwarded > 0) {
        toast.success(
          `Introduction accepted! Introducer earned ${data.fizzcoinsAwarded} FizzCoins!`,
          { duration: 5000 }
        );
      } else {
        toast.success('Introduction accepted!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept introduction');
    },
  });

  // Decline introduction mutation
  const declineMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiClient.introductions.decline({
        params: { id },
        body: {},
      });
      if (result.status !== 200) {
        throw new Error('Failed to decline introduction');
      }
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['introductions'] });
      toast.success('Introduction declined');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to decline introduction');
    },
  });

  const introductions = introductionsData?.data || [];
  const pagination = introductionsData?.pagination;

  const handleAccept = (id: number, introducerName: string) => {
    if (confirm(`Accept introduction from ${introducerName}?`)) {
      acceptMutation.mutate(id);
    }
  };

  const handleDecline = (id: number, introducerName: string) => {
    if (confirm(`Decline introduction from ${introducerName}?`)) {
      declineMutation.mutate(id);
    }
  };

  // Get the other person in the introduction (not the current user)
  const getOtherPerson = (intro: typeof introductions[0]) => {
    if (intro.personAId === user?.id) {
      return {
        name: intro.personBName,
        avatar: intro.personBAvatar,
        title: intro.personBTitle,
        company: intro.personBCompany,
      };
    } else {
      return {
        name: intro.personAName,
        avatar: intro.personAAvatar,
        title: intro.personATitle,
        company: intro.personACompany,
      };
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Introduction Requests</h1>
          <p className="text-text-secondary">
            People who want to connect you with others
          </p>
        </div>

        {/* Info Card */}
        <GlassCard className="p-4 mb-8 bg-primary-500/10 border-primary-500/20">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-primary-500 mb-1">Help grow the network!</p>
              <p className="text-sm text-text-secondary">
                When you accept an introduction, the person who introduced you earns FizzCoins.
                Accept quality introductions to help them succeed!
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Introduction Requests List */}
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
            <p className="text-text-secondary mb-2">No pending introduction requests</p>
            <p className="text-sm text-text-secondary">
              When someone introduces you to one of their connections, it will appear here
            </p>
          </GlassCard>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {introductions.map((intro) => {
                const otherPerson = getOtherPerson(intro);
                const isPending = acceptMutation.isPending || declineMutation.isPending;

                return (
                  <GlassCard key={intro.id} className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-warning-500" />
                        <span className="text-sm font-semibold text-warning-500">
                          Pending
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {format(new Date(intro.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>

                    {/* Introducer Info */}
                    <div className="mb-4 p-4 bg-background-glass border border-border-default rounded-lg">
                      <p className="text-sm text-text-secondary mb-2">
                        <span className="font-semibold text-primary-500">
                          {intro.introducerName}
                        </span>{' '}
                        wants to introduce you to:
                      </p>

                      {/* Other Person */}
                      <div className="flex items-center gap-3 p-3 bg-background-glass border border-border-default rounded-lg">
                        <Avatar
                          src={otherPerson.avatar}
                          alt={otherPerson.name}
                          size="md"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{otherPerson.name}</h3>
                          {otherPerson.title && (
                            <p className="text-sm text-text-secondary">
                              {otherPerson.title}
                              {otherPerson.company && ` at ${otherPerson.company}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Context */}
                    {intro.context && (
                      <div className="mb-4 p-4 bg-background-glass border border-border-default rounded-lg">
                        <p className="text-sm font-semibold text-text-secondary mb-2">
                          Why you should connect:
                        </p>
                        <p className="text-sm">{intro.context}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => handleAccept(intro.id, intro.introducerName)}
                        disabled={isPending}
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Accept Introduction
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1"
                        onClick={() => handleDecline(intro.id, intro.introducerName)}
                        disabled={isPending}
                      >
                        <X className="w-5 h-5 mr-2" />
                        Decline
                      </Button>
                    </div>

                    {/* Processing State */}
                    {isPending && (
                      <p className="text-center text-sm text-text-secondary mt-3">
                        Processing...
                      </p>
                    )}
                  </GlassCard>
                );
              })}
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
