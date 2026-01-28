import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { apiClient } from '@/lib/api-client';
import { Booking, Chapel } from '@shared/schema';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

export default function CoupleDashboardPage() {
  // Fetch current user
  const { data: currentUser, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.auth.getCurrentUser();
      if (response.status === 200) {
        return response.body;
      }
      throw new Error('Failed to fetch user');
    }
  });

  // Fetch user's bookings
  const { data: bookingsData, isLoading: isLoadingBookings, error: bookingsError } = useQuery({
    queryKey: ['myBookings', { page: 1, limit: 10 }],
    queryFn: async () => {
      const response = await apiClient.bookings.getMyBookings({
        query: { page: 1, limit: 10 }
      });
      if (response.status === 200) {
        return response.body;
      }
      throw new Error('Failed to fetch bookings');
    }
  });

  // Fetch chapel details for each booking
  const { data: chapelsData } = useQuery({
    queryKey: ['bookingChapels', bookingsData?.bookings.map(b => b.chapelId)],
    queryFn: async () => {
      if (!bookingsData?.bookings || bookingsData.bookings.length === 0) {
        return {};
      }

      const chapelPromises = bookingsData.bookings.map(async (booking: Booking) => {
        const response = await apiClient.chapels.getChapel({
          params: { id: booking.chapelId }
        });
        if (response.status === 200) {
          return { [booking.chapelId]: response.body };
        }
        return null;
      });

      const chapelResults = await Promise.all(chapelPromises);
      return chapelResults.reduce((acc, result) => {
        if (result) {
          return { ...acc, ...result };
        }
        return acc;
      }, {} as Record<string, Chapel>);
    },
    enabled: !!bookingsData?.bookings && bookingsData.bookings.length > 0
  });

  // Show loading state
  if (isLoadingUser || isLoadingBookings) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    );
  }

  // Show error state
  if (userError || bookingsError) {
    return (
      <AppLayout>
        <ErrorState error={userError || bookingsError} />
      </AppLayout>
    );
  }

  const bookings = bookingsData?.bookings || [];
  const chapels = chapelsData || {};

  // Calculate stats
  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(
    b => b.status === 'pending' || b.status === 'confirmed'
  ).length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  // Get recent bookings (first 3)
  const recentBookings = bookings.slice(0, 3);

  // Status badge variant mapping
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time slot
  const formatTimeSlot = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning':
        return '9 AM - 12 PM';
      case 'afternoon':
        return '1 PM - 5 PM';
      case 'evening':
        return '6 PM - 9 PM';
      default:
        return timeSlot;
    }
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-50 mb-2">
            Welcome back, {currentUser?.fullName || 'there'}!
          </h1>
          <p className="text-slate-400">
            Here's an overview of your chapel bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Bookings */}
          <Link href="/dashboard/couple/bookings">
            <Card className="bg-slate-800 border-slate-700 hover:border-violet-500 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">Total Bookings</CardDescription>
                <CardTitle className="text-4xl font-bold text-slate-50">
                  {totalBookings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">All time</p>
              </CardContent>
            </Card>
          </Link>

          {/* Upcoming Bookings */}
          <Link href="/dashboard/couple/bookings?status=pending,confirmed">
            <Card className="bg-slate-800 border-slate-700 hover:border-violet-500 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">Upcoming</CardDescription>
                <CardTitle className="text-4xl font-bold text-slate-50">
                  {upcomingBookings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">Pending & confirmed</p>
              </CardContent>
            </Card>
          </Link>

          {/* Completed Bookings */}
          <Link href="/dashboard/couple/bookings?status=completed">
            <Card className="bg-slate-800 border-slate-700 hover:border-violet-500 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardDescription className="text-slate-400">Completed</CardDescription>
                <CardTitle className="text-4xl font-bold text-slate-50">
                  {completedBookings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">Past events</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Bookings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-50">Recent Bookings</h2>
            {bookings.length > 0 && (
              <Link href="/dashboard/couple/bookings">
                <Button variant="link" className="text-violet-400 hover:text-violet-300">
                  View All →
                </Button>
              </Link>
            )}
          </div>

          {recentBookings.length === 0 ? (
            /* Empty State */
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-50 mb-2">
                  No bookings yet
                </h3>
                <p className="text-slate-400 mb-6 text-center max-w-md">
                  Start your journey by browsing our beautiful chapel collection and finding the perfect venue for your special day.
                </p>
                <Link href="/chapels">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-slate-50">
                    Browse Chapels
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            /* Recent Bookings List */
            <div className="grid grid-cols-1 gap-4">
              {recentBookings.map((booking: Booking) => {
                const chapel = chapels[booking.chapelId];
                return (
                  <Link key={booking.id} href={`/dashboard/couple/bookings/${booking.id}`}>
                    <Card className="bg-slate-800 border-slate-700 hover:border-violet-500 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {chapel ? (
                                <Link
                                  href={`/chapels/${chapel.id}`}
                                  className="text-xl font-bold text-slate-50 hover:text-violet-400 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {chapel.name}
                                </Link>
                              ) : (
                                <span className="text-xl font-bold text-slate-50">
                                  Loading chapel...
                                </span>
                              )}
                              <Badge variant={getStatusVariant(booking.status)}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(booking.bookingDate)}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimeSlot(booking.timeSlot)}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{booking.guestCount} guests</span>
                              </div>
                            </div>

                            {chapel && (
                              <div className="flex items-center gap-2 mt-3 text-sm text-slate-400">
                                <MapPin className="w-4 h-4" />
                                <span>{chapel.city}, {chapel.state}</span>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            className="text-violet-400 hover:text-violet-300 hover:bg-violet-950/50"
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/dashboard/couple/bookings/${booking.id}`;
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {bookings.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
              <div>
                <h3 className="text-xl font-bold text-slate-50 mb-2">
                  Looking for another venue?
                </h3>
                <p className="text-slate-400">
                  Browse our collection of beautiful chapels for your next event
                </p>
              </div>
              <Link href="/chapels">
                <Button className="bg-violet-600 hover:bg-violet-700 text-slate-50 mt-4 md:mt-0">
                  Browse Chapels
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
