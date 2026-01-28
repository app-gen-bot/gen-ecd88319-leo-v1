import { auth } from '@clerk/nextjs';
import type { 
  Song, 
  Platform, 
  Registration, 
  AnalyticsOverview,
  ApiResponse,
  PaginatedResponse,
  UploadFormData,
  NotificationSettings,
  BillingInfo,
  PlatformCredentials,
  ApiError as ApiErrorType
} from '@/types';

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

class ApiError extends Error {
  constructor(public message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  }
  
  // Get token for client-side requests
  private async getAuthToken(): Promise<string | null> {
    if (typeof window !== 'undefined' && window.Clerk) {
      return await window.Clerk.session?.getToken() || null;
    }
    return null;
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    // Get fresh token from Clerk for each request
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });
      
      const data = response.ok ? await response.json() : null;
      
      if (!response.ok) {
        switch (response.status) {
          case 401:
            if (typeof window !== 'undefined') {
              window.location.href = '/sign-in';
            }
            throw new ApiError('Unauthorized', 'UNAUTHORIZED');
          case 403:
            throw new ApiError('You do not have permission to perform this action', 'FORBIDDEN');
          case 404:
            throw new ApiError('The requested resource was not found', 'NOT_FOUND');
          case 429:
            const retryAfter = response.headers.get('Retry-After');
            throw new ApiError(`Rate limited. Try again in ${retryAfter} seconds`, 'RATE_LIMITED');
          case 500:
          case 502:
          case 503:
          case 504:
            throw new ApiError('Server error. Please try again later.', 'SERVER_ERROR');
          default:
            throw new ApiError(data?.detail || 'An error occurred', 'UNKNOWN_ERROR');
        }
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );
    }
  }
  
  // Songs API
  async getSongs(params?: { 
    page?: number; 
    page_size?: number; 
    filter?: string;
    sort?: string;
  }): Promise<PaginatedResponse<Song>> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<Song>>(`/songs?${queryParams}`);
  }
  
  async getSong(id: string): Promise<Song> {
    return this.request<Song>(`/songs/${id}`);
  }
  
  async uploadSong(data: FormData): Promise<Song> {
    return this.request<Song>('/songs/upload', {
      method: 'POST',
      body: data,
      headers: {}, // Let browser set content-type for FormData
    });
  }
  
  async updateSongMetadata(id: string, metadata: Partial<Song>): Promise<Song> {
    return this.request<Song>(`/songs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(metadata),
    });
  }
  
  async deleteSong(id: string): Promise<void> {
    return this.request<void>(`/songs/${id}`, {
      method: 'DELETE',
    });
  }
  
  // Registrations API
  async getRegistrations(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    song_id?: string;
    platform_code?: string;
  }): Promise<PaginatedResponse<Registration>> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<Registration>>(`/registrations?${queryParams}`);
  }
  
  async getRegistration(id: string): Promise<Registration> {
    return this.request<Registration>(`/registrations/${id}`);
  }
  
  async createRegistration(data: {
    song_id: string;
    platform_codes: string[];
  }): Promise<Registration[]> {
    return this.request<Registration[]>('/registrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async retryRegistration(id: string): Promise<Registration> {
    return this.request<Registration>(`/registrations/${id}/retry`, {
      method: 'POST',
    });
  }
  
  // Platforms API
  async getPlatforms(): Promise<Platform[]> {
    return this.request<Platform[]>('/platforms');
  }
  
  async getPlatform(code: string): Promise<Platform> {
    return this.request<Platform>(`/platforms/${code}`);
  }
  
  async connectPlatform(code: string, credentials: PlatformCredentials): Promise<Platform> {
    return this.request<Platform>(`/platforms/${code}/connect`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
  
  async disconnectPlatform(code: string): Promise<void> {
    return this.request<void>(`/platforms/${code}/disconnect`, {
      method: 'POST',
    });
  }
  
  async testPlatformConnection(code: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/platforms/${code}/test`, {
      method: 'POST',
    });
  }
  
  // Analytics API
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    platform_code?: string;
  }): Promise<AnalyticsOverview> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request<AnalyticsOverview>(`/analytics?${queryParams}`);
  }
  
  // Settings API
  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.request<NotificationSettings>('/settings/notifications');
  }
  
  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    return this.request<NotificationSettings>('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
  
  async getBillingInfo(): Promise<BillingInfo> {
    return this.request<BillingInfo>('/settings/billing');
  }
  
  async updatePaymentMethod(token: string): Promise<BillingInfo> {
    return this.request<BillingInfo>('/settings/billing/payment-method', {
      method: 'PUT',
      body: JSON.stringify({ token }),
    });
  }
  
  async cancelSubscription(): Promise<void> {
    return this.request<void>('/settings/billing/cancel', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
export { ApiError };