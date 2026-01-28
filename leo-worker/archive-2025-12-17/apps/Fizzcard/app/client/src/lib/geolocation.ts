/**
 * Geolocation utilities for capturing meeting context
 */

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  code: number;
  message: string;
}

/**
 * Request location permission from the user
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocation is not supported by this browser');
    return false;
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state === 'granted' || result.state === 'prompt';
  } catch {
    // Permissions API might not be supported, try to get location anyway
    return true;
  }
}

/**
 * Get current position coordinates
 * @returns Promise with latitude and longitude
 * @throws LocationError if permission denied or position unavailable
 */
export async function getCurrentPosition(): Promise<LocationCoords> {
  if (!('geolocation' in navigator)) {
    throw new Error('Geolocation is not supported by this browser');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        const errorMessage: Record<number, string> = {
          1: 'Location permission denied. Please enable location access to capture meeting context.',
          2: 'Location unavailable. Please check your device settings.',
          3: 'Location request timed out. Please try again.',
        };

        reject({
          code: error.code,
          message: errorMessage[error.code] || 'Unknown location error',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Get location name from coordinates using reverse geocoding
 * In production, this would use a geocoding API like Google Maps or OpenStreetMap
 * For now, returns a placeholder
 */
export async function getLocationName(
  latitude: number,
  longitude: number
): Promise<string> {
  // TODO: Implement reverse geocoding
  // This would typically call an API like:
  // - Google Maps Geocoding API
  // - OpenStreetMap Nominatim
  // - Mapbox Geocoding API

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

/**
 * Watch position for continuous tracking (useful for event check-ins)
 * Returns a cleanup function to stop watching
 */
export function watchPosition(
  onSuccess: (coords: LocationCoords) => void,
  onError?: (error: LocationError) => void
): () => void {
  if (!('geolocation' in navigator)) {
    onError?.({
      code: 0,
      message: 'Geolocation is not supported by this browser',
    });
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      onError?.({
        code: error.code,
        message: error.message,
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}
