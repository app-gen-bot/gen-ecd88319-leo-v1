import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation, Link } from 'wouter';
import {
  Calendar,
  MapPin,
  Users,
  Lock,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * EventDetailsPage component
 * Display full event details with attendees and actions
 */
export function EventDetailsPage() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [, params] = useRoute('/events/:id');
  const eventId = params?.id ? parseInt(params.id) : null;
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch event details
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
  } = useQuery({
    queryKey: ['events', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Invalid event ID');
      const result = await apiClient.events.getById({
        params: { id: eventId },
      });
      if (result.status !== 200) throw new Error('Failed to fetch event');
      return result.body;
    },
    enabled: !!eventId,
  });

  // Fetch attendees
  const {
    data: attendeesData,
    isLoading: attendeesLoading,
  } = useQuery({
    queryKey: ['events', eventId, 'attendees'],
    queryFn: async () => {
      if (!eventId) throw new Error('Invalid event ID');
      const result = await apiClient.events.getAttendees({
        params: { id: eventId },
        query: { page: 1, limit: 100 },
      });
      if (result.status !== 200) throw new Error('Failed to fetch attendees');
      return result.body;
    },
    enabled: !!eventId,
  });

  // Attend event mutation
  const attendMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error('Invalid event ID');
      const result = await apiClient.events.attend({
        params: { id: eventId },
        body: {},
      });
      if (result.status !== 201) {
        const errorData = result.body as { error?: string };
        throw new Error(errorData.error || 'Failed to register for event');
      }
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Successfully registered for event!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register for event';
      toast.error(errorMessage);
    },
  });

  // Check in to event mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error('Invalid event ID');
      const result = await apiClient.events.checkIn({
        params: { id: eventId },
        body: {},
      });
      if (result.status !== 201) {
        const errorData = result.body as { error?: string };
        throw new Error(errorData.error || 'Failed to check in to event');
      }
      return result.body;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(`Checked in! +${data.fizzcoinsEarned} FizzCoins earned!`, {
        duration: 4000,
        icon: '🎉',
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check in to event';
      toast.error(errorMessage);
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error('Invalid event ID');
      const result = await apiClient.events.delete({
        params: { id: eventId },
        body: {},
      });
      if (result.status !== 200) {
        const errorData = result.body as { error?: string };
        throw new Error(errorData.error || 'Failed to delete event');
      }
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
      navigate('/events');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      toast.error(errorMessage);
    },
  });

  const attendees = attendeesData?.data || [];
  const isCreator = user && event && event.createdBy === user.id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isCreator || isAdmin;

  if (eventLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (eventError || !event) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <GlassCard className="p-8 text-center">
            <p className="text-error-500 mb-4">Failed to load event details</p>
            <Button variant="primary" onClick={() => navigate('/events')}>
              Back to Events
            </Button>
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isUpcoming = startDate > new Date();
  const isOngoing = startDate <= new Date() && endDate >= new Date();
  const isPast = endDate < new Date();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link href="/events">
          <a>
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </a>
        </Link>

        {/* Event Details */}
        <GlassCard className="p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {event.name}
                {event.isExclusive && (
                  <Lock className="inline w-6 h-6 ml-2 text-fizzCoin-500" />
                )}
              </h1>
              <p className="text-text-secondary">By {event.creatorName}</p>
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/events/${eventId}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-error-500 hover:bg-error-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            {isUpcoming && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm font-semibold">
                <Clock className="w-4 h-4" />
                Upcoming
              </span>
            )}
            {isOngoing && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-success-500/20 text-success-500 rounded-full text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Happening Now
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-text-secondary/20 text-text-secondary rounded-full text-sm font-semibold">
                Ended
              </span>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-text-secondary mb-6 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Event Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary-500 mt-1" />
              <div>
                <p className="font-semibold">Date & Time</p>
                <p className="text-text-secondary">
                  {format(startDate, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-text-secondary">
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 mt-1" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-text-secondary">{event.location}</p>
                  {event.latitude && event.longitude && (
                    <p className="text-xs text-text-secondary mt-1">
                      Coordinates: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary-500 mt-1" />
              <div>
                <p className="font-semibold">Attendees</p>
                <p className="text-text-secondary">{event.attendeeCount} registered</p>
              </div>
            </div>
          </div>

          {/* Exclusive Event Info */}
          {event.isExclusive && (
            <div className="p-4 rounded-lg bg-fizzCoin-500/10 border border-fizzCoin-500/30 mb-6">
              <p className="text-fizzCoin-500 font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Exclusive Event
              </p>
              <p className="text-text-secondary text-sm mt-2">
                This event requires {event.minFizzcoinRequired} FizzCoins to attend
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!event.isAttending && (isUpcoming || isOngoing) && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => attendMutation.mutate()}
                disabled={attendMutation.isPending}
                className="flex-1"
              >
                {attendMutation.isPending ? 'Registering...' : 'Register to Attend'}
              </Button>
            )}
            {event.isAttending && !event.hasCheckedIn && (isUpcoming || isOngoing) && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending}
                className="flex-1"
              >
                {checkInMutation.isPending ? 'Checking In...' : 'Check In'}
              </Button>
            )}
            {event.hasCheckedIn && (
              <div className="flex items-center justify-center gap-2 text-success-500 font-semibold py-3">
                <CheckCircle className="w-5 h-5" />
                You've checked in to this event
              </div>
            )}
            {isPast && !event.isAttending && (
              <p className="text-text-secondary text-center py-3">This event has ended</p>
            )}
          </div>
        </GlassCard>

        {/* Attendees List */}
        <GlassCard className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">
            Attendees ({attendees.length})
          </h2>

          {attendeesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">No attendees yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-background-glass border border-border-default hover:border-primary-500/50 transition-colors"
                >
                  <Avatar
                    src={attendee.userAvatar}
                    alt={attendee.userName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{attendee.userName}</h3>
                    {attendee.userTitle && (
                      <p className="text-sm text-text-secondary truncate">
                        {attendee.userTitle}
                        {attendee.userCompany && ` at ${attendee.userCompany}`}
                      </p>
                    )}
                  </div>
                  {attendee.checkInAt && (
                    <span className="flex items-center gap-1 text-success-500 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Checked In
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Delete Event?</h3>
              <p className="text-text-secondary mb-6">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-error-500 hover:bg-error-600"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
