/**
 * Geocoding Service
 *
 * Reverse geocoding to convert GPS coordinates to human-readable location names.
 * Uses OpenCage Geocoding API with caching to minimize API calls.
 */

import axios from 'axios';

interface GeocodeResult {
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  formatted: string;
}

export class GeocodingService {
  private cache: Map<string, string> = new Map();
  private apiKey: string | undefined;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.OPENCAGE_API_KEY;
    this.enabled = !!this.apiKey;

    if (!this.enabled) {
      console.log('[Geocoding] OpenCage API key not found, geocoding disabled');
    } else {
      console.log('[Geocoding] Geocoding service initialized with OpenCage API');
    }
  }

  /**
   * Reverse geocode coordinates to location name
   * Returns city/region name or formatted address
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // If geocoding is disabled, return coordinates
    if (!this.enabled) {
      console.log('[Geocoding] Geocoding disabled, returning coordinates');
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    // Create cache key
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      console.log(`[Geocoding] Cache hit for ${cacheKey}: ${cached}`);
      return cached;
    }

    try {
      console.log(`[Geocoding] Reverse geocoding: ${lat}, ${lng}`);

      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: `${lat},${lng}`,
          key: this.apiKey,
          no_annotations: 1,
          language: 'en',
        },
        timeout: 5000,
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const components = result.components;

        // Build a human-readable location name
        const location = this.formatLocation({
          city: components.city || components.town || components.village,
          county: components.county,
          state: components.state || components.state_code,
          country: components.country,
          formatted: result.formatted,
        });

        // Cache the result
        this.cache.set(cacheKey, location);
        console.log(`[Geocoding] Geocoded ${lat}, ${lng} to: ${location}`);

        return location;
      }

      // No results found, return coordinates
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      this.cache.set(cacheKey, fallback);
      console.log(`[Geocoding] No results found, using fallback: ${fallback}`);
      return fallback;
    } catch (error) {
      console.error('[Geocoding] Error during reverse geocoding:', error);

      // Return coordinates as fallback
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      return fallback;
    }
  }

  /**
   * Format location components into a readable string
   */
  private formatLocation(result: GeocodeResult): string {
    // Prefer: City, State, Country
    // Or: City, Country
    // Or: State, Country
    // Or: Full formatted address

    const parts: string[] = [];

    if (result.city) {
      parts.push(result.city);
    }

    if (result.state && result.state !== result.city) {
      parts.push(result.state);
    }

    if (result.country) {
      parts.push(result.country);
    }

    if (parts.length > 0) {
      return parts.join(', ');
    }

    // Fallback to formatted address (but shorten it)
    return result.formatted.split(',').slice(0, 3).join(',');
  }

  /**
   * Clear the geocoding cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[Geocoding] Cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService();
