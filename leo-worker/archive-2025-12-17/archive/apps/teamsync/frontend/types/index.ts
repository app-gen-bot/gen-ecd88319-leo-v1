// User and Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  title?: string;
  bio?: string;
  status: "online" | "away" | "offline";
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  url_slug: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  owner_id: string;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  workspace_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  user: User;
}

// Channel Types
export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  is_private: boolean;
  is_archived: boolean;
  project_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  last_activity_at?: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  joined_at: string;
  last_read_at?: string;
  user: User;
}

// Message Types
export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  edited_at?: string;
  thread_count: number;
  created_at: string;
  updated_at: string;
  user: User;
  reactions?: Reaction[];
  attachments?: Attachment[];
  task_id?: string;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user: User;
}

export interface Attachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  thumbnail_url?: string;
  uploaded_at: string;
}

// Project Types
export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  status: "active" | "completed" | "archived";
  due_date?: string;
  channel_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  progress: number;
  task_count: {
    total: number;
    completed: number;
  };
  team_members: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  user: User;
}

// Task Types
export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee_id?: string;
  due_date?: string;
  labels: string[];
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  message_id?: string;
  assignee?: User;
  subtasks?: Subtask[];
  comments_count: number;
  attachments_count: number;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
  completed_at?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: "mention" | "assignment" | "comment" | "reaction" | "channel_invite" | "project_invite";
  title: string;
  description?: string;
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// API Response Types
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterFormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  workspace_name?: string;
  invite_code?: string;
  terms: boolean;
}

export interface CreateProjectFormData {
  name: string;
  description?: string;
  due_date?: string;
  template?: "blank" | "marketing" | "development" | "design";
  team_members: string[];
  create_linked_channel: boolean;
}

export interface CreateTaskFormData {
  title: string;
  project_id: string;
  assignee_id?: string;
  due_date?: string;
  description?: string;
  priority?: Task["priority"];
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: "message" | "task_update" | "presence_update" | "typing" | "notification";
  payload: any;
  timestamp: string;
}

export interface TypingIndicator {
  channel_id: string;
  user_id: string;
  user: User;
  is_typing: boolean;
}