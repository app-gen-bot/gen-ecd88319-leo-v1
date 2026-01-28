// Standard API Client following opinionated patterns

// Token keys - ALWAYS use these exact keys
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const CURRENT_USER_KEY = 'current_user';
export const CURRENT_WORKSPACE_KEY = 'current_workspace';

// Custom error class
class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    // Auto-restore token
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
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    // Always add auth header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(url, { ...options, headers });
      
      // Handle non-OK responses
      if (!response.ok) {
        if (response.status === 401) {
          // Auto-logout on 401
          this.handleUnauthorized();
          throw new ApiError('Session expired', 'UNAUTHORIZED');
        }
        
        const data = await response.json().catch(() => ({}));
        throw new ApiError(
          data.detail || `Request failed with status ${response.status}`,
          this.getErrorCode(response.status),
          data
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error', 'NETWORK_ERROR');
    }
  }
  
  private handleUnauthorized() {
    // Clear everything and redirect
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_WORKSPACE_KEY);
    this.token = null;
    
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  }
  
  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMITED',
      500: 'SERVER_ERROR',
      502: 'SERVER_ERROR',
      503: 'SERVER_ERROR',
      504: 'SERVER_ERROR',
    };
    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
  
  // Standard CRUD methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
  
  // Auth endpoints
  async login(email: string, password: string) {
    return this.post<{
      access_token: string;
      refresh_token: string;
      user: any;
    }>('/auth/login', { email, password });
  }
  
  async signup(name: string, email: string, password: string) {
    return this.post<{
      access_token: string;
      refresh_token: string;
      user: any;
    }>('/auth/signup', { name, email, password });
  }
  
  async logout() {
    return this.post('/auth/logout');
  }
  
  async getSession() {
    return this.get<{ valid: boolean; user?: any }>('/auth/session');
  }
  
  // AI Legal Advisor endpoints
  async sendChatMessage(message: string, context?: any) {
    return this.post<{
      response: string;
      citations: Array<{ law: string; section: string; text: string }>;
    }>('/chat/message', { message, context });
  }
  
  async getChatHistory() {
    return this.get<Array<{
      id: string;
      message: string;
      response: string;
      created_at: string;
    }>>('/chat/history');
  }
  
  // Document Review endpoints
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<{
      id: string;
      status: string;
      file_name: string;
    }>('/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }
  
  async getDocumentAnalysis(documentId: string) {
    return this.get<{
      id: string;
      file_name: string;
      analysis: {
        issues: Array<{
          type: string;
          severity: 'high' | 'medium' | 'low';
          description: string;
          clause: string;
          recommendation: string;
        }>;
        summary: string;
        risk_level: string;
      };
    }>(`/documents/${documentId}/analysis`);
  }
  
  // Smart Documentation endpoints
  async savePropertyDocumentation(data: {
    type: 'move_in' | 'move_out';
    property_id: string;
    media: Array<{ url: string; type: 'photo' | 'video'; annotations?: any }>;
    notes: string;
  }) {
    return this.post('/documentation', data);
  }
  
  // Dispute Wizard endpoints
  async createDispute(data: {
    type: string;
    description: string;
    evidence: string[];
  }) {
    return this.post('/disputes', data);
  }
  
  async getDisputeById(id: string) {
    return this.get(`/disputes/${id}`);
  }
  
  // Letter Generator endpoints
  async getLetterTemplates() {
    return this.get<Array<{
      id: string;
      name: string;
      category: string;
      description: string;
    }>>('/letters/templates');
  }
  
  async generateLetter(templateId: string, data: any) {
    return this.post<{
      id: string;
      content: string;
      pdf_url: string;
    }>('/letters/generate', { template_id: templateId, data });
  }
  
  // Security Deposit endpoints
  async getSecurityDeposits() {
    return this.get('/deposits');
  }
  
  async createSecurityDeposit(data: {
    amount: number;
    move_in_date: string;
    property_address: string;
    landlord_name: string;
  }) {
    return this.post('/deposits', data);
  }
  
  // Communication Hub endpoints
  async getMessages() {
    return this.get('/communications');
  }
  
  async sendMessage(data: {
    recipient_id: string;
    subject: string;
    content: string;
  }) {
    return this.post('/communications', data);
  }
  
  // Knowledge Base endpoints
  async searchKnowledge(query: string) {
    return this.get(`/knowledge/search?q=${encodeURIComponent(query)}`);
  }
  
  async getKnowledgeArticle(id: string) {
    return this.get(`/knowledge/articles/${id}`);
  }
}

// Export singleton
const apiClient = new ApiClient();
export default apiClient;
export { ApiError };