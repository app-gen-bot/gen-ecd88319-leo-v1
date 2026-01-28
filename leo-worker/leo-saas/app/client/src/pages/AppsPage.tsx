import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Rocket,
  AlertCircle,
  FileCode,
  Plane,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  PauseCircle,
} from 'lucide-react';
import { DeployModal } from '@/components/DeployModal';
import type { GenerationRequest } from '@shared/schema.zod';

export default function AppsPage() {
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<GenerationRequest | null>(null);

  // Fetch all generation requests
  const { data: generations, isLoading, error } = useQuery({
    queryKey: ['generations'],
    queryFn: async () => {
      const response = await apiClient.generations.list();
      if (response.status === 200) {
        return Array.isArray(response.body) ? response.body : [];
      }
      throw new Error('Failed to fetch generations');
    },
    refetchInterval: false,
    retry: 1,
    staleTime: 1000,
  });

  // Deploy mutation - TODO: Add deploy endpoint to V2 API contract
  /* const deployMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.generations.deploy({ params: { id: id.toString() } });
      if (response.status === 200) {
        return response.body;
      }
      throw new Error(response.body?.error || 'Deployment failed');
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
      // Update the selected generation with the deployment URL
      if (selectedGeneration?.id === id) {
        setSelectedGeneration({ ...selectedGeneration, deploymentUrl: data.deploymentUrl });
      }
    },
  }); */

  const handleDeploy = (generation: GenerationRequest) => {
    setSelectedGeneration(generation);
    setDeployModalOpen(true);
  };

  const getStatusIcon = (status: GenerationRequest['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-5 w-5 text-leo-text-secondary" />;
      case 'generating':
        return <Loader2 className="h-5 w-5 text-leo-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'paused':
        return <PauseCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: GenerationRequest['status']) => {
    const styles: Record<typeof status, string> = {
      queued: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      generating: 'bg-leo-primary/10 text-leo-primary border-leo-primary/20',
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
      paused: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };

    return (
      <Badge className={`${styles[status]} font-semibold border`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-8">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-bold tracking-tight text-leo-text">Your Apps</h1>
            <Link href="/console">
              <Button className="bg-leo-primary hover:bg-leo-primary-dark text-white shadow-glow-sm hover:shadow-glow-md transition-all duration-300">
                <Rocket className="h-4 w-4 mr-2" />
                New App
              </Button>
            </Link>
          </div>
          <p className="text-xl text-leo-text-secondary">
            View and manage all your AI-generated applications
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-leo-bg-secondary border-leo-border">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4 bg-leo-bg-tertiary" />
                    <Skeleton className="h-4 w-full bg-leo-bg-tertiary" />
                    <Skeleton className="h-4 w-2/3 bg-leo-bg-tertiary" />
                    <Skeleton className="h-10 w-24 bg-leo-bg-tertiary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <Card className="bg-leo-bg-secondary border-red-500/30">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold text-leo-text text-lg">Unable to load apps</p>
                  <p className="text-leo-text-secondary">
                    {error instanceof Error && error.message.includes('401')
                      ? 'Please log in to view your apps'
                      : error instanceof Error
                        ? error.message
                        : 'Please try refreshing the page'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!generations || generations.length === 0) && (
          <Card className="bg-leo-bg-secondary border-leo-border border-dashed">
            <CardContent className="p-16 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-leo-primary/10 flex items-center justify-center shadow-glow-sm">
                  <FileCode className="h-12 w-12 text-leo-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-leo-text">No apps yet</h3>
                  <p className="text-leo-text-secondary max-w-md text-lg">
                    Start by creating your first AI-generated app. Describe your idea and let Leo build it for you.
                  </p>
                </div>
                <Link href="/console">
                  <Button size="lg" className="bg-leo-primary hover:bg-leo-primary-dark text-white shadow-glow-md mt-4">
                    <Rocket className="h-5 w-5 mr-2" />
                    Create Your First App
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Apps Grid */}
        {!isLoading && !error && generations && generations.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generations.map((gen: GenerationRequest) => (
              <Card
                key={gen.id}
                className="bg-leo-bg-secondary border-leo-border hover:border-leo-primary hover:shadow-glow-sm transition-all duration-300 group"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header: Icon + Status */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-leo-primary/10 flex items-center justify-center shadow-glow-sm">
                      {getStatusIcon(gen.status)}
                    </div>
                    {getStatusBadge(gen.status)}
                  </div>

                  {/* Prompt */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-leo-text line-clamp-2 min-h-[3.5rem]">
                      {gen.prompt.length > 80
                        ? `${gen.prompt.substring(0, 80)}...`
                        : gen.prompt}
                    </h3>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-sm text-leo-text-tertiary">
                    <p>Created: {formatDate(gen.createdAt)}</p>
                    {gen.completedAt && (
                      <p>Completed: {formatDate(gen.completedAt)}</p>
                    )}
                  </div>

                  {/* Deployment URL */}
                  {gen.deploymentUrl && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs font-semibold text-green-500 mb-1">LIVE</p>
                      <a
                        href={gen.deploymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-400 hover:text-green-300 hover:underline font-mono break-all"
                      >
                        {gen.deploymentUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}

                  {/* Error Message */}
                  {gen.status === 'failed' && gen.errorMessage && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">{gen.errorMessage}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {gen.status === 'completed' && (
                    <div className="flex gap-2 pt-2">
                      {gen.githubUrl && (
                        <Button
                          onClick={() => handleDeploy(gen)}
                          size="sm"
                          className="flex-1 bg-leo-primary hover:bg-leo-primary-dark text-white"
                        >
                          <Plane className="h-4 w-4 mr-1" />
                          Deploy
                        </Button>
                      )}
                    </div>
                  )}

                  {/* View Logs Link for Active Generations */}
                  {(gen.status === 'queued' || gen.status === 'generating') && (
                    <Link href={`/console/${gen.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-leo-bg-tertiary border-leo-border text-leo-primary hover:bg-leo-bg-hover hover:border-leo-primary"
                      >
                        View Live Logs →
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
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
