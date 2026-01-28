import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Heart, MapPin, Users, Search, Calendar, Check, ArrowRight, ExclamationTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';
import { useState } from 'react';

interface Chapel {
  id: string;
  name: string;
  location: string;
  capacity: number;
  startingPrice: number;
  imageUrl: string;
}

interface Package {
  id: string;
  name: string;
  priceRange: string;
  features: string[];
}

export function Home() {
  const [, navigate] = useLocation();
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if user is authenticated (placeholder - will be replaced with actual auth)
  const isAuthenticated = false; // TODO: Replace with actual auth check
  const currentUserId = ''; // TODO: Replace with actual user ID

  // Fetch featured chapels
  const {
    data: chapelsData,
    isLoading: chapelsLoading,
    isError: chapelsError,
    refetch: refetchChapels,
  } = useQuery({
    queryKey: ['featured-chapels'],
    queryFn: async () => {
      const response = await apiClient.chapels.getChapels({
        query: {
          limit: 6,
          sortBy: 'recommended',
        },
      });
      return response;
    },
  });

  // Fetch popular packages
  const {
    data: packagesData,
    isLoading: packagesLoading,
  } = useQuery({
    queryKey: ['popular-packages'],
    queryFn: async () => {
      const response = await apiClient.packages.getPackages({
        query: {
          limit: 3,
        },
      });
      return response;
    },
  });

  // Fetch user favorites if authenticated
  useQuery({
    queryKey: ['user-favorites', currentUserId],
    queryFn: async () => {
      if (!isAuthenticated || !currentUserId) return null;
      const response = await apiClient.users.getFavorites({
        params: { id: currentUserId },
      });
      return response;
    },
    enabled: isAuthenticated && !!currentUserId,
  });

  // Handle favorite toggle
  const handleFavoriteToggle = async (chapelId: string) => {
    if (!isAuthenticated) {
      navigate('/sign-in?redirect=/');
      return;
    }

    setFavoriteLoading(chapelId);
    try {
      const isFavorited = favorites.has(chapelId);

      if (isFavorited) {
        await apiClient.users.removeFavorite({
          params: { id: currentUserId, chapelId },
        });
        setFavorites(prev => {
          const updated = new Set(prev);
          updated.delete(chapelId);
          return updated;
        });
      } else {
        await apiClient.users.addFavorite({
          params: { id: currentUserId, chapelId },
        });
        setFavorites(prev => new Set(prev).add(chapelId));
      }
    } catch {
      setToastMessage('Unable to update favorites. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setFavoriteLoading(null);
    }
  };

  // Handle CTA button click
  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/browse');
    } else {
      navigate('/sign-up');
    }
  };

  const featuredChapels = chapelsData?.data || [];
  const packages = packagesData?.data || [];

  return (
    <AppLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 w-[400px] bg-slate-800 border border-slate-700 border-l-4 border-l-red-500 rounded-lg shadow-lg p-4 flex items-start justify-between">
          <p className="text-neutral-50 text-sm">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-neutral-50 transition-colors"
            aria-label="Close notification"
          >
            <ExclamationTriangle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[500px] sm:h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1519167758481-83f29da8c7b4?w=1920&h=1080&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-slate-950 bg-opacity-40" />

        <div className="relative z-10 max-w-[800px] mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-4xl sm:text-4xl font-bold text-neutral-50 mb-6 leading-tight">
            Find Your Perfect Chapel
          </h1>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            Book your dream wedding venue in minutes. Browse hundreds of beautiful chapels across the country.
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => navigate('/browse')}
              className="bg-violet-500 text-neutral-50 px-8 py-4 rounded-lg font-semibold hover:bg-violet-600 transition-colors"
              aria-label="Find your perfect chapel and start browsing"
            >
              Find Your Perfect Chapel
            </button>

            <Link href="/packages" className="text-violet-500 font-medium hover:text-violet-600 hover:underline transition-all flex items-center gap-2">
              Explore Packages
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Chapels Section */}
      <section className="max-w-[1200px] mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-neutral-50 mb-4">Featured Chapels</h2>
          <p className="text-base text-slate-400">Discover our most popular wedding venues</p>
        </div>

        {/* Loading State */}
        {chapelsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden animate-pulse">
                <div className="h-60 bg-slate-700" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-700 rounded w-1/2" />
                  <div className="h-4 bg-slate-700 rounded w-1/3" />
                  <div className="h-10 bg-slate-700 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {chapelsError && (
          <div className="bg-slate-800 border border-slate-700 border-l-4 border-l-red-500 rounded-xl p-8 text-center max-w-md mx-auto">
            <ExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-neutral-50 mb-2">Unable to load chapels</h3>
            <p className="text-base text-slate-400 mb-6">Please check your connection and try again</p>
            <button
              onClick={() => refetchChapels()}
              className="border-2 border-violet-500 text-violet-500 px-6 py-3 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!chapelsLoading && !chapelsError && featuredChapels.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-md mx-auto">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-neutral-50 mb-2">No chapels available at the moment</h3>
            <p className="text-base text-slate-400 mb-6">Check back soon for amazing venues</p>
            <button
              onClick={() => navigate('/browse')}
              className="bg-violet-500 text-neutral-50 px-6 py-3 rounded-lg font-semibold hover:bg-violet-600 transition-colors"
            >
              Browse All Chapels
            </button>
          </div>
        )}

        {/* Chapel Grid */}
        {!chapelsLoading && !chapelsError && featuredChapels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredChapels.map((chapel: Chapel) => (
              <div
                key={chapel.id}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-violet-500 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(`/chapels/${chapel.id}`)}
                role="link"
                tabIndex={0}
                aria-label={`View details for ${chapel.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/chapels/${chapel.id}`);
                  }
                }}
              >
                <div className="relative h-60">
                  <img
                    src={`${chapel.imageUrl}?w=600&h=400&fit=crop`}
                    alt={`${chapel.name} - elegant wedding chapel`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(chapel.id);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-slate-800 bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    aria-label={favorites.has(chapel.id) ? `Remove ${chapel.name} from favorites` : `Add ${chapel.name} to favorites`}
                    disabled={favoriteLoading === chapel.id}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.has(chapel.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-slate-400'
                      } ${favoriteLoading === chapel.id ? 'animate-pulse' : ''}`}
                    />
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-bold text-neutral-50 mb-2">{chapel.name}</h3>

                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{chapel.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <Users className="w-4 h-4" />
                    <span>Up to {chapel.capacity} guests</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-violet-500">
                      From ${chapel.startingPrice}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chapels/${chapel.id}`);
                      }}
                      className="border-2 border-violet-500 text-violet-500 px-6 py-2 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="max-w-[1200px] mx-auto px-8 py-20 bg-slate-950">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-neutral-50 mb-4">How It Works</h2>
          <p className="text-base text-slate-400">Three simple steps to your dream wedding</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <div className="relative inline-block mb-6">
              <Search className="w-12 h-12 text-violet-500" />
              <span className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-neutral-50 font-bold text-sm border-2 border-violet-500">
                1
              </span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-50 mb-4">Browse Chapels</h3>
            <p className="text-base text-slate-400 leading-relaxed">
              Explore our curated collection of beautiful wedding chapels with detailed photos and information.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <div className="relative inline-block mb-6">
              <Calendar className="w-12 h-12 text-violet-500" />
              <span className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-neutral-50 font-bold text-sm border-2 border-violet-500">
                2
              </span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-50 mb-4">Select Date & Package</h3>
            <p className="text-base text-slate-400 leading-relaxed">
              Choose your preferred date and wedding package that fits your vision and budget.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <div className="relative inline-block mb-6">
              <Check className="w-12 h-12 text-emerald-500" />
              <span className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-neutral-50 font-bold text-sm border-2 border-emerald-500">
                3
              </span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-50 mb-4">Confirm Booking</h3>
            <p className="text-base text-slate-400 leading-relaxed">
              Complete your booking in minutes and receive instant confirmation with all the details.
            </p>
          </div>
        </div>
      </section>

      {/* Packages Preview Section */}
      <section className="max-w-[1200px] mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-neutral-50 mb-4">Popular Packages</h2>
          <p className="text-base text-slate-400">Find the perfect package for your special day</p>
        </div>

        {packagesLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-8 animate-pulse">
                <div className="h-8 bg-slate-700 rounded w-1/2 mb-4" />
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-6" />
                <div className="space-y-3 mb-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-slate-700 rounded" />
                  ))}
                </div>
                <div className="h-10 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        )}

        {!packagesLoading && packages.length === 0 && (
          <p className="text-base text-slate-400 text-center">Package information coming soon</p>
        )}

        {!packagesLoading && packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg: Package) => (
              <div key={pkg.id} className="bg-slate-800 border border-slate-700 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-neutral-50 mb-3">{pkg.name}</h3>
                <p className="text-xl font-semibold text-violet-500 mb-6">{pkg.priceRange}</p>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-400">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/packages')}
                  className="w-full border-2 border-violet-500 text-violet-500 px-6 py-3 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-all"
                >
                  View All Packages
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-[1000px] mx-auto px-8 py-20">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <h2 className="text-4xl font-bold text-neutral-50 mb-4">Start Planning Your Wedding Today</h2>
          <p className="text-base text-slate-400 mb-8 max-w-2xl mx-auto">
            Join thousands of happy couples who found their perfect chapel through our platform.
          </p>
          <button
            onClick={handleCtaClick}
            className="bg-violet-500 text-neutral-50 px-8 py-4 rounded-lg font-semibold hover:bg-violet-600 transition-colors"
          >
            Start Planning Your Wedding
          </button>
        </div>
      </section>
    </AppLayout>
  );
}
