import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';
import {
  Heart,
  MapPin,
  Users,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';

// Types
interface Chapel {
  id: string;
  name: string;
  location: string;
  capacity: number;
  priceStarting: number;
  imageUrl: string;
  amenities: string[];
  hasAvailableSlots: boolean;
}

interface ChapelsResponse {
  chapels: Chapel[];
  total: number;
  totalPages: number;
  currentPage: number;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'capacity' | 'rating';

const AMENITIES_OPTIONS = [
  'Photography Included',
  'Live Streaming',
  'Reception Hall',
  'Garden/Outdoor Space',
  'Parking Available',
  'Wheelchair Accessible',
  'Bridal Suite',
  'Music/DJ Services'
];

const LOCATIONS = [
  'All Locations',
  'Las Vegas',
  'Los Angeles',
  'San Francisco',
  'San Diego',
  'Phoenix'
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'capacity', label: 'Capacity' },
  { value: 'rating', label: 'Rating' }
];

const PRICE_RANGES = [
  { label: '$', min: 0, max: 500 },
  { label: '$$', min: 500, max: 1000 },
  { label: '$$$', min: 1000, max: 2500 },
  { label: '$$$$', min: 2500, max: 10000 }
];

export function BrowseChapels() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Filter state
  const [location, setLocation] = useState('All Locations');
  const [minGuests, setMinGuests] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const [priceRangeIndex, setPriceRangeIndex] = useState(3); // Default to $$$$
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Get current user ID from auth context (assuming it's available)
  const currentUserId = localStorage.getItem('userId') || null;
  const isAuthenticated = !!currentUserId;

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: currentPage,
      limit: 24,
      sortBy
    };

    if (location !== 'All Locations') params.location = location;
    if (minGuests) params.minCapacity = parseInt(minGuests);
    if (maxGuests) params.maxCapacity = parseInt(maxGuests);

    const selectedRange = PRICE_RANGES[priceRangeIndex];
    if (selectedRange) {
      params.minPrice = selectedRange.min;
      params.maxPrice = selectedRange.max;
    }

    if (selectedAmenities.length > 0) {
      params.amenities = selectedAmenities.join(',');
    }

    return params;
  }, [location, minGuests, maxGuests, priceRangeIndex, selectedAmenities, sortBy, currentPage]);

  // Fetch chapels
  const { data, isLoading, isError, refetch } = useQuery<ChapelsResponse>({
    queryKey: ['chapels', queryParams],
    queryFn: async () => {
      const response = await apiClient.chapels.getChapels({ query: queryParams });
      return response.data;
    }
  });

  // Fetch user favorites
  const { data: favoritesData } = useQuery({
    queryKey: ['favorites', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { favorites: [] };
      const response = await apiClient.users.getFavorites({ params: { id: currentUserId } });
      return response.data;
    },
    enabled: isAuthenticated
  });

  const favoriteChapelIds = useMemo(() => {
    return favoritesData?.favorites?.map((f: any) => f.chapelId) || [];
  }, [favoritesData]);

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (chapelId: string) => {
      if (!currentUserId) throw new Error('Not authenticated');
      return apiClient.users.addFavorite({
        params: { id: currentUserId, chapelId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUserId] });
    }
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (chapelId: string) => {
      if (!currentUserId) throw new Error('Not authenticated');
      return apiClient.users.removeFavorite({
        params: { id: currentUserId, chapelId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUserId] });
    }
  });

  // Handle favorite toggle
  const handleFavoriteToggle = (chapelId: string, isFavorited: boolean) => {
    if (!isAuthenticated) {
      navigate(`/sign-in?redirect=/browse`);
      return;
    }

    if (isFavorited) {
      removeFavoriteMutation.mutate(chapelId);
    } else {
      addFavoriteMutation.mutate(chapelId);
    }
  };

  // Handle amenity toggle
  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
    setCurrentPage(1); // Reset to page 1
  };

  // Clear all filters
  const handleClearFilters = () => {
    setLocation('All Locations');
    setMinGuests('');
    setMaxGuests('');
    setPriceRangeIndex(3);
    setSelectedAmenities([]);
    setSortBy('recommended');
    setCurrentPage(1);
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (location !== 'All Locations') count++;
    if (minGuests || maxGuests) count++;
    if (priceRangeIndex !== 3) count++;
    if (selectedAmenities.length > 0) count += selectedAmenities.length;
    return count;
  }, [location, minGuests, maxGuests, priceRangeIndex, selectedAmenities]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-5xl font-bold text-neutral-50 mb-4">
            Find Your Perfect Chapel
          </h1>
          <p className="text-slate-400 text-base">
            Browse our collection of beautiful wedding venues
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden w-full mb-6 px-6 py-3 bg-slate-800 border-2 border-violet-500 text-violet-500 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-violet-500 hover:text-neutral-50 transition-colors"
        >
          <Filter className="w-5 h-5" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-violet-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex gap-6">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-slate-800 rounded-xl p-6 sticky top-20">
              <FilterSidebar
                location={location}
                setLocation={setLocation}
                minGuests={minGuests}
                setMinGuests={setMinGuests}
                maxGuests={maxGuests}
                setMaxGuests={setMaxGuests}
                priceRangeIndex={priceRangeIndex}
                setPriceRangeIndex={setPriceRangeIndex}
                selectedAmenities={selectedAmenities}
                handleAmenityToggle={handleAmenityToggle}
                handleClearFilters={handleClearFilters}
                activeFiltersCount={activeFiltersCount}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm">
              <div className="fixed left-0 top-0 bottom-0 w-[320px] bg-slate-800 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-50">Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
                <FilterSidebar
                  location={location}
                  setLocation={setLocation}
                  minGuests={minGuests}
                  setMinGuests={setMinGuests}
                  maxGuests={maxGuests}
                  setMaxGuests={setMaxGuests}
                  priceRangeIndex={priceRangeIndex}
                  setPriceRangeIndex={setPriceRangeIndex}
                  selectedAmenities={selectedAmenities}
                  handleAmenityToggle={handleAmenityToggle}
                  handleClearFilters={handleClearFilters}
                  activeFiltersCount={activeFiltersCount}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="text-slate-400 text-sm">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent" />
                    Loading...
                  </span>
                ) : (
                  `Showing ${data?.chapels.length || 0} of ${data?.total || 0} chapels`
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-slate-400 text-sm">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as SortOption);
                      setCurrentPage(1);
                    }}
                    className="bg-slate-800 border border-slate-700 text-neutral-50 px-4 py-2 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-slate-700 text-violet-500'
                        : 'bg-transparent text-slate-400 hover:bg-slate-700'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-slate-700 text-violet-500'
                        : 'bg-transparent text-slate-400 hover:bg-slate-700'
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {isLoading && <LoadingState viewMode={viewMode} />}

            {isError && (
              <ErrorState onRetry={() => refetch()} onGoHome={() => navigate('/')} />
            )}

            {!isLoading && !isError && data?.chapels.length === 0 && (
              <EmptyState onClearFilters={handleClearFilters} />
            )}

            {!isLoading && !isError && data && data.chapels.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.chapels.map(chapel => (
                      <ChapelCard
                        key={chapel.id}
                        chapel={chapel}
                        isFavorited={favoriteChapelIds.includes(chapel.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {data.chapels.map(chapel => (
                      <ChapelListItem
                        key={chapel.id}
                        chapel={chapel}
                        isFavorited={favoriteChapelIds.includes(chapel.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={data.totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Filter Sidebar Component
function FilterSidebar({
  location,
  setLocation,
  minGuests,
  setMinGuests,
  maxGuests,
  setMaxGuests,
  priceRangeIndex,
  setPriceRangeIndex,
  selectedAmenities,
  handleAmenityToggle,
  handleClearFilters,
  activeFiltersCount,
  setCurrentPage
}: any) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-50 flex items-center gap-2">
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-violet-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </h2>
        <button
          onClick={handleClearFilters}
          className={`text-sm font-medium transition-colors ${
            activeFiltersCount > 0 ? 'text-violet-500 hover:text-violet-400' : 'text-slate-500'
          }`}
          disabled={activeFiltersCount === 0}
        >
          Clear All
        </button>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-slate-400 text-sm font-medium mb-2">
          Location
        </label>
        <select
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-slate-800 border border-slate-700 text-neutral-50 px-4 py-3 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        >
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Capacity Filter */}
      <div>
        <label className="block text-slate-400 text-sm font-medium mb-2">
          Guest Capacity
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={minGuests}
            onChange={(e) => {
              setMinGuests(e.target.value);
              setCurrentPage(1);
            }}
            min="1"
            className="bg-slate-800 border border-slate-700 text-neutral-50 px-4 py-3 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxGuests}
            onChange={(e) => {
              setMaxGuests(e.target.value);
              setCurrentPage(1);
            }}
            min="1"
            className="bg-slate-800 border border-slate-700 text-neutral-50 px-4 py-3 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-slate-400 text-sm font-medium mb-2">
          Price Range
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="3"
            value={priceRangeIndex}
            onChange={(e) => {
              setPriceRangeIndex(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-sm">
            {PRICE_RANGES.map((range, idx) => (
              <span
                key={idx}
                className={idx <= priceRangeIndex ? 'text-violet-500 font-medium' : 'text-slate-500'}
              >
                {range.label}
              </span>
            ))}
          </div>
          <p className="text-slate-400 text-sm text-center">
            ${PRICE_RANGES[priceRangeIndex].min} - ${PRICE_RANGES[priceRangeIndex].max}
          </p>
        </div>
      </div>

      {/* Amenities Filter */}
      <div>
        <label className="block text-slate-400 text-sm font-medium mb-2">
          Amenities
        </label>
        <div className="space-y-2">
          {AMENITIES_OPTIONS.map(amenity => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
                className="w-5 h-5 bg-slate-800 border-2 border-slate-700 rounded checked:bg-violet-500 checked:border-violet-500 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
              />
              <span className="text-neutral-50 text-base group-hover:text-violet-400 transition-colors">
                {amenity}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Chapel Card Component
function ChapelCard({
  chapel,
  isFavorited,
  onFavoriteToggle,
  isAuthenticated
}: {
  chapel: Chapel;
  isFavorited: boolean;
  onFavoriteToggle: (id: string, isFavorited: boolean) => void;
  isAuthenticated: boolean;
}) {
  const [, navigate] = useLocation();

  const handleCardClick = () => {
    navigate(`/chapels/${chapel.id}`);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      navigate(`/booking/new/${chapel.id}`);
    } else {
      navigate(`/sign-in?redirect=/booking/new/${chapel.id}`);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle(chapel.id, isFavorited);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden cursor-pointer transition-all hover:border-violet-500 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-64">
        <img
          src={chapel.imageUrl || `https://source.unsplash.com/600x400/?wedding-chapel,${chapel.id}`}
          alt={chapel.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2 bg-slate-950/60 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorited ? 'fill-violet-500 text-violet-500' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-neutral-50 mb-3">
          {chapel.name}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <MapPin className="w-4 h-4" />
            {chapel.location}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            Up to {chapel.capacity} guests
          </div>
        </div>

        <p className="text-violet-500 text-base font-semibold mb-4">
          Starting at ${chapel.priceStarting.toLocaleString()}
        </p>

        {/* Amenities Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {chapel.amenities.slice(0, 3).map(amenity => (
            <span
              key={amenity}
              className="bg-slate-700 text-neutral-50 text-sm px-3 py-1 rounded-full"
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCardClick}
            className="flex-1 px-6 py-3 bg-transparent border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors"
          >
            View Details
          </button>
          {chapel.hasAvailableSlots && (
            <button
              onClick={handleBookNow}
              className="flex-1 px-6 py-3 bg-violet-500 text-neutral-50 rounded-lg font-semibold hover:bg-violet-600 transition-colors"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Chapel List Item Component
function ChapelListItem({
  chapel,
  isFavorited,
  onFavoriteToggle,
  isAuthenticated
}: {
  chapel: Chapel;
  isFavorited: boolean;
  onFavoriteToggle: (id: string, isFavorited: boolean) => void;
  isAuthenticated: boolean;
}) {
  const [, navigate] = useLocation();

  const handleCardClick = () => {
    navigate(`/chapels/${chapel.id}`);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      navigate(`/booking/new/${chapel.id}`);
    } else {
      navigate(`/sign-in?redirect=/booking/new/${chapel.id}`);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle(chapel.id, isFavorited);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden cursor-pointer transition-all hover:border-violet-500 hover:shadow-xl flex flex-col sm:flex-row"
    >
      {/* Image */}
      <div className="relative w-full sm:w-80 h-48 sm:h-auto flex-shrink-0">
        <img
          src={chapel.imageUrl || `https://source.unsplash.com/600x400/?wedding-chapel,${chapel.id}`}
          alt={chapel.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2 bg-slate-950/60 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorited ? 'fill-violet-500 text-violet-500' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-neutral-50 mb-3">
            {chapel.name}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="w-4 h-4" />
              {chapel.location}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Users className="w-4 h-4" />
              Up to {chapel.capacity} guests
            </div>
          </div>

          <p className="text-violet-500 text-base font-semibold mb-4">
            Starting at ${chapel.priceStarting.toLocaleString()}
          </p>

          {/* Amenities Tags */}
          <div className="flex flex-wrap gap-2">
            {chapel.amenities.slice(0, 3).map(amenity => (
              <span
                key={amenity}
                className="bg-slate-700 text-neutral-50 text-sm px-3 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-3 sm:w-40">
          <button
            onClick={handleCardClick}
            className="flex-1 sm:flex-none px-6 py-3 bg-transparent border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors"
          >
            View Details
          </button>
          {chapel.hasAvailableSlots && (
            <button
              onClick={handleBookNow}
              className="flex-1 sm:flex-none px-6 py-3 bg-violet-500 text-neutral-50 rounded-lg font-semibold hover:bg-violet-600 transition-colors"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading State Component
function LoadingState({ viewMode }: { viewMode: ViewMode }) {
  const skeletonCards = Array.from({ length: 9 }, (_, i) => i);

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {skeletonCards.map(i => (
          <div key={i} className="bg-slate-800 rounded-xl overflow-hidden animate-pulse flex">
            <div className="w-80 h-48 bg-slate-700" />
            <div className="flex-1 p-6 space-y-4">
              <div className="h-6 bg-slate-700 rounded w-3/4" />
              <div className="h-4 bg-slate-700 rounded w-1/2" />
              <div className="h-4 bg-slate-700 rounded w-1/3" />
              <div className="flex gap-2">
                <div className="h-6 bg-slate-700 rounded w-20" />
                <div className="h-6 bg-slate-700 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletonCards.map(i => (
        <div key={i} className="bg-slate-800 rounded-xl overflow-hidden animate-pulse">
          <div className="h-64 bg-slate-700" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-700 rounded w-3/4" />
            <div className="h-4 bg-slate-700 rounded w-1/2" />
            <div className="h-4 bg-slate-700 rounded w-1/3" />
            <div className="flex gap-2">
              <div className="h-6 bg-slate-700 rounded w-20" />
              <div className="h-6 bg-slate-700 rounded w-24" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-slate-700 rounded flex-1" />
              <div className="h-10 bg-slate-700 rounded flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty State Component
function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="w-16 h-16 text-slate-500 mb-4" />
      <h2 className="text-4xl font-bold text-neutral-50 mb-3">
        No Chapels Found
      </h2>
      <p className="text-slate-400 text-base mb-6">
        Try adjusting your filters or search criteria
      </p>
      <button
        onClick={onClearFilters}
        className="px-6 py-3 bg-transparent border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}

// Error State Component
function ErrorState({ onRetry, onGoHome }: { onRetry: () => void; onGoHome: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-slate-800 rounded-xl p-8 max-w-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-50 mb-3">
          Unable to Load Chapels
        </h2>
        <p className="text-slate-400 text-base mb-6">
          We're having trouble loading chapel listings. Please try again.
        </p>
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-violet-500 text-neutral-50 rounded-lg font-semibold hover:bg-violet-600 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={onGoHome}
            className="w-full text-violet-500 hover:text-violet-400 font-medium transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-transparent border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-violet-500 flex items-center gap-2"
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </button>

      {getPageNumbers().map((page, idx) => (
        typeof page === 'number' ? (
          <button
            key={idx}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
              currentPage === page
                ? 'bg-violet-500 text-white'
                : 'bg-slate-800 text-neutral-50 hover:bg-slate-700'
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={idx} className="px-2 text-slate-400">
            {page}
          </span>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-transparent border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-violet-500 flex items-center gap-2"
      >
        Next
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
