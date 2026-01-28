import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Offline Indicator Component
 * Shows a banner when the user loses internet connection
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white py-2 px-4 text-center text-sm font-medium animate-in slide-in-from-top duration-300">
      <WifiOff className="inline h-4 w-4 mr-2" />
      You're offline. Some features may not work.
    </div>
  );
}
