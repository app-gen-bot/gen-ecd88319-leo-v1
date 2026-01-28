import { ApiError as ApiErrorType } from './types';

// Token keys - ALWAYS use these exact keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_PROPERTY_KEY = 'current_property';

export class ApiError extends Error implements ApiErrorType {
  code: string;
  details?: any;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

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
      
      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        await this.handleHttpError(response, data);
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );
    }
  }
  
  private getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
  
  private async handleHttpError(response: Response, data: any) {
    switch (response.status) {
      case 401: // Unauthorized
        this.handleUnauthorized();
        break;
      case 403: // Forbidden
        throw new ApiError('You do not have permission to perform this action', 'FORBIDDEN');
      case 404: // Not Found
        throw new ApiError('The requested resource was not found', 'NOT_FOUND');
      case 429: // Rate Limited
        const retryAfter = response.headers.get('Retry-After');
        throw new ApiError(`Rate limited. Try again in ${retryAfter} seconds`, 'RATE_LIMITED');
      case 500:
      case 502:
      case 503:
      case 504: // Server errors
        throw new ApiError('Server error. Please try again later.', 'SERVER_ERROR');
      default:
        throw new ApiError(data?.detail || 'An error occurred', 'UNKNOWN_ERROR');
    }
  }
  
  private handleUnauthorized() {
    // Clear all auth data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_PROPERTY_KEY);
    this.token = null;
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  }
  
  // Mock implementation for demo
  private async mockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    // For demo, we'll use localStorage as a simple mock database
    if (endpoint.includes('/auth/login') && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      if (body.email === 'demo@tenant.com' && body.password === 'demo123') {
        const user = {
          id: 'user-1',
          email: 'demo@tenant.com',
          first_name: 'John',
          last_name: 'Doe',
          user_type: 'tenant',
          subscription_tier: 'free',
          profile_complete: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const response = {
          access_token: 'demo-token-' + Date.now(),
          refresh_token: 'demo-refresh-' + Date.now(),
          user,
        };
        
        this.setToken(response.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        
        return response as any;
      } else {
        throw new ApiError('Invalid email or password', 'INVALID_CREDENTIALS');
      }
    }
    
    if (endpoint.includes('/auth/register') && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const user = {
        id: 'user-' + Date.now(),
        ...body,
        subscription_tier: 'free',
        profile_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const response = {
        access_token: 'demo-token-' + Date.now(),
        refresh_token: 'demo-refresh-' + Date.now(),
        user,
      };
      
      this.setToken(response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      return response as any;
    }
    
    if (endpoint.includes('/auth/session')) {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      if (userStr && this.token) {
        return { valid: true, user: JSON.parse(userStr) } as any;
      }
      return { valid: false } as any;
    }
    
    // Return mock data for other endpoints
    return {} as T;
  }
  
  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    user_type: string;
    phone?: string;
  }) {
    return this.mockRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async login(email: string, password: string) {
    return this.mockRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
  
  async logout() {
    try {
      await this.mockRequest('/auth/logout', { method: 'POST' });
    } finally {
      // Clear all auth data regardless of API response
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(CURRENT_PROPERTY_KEY);
      this.token = null;
    }
  }
  
  async getSession() {
    return this.mockRequest<any>('/auth/session');
  }
  
  async forgotPassword(email: string) {
    return this.mockRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
  
  async resetPassword(token: string, password: string) {
    return this.mockRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }
  
  // User endpoints
  async getProfile() {
    return this.mockRequest<any>('/users/profile');
  }
  
  async updateProfile(data: any) {
    return this.mockRequest<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  // Properties endpoints
  async getProperties() {
    // Return mock properties for demo
    return [
      {
        id: 'prop-1',
        user_id: 'user-1',
        address: '123 Main St, San Francisco, CA 94105',
        unit_number: 'Apt 4B',
        property_type: 'apartment' as const,
        bedrooms: 2,
        bathrooms: 1,
        monthly_rent: 2500,
        move_in_date: '2023-01-15',
        landlord_name: 'Jane Smith',
        landlord_email: 'landlord@example.com',
        landlord_phone: '(555) 123-4567',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }
  
  async getProperty(id: string) {
    const properties = await this.getProperties();
    return properties.find(p => p.id === id);
  }
  
  async createProperty(data: any) {
    return {
      id: 'prop-' + Date.now(),
      user_id: 'user-1',
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async deleteProperty(id: string) {
    return { success: true };
  }
  
  async updateProperty(id: string, data: any) {
    return this.mockRequest<any>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async deleteProperty(id: string) {
    return this.mockRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  }
  
  // AI Chat endpoints
  async getConversations() {
    return [
      {
        id: 'conv-1',
        user_id: 'user-1',
        title: 'Security Deposit Rights',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
        last_message: 'What are my rights regarding security deposits in California?',
        message_count: 3,
      }
    ];
  }
  
  async getConversation(id: string) {
    const conversations = await this.getConversations();
    return conversations.find(c => c.id === id);
  }
  
  async getMessages(conversationId: string) {
    if (conversationId === 'conv-1') {
      return [
        {
          id: 'msg-1',
          conversation_id: 'conv-1',
          role: 'user' as const,
          content: 'What are my rights regarding security deposits in California?',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-1',
          role: 'assistant' as const,
          content: 'In California, tenants have strong protections regarding security deposits:\n\n1. **Maximum Amount**: Landlords can charge up to 2 months\' rent for unfurnished units, or 3 months\' rent for furnished units.\n\n2. **Return Timeline**: Landlords must return your deposit within 21 days after you move out.\n\n3. **Itemized Deductions**: If any deductions are made, the landlord must provide an itemized list with receipts for repairs over $126.\n\n4. **Normal Wear and Tear**: Landlords cannot charge for normal wear and tear, only for damage beyond normal use.\n\n5. **Pre-move Inspection**: You have the right to request a pre-move out inspection to identify issues you can fix before moving out.\n\n6. **Interest**: Some cities require landlords to pay interest on security deposits.\n\nWould you like more information about any of these points?',
          created_at: new Date(Date.now() - 86300000).toISOString(),
          metadata: {
            citations: [
              'California Civil Code §1950.5',
              'California Tenant Protection Act of 2019'
            ]
          }
        }
      ];
    }
    return [];
  }
  
  
  async createConversation(message: string) {
    const conversation = {
      id: 'conv-' + Date.now(),
      user_id: 'user-1',
      title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message: message,
      message_count: 1,
    };
    
    return conversation;
  }
  
  async deleteConversation(id: string) {
    return this.mockRequest(`/ai/conversations/${id}`, {
      method: 'DELETE',
    });
  }
  
  async provideFeedback(messageId: string, feedback: 'positive' | 'negative', text?: string) {
    return this.mockRequest(`/ai/messages/${messageId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback, text }),
    });
  }
  
  // Documentation endpoints
  async getDocumentationSessions(propertyId?: string) {
    return [
      {
        id: 'doc-1',
        property_id: 'prop-1',
        type: 'move_in' as const,
        status: 'completed' as const,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        completed_at: new Date(Date.now() - 29 * 86400000).toISOString(),
        rooms: [],
      }
    ];
  }
  
  async getDocumentationSession(id: string) {
    const sessions = await this.getDocumentationSessions();
    return sessions.find(s => s.id === id);
  }
  
  async createDocumentationSession(data: any) {
    return {
      id: 'doc-' + Date.now(),
      ...data,
      status: 'in_progress' as const,
      created_at: new Date().toISOString(),
      rooms: [],
    };
  }
  
  async updateDocumentationSession(id: string, data: any) {
    return this.mockRequest<any>(`/documentation/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async uploadMedia(sessionId: string, roomId: string, files: File[]) {
    // Mock media upload
    return files.map(file => ({
      id: 'media-' + Date.now() + Math.random(),
      type: file.type.startsWith('video') ? 'video' : 'photo',
      url: URL.createObjectURL(file),
      thumbnail_url: URL.createObjectURL(file),
      timestamp: new Date().toISOString(),
    }));
  }
  
  async generateReport(sessionId: string) {
    return {
      id: 'report-' + Date.now(),
      session_id: sessionId,
      file_url: '/mock-report.pdf',
      created_at: new Date().toISOString(),
    };
  }
  
  // Lease Analysis endpoints
  async uploadLease(file: File, propertyId?: string) {
    return {
      id: 'lease-' + Date.now(),
      user_id: 'user-1',
      property_id: propertyId,
      file_name: file.name,
      file_url: URL.createObjectURL(file),
      status: 'processing',
      issues: [],
      created_at: new Date().toISOString(),
    };
  }
  
  async getLeaseAnalysis(id: string) {
    // Mock completed analysis
    return {
      id,
      user_id: 'user-1',
      file_name: 'lease-agreement.pdf',
      file_url: '/mock-lease.pdf',
      status: 'completed',
      issues: [
        {
          id: 'issue-1',
          type: 'illegal',
          severity: 'high',
          title: 'Illegal Late Fee Clause',
          description: 'The lease contains a late fee that exceeds California\'s legal limits.',
          clause_text: 'Late fees of $100 per day will be charged...',
          legal_citation: 'CA Civil Code § 1671',
          suggested_revision: 'Late fees shall not exceed $50 or 5% of the monthly rent, whichever is less.',
          page_number: 3,
        }
      ],
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };
  }
  
  async getLeaseAnalyses() {
    return [];
  }
  
  async downloadLeaseReport(id: string) {
    // In a real app, this would return a blob or download URL
    return {
      url: `/api/lease-analysis/${id}/download`,
      filename: `lease-analysis-${id}.pdf`
    };
  }
  
  async shareLeaseAnalysis(id: string) {
    // In a real app, this would create a shareable link
    return `${window.location.origin}/shared/lease-analysis/${id}`;
  }
  
  // Dispute endpoints
  async getDisputes() {
    return [
      {
        id: 'dispute-1',
        user_id: 'user-1',
        property_id: 'prop-1',
        type: 'security_deposit' as const,
        status: 'open' as const,
        title: 'Unfair Security Deposit Deduction',
        description: 'Landlord deducted $500 for "cleaning" when apartment was left spotless.',
        desired_outcome: 'Full return of the $500 deduction',
        other_party_name: 'Jane Smith',
        other_party_contact: 'landlord@example.com',
        date_of_issue: new Date(Date.now() - 7 * 86400000).toISOString(),
        attempted_resolution: true,
        resolution_details: 'Sent email requesting itemized receipts, no response.',
        evidence: [],
        timeline: [],
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
  }
  
  async getDispute(id: string) {
    const disputes = await this.getDisputes();
    const dispute = disputes.find(d => d.id === id);
    if (!dispute) {
      throw new ApiError('Dispute not found', 'NOT_FOUND');
    }
    return dispute;
  }
  
  async createDispute(data: any) {
    return {
      id: 'dispute-' + Date.now(),
      user_id: 'user-1',
      ...data,
      status: 'draft',
      evidence: [],
      timeline: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  async updateDispute(id: string, data: any) {
    return this.mockRequest<any>(`/disputes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async uploadEvidence(disputeId: string, files: File[], metadata: any) {
    return files.map(file => ({
      id: 'evidence-' + Date.now() + Math.random(),
      type: metadata.type || 'document',
      title: metadata.title || file.name,
      description: metadata.description,
      file_url: URL.createObjectURL(file),
      file_name: file.name,
      uploaded_at: new Date().toISOString(),
    }));
  }
  
  async addTimelineEvent(disputeId: string, event: any) {
    return {
      id: 'event-' + Date.now(),
      ...event,
      created_at: new Date().toISOString(),
    };
  }
  
  async getDisputeAssessment(id: string) {
    return {
      strength_score: 75,
      strengths: [
        'You have photographic evidence of the apartment\'s condition',
        'You requested an itemized list of deductions',
        'The deduction appears excessive for normal cleaning',
      ],
      weaknesses: [
        'No pre-move out inspection was conducted',
        'Limited written communication with landlord',
      ],
      recommended_actions: [
        'Send a formal demand letter citing CA Civil Code § 1950.5',
        'File a claim in small claims court if landlord doesn\'t respond',
        'Consider mediation as a faster alternative',
      ],
      relevant_laws: [
        {
          title: 'Security Deposit Return Requirements',
          citation: 'CA Civil Code § 1950.5',
          summary: 'Landlords must return deposits within 21 days with itemized deductions',
        }
      ],
      estimated_resolution_time: '2-4 weeks with demand letter, 2-3 months if court action needed',
    };
  }
  
  // Letter Generator endpoints
  async getLetterTemplates(category?: string) {
    const templates = [
      {
        id: 'template-1',
        name: 'Security Deposit Demand Letter',
        description: 'Request return of wrongfully withheld security deposit',
        category: 'tenant',
        type: 'demand',
        variables: [
          { key: 'landlord_name', label: 'Landlord Name', type: 'text', required: true },
          { key: 'property_address', label: 'Property Address', type: 'address', required: true },
          { key: 'deposit_amount', label: 'Deposit Amount', type: 'number', required: true },
          { key: 'move_out_date', label: 'Move Out Date', type: 'date', required: true },
        ],
        content: 'Dear {landlord_name},\n\nI am writing to request the return of my security deposit...',
        legal_requirements: ['Must be sent within 3 years of move-out', 'Should be sent via certified mail'],
        delivery_methods: ['email', 'certified_mail', 'regular_mail'],
      },
      {
        id: 'template-2',
        name: 'Repair Request Notice',
        description: 'Formal request for necessary repairs',
        category: 'tenant',
        type: 'notice',
        variables: [
          { key: 'repair_issue', label: 'Repair Issue', type: 'text', required: true },
          { key: 'first_notice_date', label: 'First Notice Date', type: 'date', required: true },
        ],
        content: 'Dear {landlord_name},\n\nThis is a formal notice regarding necessary repairs...',
        legal_requirements: ['Document all repair requests', 'Allow reasonable time for repairs'],
        delivery_methods: ['email', 'certified_mail'],
      }
    ];
    
    if (category) {
      return templates.filter(t => t.category === category);
    }
    return templates;
  }
  
  async getLetterTemplate(id: string) {
    const templates = await this.getLetterTemplates();
    return templates.find(t => t.id === id);
  }
  
  async generateLetter(templateId: string, variables: Record<string, any>) {
    const template = await this.getLetterTemplate(templateId);
    if (!template) throw new ApiError('Template not found', 'NOT_FOUND');
    
    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    
    return {
      id: 'letter-' + Date.now(),
      user_id: 'user-1',
      template_id: templateId,
      recipient_name: variables.landlord_name || 'Recipient',
      subject: template.name,
      content,
      status: 'draft',
      created_at: new Date().toISOString(),
    };
  }
  
  async sendLetter(letterId: string, method: string, recipient: any) {
    return {
      id: letterId,
      status: 'sent',
      delivery_method: method,
      sent_at: new Date().toISOString(),
      tracking_number: method === 'certified_mail' ? 'TRACK' + Date.now() : undefined,
    };
  }
  
  async getGeneratedLetters() {
    return [];
  }
  
  async getGeneratedLetter(id: string) {
    return this.mockRequest<any>(`/letters/${id}`);
  }
  
  // Security Deposit endpoints
  async getSecurityDeposits() {
    const properties = await this.getProperties();
    return [
      {
        id: 'deposit-1',
        property_id: 'prop-1',
        property: properties[0],
        amount: 5000,
        move_in_date: '2023-01-15',
        interest_rate: 0.01,
        interest_earned: 4.17,
        deductions: [],
        status: 'active' as const,
        landlord_name: 'Jane Smith',
        landlord_contact: 'landlord@example.com',
        return_requested: false,
        created_at: new Date('2023-01-15').toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }
  
  async getSecurityDeposit(id: string) {
    const deposits = await this.getSecurityDeposits();
    const deposit = deposits.find(d => d.id === id);
    if (!deposit) {
      throw new ApiError('Deposit not found', 'NOT_FOUND');
    }
    return deposit;
  }
  
  async createSecurityDeposit(data: any) {
    const properties = await this.getProperties();
    return {
      id: 'deposit-' + Date.now(),
      property_id: data.property_id,
      property: properties.find(p => p.id === data.property_id) || properties[0],
      amount: data.amount,
      move_in_date: data.move_in_date,
      interest_rate: 0.01,
      interest_earned: 0,
      deductions: [],
      status: 'active' as const,
      landlord_name: data.landlord_name,
      landlord_contact: data.landlord_contact,
      return_requested: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  async updateSecurityDeposit(id: string, data: any) {
    return this.mockRequest<any>(`/deposits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async addDeduction(depositId: string, deduction: any) {
    return {
      id: 'deduction-' + Date.now(),
      ...deduction,
      disputed: false,
      created_at: new Date().toISOString(),
    };
  }
  
  async disputeDeduction(depositId: string, deductionId: string) {
    return { disputed: true };
  }
  
  async requestReturn(depositId: string) {
    return {
      return_requested: true,
      return_request_date: new Date().toISOString(),
    };
  }
  
  // Communication Hub endpoints
  async getMessageConversations() {
    return [
      {
        id: 'msgconv-1',
        participants: [
          {
            id: 'user-1',
            name: 'John Doe',
            email: 'demo@tenant.com',
            type: 'tenant',
          },
          {
            id: 'landlord-1',
            name: 'Jane Smith',
            email: 'landlord@example.com',
            type: 'landlord',
          }
        ],
        property_id: 'prop-1',
        subject: 'Maintenance Request - Kitchen Sink',
        last_message: {
          id: 'msg-1',
          conversation_id: 'msgconv-1',
          sender_id: 'user-1',
          sender_name: 'John Doe',
          sender_type: 'tenant',
          content: 'The kitchen sink is leaking and needs repair.',
          is_legal_notice: false,
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
        unread_count: 0,
        archived: false,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
      }
    ];
  }
  
  async getMessageConversation(id: string) {
    const conversations = await this.getMessageConversations();
    return conversations.find(c => c.id === id);
  }
  
  async getConversationMessages(conversationId: string) {
    if (conversationId === 'msgconv-1') {
      return [
        {
          id: 'msg-1',
          conversation_id: 'msgconv-1',
          sender_id: 'user-1',
          sender_name: 'John Doe',
          sender_type: 'tenant',
          content: 'The kitchen sink is leaking and needs repair.',
          is_legal_notice: false,
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'msg-2',
          conversation_id: 'msgconv-1',
          sender_id: 'landlord-1',
          sender_name: 'Jane Smith',
          sender_type: 'landlord',
          content: 'Thank you for letting me know. I\'ll send a plumber tomorrow.',
          is_legal_notice: false,
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        }
      ];
    }
    return [];
  }
  
  async sendMessageToConversation(conversationId: string, content: string, attachments?: File[], isLegalNotice = false) {
    return {
      id: 'msg-' + Date.now(),
      conversation_id: conversationId,
      sender_id: 'user-1',
      sender_name: 'John Doe',
      sender_type: 'tenant',
      content,
      is_legal_notice: isLegalNotice,
      read: false,
      created_at: new Date().toISOString(),
    };
  }
  
  async createMessageConversation(data: any) {
    return {
      id: 'msgconv-' + Date.now(),
      ...data,
      last_message: null,
      unread_count: 0,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  async markMessageAsRead(messageId: string) {
    return { read: true };
  }
  
  async archiveConversation(conversationId: string) {
    return { archived: true };
  }
  
  // Knowledge Base endpoints
  async searchKnowledge(query: string) {
    return [
      {
        id: 'article-1',
        title: 'Understanding Security Deposits in California',
        slug: 'security-deposits-california',
        category: 'Security Deposits',
        summary: 'Learn about your rights regarding security deposits, including maximum amounts, return timelines, and illegal deductions.',
        content: '# Understanding Security Deposits in California\n\n...',
        tags: ['security deposit', 'california', 'tenant rights'],
        author: 'Legal Team',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 1523,
        helpful_votes: 287,
        total_votes: 312,
      }
    ];
  }
  
  async getKnowledgeCategories() {
    return [
      { id: 'cat-1', name: 'Security Deposits', slug: 'security-deposits', article_count: 15 },
      { id: 'cat-2', name: 'Repairs & Maintenance', slug: 'repairs-maintenance', article_count: 23 },
      { id: 'cat-3', name: 'Eviction Protection', slug: 'eviction-protection', article_count: 18 },
      { id: 'cat-4', name: 'Rent Control', slug: 'rent-control', article_count: 12 },
      { id: 'cat-5', name: 'Lease Agreements', slug: 'lease-agreements', article_count: 20 },
      { id: 'cat-6', name: 'Discrimination', slug: 'discrimination', article_count: 10 },
    ];
  }
  
  async getKnowledgeArticles(category?: string) {
    return [
      {
        id: 'article-1',
        title: 'Understanding Security Deposits in California',
        slug: 'security-deposits-california',
        category: 'Security Deposits',
        summary: 'Learn about your rights regarding security deposits.',
        tags: ['security deposit', 'california', 'tenant rights'],
        author: 'Legal Team',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 1523,
        helpful_votes: 287,
        total_votes: 312,
      }
    ];
  }
  
  async getKnowledgeArticle(id: string) {
    const articles = await this.getKnowledgeArticles();
    const article = articles.find(a => a.id === id);
    if (article) {
      return {
        ...article,
        content: `# ${article.title}\n\n## Overview\n\nThis article covers important information about ${article.category.toLowerCase()} in California.\n\n## Key Points\n\n1. Important point one\n2. Important point two\n3. Important point three\n\n## Your Rights\n\nAs a tenant in California, you have specific rights protected by law...\n\n## What You Can Do\n\n- Action item one\n- Action item two\n- Action item three\n\n## Resources\n\n- [California Civil Code](https://leginfo.legislature.ca.gov/)\n- [Department of Consumer Affairs](https://www.dca.ca.gov/)\n\n## Related Articles\n\n- Related article one\n- Related article two`,
      };
    }
    return null;
  }
  
  async rateArticle(articleId: string, helpful: boolean) {
    return { success: true };
  }
  
  async getLegalForms(category?: string) {
    return [
      {
        id: 'form-1',
        name: 'Security Deposit Itemization Request',
        description: 'Request an itemized list of security deposit deductions',
        category: 'Security Deposits',
        file_url: '/forms/security-deposit-request.pdf',
        preview_url: '/forms/previews/security-deposit-request.png',
        fillable: true,
        state: 'CA',
        last_updated: new Date().toISOString(),
        downloads: 453,
      },
      {
        id: 'form-2',
        name: 'Repair Request Form',
        description: 'Formal request for repairs with legal notice',
        category: 'Repairs & Maintenance',
        file_url: '/forms/repair-request.pdf',
        preview_url: '/forms/previews/repair-request.png',
        fillable: true,
        state: 'CA',
        last_updated: new Date().toISOString(),
        downloads: 312,
      }
    ];
  }
  
  async getLegalForm(id: string) {
    const forms = await this.getLegalForms();
    return forms.find(f => f.id === id);
  }
  
  async downloadForm(id: string) {
    return { download_url: `/forms/download/${id}` };
  }
  
  // Dashboard endpoints
  async getDashboardStats() {
    return {
      active_disputes: 1,
      documents_count: 3,
      unread_messages: 0,
      upcoming_deadlines: [
        {
          id: 'deadline-1',
          type: 'rent_due',
          title: 'Rent Due',
          date: new Date(Date.now() + 3 * 86400000).toISOString(),
          property_id: 'prop-1',
          action_required: 'Pay monthly rent',
        }
      ],
      recent_activity: [
        {
          id: 'activity-1',
          type: 'dispute_created',
          title: 'Created dispute',
          description: 'Security deposit dispute with Jane Smith',
          timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
          link: '/disputes/dispute-1',
        },
        {
          id: 'activity-2',
          type: 'document_uploaded',
          title: 'Uploaded lease',
          description: 'Lease agreement analyzed',
          timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
          link: '/documents/review/lease-1',
        }
      ],
    };
  }
  
  async getActivity(limit = 10) {
    const stats = await this.getDashboardStats();
    return stats.recent_activity.slice(0, limit);
  }

  // Letter management methods
  async getSavedLetters() {
    return [
      {
        id: 'letter-1',
        template_id: 'repair-request',
        title: 'Repair Request Letter',
        status: 'draft',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'letter-2',
        template_id: 'security-deposit-return',
        title: 'Security Deposit Return Request',
        status: 'sent',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        sent_at: new Date(Date.now() - 172800000).toISOString(),
        recipient: 'landlord@example.com',
      }
    ];
  }

  async saveLetter(data: any) {
    return {
      id: 'letter-' + Date.now(),
      ...data,
      created_at: new Date().toISOString(),
    };
  }

  async sendLetter(data: any) {
    return {
      id: 'letter-' + Date.now(),
      ...data,
      status: 'sent',
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  }

  // AI Chat methods (missing from API client)
  async sendMessage(content: string, conversationId?: string | null, propertyId?: string) {
    const id = conversationId || 'conv-' + Date.now()
    return {
      messageId: 'msg-' + Date.now(),
      conversationId: id,
      content: `I understand you're asking about: "${content}". Based on California tenant law, here's what you should know...\n\nThis would be where the AI provides specific legal information based on your question. For now, this is a mock response.`,
      metadata: {
        citations: [
          'California Civil Code §1940-1954.1',
          'California Tenant Protection Act of 2019'
        ]
      }
    }
  }

  async submitFeedback(messageId: string, isHelpful: boolean) {
    return { success: true }
  }
  
  async getNotifications() {
    return [
      {
        id: 'notif-1',
        user_id: 'user-1',
        type: 'deadline_reminder',
        title: 'Rent Due in 3 Days',
        message: 'Your rent payment of $2,500 is due on ' + new Date(Date.now() + 3 * 86400000).toLocaleDateString(),
        action_url: '/properties/prop-1',
        read: false,
        created_at: new Date().toISOString(),
      }
    ];
  }
  
  async markNotificationAsRead(id: string) {
    return { read: true };
  }
  
  async markAllNotificationsAsRead() {
    return { count: 1 };
  }
  
  // Settings endpoints
  async getSettings() {
    return {
      notification_preferences: {
        email: true,
        push: true,
        sms: false,
        dispute_updates: true,
        document_reminders: true,
        legal_deadlines: true,
        newsletter: false,
      },
      privacy_settings: {
        profile_visible: false,
        share_analytics: true,
      },
    };
  }
  
  async updateSettings(settings: any) {
    return settings;
  }
  
  async uploadAvatar(file: File) {
    return {
      avatar_url: URL.createObjectURL(file),
    };
  }
  
  async changePassword(currentPassword: string, newPassword: string) {
    if (currentPassword !== 'demo123') {
      throw new ApiError('Current password is incorrect', 'INVALID_CREDENTIALS');
    }
    return { success: true };
  }
  
  async deleteAccount(password: string) {
    if (password !== 'demo123') {
      throw new ApiError('Password is incorrect', 'INVALID_CREDENTIALS');
    }
    return { success: true };
  }
  
  // Namespace methods for cleaner API
  disputes = {
    list: () => this.getDisputes(),
    get: (id: string) => this.getDispute(id),
    create: (data: any) => this.createDispute(data),
    update: (id: string, data: any) => this.updateDispute(id, data),
    uploadEvidence: (disputeId: string, files: File[], metadata: any) => this.uploadEvidence(disputeId, files, metadata),
    addTimelineEvent: (disputeId: string, event: any) => this.addTimelineEvent(disputeId, event),
  }
  
  documentation = {
    getSessions: (propertyId?: string) => this.getDocumentationSessions(propertyId),
    getSession: (id: string) => this.getDocumentationSession(id),
    createSession: (data: any) => this.createDocumentationSession(data),
    updateSession: (id: string, data: any) => this.updateDocumentationSession(id, data),
    uploadMedia: (sessionId: string, roomId: string, files: File[]) => this.uploadMedia(sessionId, roomId, files),
    generateReport: (sessionId: string) => this.generateReport(sessionId),
    deleteSession: (id: string) => Promise.resolve({ success: true }),
  }
  
  messages = {
    list: (filters?: any) => this.getConversationMessages('msgconv-1'), // Mock implementation
    getConversations: () => this.getMessageConversations(),
    getConversation: (id: string) => this.getMessageConversation(id),
    sendMessage: (data: any) => this.sendMessage(data.content, data.conversationId),
  }
  
  deposits = {
    list: () => this.getSecurityDeposits(),
    get: (id: string) => this.getSecurityDeposit(id),
    create: (data: any) => this.createSecurityDeposit(data),
    update: (id: string, data: any) => this.updateSecurityDeposit(id, data),
    addDeduction: (depositId: string, deduction: any) => this.addDeduction(depositId, deduction),
    disputeDeduction: (depositId: string, deductionId: string) => this.disputeDeduction(depositId, deductionId),
    requestReturn: (depositId: string) => this.requestReturn(depositId),
  }
}

// Export singleton instance
export const apiClient = new ApiClient();