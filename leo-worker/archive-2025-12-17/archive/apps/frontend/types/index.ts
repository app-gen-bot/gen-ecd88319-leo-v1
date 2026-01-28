// Core types for AI Tenant Rights Advisor

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'landlord' | 'property_manager';
  created_at: string;
  profile?: {
    phone?: string;
    address?: string;
    properties?: Property[];
  };
}

export interface Property {
  id: string;
  address: string;
  type: 'apartment' | 'house' | 'condo' | 'other';
  bedrooms: number;
  bathrooms: number;
  monthly_rent: number;
  landlord_id?: string;
  tenant_id?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  citations: Citation[];
  created_at: string;
}

export interface Citation {
  law: string;
  section: string;
  text: string;
  url?: string;
}

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: 'uploading' | 'processing' | 'analyzed' | 'error';
  created_at: string;
  analysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  summary: string;
  risk_level: 'low' | 'medium' | 'high';
  issues: DocumentIssue[];
  recommendations: string[];
}

export interface DocumentIssue {
  type: 'illegal_clause' | 'missing_disclosure' | 'unfair_term' | 'ambiguous_language';
  severity: 'low' | 'medium' | 'high';
  description: string;
  clause: string;
  recommendation: string;
  legal_reference?: string;
}

export interface PropertyDocumentation {
  id: string;
  property_id: string;
  type: 'move_in' | 'move_out';
  created_at: string;
  media: MediaItem[];
  notes: string;
  ai_findings: AIFinding[];
  signature?: {
    tenant_signed_at?: string;
    landlord_signed_at?: string;
  };
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  timestamp: string;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  type: 'damage' | 'wear' | 'note';
  coordinates: { x: number; y: number; width: number; height: number };
  description: string;
}

export interface AIFinding {
  id: string;
  type: 'damage' | 'wear' | 'cleanliness' | 'maintenance_needed';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  location: string;
  media_refs: string[];
}

export interface Dispute {
  id: string;
  user_id: string;
  type: 'security_deposit' | 'repairs' | 'lease_violation' | 'rent_increase' | 'other';
  status: 'draft' | 'submitted' | 'in_progress' | 'resolved';
  created_at: string;
  description: string;
  evidence: Evidence[];
  timeline: TimelineEvent[];
  resolution?: {
    outcome: string;
    resolved_at: string;
  };
}

export interface Evidence {
  id: string;
  type: 'document' | 'photo' | 'video' | 'message' | 'receipt';
  url: string;
  description: string;
  uploaded_at: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  description: string;
  evidence_refs?: string[];
}

export interface LetterTemplate {
  id: string;
  name: string;
  category: 'notice' | 'request' | 'complaint' | 'response';
  description: string;
  required_fields: string[];
  legal_requirements?: string[];
}

export interface GeneratedLetter {
  id: string;
  template_id: string;
  content: string;
  pdf_url?: string;
  created_at: string;
  sent_at?: string;
  delivery_status?: 'pending' | 'delivered' | 'failed';
}

export interface SecurityDeposit {
  id: string;
  property_id: string;
  amount: number;
  move_in_date: string;
  interest_rate: number;
  deductions: Deduction[];
  refund_status: 'held' | 'partial_refund' | 'full_refund' | 'forfeited';
}

export interface Deduction {
  id: string;
  amount: number;
  reason: string;
  date: string;
  evidence?: string[];
  disputed: boolean;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  sent_at: string;
  read_at?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  updated_at: string;
  related_articles?: string[];
}