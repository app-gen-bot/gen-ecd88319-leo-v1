// API Client for Slack Clone Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Token keys - ALWAYS use these exact keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_WORKSPACE_KEY = 'current_workspace';

// Type definitions
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  status?: string;
  workspaces?: Array<{ id: string; name: string }>;
}

interface Workspace {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  type: string;
  is_private: boolean;
  member_count: number;
  unread_count?: number;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  timestamp_human?: string;
  is_edited: boolean;
  reactions?: Array<{ emoji: string; count: number; user_ids: string[] }>;
  thread_count?: number;
}

// Standard error codes
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
}

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Auto-restore token on initialization
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
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

      if (!response.ok) {
        await this.handleHttpError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error. Please check your connection.',
        ErrorCode.NETWORK_ERROR
      );
    }
  }

  private async handleHttpError(response: Response): Promise<never> {
    let data: { detail?: string; error?: { code?: string; details?: unknown } } = {};
    try {
      data = await response.json();
    } catch {
      // Response might not be JSON
    }

    switch (response.status) {
      case 401: // Unauthorized
        this.handleUnauthorized();
        throw new ApiError('Session expired. Please log in again.', ErrorCode.UNAUTHORIZED);
      
      case 403: // Forbidden
        throw new ApiError(
          data.detail || 'You do not have permission to perform this action',
          ErrorCode.FORBIDDEN
        );
      
      case 404: // Not Found
        throw new ApiError(
          data.detail || 'The requested resource was not found',
          ErrorCode.NOT_FOUND
        );
      
      case 429: // Rate Limited
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new ApiError(
          `Rate limited. Try again in ${retryAfter} seconds`,
          ErrorCode.RATE_LIMITED
        );
      
      case 500:
      case 502:
      case 503:
      case 504: // Server errors
        throw new ApiError(
          'Server error. Please try again later.',
          ErrorCode.SERVER_ERROR
        );
      
      default:
        throw new ApiError(
          data.detail || 'An error occurred',
          data.error?.code || 'UNKNOWN_ERROR',
          data.error?.details
        );
    }
  }

  private handleUnauthorized() {
    // Clear all auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(CURRENT_WORKSPACE_KEY);
      this.token = null;
      
      // Redirect to login
      window.location.href = '/login';
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    name: string;
    workspace_name: string;
  }) {
    const response = await this.request<{
      access_token: string;
      refresh_token: string;
      user: {
        id: string;
        email: string;
        name: string;
      };
      workspace: {
        id: string;
        name: string;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.setToken(response.access_token);
    // Store refresh token
    if (response.refresh_token && typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    }
    return response;
  }

  async login(email: string, password: string) {
    // OAuth2 form format
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await this.request<{
      access_token: string;
      refresh_token: string;
      user: {
        id: string;
        email: string;
        name: string;
        workspaces: Array<{ id: string; name: string }>;
      };
    }>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    this.setToken(response.access_token);
    // Store refresh token
    if (response.refresh_token && typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    }
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Log error but continue with logout
      console.error('Logout API call failed:', error);
    }
    
    // Clear all session data
    this.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(CURRENT_WORKSPACE_KEY);
    }
  }

  async getSession() {
    return this.request<{
      valid: boolean;
      user: User | null;
      expires_at: string;
    }>('/auth/session');
  }

  // Workspace endpoints
  async getWorkspaces() {
    return this.request<Workspace[]>('/workspaces');
  }

  async getCurrentWorkspace() {
    return this.request<Workspace>('/workspaces/current');
  }

  async createWorkspace(name: string) {
    return this.request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // Channel endpoints
  async getChannels(workspaceId: string) {
    return this.request<Channel[]>(`/channels?workspace_id=${workspaceId}`);
  }

  async createChannel(data: {
    workspace_id: string;
    name: string;
    type?: 'Public' | 'Private';
    description?: string;
  }) {
    return this.request<Channel>('/channels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinChannel(channelId: string) {
    return this.request(`/channels/${channelId}/join`, {
      method: 'POST',
    });
  }

  async getChannelMembers(channelId: string) {
    return this.request<User[]>(`/channels/${channelId}/members`);
  }

  // Message endpoints
  async getMessages(channelId: string, limit = 50) {
    return this.request<Message[]>(`/messages?channel_id=${channelId}&limit=${limit}`);
  }

  async sendMessage(data: {
    channel_id?: string;
    conversation_id?: string;
    content: string;
    parent_message_id?: string;
  }) {
    return this.request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async editMessage(messageId: string, content: string) {
    return this.request<Message>(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(messageId: string) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async addReaction(messageId: string, emoji: string) {
    return this.request(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  // User endpoints
  async getUsers(workspaceId: string) {
    return this.request<User[]>(`/users?workspace_id=${workspaceId}`);
  }

  async getCurrentUser() {
    return this.request<User>('/users/me');
  }

  async updatePresence(status: string, statusMessage?: string) {
    return this.request('/users/presence', {
      method: 'POST',
      body: JSON.stringify({ 
        status, 
        status_message: statusMessage 
      }),
    });
  }

  // Search endpoints
  async search(query: string, type?: string | null) {
    const params = new URLSearchParams({ q: query });
    if (type) {
      params.append('type', type);
    }
    return this.request<Array<{
      id: string;
      type: string;
      content?: string;
      user_name?: string;
      channel_name?: string;
      created_at?: string;
      name?: string;
      member_count?: number;
      title?: string;
    }>>(`/search?${params.toString()}`);
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;