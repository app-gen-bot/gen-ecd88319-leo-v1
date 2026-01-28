import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Gift,
  ArrowRight,
  X,
  XCircle,
} from 'lucide-react';

interface BookingDetailData {
  id: string;
  bookingDate: string;
  eventDate: string;
  eventTime: string;
  status: 'upcoming' | 'past' | 'cancelled';
  numberOfGuests: number;
  specialRequests: string | null;
  totalPrice: number;
  chapel: {
    id: string;
    name: string;
    location: string;
    imageUrl: string;
  };
  package: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

export function BookingDetail() {
  const params = useParams();
  const queryClient = useQueryClient();
  const bookingId = params.id as string;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch booking details
  const {
    data: booking,
    isLoading,
    error,
  } = useQuery<BookingDetailData>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await apiClient.bookings.getBooking({
        params: { id: bookingId },
      });
      return response.data;
    },
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.bookings.cancelBooking({
        params: { id: bookingId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      setShowCancelModal(false);
      setToastMessage('Booking cancelled successfully');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
    },
    onError: () => {
      setShowCancelModal(false);
      setToastMessage('Unable to cancel booking. Please contact support.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
    },
  });

  // Download confirmation handler
  const handleDownloadConfirmation = async () => {
    try {
      await apiClient.bookings.downloadConfirmation({
        params: { id: bookingId },
      });
      setToastMessage('Confirmation downloaded successfully');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
    } catch {
      setToastMessage('Unable to download confirmation. Please try again.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
    }
  };

  // Format date helper
  const formatEventDate = (date: string, time: string, timeSlot: { startTime: string; endTime: string }) => {
    const eventDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const formattedDate = eventDate.toLocaleDateString('en-US', options);
    return `${formattedDate} at ${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  const formatBookingDate = (date: string) => {
    const bookingDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return bookingDate.toLocaleDateString('en-US', options);
  };

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: {
        bg: 'bg-emerald-500',
        text: 'text-neutral-50',
        label: 'UPCOMING',
      },
      past: {
        bg: 'bg-slate-700',
        text: 'text-neutral-50',
        label: 'COMPLETED',
      },
      cancelled: {
        bg: 'bg-red-500',
        text: 'text-neutral-50',
        label: 'CANCELLED',
      },
    };
    return badges[status as keyof typeof badges] || badges.upcoming;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-screen-lg mx-auto px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-slate-800 rounded-lg mb-4" />
            <div className="h-20 bg-slate-800 rounded-lg mb-6" />
            <div className="h-96 bg-slate-800 rounded-xl mb-6" />
            <div className="h-80 bg-slate-800 rounded-xl mb-6" />
            <div className="flex gap-4">
              <div className="h-12 w-40 bg-slate-800 rounded-lg" />
              <div className="h-12 w-40 bg-slate-800 rounded-lg" />
              <div className="h-12 w-40 bg-slate-800 rounded-lg" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <AppLayout>
        <div className="max-w-screen-lg mx-auto px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 max-w-md text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-50 mb-4">
                Booking Not Found
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                We couldn't find this booking. It may have been removed or you don't
                have permission to view it.
              </p>
              <Link href="/dashboard/bookings">
                <button className="bg-violet-500 text-neutral-50 px-6 py-3 rounded-lg font-semibold hover:bg-violet-600 transition-colors">
                  Back to My Bookings
                </button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const statusBadge = getStatusBadge(booking.status);

  return (
    <AppLayout>
      <div className="max-w-screen-lg mx-auto px-8 py-8">
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-4 right-4 bg-slate-800 border-l-4 border-emerald-500 rounded-lg p-5 shadow-2xl w-96 z-50">
            <p className="text-neutral-50">{toastMessage}</p>
          </div>
        )}

        {/* Back Navigation */}
        <Link href="/dashboard/bookings">
          <a className="inline-flex items-center gap-2 text-violet-500 hover:text-violet-600 hover:underline mb-4 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to My Bookings
          </a>
        </Link>

        {/* Booking Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-neutral-50 mb-2">
              {booking.chapel.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Booking ID: <span className="font-mono">{booking.id}</span></span>
              <span>•</span>
              <span>Booked On: {formatBookingDate(booking.bookingDate)}</span>
            </div>
          </div>
          <span
            className={`${statusBadge.bg} ${statusBadge.text} px-3 py-1 rounded-full text-xs font-semibold tracking-wider`}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Chapel Information Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6 shadow-md">
          <Link href={`/chapels/${booking.chapel.id}`}>
            <a className="block hover:border-violet-500 transition-colors rounded-xl">
              <img
                src={booking.chapel.imageUrl}
                alt={booking.chapel.name}
                className="w-full h-96 object-cover rounded-xl mb-4"
              />
            </a>
          </Link>
          <h3 className="text-2xl font-bold text-neutral-50 mb-2">
            {booking.chapel.name}
          </h3>
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <MapPin className="h-4 w-4" />
            <span>{booking.chapel.location}</span>
          </div>
          <Link href={`/chapels/${booking.chapel.id}`}>
            <a className="inline-flex items-center gap-2 text-violet-500 hover:text-violet-600 font-medium">
              View Chapel Details
              <ArrowRight className="h-4 w-4" />
            </a>
          </Link>
        </div>

        {/* Booking Details Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6 shadow-md">
          <div className="space-y-4">
            {/* Event Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-violet-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">
                  Event Date & Time
                </p>
                <p className="text-neutral-50">
                  {formatEventDate(booking.eventDate, booking.eventTime, booking.timeSlot)}
                </p>
              </div>
            </div>

            {/* Package */}
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-violet-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Package</p>
                <p className="text-neutral-50 font-semibold">{booking.package.name}</p>
                <p className="text-sm text-slate-400 mt-1">{booking.package.description}</p>
              </div>
            </div>

            {/* Number of Guests */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-violet-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">
                  Number of Guests
                </p>
                <p className="text-neutral-50">{booking.numberOfGuests} guests</p>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">
                Special Requests
              </p>
              <p className={booking.specialRequests ? 'text-neutral-50' : 'text-slate-500'}>
                {booking.specialRequests || 'None'}
              </p>
            </div>

            {/* Total Price */}
            <div className="pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-neutral-50 font-semibold">Total Price</span>
                <span className="text-2xl font-bold text-violet-500">
                  ${booking.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {booking.status === 'upcoming' && (
            <>
              <button
                onClick={handleDownloadConfirmation}
                className="bg-transparent border-2 border-violet-500 text-violet-500 px-6 py-3 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors"
              >
                Download Confirmation
              </button>
              <Link href={`/contact?chapel=${booking.chapel.id}&booking=${booking.id}`}>
                <button className="bg-transparent border-2 border-violet-500 text-violet-500 px-6 py-3 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors">
                  Contact Chapel
                </button>
              </Link>
              <button
                disabled
                className="bg-transparent border-2 border-slate-700 text-slate-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                title="Coming soon"
              >
                Reschedule
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-transparent border-2 border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-500 hover:text-neutral-50 transition-colors ml-auto"
              >
                Cancel Booking
              </button>
            </>
          )}

          {booking.status === 'past' && (
            <>
              <button
                onClick={handleDownloadConfirmation}
                className="bg-transparent border-2 border-violet-500 text-violet-500 px-6 py-3 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors"
              >
                Download Confirmation
              </button>
              <Link href={`/chapels/${booking.chapel.id}`}>
                <button className="bg-violet-500 text-neutral-50 px-6 py-3 rounded-lg font-semibold hover:bg-violet-600 transition-colors">
                  Book Again
                </button>
              </Link>
            </>
          )}

          {booking.status === 'cancelled' && (
            <Link href="/browse">
              <button className="bg-violet-500 text-neutral-50 px-6 py-3 rounded-lg font-semibold hover:bg-violet-600 transition-colors">
                Browse Chapels
              </button>
            </Link>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-lg shadow-2xl relative">
              <button
                onClick={() => setShowCancelModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-neutral-50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-2xl font-bold text-neutral-50 mb-4">
                Cancel Booking?
              </h2>

              <p className="text-slate-400 mb-6 leading-relaxed">
                Are you sure you want to cancel this booking? This action cannot be
                undone and cancellation fees may apply.
              </p>

              <div className="bg-slate-700 p-4 rounded-lg mb-6">
                <p className="text-sm text-neutral-50">
                  Cancellations made less than 7 days before the event date may incur
                  a 25% cancellation fee.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-transparent border-2 border-violet-500 text-violet-500 px-6 py-3 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors"
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="flex-1 bg-red-500 text-neutral-50 px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
