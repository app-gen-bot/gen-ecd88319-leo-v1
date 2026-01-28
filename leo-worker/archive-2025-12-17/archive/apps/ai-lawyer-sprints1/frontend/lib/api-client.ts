// API Client for Frontend

import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ConversationListResponse,
  ConversationDetailResponse,
  SearchConversationsRequest,
  ExportConversationResponse,
  UserProfile,
  User,
  ErrorResponse,
  ApiError as ApiErrorType,
} from '@/shared/types/api';

// Custom API Error class
export class ApiError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Token storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    this.restoreToken();
  }

  // Token management
  private restoreToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(AUTH_TOKEN_KEY);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // User management
  setCurrentUser(user: User | null) {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  }

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Request wrapper with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-OK responses
      if (!response.ok) {
        await this.handleHttpError(response);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
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

  private async handleHttpError(response: Response) {
    let errorData: ErrorResponse | null = null;
    
    try {
      errorData = await response.json();
    } catch {
      // Response might not be JSON
    }

    switch (response.status) {
      case 401:
        this.handleUnauthorized();
        throw new ApiError(
          errorData?.error || 'Unauthorized',
          errorData?.code || 'UNAUTHORIZED',
          401
        );
      case 403:
        throw new ApiError(
          errorData?.error || 'You do not have permission to perform this action',
          errorData?.code || 'FORBIDDEN',
          403
        );
      case 404:
        throw new ApiError(
          errorData?.error || 'The requested resource was not found',
          errorData?.code || 'NOT_FOUND',
          404
        );
      case 429:
        const retryAfter = response.headers.get('Retry-After');
        throw new ApiError(
          errorData?.error || `Rate limited. Try again in ${retryAfter} seconds`,
          errorData?.code || 'RATE_LIMITED',
          429
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiError(
          errorData?.error || 'Server error. Please try again later.',
          errorData?.code || 'SERVER_ERROR',
          response.status
        );
      default:
        throw new ApiError(
          errorData?.error || errorData?.details || 'An error occurred',
          errorData?.code || 'UNKNOWN_ERROR',
          response.status
        );
    }
  }

  private handleUnauthorized() {
    // Clear all auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      this.token = null;
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/sign-in') {
        window.location.href = '/sign-in';
      }
    }
  }

  // Authentication endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens and user
    this.setToken(response.access_token);
    this.setCurrentUser(response.user);
    if (typeof window !== 'undefined' && response.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    }

    return response;
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout errors
    } finally {
      // Clear local data regardless
      this.setToken(null);
      this.setCurrentUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }
  }

  async getSession(): Promise<{ valid: boolean; user: User | null }> {
    return this.request('/auth/session');
  }

  // User profile endpoints
  async getUserProfile(): Promise<UserProfile> {
    return this.request('/users/profile');
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Chat endpoints
  async sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getChatSuggestions(): Promise<{ suggestions: string[] }> {
    return this.request('/chat/suggestions');
  }

  // Conversation history endpoints
  async getConversations(page: number = 1, pageSize: number = 20): Promise<ConversationListResponse> {
    return this.request(`/conversations?page=${page}&page_size=${pageSize}`);
  }

  async getConversationDetail(conversationId: string): Promise<ConversationDetailResponse> {
    return this.request(`/conversations/${conversationId}`);
  }

  async getConversationMessages(conversationId: string): Promise<{ messages: ChatMessage[]; user_name: string }> {
    const response = await this.request<ConversationDetailResponse>(`/conversations/${conversationId}`);
    return {
      messages: response.messages || [],
      user_name: response.conversation?.title || 'User'
    };
  }

  async searchConversations(data: SearchConversationsRequest): Promise<ConversationListResponse> {
    return this.request('/conversations/search', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exportConversation(conversationId: string): Promise<ExportConversationResponse> {
    return this.request(`/conversations/${conversationId}/export`, {
      method: 'POST',
    });
  }

  // MFA endpoints
  async enableMFA(): Promise<{ secret: string; qr_code: string; backup_codes: string[] }> {
    return this.request('/auth/mfa/enable', {
      method: 'POST',
    });
  }

  async verifyMFA(code: string): Promise<{ success: boolean }> {
    return this.request('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async verifyMFALogin(code: string, isBackupCode: boolean = false): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    return this.request('/auth/mfa/login', {
      method: 'POST',
      body: JSON.stringify({ 
        code,
        is_backup_code: isBackupCode
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export type for use in components
export type { ApiClient };