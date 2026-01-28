import { ApiError, ERROR_CODES } from './api-error';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Workspace,
  Channel,
  Message,
  DirectMessage,
  Notification,
  CreateChannelRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  AddReactionRequest,
  UpdateProfileRequest,
  InviteUserRequest,
  SessionResponse,
  ApiErrorResponse,
} from '@/types/api';

// Token keys - ALWAYS use these exact keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_WORKSPACE_KEY = 'current_workspace';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    this.restoreToken();
  }

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

  private getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  private async handleHttpError(response: Response) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: 'An error occurred' };
    }

    switch (response.status) {
      case 401:
        this.handleUnauthorized();
        throw new ApiError('Session expired. Please login again.', ERROR_CODES.UNAUTHORIZED, 401);
      case 403:
        throw new ApiError(
          errorData.detail || 'You do not have permission to perform this action',
          ERROR_CODES.FORBIDDEN,
          403
        );
      case 404:
        throw new ApiError(
          errorData.detail || 'The requested resource was not found',
          ERROR_CODES.NOT_FOUND,
          404
        );
      case 429:
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new ApiError(
          `Rate limited. Try again in ${retryAfter} seconds`,
          ERROR_CODES.RATE_LIMITED,
          429
        );
      case 400:
        throw new ApiError(
          errorData.detail || 'Invalid request',
          ERROR_CODES.VALIDATION_ERROR,
          400
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiError(
          'Server error. Please try again later.',
          ERROR_CODES.SERVER_ERROR,
          response.status
        );
      default:
        throw new ApiError(
          errorData.detail || 'An error occurred',
          ERROR_CODES.UNKNOWN_ERROR,
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
      localStorage.removeItem(CURRENT_WORKSPACE_KEY);
      this.token = null;
      // Redirect to login
      window.location.href = '/login';
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...(options.headers as Record<string, string>),
        },
      });

      if (!response.ok) {
        await this.handleHttpError(response);
      }

      // Handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : {} as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error. Please check your connection.',
        ERROR_CODES.NETWORK_ERROR
      );
    }
  }

  // Mock implementations for development
  private mockDelay() {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    // Mock implementation
    await this.mockDelay();
    
    if (data.email === 'demo@example.com' && data.password === 'password') {
      const mockResponse: LoginResponse = {
        access_token: 'mock-jwt-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        user: {
          id: 'user-1',
          email: data.email,
          name: 'Demo User',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
          status: 'online',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        workspace: {
          id: 'ws-1',
          name: 'Demo Workspace',
          owner_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      return mockResponse;
    }
    
    throw new ApiError('Invalid email or password', ERROR_CODES.INVALID_CREDENTIALS, 401);
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    // Mock implementation
    await this.mockDelay();
    
    const mockResponse: LoginResponse = {
      access_token: 'mock-jwt-token-' + Date.now(),
      refresh_token: 'mock-refresh-token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        email: data.email,
        name: data.name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      workspace: {
        id: 'ws-' + Date.now(),
        name: data.workspace_name,
        owner_id: 'user-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    return mockResponse;
  }

  async logout(): Promise<void> {
    await this.mockDelay();
    // Server would invalidate the token
  }

  async getSession(): Promise<SessionResponse> {
    await this.mockDelay();
    
    if (!this.token) {
      return { valid: false };
    }
    
    // Mock valid session
    return {
      valid: true,
      user: {
        id: 'user-1',
        email: 'demo@example.com',
        name: 'Demo User',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      workspace: {
        id: 'ws-1',
        name: 'Demo Workspace',
        owner_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  // Channel endpoints
  async getChannels(): Promise<Channel[]> {
    await this.mockDelay();
    
    return [
      {
        id: 'ch-1',
        workspace_id: 'ws-1',
        name: 'general',
        description: 'General discussion',
        is_private: false,
        created_by: 'user-1',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 12,
        unread_count: 3,
        last_message_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 'ch-2',
        workspace_id: 'ws-1',
        name: 'random',
        description: 'Random thoughts and discussions',
        is_private: false,
        created_by: 'user-1',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 8,
        unread_count: 0,
        last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ch-3',
        workspace_id: 'ws-1',
        name: 'engineering',
        description: 'Engineering team discussions',
        is_private: false,
        created_by: 'user-2',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 5,
        unread_count: 1,
        last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ];
  }

  async getChannel(channelId: string): Promise<Channel> {
    await this.mockDelay();
    
    const channels = await this.getChannels();
    const channel = channels.find(ch => ch.id === channelId);
    
    if (!channel) {
      throw new ApiError('Channel not found', ERROR_CODES.NOT_FOUND, 404);
    }
    
    return channel;
  }

  async createChannel(data: CreateChannelRequest): Promise<Channel> {
    await this.mockDelay();
    
    return {
      id: 'ch-' + Date.now(),
      workspace_id: 'ws-1',
      name: data.name,
      description: data.description,
      is_private: data.is_private,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      member_count: 1,
      unread_count: 0,
    };
  }

  async joinChannel(channelId: string): Promise<void> {
    await this.mockDelay();
    // Server would add user to channel
  }

  async leaveChannel(channelId: string): Promise<void> {
    await this.mockDelay();
    // Server would remove user from channel
  }

  async deleteChannel(channelId: string): Promise<void> {
    await this.mockDelay();
    // Server would delete channel
  }

  // Message endpoints
  async getMessages(channelId?: string, dmId?: string): Promise<Message[]> {
    await this.mockDelay();
    
    const baseMessages: Message[] = [
      {
        id: 'msg-1',
        channel_id: channelId,
        dm_id: dmId,
        user_id: 'user-2',
        user_name: 'Alice Johnson',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        content: 'Hey team! Just pushed the new feature to staging. Can someone review?',
        is_edited: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reactions: [
          { emoji: '👍', users: ['user-3', 'user-4'], count: 2 },
          { emoji: '🚀', users: ['user-1'], count: 1 },
        ],
      },
      {
        id: 'msg-2',
        channel_id: channelId,
        dm_id: dmId,
        user_id: 'user-3',
        user_name: 'Bob Smith',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        content: 'I\'ll take a look! Give me 15 minutes.',
        is_edited: false,
        created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        thread_count: 3,
      },
      {
        id: 'msg-3',
        channel_id: channelId,
        dm_id: dmId,
        user_id: 'user-1',
        user_name: 'Demo User',
        user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        content: 'Thanks Bob! Let me know if you have any questions.',
        is_edited: true,
        edited_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1.4 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    return baseMessages;
  }

  async sendMessage(data: SendMessageRequest): Promise<Message> {
    await this.mockDelay();
    
    return {
      id: 'msg-' + Date.now(),
      channel_id: data.channel_id,
      dm_id: data.dm_id,
      user_id: 'user-1',
      user_name: 'Demo User',
      user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      content: data.content,
      is_edited: false,
      created_at: new Date().toISOString(),
    };
  }

  async updateMessage(messageId: string, data: UpdateMessageRequest): Promise<Message> {
    await this.mockDelay();
    
    return {
      id: messageId,
      channel_id: 'ch-1',
      user_id: 'user-1',
      user_name: 'Demo User',
      user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      content: data.content,
      is_edited: true,
      edited_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    };
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.mockDelay();
    // Server would delete message
  }

  async addReaction(data: AddReactionRequest): Promise<void> {
    await this.mockDelay();
    // Server would add reaction
  }

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    await this.mockDelay();
    // Server would remove reaction
  }

  // Direct message endpoints
  async getDirectMessages(): Promise<DirectMessage[]> {
    await this.mockDelay();
    
    return [
      {
        id: 'dm-1',
        user_id: 'user-1',
        other_user_id: 'user-2',
        other_user: {
          id: 'user-2',
          email: 'alice@example.com',
          name: 'Alice Johnson',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
          status: 'online',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        last_message: {
          id: 'msg-dm-1',
          dm_id: 'dm-1',
          user_id: 'user-2',
          user_name: 'Alice Johnson',
          content: 'Thanks for the quick review!',
          is_edited: false,
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        unread_count: 2,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'dm-2',
        user_id: 'user-1',
        other_user_id: 'user-3',
        other_user: {
          id: 'user-3',
          email: 'bob@example.com',
          name: 'Bob Smith',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
          status: 'away',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        unread_count: 0,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  async createDirectMessage(userId: string): Promise<DirectMessage> {
    await this.mockDelay();
    
    return {
      id: 'dm-' + Date.now(),
      user_id: 'user-1',
      other_user_id: userId,
      other_user: {
        id: userId,
        email: 'newuser@example.com',
        name: 'New User',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    await this.mockDelay();
    
    return [
      {
        id: 'user-2',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        title: 'Senior Developer',
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'user-3',
        email: 'bob@example.com',
        name: 'Bob Smith',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        title: 'Product Manager',
        status: 'away',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'user-4',
        email: 'carol@example.com',
        name: 'Carol Davis',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
        title: 'Designer',
        status: 'offline',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    await this.mockDelay();
    
    return {
      id: 'user-1',
      email: 'demo@example.com',
      name: data.name || 'Demo User',
      avatar_url: data.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      title: data.title,
      status: 'online',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateStatus(status: 'online' | 'away' | 'offline'): Promise<void> {
    await this.mockDelay();
    // Server would update user status
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    await this.mockDelay();
    
    return [
      {
        id: 'notif-1',
        type: 'mention',
        title: '@alice mentioned you',
        message: 'in #general: @demo can you review this?',
        source_id: 'msg-123',
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif-2',
        type: 'dm',
        title: 'New message from Bob',
        message: 'Hey, do you have a minute?',
        source_id: 'dm-2',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.mockDelay();
    // Server would mark notification as read
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.mockDelay();
    // Server would mark all notifications as read
  }

  // Search
  async search(query: string): Promise<{
    messages: Message[];
    channels: Channel[];
    users: User[];
  }> {
    await this.mockDelay();
    
    // Mock search results
    return {
      messages: [
        {
          id: 'msg-search-1',
          channel_id: 'ch-1',
          user_id: 'user-2',
          user_name: 'Alice Johnson',
          user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
          content: `Found "${query}" in this message about the new feature`,
          is_edited: false,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      channels: query.toLowerCase().includes('gen') ? [{
        id: 'ch-1',
        workspace_id: 'ws-1',
        name: 'general',
        description: 'General discussion',
        is_private: false,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }] : [],
      users: query.toLowerCase().includes('ali') ? [{
        id: 'user-2',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }] : [],
    };
  }

  // Admin endpoints
  async inviteUser(data: InviteUserRequest): Promise<void> {
    await this.mockDelay();
    // Server would send invite email
  }

  async getWorkspaceStats(): Promise<{
    activeUsers: number;
    totalChannels: number;
    messagesPerDay: number;
    storageUsed: number;
  }> {
    await this.mockDelay();
    
    return {
      activeUsers: 12,
      totalChannels: 8,
      messagesPerDay: 234,
      storageUsed: 1.2, // GB
    };
  }

  async getWorkspaceUsers(): Promise<Array<User & { role: 'admin' | 'member' }>> {
    await this.mockDelay();
    
    const users = await this.getUsers();
    return [
      { ...users[0], role: 'member' as const },
      { ...users[1], role: 'member' as const },
      { ...users[2], role: 'admin' as const },
    ];
  }

  async updateUserRole(userId: string, role: 'admin' | 'member'): Promise<void> {
    await this.mockDelay();
    // Server would update user role
  }

  async deactivateUser(userId: string): Promise<void> {
    await this.mockDelay();
    // Server would deactivate user
  }
}

export const apiClient = new ApiClient();