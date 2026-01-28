// User & Authentication Types
export interface User {
  id: string;
  email: string;
  artist_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Music/Song Types
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  release_date?: string;
  genre?: string;
  duration?: number;
  file_url: string;
  album_art_url?: string;
  writers: string[];
  publishers: string[];
  isrc?: string;
  created_at: string;
  updated_at: string;
  registration_status: RegistrationStatus;
  platform_statuses: PlatformStatus[];
}

export type RegistrationStatus = 'not_registered' | 'partially_registered' | 'fully_registered' | 'pending';

// Platform Types
export interface Platform {
  id: string;
  name: string;
  code: PlatformCode;
  logo_url: string;
  description: string;
  connection_status: ConnectionStatus;
  health_status: HealthStatus;
  last_sync?: string;
  registration_count: number;
  credentials?: PlatformCredentials;
}

export type PlatformCode = 'mlc' | 'soundexchange' | 'ascap' | 'bmi' | 'sesac' | 'distribution' | 'copyright';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'not_configured';
export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface PlatformCredentials {
  api_key?: string;
  api_secret?: string;
  environment?: 'production' | 'sandbox';
  oauth_token?: string;
  oauth_refresh_token?: string;
}

export interface PlatformStatus {
  platform_code: PlatformCode;
  status: 'registered' | 'pending' | 'failed' | 'not_started';
  registration_id?: string;
  last_updated?: string;
}

// Registration Types
export interface Registration {
  id: string;
  song_id: string;
  song: Song;
  platform_code: PlatformCode;
  status: 'active' | 'pending' | 'failed' | 'completed' | 'requires_review';
  platform_registration_id?: string;
  submitted_at: string;
  completed_at?: string;
  last_updated: string;
  estimated_completion?: string;
  error_message?: string;
  timeline: RegistrationEvent[];
  requires_human_intervention: boolean;
  intervention_details?: HumanInterventionDetails;
}

export interface RegistrationEvent {
  id: string;
  timestamp: string;
  event_type: 'submitted' | 'processing' | 'completed' | 'failed' | 'intervention_required';
  message: string;
  platform_code: PlatformCode;
}

export interface HumanInterventionDetails {
  reason: string;
  required_action: string;
  status: 'waiting_for_review' | 'in_progress' | 'resolved';
  assigned_to?: string;
  notes?: string;
}

// Analytics Types
export interface RevenueProjection {
  date: string;
  platform_code: PlatformCode;
  projected_amount: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface AnalyticsOverview {
  total_projected: number;
  by_platform: PlatformRevenue[];
  growth_rate: number;
  projections: RevenueProjection[];
}

export interface PlatformRevenue {
  platform_code: PlatformCode;
  amount: number;
  percentage: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Form Types
export interface UploadFormData {
  files: File[];
  metadata: SongMetadata[];
  platforms: PlatformCode[];
  registration_timing: 'immediate' | 'draft' | 'scheduled';
  scheduled_date?: string;
}

export interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  release_date?: string;
  genre?: string;
  writers: string[];
  publishers: string[];
  isrc?: string;
}

// Settings Types
export interface NotificationSettings {
  email_notifications: {
    registration_success: boolean;
    registration_failed: boolean;
    platform_updates: boolean;
    weekly_summary: boolean;
  };
  in_app_notifications: {
    registration_success: boolean;
    registration_failed: boolean;
    platform_updates: boolean;
    weekly_summary: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  current_period_end: string;
  payment_method?: {
    type: 'card';
    last4: string;
    brand: string;
  };
}