import { useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Check,
  Mail,
  Download,
  X,
  AlertTriangle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';

interface Booking {
  id: string;
  status: 'upcoming' | 'past' | 'cancelled';
  referenceNumber: string;
  chapel: {
    id: string;
    name: string;
    address: string;
    imageUrl: string;
  };
  package: {
    id: string;
    name: string;
    price: number;
    amenities: string[];
  };
  date: string;
  time: string;
  duration: number;
  numberOfGuests: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt?: string;
  cancellationDeadline?: string;
  pricing: {
    subtotal: number;
    taxes: number;
    fees: number;
    total: number;
  };
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const queryClient = useQueryClient();

  const { data: booking, isLoading, error } = useQuery<Booking>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const response = await apiClient.bookings.getBooking({
        params: { id: id! }
      });
      return response.data;
    },
    enabled: !!id
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.bookings.cancelBooking({
        params: { id: id! }
      });
      return response.data;
    },
    onSuccess: () => {
      setToast({
        type: 'success',
        message: 'Booking cancelled successfully'
      });
      setShowCancelModal(false);
      setTimeout(() => {
        setLocation('/dashboard/bookings');
      }, 1000);
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => {
      setToast({
        type: 'error',
        message: 'Unable to cancel booking. Please try again or contact support.'
      });
    }
  });

  const handleDownloadConfirmation = async () => {
    try {
      const response = await apiClient.bookings.downloadConfirmation({
        params: { id: id! }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `booking-${booking?.referenceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setToast({
        type: 'success',
        message: 'Confirmation downloaded'
      });
    } catch {
      setToast({
        type: 'error',
        message: 'Unable to download confirmation. Please try again.'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
        return {
          bg: 'bg-emerald-500',
          label: 'Upcoming'
        };
      case 'past':
        return {
          bg: 'bg-slate-500',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-500',
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-slate-500',
          label: status
        };
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="mb-6">
            <Link href="/dashboard/bookings">
              <span className="inline-flex items-center text-slate-400 hover:text-neutral-50 transition-colors cursor-pointer">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to My Bookings
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column Skeletons */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-700 rounded-xl h-[300px] animate-pulse" />
              <div className="bg-slate-700 rounded-xl h-[250px] animate-pulse" />
              <div className="bg-slate-700 rounded-xl h-[200px] animate-pulse" />
            </div>

            {/* Right Column Skeletons */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-700 rounded-xl h-[400px] animate-pulse" />
              <div className="bg-slate-700 rounded-xl h-[300px] animate-pulse" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error State
  if (error || !booking) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="mb-6">
            <Link href="/dashboard/bookings">
              <span className="inline-flex items-center text-slate-400 hover:text-neutral-50 transition-colors cursor-pointer">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to My Bookings
              </span>
            </Link>
          </div>

          <div className="max-w-lg mx-auto bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <X className="h-8 w-8 text-red-500 opacity-50" />
            </div>
            <h2 className="text-4xl font-bold text-neutral-50 mb-4">Booking Not Found</h2>
            <p className="text-slate-400 text-base mb-8">
              This booking doesn't exist or you don't have permission to view it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/bookings">
                <button className="inline-flex items-center justify-center px-6 py-3 bg-violet-500 text-neutral-50 rounded-lg font-semibold hover:bg-violet-600 transition-colors w-full">
                  Go to My Bookings
                </button>
              </Link>
              <Link href="/browse">
                <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors w-full">
                  Browse Chapels
                </button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const statusConfig = getStatusConfig(booking.status);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/dashboard/bookings">
            <span className="inline-flex items-center text-slate-400 hover:text-neutral-50 transition-colors mb-4 cursor-pointer">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to My Bookings
            </span>
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide ${statusConfig.bg} text-white`}>
              {statusConfig.label}
            </span>
          </div>

          <p className="text-slate-400 text-sm">
            Reference: #{booking.referenceNumber}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Booking Information */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chapel Details Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <img
                src={booking.chapel.imageUrl}
                alt={booking.chapel.name}
                className={`w-full h-64 object-cover rounded-lg mb-4 ${
                  booking.status === 'cancelled' ? 'grayscale-[50%] brightness-80' : ''
                }`}
              />
              <h3 className="text-2xl font-bold text-neutral-50 mb-2">
                {booking.chapel.name}
              </h3>
              <div className="flex items-start text-slate-400 text-sm mb-4">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{booking.chapel.address}</span>
              </div>
              <Link href={`/chapels/${booking.chapel.id}`}>
                <span className="inline-flex items-center text-violet-500 hover:text-violet-400 font-medium transition-colors cursor-pointer">
                  View Chapel Details
                  <span className="ml-1">→</span>
                </span>
              </Link>
            </div>

            {/* Event Details Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-neutral-50 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-slate-400 mr-3" />
                  <span className="text-neutral-50">{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-slate-400 mr-3" />
                  <span className="text-neutral-50">{booking.time}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-slate-400 mr-3" />
                  <span className="text-neutral-50">{booking.duration} minutes</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-slate-400 mr-3" />
                  <span className="text-neutral-50">{booking.numberOfGuests} guests</span>
                </div>
              </div>
            </div>

            {/* Package Details Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-neutral-50 mb-2">{booking.package.name}</h3>
              <p className="text-violet-500 text-2xl font-bold mb-4">
                {formatCurrency(booking.package.price)}
              </p>
              <div className="space-y-2">
                {booking.package.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-400 text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Requests Section */}
            {booking.specialRequests && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-neutral-50 mb-4">Special Requests</h3>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400">{booking.specialRequests}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Buttons Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 lg:sticky lg:top-20">
              <h3 className="text-xl font-bold text-neutral-50 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadConfirmation}
                  className="w-full flex items-center justify-center px-6 py-3 border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Confirmation
                </button>

                <Link href={`/contact?chapel=${booking.chapel.id}&booking=${booking.id}`}>
                  <button className="w-full flex items-center justify-center px-6 py-3 border-2 border-slate-600 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                    <Mail className="h-5 w-5 mr-2" />
                    Contact Chapel
                  </button>
                </Link>

                {booking.status === 'upcoming' && (
                  <>
                    <Link href={`/booking/reschedule/${booking.id}`}>
                      <button className="w-full flex items-center justify-center px-6 py-3 border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors">
                        <Calendar className="h-5 w-5 mr-2" />
                        Reschedule
                      </button>
                    </Link>

                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full flex items-center justify-center px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors mt-4"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel Booking
                    </button>
                  </>
                )}

                {booking.status === 'past' && (
                  <Link href={`/chapels/${booking.chapel.id}`}>
                    <button className="w-full flex items-center justify-center px-6 py-3 border-2 border-violet-500 text-violet-500 rounded-lg font-semibold hover:bg-violet-500 hover:text-neutral-50 transition-colors">
                      Rebook This Chapel
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Booking Timeline Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-neutral-50 mb-4">Timeline</h3>
              <div className="space-y-4 border-l-2 border-slate-700 pl-6 relative">
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <p className="text-sm text-slate-400 mb-1">Booked</p>
                  <p className="text-neutral-50 text-sm">
                    {new Date(booking.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {booking.updatedAt && (
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <p className="text-sm text-slate-400 mb-1">Last Modified</p>
                    <p className="text-neutral-50 text-sm">
                      {new Date(booking.updatedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {booking.status === 'upcoming' && booking.cancellationDeadline && (
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <p className="text-sm text-slate-400 mb-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                      Cancellation Deadline
                    </p>
                    <p className="text-neutral-50 text-sm">
                      {new Date(booking.cancellationDeadline).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-neutral-50 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-neutral-50">{formatCurrency(booking.pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Taxes & Fees</span>
                  <span className="text-neutral-50">
                    {formatCurrency(booking.pricing.taxes + booking.pricing.fees)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-neutral-50 font-semibold text-lg">Total Paid</span>
                  <span className="text-violet-500 font-bold text-xl">
                    {formatCurrency(booking.pricing.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-700 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-neutral-50 transition-colors"
              aria-label="Close cancel confirmation dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-bold text-neutral-50 mb-4">Cancel Booking?</h3>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Are you sure you want to cancel this booking? This action cannot be undone and may be subject to cancellation fees.
            </p>

            <div className="bg-slate-700 rounded-lg p-3 mb-6">
              <p className="text-slate-400 text-sm">
                <strong className="text-neutral-50">{booking.chapel.name}</strong><br />
                {formatDate(booking.date)} at {booking.time}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-6 py-3 border-2 border-slate-600 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
              >
                No, Keep Booking
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl max-w-md z-50"
          style={{ borderLeftWidth: '4px', borderLeftColor: toast.type === 'success' ? '#10B981' : '#EF4444' }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-neutral-50 text-sm">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-neutral-50 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
