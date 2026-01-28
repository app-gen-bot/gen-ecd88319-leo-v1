// API Contract Types for Sprint 1
// This file defines all request/response types for API endpoints

// ==================== User & Auth Types ====================

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'tenant' | 'landlord';
  phone?: string;
  address?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Type aliases for API client compatibility
export interface UserProfile extends User {
  // UserProfile is an alias for User with potential additional fields
  user_type?: 'tenant' | 'landlord'; // Backend compatibility
  email_verified?: boolean; // Backend compatibility
  totp_enabled?: boolean; // Backend compatibility
  created_at?: string; // Backend compatibility
  updated_at?: string; // Backend compatibility
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  userType: 'tenant' | 'landlord';
  phone?: string;
  address?: string;
}

export interface SignupRequest extends SignUpRequest {}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface LoginRequest extends SignInRequest {}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface SignupResponse extends AuthResponse {}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  userType?: 'tenant' | 'landlord';
}

export interface EnableMFAResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface VerifyMFARequest {
  code: string;
}

// ==================== Chat Types ====================

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
  // Backend compatibility
  conversation_id?: string;
  user_id?: string;
}

export interface Citation {
  law: string;
  section: string;
  text: string;
  url?: string;
  // Backend compatibility
  law_code?: string;
  title?: string;
}

export interface SendMessageRequest {
  conversationId?: string; // Optional for new conversations
  message: string;
  context?: string;
}

export interface ChatRequest extends SendMessageRequest {
  conversation_id?: string; // Backend compatibility
}

export interface SendMessageResponse {
  conversationId: string;
  message: ChatMessage;
  userMessage: ChatMessage;
}

export interface ChatResponse extends SendMessageResponse {
  conversation_id?: string; // Backend compatibility
  user_message?: ChatMessage; // Backend compatibility
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  // Backend compatibility
  user_id?: string;
  last_message?: string;
  last_message_at?: string;
  message_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ConversationListResponse extends GetConversationsResponse {
  page_size?: number; // Backend compatibility
}

export interface GetConversationMessagesRequest {
  conversationId: string;
  page?: number;
  pageSize?: number;
}

export interface GetConversationMessagesResponse {
  messages: ChatMessage[];
  conversation: Conversation;
  total: number;
  page: number;
  pageSize: number;
}

export interface ConversationDetailResponse extends GetConversationMessagesResponse {
  page_size?: number; // Backend compatibility
}

export interface SearchConversationsRequest {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface ExportConversationRequest {
  conversationId: string;
  format: 'pdf' | 'txt';
}

export interface ExportConversationResponse {
  url: string;
  expiresAt: string;
  // Backend compatibility
  pdf_url?: string;
  filename?: string;
}

// ==================== Document Types ====================

export interface Document {
  id: string;
  userId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  uploadedAt: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  analysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  illegalClauses: IllegalClause[];
  missingDisclosures: string[];
  complianceScore: number;
  recommendations: string[];
  analyzedAt: string;
}

export interface IllegalClause {
  clause: string;
  reason: string;
  lawReference: string;
  severity: 'high' | 'medium' | 'low';
  location?: string;
}

export interface UploadDocumentResponse {
  documentId: string;
  uploadUrl: string; // Pre-signed S3 URL
  expiresAt: string;
}

export interface GetDocumentsResponse {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== Dispute Types ====================

export interface Dispute {
  id: string;
  userId: string;
  type: 'security_deposit' | 'repairs' | 'lease_violation' | 'eviction' | 'other';
  status: 'draft' | 'active' | 'resolved' | 'closed';
  title: string;
  description: string;
  timeline: TimelineEvent[];
  evidence: Evidence[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  description: string;
  type: 'incident' | 'communication' | 'action' | 'resolution';
  attachments?: string[];
}

export interface Evidence {
  id: string;
  type: 'photo' | 'document' | 'email' | 'text' | 'other';
  filename: string;
  description: string;
  s3Key: string;
  uploadedAt: string;
}

export interface CreateDisputeRequest {
  type: Dispute['type'];
  title: string;
  description: string;
  initialEvent?: Omit<TimelineEvent, 'id'>;
}

export interface AddTimelineEventRequest {
  disputeId: string;
  date: string;
  description: string;
  type: TimelineEvent['type'];
}

export interface AddEvidenceRequest {
  disputeId: string;
  type: Evidence['type'];
  description: string;
}

export interface AddEvidenceResponse {
  evidenceId: string;
  uploadUrl: string; // Pre-signed S3 URL
  expiresAt: string;
}

export interface ExportDisputeRequest {
  disputeId: string;
  format: 'pdf';
}

export interface ExportDisputeResponse {
  url: string;
  expiresAt: string;
}

// ==================== Common Types ====================

export interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: any;
}

export interface ErrorResponse extends ApiError {
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

// ==================== Session Types ====================

export interface SessionInfo {
  user: User;
  expiresAt: string;
  isActive: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ==================== Demo Data Types ====================

export interface DemoDataSeed {
  conversations: Conversation[];
  messages: ChatMessage[];
  documents: Document[];
  disputes: Dispute[];
}