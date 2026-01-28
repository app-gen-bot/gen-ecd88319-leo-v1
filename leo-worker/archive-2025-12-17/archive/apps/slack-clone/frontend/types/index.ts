export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  status?: 'online' | 'away' | 'offline';
  is_admin?: boolean;
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
}

export interface Message {
  id: string;
  channel_id?: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  content: string;
  is_edited: boolean;
  edited_at?: string;
  thread_id?: string;
  thread_count?: number;
  reactions?: Reaction[];
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  has_reacted?: boolean;
}

export interface DirectMessage {
  id: string;
  user_id: string;
  recipient_id: string;
  user?: User;
  unread_count?: number;
  last_message?: Message;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'mention' | 'dm' | 'channel' | 'file';
  title: string;
  content: string;
  is_read: boolean;
  source_id?: string;
  source_type?: string;
  created_at: string;
}

export interface ApiError extends Error {
  code: string;
  details?: any;
}