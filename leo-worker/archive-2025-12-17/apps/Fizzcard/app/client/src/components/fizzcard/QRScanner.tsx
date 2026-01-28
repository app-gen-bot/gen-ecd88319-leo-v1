import { useState, useEffect } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { X, MapPin, Calendar } from 'lucide-react';
import { getCurrentPosition, type LocationCoords } from '@/lib/geolocation';
import { formatDateTime } from '@/lib/utils';

interface QRScannerProps {
  onScan: (data: string, location?: LocationCoords) => void;
  onClose: () => void;
}

/**
 * QRScanner component
 * Full-screen QR code scanner with GPS capture
 */
export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  // Capture GPS location on mount
  useEffect(() => {
    const captureLocation = async () => {
      try {
        const coords = await getCurrentPosition();
        setLocation(coords);
      } catch (error: any) {
        console.error('Location error:', error);
        setLocationError(error.message || 'Failed to get location');
      }
    };

    captureLocation();
  }, []);

  const handleScan = (result: string) => {
    if (scanned) return;
    setScanned(true);

    // Call onScan with the result and location
    onScan(result, location || undefined);
  };

  return (
    <div className="fixed inset-0 z-[1050] bg-background-primary">
      {/* Scanner */}
      <div className="relative w-full h-full">
        <QrScanner
          onDecode={(result) => {
            if (result) {
              handleScan(result);
            }
          }}
          onError={(error) => console.error('QR scan error:', error)}
          constraints={{ facingMode: 'environment' }}
          containerStyle={{
            width: '100%',
            height: '100%',
          }}
        />

        {/* Targeting Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-4 border-primary-500 rounded-3xl shadow-[0_0_40px_rgba(0,217,255,0.6)]">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary-500 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary-500 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary-500 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary-500 rounded-br-3xl" />

            {/* Scan line animation */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-[scanLine_2s_linear_infinite]" />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 rounded-full bg-background-secondary border border-border-default text-text-primary hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Context Info */}
        <div className="absolute bottom-8 left-4 right-4 z-10">
          <div className="backdrop-blur-xl bg-background-glass border border-border-default rounded-2xl p-4 max-w-md mx-auto">
            <div className="flex flex-col gap-2 text-sm">
              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="text-text-secondary">
                  {location
                    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                    : locationError
                    ? locationError
                    : 'Capturing location...'}
                </span>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                <span className="text-text-secondary">
                  {formatDateTime(new Date())}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-text-tertiary text-center">
              Position the QR code within the frame to scan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
