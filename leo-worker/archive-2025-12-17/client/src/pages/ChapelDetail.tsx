import { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';
import {
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  inclusions: string[];
}

interface Chapel {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: number;
  priceRange: string;
  amenities: string[];
}

interface ChapelImage {
  id: string;
  url: string;
  alt: string;
}

export function ChapelDetail() {
  const [, params] = useRoute('/chapels/:id');
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const chapelId = params?.id || '';

  // State management
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'availability'>('overview');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [modalPackage, setModalPackage] = useState<Package | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('authToken');
  const currentUserId = localStorage.getItem('userId');

  // Fetch chapel details
  const { data: chapel, isLoading: chapelLoading, error: chapelError } = useQuery({
    queryKey: ['chapel', chapelId],
    queryFn: async () => {
      const response = await apiClient.chapels.getChapel({ params: { id: chapelId } });
      return response.data as Chapel;
    },
  });

  // Fetch chapel images
  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ['chapelImages', chapelId],
    queryFn: async () => {
      const response = await apiClient.chapels.getChapelImages({ params: { id: chapelId } });
      return response.data as ChapelImage[];
    },
  });

  // Fetch packages
  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['packages', chapelId],
    queryFn: async () => {
      const response = await apiClient.packages.getPackagesByChapel({ params: { chapelId } });
      return response.data as Package[];
    },
  });

  // Fetch availability
  const { data: availableSlots, isLoading: slotsLoading, error: slotsError, refetch: refetchSlots } = useQuery({
    queryKey: ['timeSlots', chapelId, currentMonth, currentYear, selectedDate],
    queryFn: async () => {
      const query: any = { month: currentMonth + 1, year: currentYear };
      if (selectedDate) {
        query.date = selectedDate.toISOString().split('T')[0];
      }
      const response = await apiClient.timeSlots.getAvailableSlots({
        params: { chapelId },
        query,
      });
      return response.data as TimeSlot[];
    },
  });

  // Fetch favorites if authenticated
  const { data: favorites } = useQuery({
    queryKey: ['favorites', currentUserId],
    queryFn: async () => {
      if (!isAuthenticated || !currentUserId) return [];
      const response = await apiClient.users.getFavorites({ params: { id: currentUserId } });
      return response.data as { chapelId: string }[];
    },
    enabled: isAuthenticated && !!currentUserId,
  });

  const isFavorited = favorites?.some((fav) => fav.chapelId === chapelId) || false;

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('Not authenticated');
      await apiClient.users.addFavorite({ params: { id: currentUserId, chapelId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUserId] });
      showToast('Added to favorites!', 'success');
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('Not authenticated');
      await apiClient.users.removeFavorite({ params: { id: currentUserId, chapelId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUserId] });
      showToast('Removed from favorites', 'success');
    },
  });

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Favorite toggle handler
  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      navigate(`/sign-in?redirect=/chapels/${chapelId}`);
      return;
    }

    if (isFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  // Package selection handler
  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
    setActiveTab('availability');
    showToast('Package selected! Choose your date below.', 'success');
    setTimeout(() => {
      document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Date selection handler
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlotId(null);
  };

  // Time slot selection handler
  const handleTimeSlotSelect = async (slotId: string) => {
    // Verify slot is still available
    try {
      const response = await apiClient.timeSlots.checkSlotAvailability({ params: { id: slotId } });
      if (response.data.isAvailable) {
        setSelectedTimeSlotId(slotId);
      } else {
        showToast('This time slot was just booked. Please select another.', 'warning');
        refetchSlots();
      }
    } catch {
      showToast('Error checking availability. Please try again.', 'error');
    }
  };

  // Continue to booking handler
  const handleContinueToBooking = () => {
    if (!selectedPackageId || !selectedDate || !selectedTimeSlotId) return;

    const dateString = selectedDate.toISOString().split('T')[0];
    const bookingUrl = `/booking/new/${chapelId}?package=${selectedPackageId}&date=${dateString}&time=${selectedTimeSlotId}`;

    if (isAuthenticated) {
      navigate(bookingUrl);
    } else {
      navigate(`/sign-in?redirect=${encodeURIComponent(bookingUrl)}`);
    }
  };

  // Month navigation
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedTimeSlotId(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedTimeSlotId(null);
  };

  // Lightbox navigation
  const handlePreviousImage = () => {
    if (!images) return;
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!images) return;
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showLightbox) return;
      if (e.key === 'Escape') setShowLightbox(false);
      if (e.key === 'ArrowLeft') handlePreviousImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, images]);

  // Generate calendar dates
  const generateCalendarDates = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const dates: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      dates.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(currentYear, currentMonth, day));
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Check if a date has availability
  const hasAvailability = (date: Date | null) => {
    if (!date || !availableSlots) return false;
    const dateString = date.toISOString().split('T')[0];
    return availableSlots.some((slot: any) => slot.date === dateString && slot.isAvailable);
  };

  // Loading state
  if (chapelLoading || imagesLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse">
          <div className="w-full h-[600px] bg-slate-700" />
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="h-12 bg-slate-700 rounded w-1/2 mb-4" />
            <div className="h-6 bg-slate-700 rounded w-1/3 mb-8" />
            <div className="grid grid-cols-3 gap-6">
              <div className="h-64 bg-slate-700 rounded" />
              <div className="h-64 bg-slate-700 rounded" />
              <div className="h-64 bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (chapelError) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-8 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Load Chapel</h1>
          <p className="text-slate-400 mb-8">
            We couldn't load this chapel's details. It may have been removed or the link is incorrect.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-white transition-colors"
            >
              Try Again
            </button>
            <Link href="/browse">
              <a className="px-6 py-3 bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600 transition-colors">
                Browse All Chapels
              </a>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!chapel) return null;

  const selectedPackage = packages?.find((pkg) => pkg.id === selectedPackageId);
  const selectedTimeSlot = availableSlots?.find((slot: any) => slot.id === selectedTimeSlotId);

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/">
              <a className="text-violet-500 hover:text-violet-400">Home</a>
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <Link href="/browse">
              <a className="text-violet-500 hover:text-violet-400">Browse Chapels</a>
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-400">{chapel.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div
          className="w-full h-[600px] bg-slate-900 cursor-pointer"
          onClick={() => setShowLightbox(true)}
        >
          {images && images.length > 0 && (
            <img
              src={images[selectedImageIndex]?.url}
              alt={images[selectedImageIndex]?.alt}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-6 right-6 p-3 bg-slate-800/80 backdrop-blur-sm rounded-lg hover:bg-slate-700 transition-colors"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-8 h-8 ${isFavorited ? 'fill-violet-500 text-violet-500' : 'text-white'}`}
          />
        </button>
      </div>

      {/* Thumbnail Strip */}
      {images && images.length > 1 && (
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex gap-4 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex ? 'border-violet-500' : 'border-transparent'
                  }`}
                >
                  <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Chapel Info */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-white mb-2">{chapel.name}</h1>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{chapel.location}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b-2 border-slate-700 mb-8">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 px-1 font-medium transition-colors relative ${
                    activeTab === 'overview' ? 'text-violet-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Overview
                  {activeTab === 'overview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('packages')}
                  className={`pb-3 px-1 font-medium transition-colors relative ${
                    activeTab === 'packages' ? 'text-violet-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Packages & Pricing
                  {activeTab === 'packages' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`pb-3 px-1 font-medium transition-colors relative ${
                    activeTab === 'availability' ? 'text-violet-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Check Availability
                  {activeTab === 'availability' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                  )}
                </button>
                <button
                  disabled
                  className="pb-3 px-1 font-medium text-slate-500 cursor-not-allowed"
                  title="Reviews coming in Phase 2"
                >
                  Reviews (Coming Soon)
                </button>
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">{chapel.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-700 rounded-lg px-4 py-3 text-center">
                    <div className="text-white font-semibold">{chapel.capacity} Guests</div>
                    <div className="text-slate-400 text-sm">Capacity</div>
                  </div>
                  <div className="bg-violet-500 rounded-lg px-4 py-3 text-center">
                    <div className="text-white font-semibold">{chapel.priceRange}</div>
                    <div className="text-white text-sm">Price Range</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg px-4 py-3 text-center">
                    <div className="text-white font-semibold flex items-center justify-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{chapel.location}</span>
                    </div>
                    <div className="text-slate-400 text-sm">Location</div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {chapel.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-white">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div>
                <h2 className="text-4xl font-bold text-white mb-8">Available Packages</h2>
                {packagesLoading ? (
                  <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-64 bg-slate-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : packages && packages.length > 0 ? (
                  <div className="grid gap-6">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`bg-slate-800 border rounded-xl p-6 transition-colors ${
                          selectedPackageId === pkg.id
                            ? 'border-violet-500'
                            : 'border-slate-700 hover:border-violet-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">{pkg.name}</h3>
                            <p className="text-slate-400 text-sm">{pkg.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-violet-500">${pkg.price}</div>
                            <div className="text-slate-400 text-sm">/ceremony</div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="grid grid-cols-2 gap-2">
                            {pkg.inclusions.slice(0, 6).map((inclusion, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <span className="text-white text-sm">{inclusion}</span>
                              </div>
                            ))}
                          </div>
                          {pkg.inclusions.length > 6 && (
                            <button
                              onClick={() => {
                                setModalPackage(pkg);
                                setShowPackageModal(true);
                              }}
                              className="text-violet-500 text-sm mt-2 hover:text-violet-400"
                            >
                              View full package details
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handlePackageSelect(pkg.id)}
                          className="w-full py-3 bg-violet-500 text-white font-semibold rounded-lg hover:bg-violet-600 transition-colors"
                        >
                          Select This Package
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">No Packages Available</h3>
                    <p className="text-slate-400 mb-6">
                      This chapel is currently not offering packages. Please contact them directly for pricing.
                    </p>
                    <Link href={`/contact?chapel=${chapelId}`}>
                      <a className="inline-block px-6 py-3 bg-violet-500 text-white font-semibold rounded-lg hover:bg-violet-600">
                        Contact Chapel
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Availability Tab */}
            {activeTab === 'availability' && (
              <div id="availability-section">
                <h2 className="text-4xl font-bold text-white mb-8">Book Your Date</h2>

                {/* Calendar */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={handlePreviousMonth}
                      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-6 h-6 text-slate-400 hover:text-violet-500" />
                    </button>
                    <h3 className="text-2xl font-bold text-white">
                      {monthNames[currentMonth]} {currentYear}
                    </h3>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-6 h-6 text-slate-400 hover:text-violet-500" />
                    </button>
                  </div>

                  {slotsError ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                      <p className="text-red-400 mb-4">Unable to load availability. Please try again.</p>
                      <button
                        onClick={() => refetchSlots()}
                        className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {calendarDates.map((date, index) => {
                          if (!date) {
                            return <div key={`empty-${index}`} />;
                          }

                          const isAvailable = hasAvailability(date);
                          const isSelected = selectedDate?.toDateString() === date.toDateString();
                          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                          return (
                            <button
                              key={date.toISOString()}
                              onClick={() => isAvailable && handleDateSelect(date)}
                              disabled={!isAvailable || isPast}
                              className={`relative aspect-square rounded-lg p-2 text-center transition-colors ${
                                isSelected
                                  ? 'bg-violet-500 text-white border-2 border-violet-400'
                                  : isAvailable
                                  ? 'bg-slate-800 text-white hover:border-2 hover:border-violet-500'
                                  : 'bg-slate-950 text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              <span className="text-sm">{date.getDate()}</span>
                              {isAvailable && !isSelected && (
                                <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {!slotsLoading && availableSlots && availableSlots.length === 0 && (
                        <div className="text-center py-8 mt-4">
                          <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                          <p className="text-slate-400">
                            No availability in {monthNames[currentMonth]}. Try another month.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Available times for {selectedDate.toLocaleDateString()}
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {availableSlots
                        ?.filter((slot: any) => slot.date === selectedDate.toISOString().split('T')[0])
                        .map((slot: any) => (
                          <button
                            key={slot.id}
                            onClick={() => handleTimeSlotSelect(slot.id)}
                            disabled={!slot.isAvailable}
                            className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                              selectedTimeSlotId === slot.id
                                ? 'bg-violet-500 text-white border-2 border-violet-400'
                                : slot.isAvailable
                                ? 'border-2 border-slate-700 text-white hover:border-violet-500'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-slate-800 border border-violet-500 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4">{chapel.name}</h3>

              {selectedPackage && (
                <div className="mb-3">
                  <div className="text-slate-400 text-sm">Package</div>
                  <div className="text-white font-semibold">{selectedPackage.name}</div>
                  <div className="text-violet-500 font-bold">${selectedPackage.price}</div>
                </div>
              )}

              {selectedDate && (
                <div className="mb-3">
                  <div className="text-slate-400 text-sm">Date</div>
                  <div className="text-white font-semibold">{selectedDate.toLocaleDateString()}</div>
                </div>
              )}

              {selectedTimeSlot && (
                <div className="mb-3">
                  <div className="text-slate-400 text-sm">Time</div>
                  <div className="text-white font-semibold">{selectedTimeSlot.time}</div>
                </div>
              )}

              <div className="h-px bg-slate-700 my-4" />

              {selectedPackage && (
                <div className="mb-6">
                  <div className="text-slate-400 text-sm">Total</div>
                  <div className="text-4xl font-bold text-violet-500">${selectedPackage.price}</div>
                </div>
              )}

              <button
                onClick={handleContinueToBooking}
                disabled={!selectedPackageId || !selectedTimeSlotId}
                className="w-full py-4 bg-violet-500 text-white text-lg font-semibold rounded-lg hover:bg-violet-600 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed mb-4"
              >
                Continue to Booking
              </button>

              <Link href={`/contact?chapel=${chapelId}`}>
                <a className="block w-full py-3 border-2 border-violet-500 text-violet-500 text-center font-semibold rounded-lg hover:bg-violet-500 hover:text-white transition-colors">
                  Contact Chapel
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && images && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLightbox(false);
            }}
            className="absolute top-6 right-6 p-3 bg-slate-800/80 rounded-lg hover:bg-red-500/80 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePreviousImage();
            }}
            className="absolute left-6 p-4 bg-slate-800/80 rounded-lg hover:bg-violet-500/80 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextImage();
            }}
            className="absolute right-6 p-4 bg-slate-800/80 rounded-lg hover:bg-violet-500/80 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          <img
            src={images[selectedImageIndex]?.url}
            alt={images[selectedImageIndex]?.alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800/80 rounded-full text-white">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {showPackageModal && modalPackage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPackageModal(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPackageModal(false)}
              className="float-right p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-slate-400 hover:text-white" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-2">{modalPackage.name}</h3>
            <div className="text-4xl font-bold text-violet-500 mb-6">${modalPackage.price}</div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">What's Included</h4>
              <div className="grid grid-cols-2 gap-3">
                {modalPackage.inclusions.map((inclusion, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-white text-sm">{inclusion}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">Terms & Conditions</h4>
              <p className="text-slate-400 text-sm">
                All packages require a deposit upon booking. Final payment due 30 days before ceremony date.
                Cancellations made more than 60 days in advance receive a full refund minus deposit.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">Cancellation Policy</h4>
              <p className="text-slate-400 text-sm">
                60+ days: Full refund minus deposit. 30-59 days: 50% refund. Less than 30 days: No refund.
              </p>
            </div>

            <button
              onClick={() => {
                handlePackageSelect(modalPackage.id);
                setShowPackageModal(false);
              }}
              className="w-full py-3 bg-violet-500 text-white font-semibold rounded-lg hover:bg-violet-600 transition-colors"
            >
              Select This Package
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div
            className={`bg-slate-800 border rounded-lg p-4 shadow-xl max-w-md flex items-start gap-3 ${
              toast.type === 'success'
                ? 'border-l-4 border-l-emerald-500'
                : toast.type === 'error'
                ? 'border-l-4 border-l-red-500'
                : 'border-l-4 border-l-amber-500'
            }`}
          >
            {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
            <p className="text-white text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
