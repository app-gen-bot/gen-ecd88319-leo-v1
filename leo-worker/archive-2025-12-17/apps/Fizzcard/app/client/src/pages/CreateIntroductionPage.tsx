import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { UserPlus, Search, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { celebrateSuccess } from '@/lib/confetti';

/**
 * CreateIntroductionPage component
 * Form to create a new introduction between two connections
 */
export function CreateIntroductionPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [personAId, setPersonAId] = useState<number | null>(null);
  const [personBId, setPersonBId] = useState<number | null>(null);
  const [context, setContext] = useState('');
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  // Fetch connections
  // Note: Using limit=100 (schema max). Frontend filters/search handles large connection lists client-side.
  const { data: connectionsData, isLoading, isError } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const result = await apiClient.connections.getAll({
        query: { limit: 100 } // Schema enforces max(100)
      });
      if (result.status !== 200) throw new Error('Failed to fetch connections');
      return result.body;
    },
  });

  const connections = connectionsData?.data || [];

  // Filter connections for each dropdown
  const filteredConnectionsA = connections.filter((c) =>
    c.connectedUserName.toLowerCase().includes(searchA.toLowerCase())
  );

  const filteredConnectionsB = connections.filter((c) =>
    c.connectedUserName.toLowerCase().includes(searchB.toLowerCase()) &&
    c.connectedUserId !== personAId // Can't introduce someone to themselves
  );

  // Get selected connections
  const personA = connections.find((c) => c.connectedUserId === personAId);
  const personB = connections.find((c) => c.connectedUserId === personBId);

  // Create introduction mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!personAId || !personBId) {
        throw new Error('Please select both people to introduce');
      }

      const result = await apiClient.introductions.create({
        body: {
          personAId,
          personBId,
          context: context.trim() || undefined,
        },
      });

      if (result.status !== 201) {
        throw new Error('Failed to create introduction');
      }

      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['introductions'] });

      // Celebrate successful introduction
      celebrateSuccess();

      toast.success('Introduction created! Waiting for acceptance.');
      setLocation('/introductions');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create introduction');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!personAId || !personBId) {
      toast.error('Please select both people to introduce');
      return;
    }

    if (personAId === personBId) {
      toast.error('Cannot introduce a person to themselves');
      return;
    }

    createMutation.mutate();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Make Introduction</h1>
          <p className="text-text-secondary">
            Connect two of your contacts and earn FizzCoins when they accept
          </p>
        </div>

        {/* Reward Info */}
        <GlassCard className="p-4 mb-8 bg-primary-500/10 border-primary-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-primary-500 mb-1">Earn FizzCoins!</p>
              <p className="text-sm text-text-secondary">
                Earn <span className="font-bold text-primary-500">50 FizzCoins</span> when both
                people accept your introduction. Super-Connectors get{' '}
                <span className="font-bold text-primary-500">100 FizzCoins</span>!
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isError ? (
          <GlassCard className="p-8 text-center">
            <p className="text-error-500 mb-4">Failed to load connections</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </GlassCard>
        ) : connections.length < 2 ? (
          <GlassCard className="p-8 text-center">
            <UserPlus className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary mb-4">
              You need at least 2 connections to make an introduction
            </p>
            <Button variant="primary" onClick={() => setLocation('/scan')}>
              Add Connections
            </Button>
          </GlassCard>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Person A Selection */}
              <GlassCard className="p-6">
                <label className="block text-sm font-semibold mb-3">
                  Select First Person
                </label>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search connections..."
                    className="w-full pl-10 pr-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchA}
                    onChange={(e) => setSearchA(e.target.value)}
                  />
                </div>

                {/* Selected Person */}
                {personA ? (
                  <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={personA.connectedUserAvatar}
                        alt={personA.connectedUserName}
                        size="md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{personA.connectedUserName}</h3>
                        {personA.connectedUserTitle && (
                          <p className="text-sm text-text-secondary">
                            {personA.connectedUserTitle}
                            {personA.connectedUserCompany &&
                              ` at ${personA.connectedUserCompany}`}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPersonAId(null);
                          setSearchA('');
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Connection List */
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredConnectionsA.length === 0 ? (
                      <p className="text-center text-text-secondary py-4">
                        No connections found
                      </p>
                    ) : (
                      filteredConnectionsA.map((connection) => (
                        <button
                          key={connection.id}
                          type="button"
                          className="w-full p-3 bg-background-glass border border-border-default hover:border-primary-500 rounded-lg transition-colors text-left"
                          onClick={() => setPersonAId(connection.connectedUserId)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={connection.connectedUserAvatar}
                              alt={connection.connectedUserName}
                              size="sm"
                            />
                            <div>
                              <h4 className="font-medium">{connection.connectedUserName}</h4>
                              {connection.connectedUserTitle && (
                                <p className="text-xs text-text-secondary">
                                  {connection.connectedUserTitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </GlassCard>

              {/* Arrow Indicator */}
              {personAId && (
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}

              {/* Person B Selection */}
              {personAId && (
                <GlassCard className="p-6">
                  <label className="block text-sm font-semibold mb-3">
                    Select Second Person
                  </label>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search connections..."
                      className="w-full pl-10 pr-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={searchB}
                      onChange={(e) => setSearchB(e.target.value)}
                    />
                  </div>

                  {/* Selected Person */}
                  {personB ? (
                    <div className="p-4 bg-accent-500/10 border border-accent-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={personB.connectedUserAvatar}
                          alt={personB.connectedUserName}
                          size="md"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{personB.connectedUserName}</h3>
                          {personB.connectedUserTitle && (
                            <p className="text-sm text-text-secondary">
                              {personB.connectedUserTitle}
                              {personB.connectedUserCompany &&
                                ` at ${personB.connectedUserCompany}`}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPersonBId(null);
                            setSearchB('');
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Connection List */
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {filteredConnectionsB.length === 0 ? (
                        <p className="text-center text-text-secondary py-4">
                          No connections found
                        </p>
                      ) : (
                        filteredConnectionsB.map((connection) => (
                          <button
                            key={connection.id}
                            type="button"
                            className="w-full p-3 bg-background-glass border border-border-default hover:border-accent-500 rounded-lg transition-colors text-left"
                            onClick={() => setPersonBId(connection.connectedUserId)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={connection.connectedUserAvatar}
                                alt={connection.connectedUserName}
                                size="sm"
                              />
                              <div>
                                <h4 className="font-medium">{connection.connectedUserName}</h4>
                                {connection.connectedUserTitle && (
                                  <p className="text-xs text-text-secondary">
                                    {connection.connectedUserTitle}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Context */}
              {personBId && (
                <GlassCard className="p-6">
                  <label className="block text-sm font-semibold mb-3">
                    Add Context (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={4}
                    placeholder="Why should they connect? Add some context to help them..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    maxLength={500}
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    {context.length}/500 characters
                  </p>
                </GlassCard>
              )}

              {/* Submit Button */}
              {personBId && (
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setLocation('/introductions')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      'Creating...'
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Make Introduction
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
