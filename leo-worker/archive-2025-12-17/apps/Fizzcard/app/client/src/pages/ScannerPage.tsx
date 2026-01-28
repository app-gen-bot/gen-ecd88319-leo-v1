import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { QRScanner } from '@/components/fizzcard/QRScanner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { getCurrentPosition, getLocationName, type LocationCoords } from '@/lib/geolocation';

/**
 * ScannerPage component
 * QR code scanner with contact preview and exchange initiation
 */
export function ScannerPage() {
  const [, setLocation] = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  const [scannedData, setScannedData] = useState<{
    url: string;
    receiverId: number | null;
    location?: LocationCoords;
    locationName?: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Extract user ID from scanned URL
  const extractUserIdFromUrl = (url: string): number | null => {
    try {
      // Expected format: https://domain.com/fizzcard/{id}
      const match = url.match(/\/fizzcard\/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    } catch {
      return null;
    }
  };

  // Initiate contact exchange mutation
  const exchangeMutation = useMutation({
    mutationFn: async (data: {
      receiverId: number;
      latitude?: number;
      longitude?: number;
      locationName?: string;
    }) => {
      const result = await apiClient.contactExchanges.initiate({
        body: {
          receiverId: data.receiverId,
          method: 'qr_code',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          locationName: data.locationName || null,
          metAt: new Date().toISOString(),
          status: 'pending',
        },
      });
      if (result.status !== 201) {
        throw new Error('Failed to initiate contact exchange');
      }
      return result.body;
    },
    onSuccess: () => {
      toast.success('Connection request sent! Earn FizzCoins when they accept!', {
        duration: 4000,
        icon: '🎉',
      });
      setShowPreview(false);
      setScannedData(null);
      setLocation('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send connection request');
    },
  });

  const handleScan = async (data: string, location?: LocationCoords) => {
    const receiverId = extractUserIdFromUrl(data);

    if (!receiverId) {
      toast.error('Invalid QR code. Please scan a valid FizzCard.');
      return;
    }

    // Try to get location
    let coords = location;
    let locationName: string | undefined;

    if (!coords) {
      setIsLoadingLocation(true);
      try {
        coords = await getCurrentPosition();
        locationName = await getLocationName(coords.latitude, coords.longitude);
      } catch (error) {
        // Location is optional, continue without it
        console.warn('Could not get location:', error);
        toast.error('Location unavailable, but continuing without it', {
          duration: 2000,
        });
      } finally {
        setIsLoadingLocation(false);
      }
    }

    setScannedData({
      url: data,
      receiverId,
      location: coords,
      locationName,
    });
    setShowPreview(true);
  };

  const handleClose = () => {
    setLocation('/dashboard');
  };

  const handleConnect = () => {
    if (!scannedData?.receiverId) {
      toast.error('Invalid contact data');
      return;
    }

    exchangeMutation.mutate({
      receiverId: scannedData.receiverId,
      latitude: scannedData.location?.latitude,
      longitude: scannedData.location?.longitude,
      locationName: scannedData.locationName,
    });
  };

  return (
    <>
      <QRScanner onScan={handleScan} onClose={handleClose} />

      {/* Contact Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => {
          if (!exchangeMutation.isPending) {
            setShowPreview(false);
            setScannedData(null);
          }
        }}
        title="New Connection"
        size="md"
      >
        <div className="text-center">
          {isLoadingLocation ? (
            <>
              <Skeleton variant="circular" className="w-24 h-24 mx-auto mb-4" />
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto mb-6" />
            </>
          ) : (
            <>
              <Avatar
                src={null}
                alt="Contact"
                size="3xl"
                className="mx-auto mb-4"
              />

              <h3 className="text-2xl font-semibold mb-2">
                Ready to Connect
              </h3>

              {scannedData?.locationName && (
                <p className="text-text-secondary mb-2">
                  Meeting at: {scannedData.locationName}
                </p>
              )}

              {scannedData?.location && (
                <p className="text-xs text-text-secondary mb-6">
                  {scannedData.location.latitude.toFixed(4)},{' '}
                  {scannedData.location.longitude.toFixed(4)}
                </p>
              )}
            </>
          )}

          <div className="p-4 rounded-lg bg-fizzCoin-500/10 border border-fizzCoin-500/30 mb-6">
            <p className="text-fizzCoin-500 font-semibold">
              Earn FizzCoins when they accept!
            </p>
            <p className="text-sm text-text-secondary mt-1">
              +10 FizzCoins for you, +25 for them
            </p>
          </div>

          {exchangeMutation.isError && (
            <div className="mb-4 p-3 bg-error-500/10 border border-error-500/30 rounded-lg">
              <p className="text-error-500 text-sm">
                {exchangeMutation.error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => {
                setShowPreview(false);
                setScannedData(null);
              }}
              disabled={exchangeMutation.isPending || isLoadingLocation}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleConnect}
              disabled={
                exchangeMutation.isPending ||
                isLoadingLocation ||
                !scannedData?.receiverId
              }
            >
              {exchangeMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
