import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { apiClient } from '@/lib/api';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  Check,
  Box,
  AlertCircle,
  MapPin,
  X,
  Loader2,
} from 'lucide-react';

// Types
interface Chapel {
  id: number;
  name: string;
  location: string;
  capacity: number;
  imageUrl?: string;
}

interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Package {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  capacity: number;
}

interface BookingData {
  date?: string;
  timeSlotId?: number;
  timeSlot?: TimeSlot;
  packageId?: number;
  package?: Package;
  numberOfGuests?: number;
  specialRequests?: string;
  contactMethod?: 'email' | 'phone';
  phone?: string;
}

type Step = 1 | 2 | 3 | 4;

export default function BookingCreatePage() {
  const params = useParams<{ chapelId: string }>();
  const chapelId = params.chapelId ? parseInt(params.chapelId) : 0;

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    contactMethod: 'email',
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Load chapel details
  const { data: chapel, isLoading: chapelLoading, error: chapelError } = useQuery({
    queryKey: ['chapel', chapelId],
    queryFn: async () => {
      const response = await apiClient.chapels.getChapel({ params: { id: chapelId } });
      return response.data as Chapel;
    },
    enabled: chapelId > 0,
  });

  // Load time slots
  const { data: timeSlots, isLoading: timeSlotsLoading } = useQuery({
    queryKey: ['timeSlots', chapelId, currentMonth, currentYear],
    queryFn: async () => {
      const response = await apiClient.timeSlots.getAvailableSlots({
        params: { chapelId },
        query: { month: currentMonth + 1, year: currentYear },
      });
      return response.data as TimeSlot[];
    },
    enabled: chapelId > 0 && currentStep === 1,
  });

  // Load packages
  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['packages', chapelId],
    queryFn: async () => {
      const response = await apiClient.packages.getPackagesByChapel({
        params: { chapelId },
      });
      return response.data as Package[];
    },
    enabled: chapelId > 0 && currentStep === 2,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.bookings.createBooking({
        body: {
          chapelId,
          packageId: bookingData.packageId!,
          timeSlotId: bookingData.timeSlotId!,
          numberOfGuests: bookingData.numberOfGuests!,
          specialRequests: bookingData.specialRequests || undefined,
        },
      });
      return response.data;
    },
    onSuccess: (data: any) => {
      window.location.href = `/booking/confirmation/${data.id}`;
    },
    onError: (error: any) => {
      setErrorMessage(
        error.message || 'We were unable to confirm your booking. The time slot may no longer be available.'
      );
      setShowErrorModal(true);
    },
  });

  // Calendar logic
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (day: number) => {
    const month = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${currentYear}-${month}-${dayStr}`;
  };

  const isDateAvailable = (dateStr: string) => {
    return timeSlots?.some((slot) => slot.date === dateStr && slot.isAvailable);
  };

  const isDatePast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getTimeSlotsForDate = (dateStr: string) => {
    return timeSlots?.filter((slot) => slot.date === dateStr && slot.isAvailable) || [];
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const canGoToPreviousMonth = () => {
    const today = new Date();
    if (currentYear > today.getFullYear()) return true;
    if (currentYear === today.getFullYear() && currentMonth > today.getMonth()) return true;
    return false;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setBookingData({ ...bookingData, date: dateStr, timeSlotId: undefined, timeSlot: undefined });
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setBookingData({ ...bookingData, timeSlotId: slot.id, timeSlot: slot });
  };

  const handlePackageSelect = (pkg: Package) => {
    setBookingData({ ...bookingData, packageId: pkg.id, package: pkg });
  };

  const handleConfirmBooking = () => {
    if (agreeToTerms && bookingData.numberOfGuests) {
      createBookingMutation.mutate();
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Loading state for initial chapel load
  if (chapelLoading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    );
  }

  // Error state for chapel load failure
  if (chapelError || !chapel) {
    return (
      <AppLayout>
        <ErrorState
          error={chapelError || new Error('Chapel not found')}
          title="Unable to load chapel details"
          onRetry={() => window.location.reload()}
          showHomeButton={true}
        />
      </AppLayout>
    );
  }

  // Step rendering
  const renderStep1 = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const calendarDays = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(day);
      const isPast = isDatePast(day);
      const isAvailable = isDateAvailable(dateStr);
      const isSelected = selectedDate === dateStr;

      calendarDays.push(
        <button
          key={day}
          disabled={isPast || !isAvailable}
          onClick={() => handleDateSelect(dateStr)}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-all relative
            ${isPast ? 'bg-background text-muted-foreground cursor-not-allowed' : ''}
            ${!isPast && !isAvailable ? 'bg-card text-muted-foreground cursor-not-allowed' : ''}
            ${!isPast && isAvailable && !isSelected ? 'bg-card text-foreground hover:bg-muted' : ''}
            ${isSelected ? 'bg-primary text-primary-foreground border-2 border-primary' : ''}
          `}
        >
          {day}
          {!isPast && isAvailable && !isSelected && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-success rounded-full" />
          )}
          {!isPast && !isAvailable && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-destructive rounded-full" />
          )}
        </button>
      );
    }

    const availableSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : [];

    return (
      <div className="space-y-6">
        {/* Chapel Header */}
        <div>
          <button
            onClick={() => (window.location.href = `/chapels/${chapelId}`)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Chapel Details</span>
          </button>

          <div className="flex items-center gap-4">
            {chapel.imageUrl && (
              <img
                src={chapel.imageUrl}
                alt={chapel.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div>
              <h2 className="text-4xl font-bold text-foreground">{chapel.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{chapel.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              disabled={!canGoToPreviousMonth()}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h3 className="text-2xl font-bold text-foreground">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {timeSlotsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">{calendarDays}</div>
            </>
          )}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Available Times for {formatDateDisplay(selectedDate)}
            </h3>

            {availableSlots.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No available time slots for this date. Please select another date.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot)}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all text-sm font-medium
                      ${
                        bookingData.timeSlotId === slot.id
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-border text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    {formatTimeDisplay(slot.startTime)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={() => setCurrentStep(2)}
          disabled={!bookingData.timeSlotId}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Continue to Package Selection
        </button>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground">
          Date: {bookingData.date && formatDateDisplay(bookingData.date)} at{' '}
          {bookingData.timeSlot && formatTimeDisplay(bookingData.timeSlot.startTime)}
          <button
            onClick={() => setCurrentStep(1)}
            className="ml-2 text-primary hover:text-primary/80 transition-colors"
          >
            Change
          </button>
        </div>

        <h2 className="text-4xl font-bold text-foreground">Choose Your Package</h2>

        {packagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : packages && packages.length > 0 ? (
          <div className="space-y-4">
            {packages.map((pkg) => {
              const isSelected = bookingData.packageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg)}
                  className={`
                    w-full p-6 rounded-xl border-2 transition-all text-left
                    ${
                      isSelected
                        ? 'border-primary bg-muted'
                        : 'border-border hover:border-muted-foreground'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{pkg.name}</h3>
                      <p className="text-3xl font-bold text-primary mt-2">
                        ${pkg.price.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-border bg-transparent'
                      }
                    `}
                    >
                      {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{pkg.description}</p>

                  <div className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No Packages Available</h3>
            <p className="text-muted-foreground mb-6">
              This chapel currently has no packages available for booking.
            </p>
            <button
              onClick={() => (window.location.href = '/browse')}
              className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all font-medium"
            >
              Browse Other Chapels
            </button>
          </div>
        )}

        {packages && packages.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!bookingData.packageId}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue to Guest Details
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all"
            >
              ← Back to Date &amp; Time
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => {
    const maxCapacity = bookingData.package?.capacity || chapel?.capacity || 100;

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground">
          Date: {bookingData.date && formatDateDisplay(bookingData.date)} at{' '}
          {bookingData.timeSlot && formatTimeDisplay(bookingData.timeSlot.startTime)} | Package:{' '}
          {bookingData.package?.name}
          <button
            onClick={() => setCurrentStep(1)}
            className="ml-2 text-primary hover:text-primary/80 transition-colors"
          >
            Change Date
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            className="ml-2 text-primary hover:text-primary/80 transition-colors"
          >
            Change Package
          </button>
        </div>

        <h2 className="text-4xl font-bold text-foreground">Guest Information</h2>

        <div className="space-y-6">
          {/* Number of Guests */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Number of Guests
            </label>
            <input
              type="number"
              min="1"
              max={maxCapacity}
              value={bookingData.numberOfGuests || ''}
              onChange={(e) =>
                setBookingData({ ...bookingData, numberOfGuests: parseInt(e.target.value) || undefined })
              }
              className="w-full bg-card border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Enter number of guests"
            />
            {bookingData.numberOfGuests && bookingData.numberOfGuests > maxCapacity && (
              <p className="text-destructive text-sm mt-1">
                Number of guests cannot exceed {maxCapacity}
              </p>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              rows={4}
              maxLength={500}
              value={bookingData.specialRequests || ''}
              onChange={(e) =>
                setBookingData({ ...bookingData, specialRequests: e.target.value })
              }
              className="w-full bg-card border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Any special accommodations, dietary restrictions, accessibility needs, etc."
            />
            <div className="text-right text-sm text-muted-foreground mt-1">
              {bookingData.specialRequests?.length || 0}/500
            </div>
          </div>

          {/* Contact Method */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Preferred Contact Method
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={bookingData.contactMethod === 'email'}
                  onChange={() =>
                    setBookingData({ ...bookingData, contactMethod: 'email', phone: undefined })
                  }
                  className="w-5 h-5 text-primary accent-primary"
                />
                <span className="text-foreground">Email</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="phone"
                  checked={bookingData.contactMethod === 'phone'}
                  onChange={() => setBookingData({ ...bookingData, contactMethod: 'phone' })}
                  className="w-5 h-5 text-primary accent-primary"
                />
                <span className="text-foreground">Phone</span>
              </label>

              {bookingData.contactMethod === 'phone' && (
                <input
                  type="tel"
                  value={bookingData.phone || ''}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  className="w-full bg-card border border-border text-foreground px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ml-8"
                  placeholder="(555) 123-4567"
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setCurrentStep(4)}
            disabled={
              !bookingData.numberOfGuests ||
              bookingData.numberOfGuests > maxCapacity ||
              bookingData.numberOfGuests < 1
            }
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Continue to Review
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all"
          >
            ← Back to Package
          </button>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-foreground">Review Your Booking</h2>

        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          {/* Chapel Information */}
          {chapel && (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {chapel.imageUrl && (
                    <img
                      src={chapel.imageUrl}
                      alt={chapel.name}
                      className="w-28 h-28 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{chapel.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{chapel.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-4" />
            </div>
          )}

          {/* Date & Time */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-semibold text-foreground">Date &amp; Time</h4>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Edit
              </button>
            </div>
            <p className="text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {bookingData.date && formatDateDisplay(bookingData.date)}
            </p>
            <p className="text-foreground flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {bookingData.timeSlot &&
                `${formatTimeDisplay(bookingData.timeSlot.startTime)} - ${formatTimeDisplay(
                  bookingData.timeSlot.endTime
                )}`}
            </p>
            <div className="border-t border-border pt-4 mt-4" />
          </div>

          {/* Package */}
          {bookingData.package && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-semibold text-foreground">Package</h4>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  Edit
                </button>
              </div>
              <p className="text-foreground font-medium">{bookingData.package.name}</p>
              <p className="text-2xl font-bold text-primary mt-1">
                ${bookingData.package.price.toLocaleString()}
              </p>
              <div className="mt-3 space-y-1">
                {bookingData.package.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mt-4" />
            </div>
          )}

          {/* Guest Details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-semibold text-foreground">Guest Information</h4>
              <button
                onClick={() => setCurrentStep(3)}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Edit
              </button>
            </div>
            <p className="text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              {bookingData.numberOfGuests} guests
            </p>
            <p className="text-sm text-muted-foreground italic mt-2">
              {bookingData.specialRequests || 'No special requests'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact:{' '}
              {bookingData.contactMethod === 'email'
                ? 'Email'
                : `Phone: ${bookingData.phone || 'Not provided'}`}
            </p>
            <div className="border-t border-border pt-4 mt-4" />
          </div>

          {/* Pricing */}
          {bookingData.package && (
            <div>
              <div className="flex items-center justify-between text-foreground">
                <span>Package Price</span>
                <span className="font-medium">${bookingData.package.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-2xl font-bold text-primary mt-3">
                <span>Total Price</span>
                <span>${bookingData.package.price.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="w-5 h-5 text-primary accent-primary mt-0.5 flex-shrink-0"
          />
          <span className="text-foreground">
            I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline"
            >
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a
              href="/terms#cancellation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline"
            >
              Cancellation Policy
            </a>
          </span>
        </label>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleConfirmBooking}
            disabled={!agreeToTerms || createBookingMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {createBookingMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all"
          >
            ← Back to Guest Details
          </button>
        </div>

        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel Booking
        </button>
      </div>
    );
  };

  const steps = [
    { number: 1, label: 'Date & Time', icon: Calendar },
    { number: 2, label: 'Package', icon: Box },
    { number: 3, label: 'Guest Details', icon: Users },
    { number: 4, label: 'Review', icon: Check },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;

                return (
                  <div key={step.number} className="flex-1 relative">
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                        w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all
                        ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }
                      `}
                      >
                        {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                      </div>
                      <span
                        className={`
                        mt-2 text-sm font-medium
                        ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                      `}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`
                        absolute top-6 left-1/2 w-full h-0.5 -z-0
                        ${isCompleted ? 'bg-primary' : 'bg-border'}
                      `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cancel Link */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Card Container */}
          <div className="bg-card rounded-xl p-8 shadow-lg border border-border">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-foreground">Cancel Booking?</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to cancel this booking? All your progress will be lost.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = `/chapels/${chapelId}`)}
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Yes, Cancel Booking
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full border-2 border-border text-foreground hover:bg-muted font-semibold py-3 px-6 rounded-lg transition-all"
              >
                No, Continue Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Booking Failed</h3>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <div className="space-y-3 w-full">
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    setCurrentStep(1);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Try Different Time Slot
                </button>
                <button
                  onClick={() => (window.location.href = `/contact?issue=booking-failed`)}
                  className="w-full text-primary hover:text-primary/80 text-sm transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
