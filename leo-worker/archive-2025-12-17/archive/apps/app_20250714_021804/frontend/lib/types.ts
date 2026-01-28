export interface User {
  id: string
  email: string
  name: string
  avatar?: string  // Frontend uses avatar, API may return avatar_url
  role: 'parent' | 'partner' | 'child' | 'other'
  personality_type: 'formal' | 'playful' | 'romantic' | 'funny' | 'friendly'
  message_styles: string[]
  family_id: string
  created_at: string
  updated_at: string
}

export interface FamilyMember extends User {
  active_tasks: number
  completed_tasks: number
  love_score_contribution: number
}

export interface Family {
  id: string
  name: string
  code: string
  created_at: string
  updated_at: string
  love_score?: number
  weekly_score_change?: number
  member_count?: number
  settings?: {
    themes: string[]
    categories: string[]
    priorities: string[]
  }
}

export interface Task {
  id: string
  description: string
  original_message?: string
  transformed_message?: string
  assignee_id: string
  assignee_name: string
  assignee_avatar?: string
  assigned_by_id?: string
  assigned_by_name?: string
  created_by_id: string
  created_by_name: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'negotiating' | 'in_discussion'
  priority: 'high' | 'medium' | 'low'
  category: 'household' | 'kitchen' | 'kids' | 'pets' | 'shopping' | 'outdoor' | 'other' | 'chores' | 'homework' | 'fun'
  due_date: string
  completed_at?: string
  created_at: string
  updated_at: string
  response_message?: string
}

export interface Message {
  id: string
  task_id?: string
  content: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  recipient_id: string
  recipient_name?: string
  original_content?: string
  transformed_content?: string
  message_type: 'task' | 'response' | 'celebration' | 'appreciation' | 'encouragement'
  style?: string
  reactions: { [emoji: string]: string[] }
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  title: string
  name?: string
  description: string
  icon: string
  unlocked_at?: string
  earned_at?: string
  progress?: number
  total?: number
}

export interface ApiError extends Error {
  code: string
  detail?: string
}