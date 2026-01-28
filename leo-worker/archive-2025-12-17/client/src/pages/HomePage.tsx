import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api-client';
import { Search, Calendar, Building } from 'lucide-react';

interface Chapel {
  id: string;
  name: string;
  city: string;
  state: string;
  basePrice: number;
  images?: Array<{
    imageUrl: string;
    isPrimary: boolean;
  }>;
}

export default function HomePage() {
  const [, navigate] = useLocation();
  const [featuredChapels, setFeaturedChapels] = useState<Chapel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedChapels = async () => {
      try {
        const { body } = await apiClient.chapels.getChapels({
          query: {
            page: 1,
            limit: 3,
            isActive: true,
          },
        });

        setFeaturedChapels(body.chapels);
      } catch (error) {
        // Silently fail - home page works without featured chapels
        console.error('Failed to load featured chapels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedChapels();
  }, []);

  const handleBrowseChapels = () => {
    navigate('/chapels');
  };

  const handleCardClick = (destination: string) => {
    navigate(destination);
  };

  const handleChapelClick = (chapelId: string) => {
    navigate(`/chapels/${chapelId}`);
  };

  const getPrimaryImage = (chapel: Chapel): string => {
    if (!chapel.images || chapel.images.length === 0) {
      return '/placeholder-chapel.jpg';
    }

    const primaryImage = chapel.images.find(img => img.isPrimary);
    return primaryImage ? primaryImage.imageUrl : chapel.images[0].imageUrl;
  };

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-8 text-center">
        <h1 className="text-5xl md:text-4xl font-bold text-slate-50 leading-tight mb-6">
          Find Your Perfect Chapel
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          Book the ideal venue for your special day with ease
        </p>
        <button
          onClick={handleBrowseChapels}
          className="bg-violet-500 text-slate-50 px-8 py-3 rounded-lg text-base font-normal transition-colors duration-200 hover:bg-violet-600 cursor-pointer border-0"
          aria-label="Browse available chapels"
        >
          Browse Chapels
        </button>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 px-8">
        <h2 className="text-4xl font-bold text-slate-50 text-center mb-12">
          Why Choose Chapel Bookings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Feature Card 1 */}
          <article
            onClick={() => handleCardClick('/chapels')}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 cursor-pointer transition-colors duration-200 hover:border-violet-500 focus:border-violet-500 focus:outline-none"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick('/chapels');
              }
            }}
          >
            <div className="mb-4 text-violet-500">
              <Search size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-50 mt-4 mb-3">
              Search & Filter
            </h3>
            <p className="text-base text-slate-400 leading-normal">
              Browse hundreds of chapels and find exactly what you need
            </p>
          </article>

          {/* Feature Card 2 */}
          <article
            onClick={() => handleCardClick('/register?role=couple')}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 cursor-pointer transition-colors duration-200 hover:border-violet-500 focus:border-violet-500 focus:outline-none"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick('/register?role=couple');
              }
            }}
          >
            <div className="mb-4 text-violet-500">
              <Calendar size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-50 mt-4 mb-3">
              Easy Booking
            </h3>
            <p className="text-base text-slate-400 leading-normal">
              Request bookings instantly and get quick confirmations
            </p>
          </article>

          {/* Feature Card 3 */}
          <article
            onClick={() => handleCardClick('/register?role=chapel_owner')}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 cursor-pointer transition-colors duration-200 hover:border-violet-500 focus:border-violet-500 focus:outline-none"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick('/register?role=chapel_owner');
              }
            }}
          >
            <div className="mb-4 text-violet-500">
              <Building size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-50 mt-4 mb-3">
              List Your Chapel
            </h3>
            <p className="text-base text-slate-400 leading-normal">
              Chapel owners can manage listings and bookings in one place
            </p>
          </article>
        </div>
      </section>

      {/* Chapel Preview Section */}
      {!isLoading && featuredChapels.length > 0 && (
        <section className="py-16 px-8">
          <h2 className="text-4xl font-bold text-slate-50 text-center mb-12">
            Featured Chapels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-8">
            {featuredChapels.map((chapel) => (
              <article
                key={chapel.id}
                onClick={() => handleChapelClick(chapel.id)}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden cursor-pointer transition-colors duration-200 hover:border-violet-500 focus:border-violet-500 focus:outline-none"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleChapelClick(chapel.id);
                  }
                }}
              >
                <img
                  src={getPrimaryImage(chapel)}
                  alt={`Photo of ${chapel.name}`}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-50 mb-2">
                    {chapel.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-3">
                    {chapel.city}, {chapel.state}
                  </p>
                  <p className="text-base text-violet-500 font-normal">
                    ${chapel.basePrice} base price
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={handleBrowseChapels}
              className="bg-transparent text-violet-500 border border-violet-500 px-8 py-3 rounded-lg text-base font-normal transition-colors duration-200 hover:bg-violet-500/10 cursor-pointer"
            >
              View All Chapels
            </button>
          </div>
        </section>
      )}

      {/* Loading State for Featured Chapels */}
      {isLoading && (
        <section className="py-16 px-8">
          <h2 className="text-4xl font-bold text-slate-50 text-center mb-12">
            Featured Chapels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-slate-800 rounded-xl overflow-hidden animate-pulse"
                style={{ height: '300px' }}
              >
                <div className="w-full h-48 bg-slate-700"></div>
                <div className="p-6">
                  <div className="h-5 bg-slate-700 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded mb-3 w-1/2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA Section */}
      <section className="bg-slate-800 border-t border-slate-700 py-12 px-8 text-center">
        <h2 className="text-4xl md:text-3xl font-bold text-slate-50 mb-6">
          Ready to Find Your Chapel?
        </h2>
        <button
          onClick={handleBrowseChapels}
          className="bg-violet-500 text-slate-50 px-8 py-3 rounded-lg text-base font-normal transition-colors duration-200 hover:bg-violet-600 cursor-pointer border-0"
        >
          Get Started
        </button>
      </section>
    </AppLayout>
  );
}
