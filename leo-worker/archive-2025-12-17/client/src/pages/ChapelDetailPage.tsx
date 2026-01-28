import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
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
  altText: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  inclusions: string[];
  terms: string;
  cancellationPolicy: string;
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  isAvailable: boolean;
}

type TabType = 'overview' | 'packages' | 'availability' | 'reviews';

export default function ChapelDetailPage() {
  const [, params] = useRoute('/chapels/:id');
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const chapelId = params?.id || '';

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [modalPackage, setModalPackage] = useState<Package | null>(null);

  // Check authentication
  const isAuthenticated = Boolean(localStorage.getItem('authToken'));
  const currentUserId = localStorage.getItem('userId') || '';

  // Fetch chapel details
  const { data: chapel, isLoading: isLoadingChapel, error: chapelError } = useQuery({
    queryKey: ['chapel', chapelId],
    queryFn: async () => {
      const response = await apiClient.chapels.getChapel({ params: { id: chapelId } });
      return response.data as Chapel;
    },
    enabled: !!chapelId,
  });

  // Fetch chapel images
  const { data: images, isLoading: isLoadingImages } = useQuery({
    queryKey: ['chapel-images', chapelId],
    queryFn: async () => {
      const response = await apiClient.chapels.getChapelImages({ params: { id: chapelId } });
      return response.data as ChapelImage[];
    },
    enabled: !!chapelId,
  });

  // Fetch packages
  const { data: packages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['packages', chapelId],
    queryFn: async () => {
      const response = await apiClient.packages.getPackagesByChapel({ params: { chapelId } });
      return response.data as Package[];
    },
    enabled: !!chapelId,
  });

  // Fetch availability
  const { data: availableSlots, isLoading: isLoadingSlots, refetch: refetchSlots } = useQuery({
    queryKey: ['time-slots', chapelId, currentMonth, currentYear, selectedDate],
    queryFn: async () => {
      const query: any = { month: currentMonth, year: currentYear };
      if (selectedDate) {
        query.date = selectedDate;
      }
      const response = await apiClient.timeSlots.getAvailableSlots({
        params: { chapelId },
        query,
      });
      return response.data as TimeSlot[];
    },
    enabled: !!chapelId,
  });

  // Fetch user favorites
  const { data: favorites } = useQuery({
    queryKey: ['favorites', currentUserId],
    queryFn: async () => {
      const response = await apiClient.users.getFavorites({ params: { id: currentUserId } });
      return response.data as { chapelId: string }[];
    },
    enabled: isAuthenticated && !!currentUserId,
  });

  const isFavorited = favorites?.some((fav) => fav.chapelId === chapelId) || false;

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.users.addFavorite({
        params: { id: currentUserId, chapelId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUserId] });
      showToast('Added to favorites!', 'success');
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.users.removeFavorite({
        params: { id: currentUserId, chapelId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUserId] });
      showToast('Removed from favorites', 'info');
    },
  });

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
    setActiveTab('availability');
    showToast('Package selected! Choose your date below.', 'success');
    // Scroll to availability section
    setTimeout(() => {
      document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlotId(null);
  };

  const handleTimeSlotSelect = async (timeSlotId: string) => {
    // Verify slot is still available
    try {
      const response = await apiClient.timeSlots.checkSlotAvailability({
        params: { id: timeSlotId },
      });
      const slotStatus = response.data as { isAvailable: boolean };

      if (slotStatus.isAvailable) {
        setSelectedTimeSlotId(timeSlotId);
      } else {
        showToast('This time slot was just booked. Please select another.', 'warning');
        refetchSlots();
      }
    } catch {
      showToast('Unable to verify slot availability. Please try again.', 'error');
    }
  };

  const handleContinueToBooking = () => {
    if (!selectedPackageId || !selectedDate || !selectedTimeSlotId) return;

    const bookingUrl = `/booking/new/${chapelId}?package=${selectedPackageId}&date=${selectedDate}&time=${selectedTimeSlotId}`;

    if (!isAuthenticated) {
      navigate(`/sign-in?redirect=${encodeURIComponent(bookingUrl)}`);
    } else {
      navigate(bookingUrl);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    setSelectedDate(null);
    setSelectedTimeSlotId(null);
  };

  const openPackageModal = (pkg: Package) => {
    setModalPackage(pkg);
    setIsPackageModalOpen(true);
  };

  const closePackageModal = () => {
    setIsPackageModalOpen(false);
    setModalPackage(null);
  };

  // Loading skeleton
  if (isLoadingChapel || isLoadingImages) {
    return (
      <AppLayout>
        <div className="animate-pulse">
          {/* Hero skeleton */}
          <div className="w-full h-[500px] bg-slate-700" />
          {/* Thumbnail skeleton */}
          <div className="flex gap-4 p-8 bg-slate-950">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-[120px] h-[90px] bg-slate-700 rounded-lg" />
            ))}
          </div>
          {/* Content skeleton */}
          <div className="max-w-[1200px] mx-auto px-8 py-8">
            <div className="h-12 bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-6 bg-slate-700 rounded w-1/4 mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-slate-700 rounded w-full" />
              <div className="h-4 bg-slate-700 rounded w-5/6" />
              <div className="h-4 bg-slate-700 rounded w-4/6" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (chapelError || !chapel) {
    return (
      <AppLayout>
        <div className="max-w-[1200px] mx-auto px-8 py-24 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Unable to Load Chapel</h1>
          <p className="text-slate-400 mb-8">
            We couldn't load this chapel's details. It may have been removed or the link is incorrect.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['chapel', chapelId] })}
              className="px-6 py-3 border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-white transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="px-6 py-3 bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600 transition-colors"
            >
              Browse All Chapels
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentImages = images || [];
  const currentPackages = packages || [];
  const currentSlots = availableSlots || [];

  // Get time slots for selected date
  const timeSlotsForDate = selectedDate
    ? currentSlots.filter((slot) => slot.date === selectedDate)
    : [];

  // Calculate total price
  const selectedPackage = currentPackages.find((pkg) => pkg.id === selectedPackageId);
  const totalPrice = selectedPackage ? selectedPackage.price : 0;

  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[currentMonth - 1];

  // Generate calendar dates
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const calendarDates = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDates.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasAvailability = currentSlots.some((slot) => slot.date === dateString && slot.isAvailable);
    calendarDates.push({
      day,
      dateString,
      hasAvailability,
    });
  }

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-[1200px] mx-auto px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/')} className="text-violet-500 hover:text-violet-400">
              Home
            </button>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <button onClick={() => navigate('/browse')} className="text-violet-500 hover:text-violet-400">
              Browse Chapels
            </button>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-400">{chapel.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Image Gallery */}
      <div className="relative w-full h-[500px] bg-slate-900">
        {currentImages.length > 0 ? (
          <>
            <img
              src={currentImages[selectedImageIndex]?.url}
              alt={currentImages[selectedImageIndex]?.altText}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            />
            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              className="absolute top-6 right-6 p-3 bg-slate-800/80 backdrop-blur-sm rounded-lg hover:bg-slate-700/80 transition-colors"
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-8 h-8 ${
                  isFavorited ? 'fill-violet-500 text-violet-500' : 'text-white'
                }`}
              />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <p className="text-slate-400">No images available</p>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {currentImages.length > 1 && (
        <div className="bg-slate-800 py-4">
          <div className="max-w-[1200px] mx-auto px-8">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {currentImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-[120px] h-[90px] rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-violet-500'
                      : 'border-transparent hover:border-violet-400'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="lg:flex lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:w-2/3">
            {/* Chapel Header */}
            <h1 className="text-5xl font-bold text-white mb-2">{chapel.name}</h1>
            <div className="flex items-center gap-2 text-slate-400 mb-8">
              <MapPin className="w-4 h-4" />
              <span>{chapel.location}</span>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-700 mb-8">
              <div className="flex gap-0 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'text-violet-500 border-b-2 border-violet-500'
                      : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('packages')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'packages'
                      ? 'text-violet-500 border-b-2 border-violet-500'
                      : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  Packages & Pricing
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'availability'
                      ? 'text-violet-500 border-b-2 border-violet-500'
                      : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  Check Availability
                </button>
                <button
                  disabled
                  className="px-6 py-3 font-medium text-slate-500 border-b-2 border-transparent cursor-not-allowed"
                  title="Reviews coming in Phase 2"
                >
                  Reviews (Coming Soon)
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <p className="text-slate-400 leading-relaxed">{chapel.description}</p>
                </div>

                {/* Quick Facts */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Quick Facts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="px-4 py-3 bg-slate-700 rounded-lg text-center">
                      <p className="text-white font-semibold">Capacity</p>
                      <p className="text-slate-300">{chapel.capacity} guests</p>
                    </div>
                    <div className="px-4 py-3 bg-violet-500 rounded-lg text-center">
                      <p className="text-white font-semibold">Price Range</p>
                      <p className="text-white">{chapel.priceRange}</p>
                    </div>
                    <div className="px-4 py-3 bg-slate-700 rounded-lg text-center">
                      <MapPin className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                      <p className="text-white font-semibold">Location</p>
                      <p className="text-slate-300">{chapel.location}</p>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chapel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-white">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'packages' && (
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-white mb-6">Available Packages</h2>
                {isLoadingPackages ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-96 bg-slate-700 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : currentPackages.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">No Packages Available</h3>
                    <p className="text-slate-400 mb-6">
                      This chapel is currently not offering packages. Please contact them directly for pricing.
                    </p>
                    <button
                      onClick={() => navigate(`/contact?chapel=${chapelId}`)}
                      className="px-6 py-3 bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600 transition-colors"
                    >
                      Contact Chapel
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`bg-slate-800 border rounded-xl p-6 transition-all hover:border-violet-500 ${
                          selectedPackageId === pkg.id ? 'border-violet-500' : 'border-slate-700'
                        }`}
                      >
                        <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-violet-500">${pkg.price}</span>
                          <span className="text-sm text-slate-400"> /ceremony</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">{pkg.description}</p>
                        <div className="space-y-2 mb-6">
                          {pkg.inclusions.slice(0, 4).map((inclusion, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-white">{inclusion}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => openPackageModal(pkg)}
                          className="text-sm text-violet-500 hover:text-violet-400 mb-4 block"
                        >
                          View full package details
                        </button>
                        <button
                          onClick={() => handlePackageSelect(pkg.id)}
                          className="w-full px-6 py-3 bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600 transition-colors"
                        >
                          Select This Package
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'availability' && (
              <div id="availability-section" className="space-y-6">
                <h2 className="text-4xl font-bold text-white mb-6">Book Your Date</h2>

                {/* Calendar */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => handleMonthChange('prev')}
                      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-6 h-6 text-slate-400 hover:text-violet-500" />
                    </button>
                    <h3 className="text-2xl font-bold text-white">
                      {monthName} {currentYear}
                    </h3>
                    <button
                      onClick={() => handleMonthChange('next')}
                      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-6 h-6 text-slate-400 hover:text-violet-500" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  {isLoadingSlots ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-10 h-10 border-3 border-slate-700 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {calendarDates.map((date, index) => (
                          <div key={index} className="aspect-square">
                            {date ? (
                              <button
                                onClick={() => date.hasAvailability && handleDateSelect(date.dateString)}
                                disabled={!date.hasAvailability}
                                className={`w-full h-full rounded-lg flex items-center justify-center relative transition-all ${
                                  !date.hasAvailability
                                    ? 'bg-slate-950 text-slate-600 cursor-not-allowed'
                                    : selectedDate === date.dateString
                                    ? 'bg-violet-500 text-white border-2 border-violet-400'
                                    : 'bg-slate-800 text-white hover:border-2 hover:border-violet-500'
                                }`}
                              >
                                {date.day}
                                {date.hasAvailability && (
                                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                                )}
                              </button>
                            ) : (
                              <div />
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {currentSlots.length === 0 && !isLoadingSlots && (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400">No availability in {monthName}. Try another month.</p>
                    </div>
                  )}
                </div>

                {/* Time Slots */}
                {selectedDate && timeSlotsForDate.length > 0 && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Available times for {selectedDate}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {timeSlotsForDate.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => slot.isAvailable && handleTimeSlotSelect(slot.id)}
                          disabled={!slot.isAvailable}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            !slot.isAvailable
                              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              : selectedTimeSlotId === slot.id
                              ? 'bg-violet-500 border-2 border-violet-400 text-white'
                              : 'border-2 border-slate-700 bg-transparent text-white hover:border-violet-500'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && timeSlotsForDate.length === 0 && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                    <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No available time slots for this date.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Booking Summary (Desktop Sticky) */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="sticky top-20">
              <div className="bg-slate-800 border border-violet-500 rounded-xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">{chapel.name}</h3>

                {selectedPackage && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400">Package</p>
                    <p className="text-white font-semibold">{selectedPackage.name}</p>
                    <p className="text-violet-500 font-bold">${selectedPackage.price}</p>
                  </div>
                )}

                {selectedDate && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400">Date</p>
                    <p className="text-white font-semibold">{selectedDate}</p>
                  </div>
                )}

                {selectedTimeSlotId && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400">Time</p>
                    <p className="text-white font-semibold">
                      {timeSlotsForDate.find((s) => s.id === selectedTimeSlotId)?.time}
                    </p>
                  </div>
                )}

                {selectedPackage && (
                  <>
                    <hr className="border-slate-700 my-4" />
                    <div className="mb-6">
                      <p className="text-sm text-slate-400 mb-1">Total</p>
                      <p className="text-3xl font-bold text-violet-500">${totalPrice}</p>
                    </div>
                  </>
                )}

                <button
                  onClick={handleContinueToBooking}
                  disabled={!selectedPackageId || !selectedTimeSlotId}
                  className={`w-full px-8 py-4 rounded-lg font-semibold text-lg transition-colors mb-4 ${
                    selectedPackageId && selectedTimeSlotId
                      ? 'bg-violet-500 text-white hover:bg-violet-600'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continue to Booking
                </button>

                <button
                  onClick={() => navigate(`/contact?chapel=${chapelId}`)}
                  className="w-full px-6 py-3 border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-white transition-colors"
                >
                  Contact Chapel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Details Modal */}
      {isPackageModalOpen && modalPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={closePackageModal}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-[700px] w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{modalPackage.name}</h2>
                <p className="text-4xl font-bold text-violet-500">${modalPackage.price}</p>
              </div>
              <button
                onClick={closePackageModal}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">What's Included</h3>
                <div className="space-y-2">
                  {modalPackage.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-white">{inclusion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Terms & Conditions</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{modalPackage.terms}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Cancellation Policy</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{modalPackage.cancellationPolicy}</p>
              </div>

              <button
                onClick={() => {
                  handlePackageSelect(modalPackage.id);
                  closePackageModal();
                }}
                className="w-full px-6 py-3 bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600 transition-colors"
              >
                Select This Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Gallery */}
      {isLightboxOpen && currentImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-slate-800/80 backdrop-blur-sm rounded-lg hover:bg-red-500/80 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex((prev) =>
                prev === 0 ? currentImages.length - 1 : prev - 1
              );
            }}
            className="absolute left-6 p-4 bg-slate-800/80 backdrop-blur-sm rounded-lg hover:bg-violet-500/80 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImages[selectedImageIndex]?.url}
              alt={currentImages[selectedImageIndex]?.altText}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex((prev) =>
                prev === currentImages.length - 1 ? 0 : prev + 1
              );
            }}
            className="absolute right-6 p-4 bg-slate-800/80 backdrop-blur-sm rounded-lg hover:bg-violet-500/80 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full">
            <span className="text-white font-medium">
              {selectedImageIndex + 1} / {currentImages.length}
            </span>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div
            className={`bg-slate-800 border rounded-lg px-5 py-4 shadow-xl flex items-center gap-3 min-w-[350px] ${
              toast.type === 'success'
                ? 'border-l-4 border-l-emerald-500'
                : toast.type === 'error'
                ? 'border-l-4 border-l-red-500'
                : toast.type === 'warning'
                ? 'border-l-4 border-l-amber-500'
                : 'border-l-4 border-l-blue-500'
            }`}
          >
            {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
            {toast.type === 'info' && <Heart className="w-5 h-5 text-slate-400" />}
            <p className="text-white flex-1">{toast.message}</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
