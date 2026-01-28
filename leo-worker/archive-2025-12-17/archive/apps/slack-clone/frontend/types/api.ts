// API Response Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  title?: string;
  status: 'online' | 'away' | 'offline';
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  unread_count?: number;
  last_message_at?: string;
}

export interface Message {
  id: string;
  channel_id?: string;
  dm_id?: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  thread_count?: number;
  reactions?: Reaction[];
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface DirectMessage {
  id: string;
  user_id: string;
  other_user_id: string;
  other_user: User;
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: string;
  message_id: string;
  replies: Message[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: 'mention' | 'dm' | 'channel' | 'file';
  title: string;
  message: string;
  source_id: string;
  is_read: boolean;
  created_at: string;
}

// API Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  workspace_name: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  workspace: Workspace;
}

export interface CreateChannelRequest {
  name: string;
  description?: string;
  is_private: boolean;
}

export interface SendMessageRequest {
  channel_id?: string;
  dm_id?: string;
  content: string;
  thread_id?: string;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface AddReactionRequest {
  message_id: string;
  emoji: string;
}

export interface UpdateProfileRequest {
  name?: string;
  title?: string;
  avatar_url?: string;
}

export interface InviteUserRequest {
  email: string;
  role: 'admin' | 'member';
}

// API Error Response
export interface ApiErrorResponse {
  detail: string;
  code?: string;
}

// Session Response
export interface SessionResponse {
  valid: boolean;
  user?: User;
  workspace?: Workspace;
}