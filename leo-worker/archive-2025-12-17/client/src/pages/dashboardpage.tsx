import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { apiClient, setAuthToken } from '@/lib/api-client';
import {
  Calendar,
  Heart,
  User,
  MapPin,
  LogOut,
} from 'lucide-react';

interface BookingWithDetails {
  id: number;
  chapelId: number;
  packageId: number;
  timeSlotId: number;
  numberOfGuests: number;
  specialRequests?: string;
  status: string;
  createdAt: string;
  chapelDetails?: {
    id: number;
    name: string;
    location: string;
    capacity: number;
    images: string[];
  };
  packageDetails?: {
    id: number;
    name: string;
    price: number;
  };
  timeSlotDetails?: {
    date: string;
    startTime: string;
  };
}

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [bookingsWithDetails, setBookingsWithDetails] = useState<BookingWithDetails[]>([]);

  // Fetch current user
  const {
    data: currentUserData,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery<UserData>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.users.getCurrentUser();
      return response.body;
    },
  });

  // Fetch upcoming bookings
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    error: bookingsError,
  } = useQuery({
    queryKey: ['upcomingBookings', currentUserData?.id],
    queryFn: async () => {
      if (!currentUserData?.id) return [];
      const response = await apiClient.bookings.getUpcomingBookings({
        params: { userId: currentUserData.id },
      });
      return response.body;
    },
    enabled: !!currentUserData?.id,
  });

  // Fetch favorites
  const { data: favoritesData } = useQuery({
    queryKey: ['favorites', currentUserData?.id],
    queryFn: async () => {
      if (!currentUserData?.id) return [];
      const response = await apiClient.users.getFavorites({
        params: { id: currentUserData.id },
      });
      return response.body;
    },
    enabled: !!currentUserData?.id,
  });

  // Fetch detailed information for each booking
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingsData || !Array.isArray(bookingsData)) return;

      const enrichedBookings = await Promise.all(
        bookingsData.map(async (booking: BookingWithDetails) => {
          try {
            const [chapelResponse, packageResponse] = await Promise.all([
              apiClient.chapels.getChapel({ params: { id: booking.chapelId } }),
              apiClient.packages.getPackage({ params: { id: booking.packageId } }),
            ]);

            return {
              ...booking,
              chapelDetails: chapelResponse.body,
              packageDetails: packageResponse.body,
            };
          } catch (error) {
            console.error('Error fetching booking details:', error);
            return booking;
          }
        })
      );

      setBookingsWithDetails(enrichedBookings);
    };

    fetchBookingDetails();
  }, [bookingsData]);

  const handleSignOut = async () => {
    try {
      await apiClient.auth.logout();
      setAuthToken(null);
      setLocation('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthToken(null);
      setLocation('/');
    }
  };

  // Loading state - use LoadingState component
  if (isLoadingUser) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    );
  }

  // Error state - use ErrorState component
  if (userError) {
    return (
      <AppLayout>
        <ErrorState error={userError} />
      </AppLayout>
    );
  }

  const hasUpcomingBookings = bookingsWithDetails && bookingsWithDetails.length > 0;
  const favoritesCount = Array.isArray(favoritesData) ? favoritesData.length : 0;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format member since date
  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-amber-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-slate-700';
    }
  };

  return (
    <AppLayout>
      <div className="flex min-h-screen bg-slate-950">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-60 bg-slate-800 border-r border-slate-700">
          <nav className="flex-1 p-4 space-y-2" aria-label="Dashboard navigation">
            <Link href="/dashboard">
              <a className="flex items-center gap-3 px-4 py-3 text-violet-500 bg-slate-700 rounded-lg border-l-4 border-violet-500 font-medium">
                <Calendar className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
            </Link>
            <Link href="/dashboard/bookings">
              <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <Calendar className="h-5 w-5" />
                <span>My Bookings</span>
              </a>
            </Link>
            <Link href="/dashboard/favorites">
              <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <Heart className="h-5 w-5" />
                <span>Favorite Chapels</span>
              </a>
            </Link>
            <Link href="/dashboard/profile">
              <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </a>
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Sign out of your account"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {currentUserData?.firstName || 'User'}!
            </h1>
            <p className="text-slate-400">Here's what's coming up</p>
          </div>

          {/* Upcoming Bookings Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">Your Upcoming Bookings</h2>
            </div>

            {/* Loading State for Bookings */}
            {isLoadingBookings && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="w-full h-64 bg-slate-700" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-slate-700 rounded w-3/4" />
                      <div className="h-4 bg-slate-700 rounded w-1/2" />
                      <div className="h-4 bg-slate-700 rounded w-2/3" />
                      <div className="h-10 bg-slate-700 rounded w-32 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State for Bookings */}
            {bookingsError && !isLoadingBookings && (
              <ErrorState error={bookingsError} />
            )}

            {/* Empty State */}
            {!isLoadingBookings && !bookingsError && !hasUpcomingBookings && (
              <>
                <div className="bg-slate-800 border border-dashed border-slate-700 rounded-xl p-12 text-center max-w-md mx-auto mb-8">
                  <Calendar className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    No Upcoming Bookings
                  </h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    You don't have any bookings scheduled. Start planning your special day!
                  </p>
                  <Link href="/browse">
                    <a className="inline-flex items-center gap-2 px-8 py-4 bg-violet-500 text-white font-semibold rounded-lg hover:bg-violet-600 transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                      <MapPin className="h-5 w-5" />
                      Find Your Perfect Chapel
                    </a>
                  </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                    <Calendar className="h-8 w-8 text-violet-500 mx-auto mb-3" />
                    <div className="text-4xl font-bold text-white mb-1">0</div>
                    <div className="text-sm text-slate-400">Upcoming Bookings</div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
                    <div className="text-4xl font-bold text-white mb-1">
                      {favoritesCount}
                    </div>
                    <div className="text-sm text-slate-400">Favorite Chapels</div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                    <User className="h-8 w-8 text-green-500 mx-auto mb-3" />
                    <div className="text-sm text-slate-400 mb-1">Member Since</div>
                    <div className="text-lg font-semibold text-white">
                      {currentUserData?.createdAt
                        ? formatMemberSince(currentUserData.createdAt)
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Booking Cards */}
            {!isLoadingBookings && !bookingsError && hasUpcomingBookings && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookingsWithDetails.map((booking) => (
                    <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
                      <a
                        className="block bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-violet-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-500/30"
                        aria-label={`View booking details for ${
                          booking.chapelDetails?.name || 'chapel'
                        } on ${booking.timeSlotDetails?.date || 'date'}`}
                      >
                        <div className="relative h-48 overflow-hidden">
                          {booking.chapelDetails?.images?.[0] ? (
                            <img
                              src={booking.chapelDetails.images[0]}
                              alt={`Photo of ${booking.chapelDetails.name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                              <Calendar className="h-16 w-16 text-slate-500" />
                            </div>
                          )}
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusBadgeColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {booking.chapelDetails?.name || 'Chapel Booking'}
                          </h3>
                          <div className="flex items-start gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <p className="text-slate-400 text-sm">
                              {booking.timeSlotDetails?.date
                                ? formatDate(booking.timeSlotDetails.date)
                                : 'Date TBD'}
                            </p>
                          </div>
                          <p className="text-violet-500 text-sm mb-2">
                            {booking.packageDetails?.name || 'Package'}
                          </p>
                          <p className="text-slate-500 text-sm mb-4">
                            {booking.numberOfGuests}{' '}
                            {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                          </p>
                          <div className="text-violet-500 text-sm font-medium hover:text-violet-400">
                            View Details →
                          </div>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 text-right">
                  <Link href="/dashboard/bookings">
                    <a className="text-violet-500 font-medium hover:text-violet-400 hover:underline focus:outline-none focus:ring-4 focus:ring-violet-500/30 rounded inline-block">
                      View All Bookings →
                    </a>
                  </Link>
                </div>
              </>
            )}
          </section>

          {/* Quick Actions Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Browse Chapels Action Card */}
              <Link href="/browse">
                <a className="block bg-slate-800 border border-slate-700 rounded-xl p-6 text-center hover:border-violet-500 hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                  <MapPin className="h-8 w-8 text-violet-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-1">Browse Chapels</h3>
                  <p className="text-sm text-slate-400">Explore available venues</p>
                </a>
              </Link>

              {/* View Favorites Action Card */}
              <Link href="/dashboard/favorites">
                <a className="block bg-slate-800 border border-slate-700 rounded-xl p-6 text-center hover:border-violet-500 hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                  <Heart className="h-8 w-8 text-violet-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-1">View Favorites</h3>
                  <p className="text-sm text-slate-400">See your saved chapels</p>
                </a>
              </Link>

              {/* Manage Profile Action Card */}
              <Link href="/dashboard/profile">
                <a className="block bg-slate-800 border border-slate-700 rounded-xl p-6 text-center hover:border-violet-500 hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                  <User className="h-8 w-8 text-violet-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-1">Manage Profile</h3>
                  <p className="text-sm text-slate-400">Update your settings</p>
                </a>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </AppLayout>
  );
}
