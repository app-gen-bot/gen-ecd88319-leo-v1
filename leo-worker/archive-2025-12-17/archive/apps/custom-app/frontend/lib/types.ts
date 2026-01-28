// User and Authentication Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  user_type: 'tenant' | 'landlord' | 'property_manager';
  phone?: string;
  created_at: string;
  updated_at: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  is_premium?: boolean;
  profile_complete: boolean;
  avatar_url?: string;
}

// Property Types
export interface Property {
  id: string;
  user_id: string;
  address: string;
  unit_number?: string;
  property_type: 'single_family' | 'apartment' | 'condo' | 'townhouse' | 'mobile_home' | 'room';
  bedrooms: number;
  bathrooms: number;
  monthly_rent: number;
  move_in_date: string;
  move_out_date?: string;
  landlord_name?: string;
  landlord_email?: string;
  landlord_phone?: string;
  created_at: string;
  updated_at: string;
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  attachments?: Attachment[];
  feedback?: 'positive' | 'negative';
  feedback_text?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  message_count: number;
}

// Documentation Types
export interface DocumentationSession {
  id: string;
  property_id: string;
  type: 'move_in' | 'routine' | 'move_out';
  status: 'in_progress' | 'completed' | 'signed';
  created_at: string;
  completed_at?: string;
  rooms: RoomDocumentation[];
  signature?: string;
  shared_with?: string[];
}

export interface RoomDocumentation {
  id: string;
  room_name: string;
  media: MediaItem[];
  issues: Issue[];
  notes?: string;
  completed: boolean;
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail_url?: string;
  timestamp: string;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
  severity: 'minor' | 'moderate' | 'severe';
}

export interface Issue {
  id: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  category: string;
  media_ids: string[];
  ai_detected: boolean;
  created_at: string;
}

// Lease Analysis Types
export interface LeaseAnalysis {
  id: string;
  user_id: string;
  property_id?: string;
  file_name: string;
  file_url: string;
  status: 'processing' | 'completed' | 'failed';
  issues: LeaseIssue[];
  created_at: string;
  completed_at?: string;
}

export interface LeaseIssue {
  id: string;
  type: 'illegal' | 'concerning' | 'missing';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  clause_text: string;
  legal_citation?: string;
  suggested_revision?: string;
  page_number?: number;
  location?: { start: number; end: number };
}

// Dispute Types
export interface Dispute {
  id: string;
  user_id: string;
  property_id: string;
  property?: Property;
  type: 'security_deposit' | 'repairs' | 'lease_violation' | 'rent_increase' | 'eviction' | 'other';
  status: 'draft' | 'open' | 'in_progress' | 'resolved' | 'closed';
  title: string;
  description: string;
  desired_outcome: string;
  other_party_name: string;
  other_party_contact?: string;
  date_of_issue: string;
  attempted_resolution: boolean;
  resolution_details?: string;
  evidence: Evidence[];
  timeline: TimelineEvent[];
  ai_assessment?: DisputeAssessment;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Evidence {
  id: string;
  type: 'photo' | 'video' | 'document' | 'communication' | 'receipt';
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
  date_taken?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  evidence_ids?: string[];
  created_at: string;
}

export interface DisputeAssessment {
  strength: number; // 1-10
  summary: string;
  recommendations?: string[];
  strengths?: string[];
  weaknesses?: string[];
  relevant_laws?: LegalReference[];
  estimated_resolution_time?: string;
}

export interface LegalReference {
  title: string;
  citation: string;
  summary: string;
  link?: string;
}

// Letter/Notice Types
export interface LetterTemplate {
  id: string;
  name: string;
  description: string;
  category: 'tenant' | 'landlord' | 'both';
  type: string;
  variables: TemplateVariable[];
  content: string;
  legal_requirements?: string[];
  delivery_methods: ('email' | 'certified_mail' | 'regular_mail')[];
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'address';
  required: boolean;
  default_value?: string;
  help_text?: string;
}

export interface GeneratedLetter {
  id: string;
  user_id: string;
  template_id: string;
  property_id?: string;
  recipient_name: string;
  recipient_address?: string;
  recipient_email?: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent' | 'delivered' | 'failed';
  delivery_method?: 'email' | 'certified_mail' | 'download';
  sent_at?: string;
  delivered_at?: string;
  read_receipt?: boolean;
  tracking_number?: string;
  created_at: string;
}

// Security Deposit Types
export interface SecurityDeposit {
  id: string;
  property_id: string;
  property: Property;
  amount: number;
  move_in_date: string;
  move_out_date?: string;
  interest_rate?: number; // Annual percentage
  interest_earned?: number;
  deductions?: Deduction[];
  status: 'active' | 'pending_return' | 'returned' | 'disputed';
  landlord_name?: string;
  landlord_contact?: string;
  return_requested?: boolean;
  return_request_date?: string;
  returned_amount?: number;
  returned_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Deduction {
  id: string;
  amount: number;
  category: 'cleaning' | 'repairs' | 'damages' | 'unpaid_rent' | 'other';
  description: string;
  evidence_ids?: string[];
  disputed: boolean;
  created_at: string;
}

// Communication Types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'tenant' | 'landlord' | 'system';
  content: string;
  attachments?: Attachment[];
  is_legal_notice: boolean;
  read: boolean;
  read_at?: string;
  created_at: string;
}

export interface MessageConversation {
  id: string;
  participants: Participant[];
  property_id?: string;
  subject: string;
  last_message?: Message;
  unread_count: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  type: 'tenant' | 'landlord' | 'property_manager';
  avatar_url?: string;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

// Knowledge Base Types
export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  content: string;
  summary: string;
  tags: string[];
  related_articles?: string[];
  author: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  views: number;
  helpful_votes: number;
  total_votes: number;
}

export interface LegalForm {
  id: string;
  name: string;
  description: string;
  category: string;
  file_url: string;
  preview_url?: string;
  fillable: boolean;
  state: string;
  last_updated: string;
  downloads: number;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  read: boolean;
  created_at: string;
  read_at?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form Types
export interface FormError {
  field: string;
  message: string;
}

// Settings Types
export interface UserSettings {
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    dispute_updates: boolean;
    document_reminders: boolean;
    legal_deadlines: boolean;
    newsletter: boolean;
  };
  privacy_settings: {
    profile_visible: boolean;
    share_analytics: boolean;
  };
}

// Dashboard Types
export interface DashboardStats {
  active_disputes: number;
  documents_count: number;
  unread_messages: number;
  upcoming_deadlines: Deadline[];
  recent_activity: Activity[];
}

export interface Deadline {
  id: string;
  type: string;
  title: string;
  date: string;
  property_id?: string;
  action_required: string;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  link?: string;
}

// API Error Types
export interface ApiError extends Error {
  code: string;
  details?: any;
}