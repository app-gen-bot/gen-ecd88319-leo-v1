import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';
import {
  Calendar,
  Heart,
  User,
  Search,
  LogOut,
  RefreshCw,
  AlertTriangle,
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

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
}

export function Dashboard() {
  const [, setLocation] = useLocation();
  const [bookingsWithDetails, setBookingsWithDetails] = useState<BookingWithDetails[]>([]);

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.auth.getCurrentUser();
      return response.data;
    },
  });

  // Fetch upcoming bookings
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['upcomingBookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiClient.bookings.getUserBookings({
        params: { userId: user.id },
        query: {
          status: 'upcoming',
          limit: 3,
          page: 1,
        },
      });
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Fetch favorites count
  const { data: favorites } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await apiClient.users.getFavorites({
        params: { id: user.id },
      });
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Fetch all bookings for total count
  const { data: allBookingsData } = useQuery({
    queryKey: ['allBookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiClient.bookings.getUserBookings({
        params: { userId: user.id },
        query: {
          page: 1,
          limit: 100, // Get all for count
        },
      });
      return response.data;
    },
    enabled: !!user?.id,
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
              chapelDetails: chapelResponse.data,
              packageDetails: packageResponse.data,
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
      setLocation('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setLocation('/');
    }
  };

  const handleRetry = () => {
    refetchBookings();
  };

  const isLoading = userLoading || bookingsLoading;
  const hasUpcomingBookings = bookingsWithDetails && bookingsWithDetails.length > 0;
  const totalBookingsCount = Array.isArray(allBookingsData) ? allBookingsData.length : 0;
  const favoritesCount = Array.isArray(favorites) ? favorites.length : 0;

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

  return (
    <AppLayout>
      <div className="flex min-h-screen bg-slate-950">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-60 bg-slate-800 border-r border-slate-700">
          <nav className="flex-1 p-4 space-y-2" aria-label="Dashboard navigation">
            <Link href="/dashboard">
              <a className="flex items-center gap-3 px-4 py-3 text-violet-500 bg-slate-900 rounded-lg border-l-4 border-violet-500 font-medium">
                <Calendar className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
            </Link>
            <Link href="/dashboard/bookings">
              <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors">
                <Calendar className="h-5 w-5" />
                <span>My Bookings</span>
              </a>
            </Link>
            <Link href="/dashboard/favorites">
              <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors">
                <Heart className="h-5 w-5" />
                <span>Favorite Chapels</span>
              </a>
            </Link>
            <Link href="/dashboard/profile">
              <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </a>
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors"
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
            <h1 className="text-4xl font-bold text-slate-50 mb-2">
              Welcome back, {isLoading ? '...' : user?.firstName || 'User'}!
            </h1>
            <p className="text-slate-400">Here's what's coming up</p>
          </div>

          {/* Upcoming Bookings Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-50 mb-6">Upcoming Bookings</h2>

            {/* Loading State */}
            {isLoading && (
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

            {/* Error State */}
            {bookingsError && !isLoading && (
              <div className="bg-slate-800 border border-red-500 rounded-xl p-8 text-center max-w-md mx-auto">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-50 mb-2">
                  Unable to Load Bookings
                </h3>
                <p className="text-slate-400 mb-6">
                  We're having trouble loading your bookings. Please try again.
                </p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-slate-50 font-semibold rounded-lg hover:bg-violet-600 transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/30"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try Again
                </button>
                <div className="mt-4">
                  <Link href="/contact">
                    <a className="text-violet-500 text-sm hover:text-violet-400 hover:underline">
                      Contact Support
                    </a>
                  </Link>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !bookingsError && !hasUpcomingBookings && (
              <>
                <div className="bg-slate-800 border border-dashed border-slate-700 rounded-xl p-12 text-center max-w-md mx-auto mb-8">
                  <Calendar className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-50 mb-2">
                    No Upcoming Bookings
                  </h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    You don't have any bookings scheduled. Start planning your special day!
                  </p>
                  <Link href="/browse">
                    <a className="inline-block px-8 py-4 bg-violet-500 text-slate-50 font-semibold rounded-lg hover:bg-violet-600 transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                      Find Your Perfect Chapel
                    </a>
                  </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                    <Calendar className="h-8 w-8 text-violet-500 mx-auto mb-3" />
                    <div className="text-4xl font-bold text-slate-50 mb-1">
                      {totalBookingsCount}
                    </div>
                    <div className="text-sm text-slate-400">Total Bookings</div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
                    <div className="text-4xl font-bold text-slate-50 mb-1">
                      {favoritesCount}
                    </div>
                    <div className="text-sm text-slate-400">Favorite Chapels</div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                    <User className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                    <div className="text-sm text-slate-400 mb-1">Member Since</div>
                    <div className="text-lg font-semibold text-slate-50">
                      {user?.createdAt ? formatMemberSince(user.createdAt) : 'N/A'}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Booking Cards */}
            {!isLoading && !bookingsError && hasUpcomingBookings && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookingsWithDetails.map((booking) => (
                    <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
                      <a
                        className="block bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-violet-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-500/30"
                        aria-label={`View booking details for ${booking.chapelDetails?.name || 'chapel'} on ${booking.timeSlotDetails?.date || 'date'}`}
                      >
                        <div className="relative h-64 overflow-hidden">
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
                        </div>
                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-slate-50 mb-2">
                            {booking.chapelDetails?.name || 'Chapel Booking'}
                          </h3>
                          <p className="text-slate-400 mb-1">
                            {booking.timeSlotDetails?.date
                              ? formatDate(booking.timeSlotDetails.date)
                              : 'Date TBD'}
                          </p>
                          <p className="text-violet-500 text-sm mb-1">
                            {booking.packageDetails?.name || 'Package'}
                          </p>
                          <p className="text-slate-400 text-sm mb-4">
                            {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                          </p>
                          <button className="px-6 py-3 border-2 border-violet-500 text-violet-500 font-semibold rounded-lg hover:bg-violet-500 hover:text-slate-50 transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                            View Details
                          </button>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 text-right">
                  <Link href="/dashboard/bookings">
                    <a className="text-violet-500 font-medium hover:text-violet-400 hover:underline focus:outline-none focus:ring-4 focus:ring-violet-500/30 rounded">
                      View All Bookings →
                    </a>
                  </Link>
                </div>
              </>
            )}
          </section>

          {/* Quick Actions Section */}
          <section>
            <h2 className="text-2xl font-bold text-slate-50 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/browse">
                <a className="flex items-center justify-center gap-3 px-6 py-4 bg-violet-500 text-slate-50 font-semibold rounded-lg hover:bg-violet-600 transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                  <Search className="h-5 w-5" />
                  Browse Chapels
                </a>
              </Link>
              <Link href="/dashboard/favorites">
                <a className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-violet-500 text-violet-500 font-semibold rounded-lg hover:bg-violet-500 hover:text-slate-50 transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                  <Heart className="h-5 w-5" />
                  View Favorites
                </a>
              </Link>
              <Link href="/dashboard/bookings">
                <a className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-violet-500 text-violet-500 font-semibold rounded-lg hover:bg-violet-500 hover:text-slate-50 transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                  <Calendar className="h-5 w-5" />
                  My Bookings
                </a>
              </Link>
              <Link href="/dashboard/profile">
                <a className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-violet-500 text-violet-500 font-semibold rounded-lg hover:bg-violet-500 hover:text-slate-50 transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/30">
                  <User className="h-5 w-5" />
                  Update Profile
                </a>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </AppLayout>
  );
}
