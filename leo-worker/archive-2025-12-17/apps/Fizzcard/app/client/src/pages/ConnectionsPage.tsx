import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, MapPin, Calendar, Trash2, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';

/**
 * ConnectionsPage component
 * Display and manage user connections with filters
 */
export function ConnectionsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'strength' | 'name'>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [editingNote, setEditingNote] = useState<{ id: number; note: string } | null>(null);

  // Fetch connections
  const { data: connectionsData, isLoading, isError, error } = useQuery({
    queryKey: ['connections', { location: locationFilter, sortBy, page }],
    queryFn: async () => {
      const result = await apiClient.connections.getAll({
        query: {
          location: locationFilter || undefined,
          sortBy,
          page,
          limit: 20,
        },
      });
      if (result.status !== 200) throw new Error('Failed to fetch connections');
      return result.body;
    },
  });

  // Update connection mutation
  const updateConnectionMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      const result = await apiClient.connections.update({
        params: { id },
        body: { relationshipNote: note },
      });
      if (result.status !== 200) throw new Error('Failed to update connection');
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection updated!');
      setEditingNote(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update connection');
    },
  });

  // Delete connection mutation
  const deleteConnectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiClient.connections.delete({
        params: { id },
        body: {},
      });
      if (result.status !== 200) throw new Error('Failed to delete connection');
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete connection');
    },
  });

  const connections = connectionsData?.data || [];
  const pagination = connectionsData?.pagination;

  // Filter connections by search query
  const filteredConnections = connections.filter((conn) =>
    conn.connectedUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.connectedUserCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.locationName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateNote = (id: number, note: string) => {
    updateConnectionMutation.mutate({ id, note });
  };

  const handleDeleteConnection = (id: number, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your connections?`)) {
      deleteConnectionMutation.mutate(id);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Connections</h1>
          <p className="text-text-secondary">
            Manage your professional network
          </p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search connections..."
                className="w-full pl-12 pr-4 py-3 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full justify-start gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {/* Filters */}
            {showFilters && (
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border-default">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    className="w-full px-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={locationFilter}
                    onChange={(e) => {
                      setLocationFilter(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    className="w-full px-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as typeof sortBy);
                      setPage(1);
                    }}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="strength">Connection Strength</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Connections List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <GlassCard className="p-8 text-center">
            <p className="text-error-500 mb-4">{error.message}</p>
            <Button
              variant="primary"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['connections'] })}
            >
              Try Again
            </Button>
          </GlassCard>
        ) : filteredConnections.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-text-secondary mb-4">
              {searchQuery || locationFilter
                ? 'No connections match your filters'
                : 'No connections yet'}
            </p>
            {!searchQuery && !locationFilter && (
              <Button variant="primary" onClick={() => (window.location.href = '/scan')}>
                Scan QR Code
              </Button>
            )}
          </GlassCard>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {filteredConnections.map((connection) => (
                <GlassCard key={connection.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={connection.connectedUserAvatar}
                      alt={connection.connectedUserName}
                      size="lg"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold mb-1">
                        {connection.connectedUserName}
                      </h3>

                      {connection.connectedUserTitle && (
                        <p className="text-text-secondary mb-2">
                          {connection.connectedUserTitle}
                          {connection.connectedUserCompany &&
                            ` at ${connection.connectedUserCompany}`}
                        </p>
                      )}

                      {connection.metAt && (
                        <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-3">
                          {connection.locationName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {connection.locationName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(connection.metAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}

                      {/* Note */}
                      {editingNote?.id === connection.id ? (
                        <div className="space-y-2">
                          <textarea
                            className="w-full px-3 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            rows={3}
                            value={editingNote.note}
                            onChange={(e) =>
                              setEditingNote({ ...editingNote, note: e.target.value })
                            }
                            placeholder="Add a note about this connection..."
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                handleUpdateNote(connection.id, editingNote.note)
                              }
                              disabled={updateConnectionMutation.isPending}
                            >
                              {updateConnectionMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingNote(null)}
                              disabled={updateConnectionMutation.isPending}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : connection.relationshipNote ? (
                        <div className="p-3 bg-background-glass border border-border-default rounded-lg text-sm">
                          <p className="mb-2">{connection.relationshipNote}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setEditingNote({
                                id: connection.id,
                                note: connection.relationshipNote || '',
                              })
                            }
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit Note
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditingNote({ id: connection.id, note: '' })
                          }
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Add Note
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDeleteConnection(connection.id, connection.connectedUserName)
                      }
                      disabled={deleteConnectionMutation.isPending}
                    >
                      <Trash2 className="w-5 h-5 text-error-500" />
                    </Button>
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
