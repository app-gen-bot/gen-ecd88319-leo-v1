import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Calendar, MapPin, Users, Lock, CheckCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';

/**
 * EventsPage component
 * Display and manage networking events
 */
export function EventsPage() {
  const [page, setPage] = useState(1);
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  // Fetch events
  const { data: eventsData, isLoading, isError } = useQuery({
    queryKey: ['events', { upcoming: upcomingOnly, page }],
    queryFn: async () => {
      const result = await apiClient.events.getAll({
        query: {
          upcoming: upcomingOnly,
          page,
          limit: 20,
        },
      });
      if (result.status !== 200) throw new Error('Failed to fetch events');
      return result.body;
    },
  });

  const events = eventsData?.data || [];
  const pagination = eventsData?.pagination;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Events</h1>
            <p className="text-text-secondary">
              Discover and attend networking events
            </p>
          </div>
          <Link href="/events/create">
            <a>
              <Button variant="primary" size="md">
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </a>
          </Link>
        </div>

        {/* Filter */}
        <GlassCard className="p-4 mb-8">
          <div className="flex gap-2">
            <Button
              variant={upcomingOnly ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setUpcomingOnly(true);
                setPage(1);
              }}
            >
              Upcoming Events
            </Button>
            <Button
              variant={!upcomingOnly ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setUpcomingOnly(false);
                setPage(1);
              }}
            >
              All Events
            </Button>
          </div>
        </GlassCard>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : isError ? (
          <GlassCard className="p-8 text-center">
            <p className="text-error-500 mb-4">Failed to load events</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </GlassCard>
        ) : events.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-text-secondary mb-2">
              {upcomingOnly ? 'No upcoming events' : 'No events available'}
            </p>
            <p className="text-sm text-text-secondary">
              Check back later for new networking opportunities!
            </p>
          </GlassCard>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {events.map((event) => {
                const isExclusive = event.isExclusive;
                const hasCheckedIn = event.hasCheckedIn;
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);

                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <a>
                      <GlassCard className="p-6 hover:border-primary-500/50 transition-all cursor-pointer">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Date Box */}
                      <div className="flex-shrink-0 w-20 h-20 bg-primary-500/10 border border-primary-500/30 rounded-lg flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold">
                          {format(startDate, 'd')}
                        </p>
                        <p className="text-xs text-text-secondary uppercase">
                          {format(startDate, 'MMM')}
                        </p>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-xl font-semibold">
                            {event.name}
                            {isExclusive && (
                              <Lock className="inline w-4 h-4 ml-2 text-fizzCoin-500" />
                            )}
                          </h3>
                          {hasCheckedIn && (
                            <span className="flex items-center gap-1 text-success-500 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Checked In
                            </span>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-text-secondary mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="space-y-2 text-sm text-text-secondary mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(startDate, 'MMM d, yyyy h:mm a')} -{' '}
                              {format(endDate, 'h:mm a')}
                            </span>
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{event.attendeeCount} attendees</span>
                          </div>
                        </div>

                        {isExclusive && (
                          <div className="p-3 rounded-lg bg-fizzCoin-500/10 border border-fizzCoin-500/30 mb-4">
                            <p className="text-fizzCoin-500 font-semibold text-sm">
                              Exclusive Event - {event.minFizzcoinRequired} FizzCoins required
                            </p>
                          </div>
                        )}

                          <div className="flex gap-3">
                            <Button variant="secondary" size="md">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </a>
                </Link>
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
