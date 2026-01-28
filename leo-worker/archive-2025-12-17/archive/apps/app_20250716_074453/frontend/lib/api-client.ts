// API Client following the technical implementation spec

import { User, Pet, Appointment, MedicalRecord, Invoice, Prescription, Product, Message, Task, Vaccination, DashboardStats } from '@/types';
import { 
  LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, SessionResponse,
  CreatePetRequest, UpdatePetRequest, AppointmentFilters, CreateAppointmentRequest,
  UpdateAppointmentRequest, CreateSOAPNoteRequest, InvoiceFilters, PaymentRequest,
  SendMessageRequest, UpdateInventoryRequest, ApiResponse, PaginatedResponse
} from '@/types/api';

export class ApiError extends Error {
  constructor(public message: string, public code: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_CLINIC_KEY = 'current_clinic';

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
      
      if (!response.ok) {
        await this.handleHttpError(response);
      }
      
      return await response.json();
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
  
  private async handleHttpError(response: Response) {
    let data: { detail?: string; message?: string; error?: string } = {};
    try {
      data = await response.json();
    } catch {
      // Response might not be JSON
    }
    
    switch (response.status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        throw new ApiError('You do not have permission to perform this action', 'FORBIDDEN');
      case 404:
        throw new ApiError('The requested resource was not found', 'NOT_FOUND');
      case 429:
        const retryAfter = response.headers.get('Retry-After');
        throw new ApiError(`Rate limited. Try again in ${retryAfter} seconds`, 'RATE_LIMITED');
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiError('Server error. Please try again later.', 'SERVER_ERROR');
      default:
        throw new ApiError(data.detail || 'An error occurred', 'UNKNOWN_ERROR');
    }
  }
  
  private handleUnauthorized() {
    // Clear all auth data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_CLINIC_KEY);
    this.token = null;
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  
  // Auth endpoints
  async login(email: string, password: string, portal: 'client' | 'staff' = 'client', rememberMe: boolean = false) {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, portal, rememberMe } as LoginRequest),
    });
    
    this.setToken(response.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
    
    return response;
  }
  
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.handleUnauthorized();
    }
  }
  
  async getSession() {
    return this.request<SessionResponse>('/auth/session');
  }
  
  // Pet endpoints
  async getPets() {
    return this.request<Pet[]>('/pets');
  }
  
  async getPet(id: string) {
    return this.request<Pet>(`/pets/${id}`);
  }
  
  async createPet(data: CreatePetRequest) {
    return this.request<Pet>('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async updatePet(id: string, data: UpdatePetRequest) {
    return this.request<Pet>(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  // Appointment endpoints
  async getAppointments(filters?: AppointmentFilters) {
    const params = new URLSearchParams(filters as any);
    return this.request<Appointment[]>(`/appointments?${params}`);
  }
  
  async getAppointment(id: string) {
    return this.request<Appointment>(`/appointments/${id}`);
  }
  
  async createAppointment(data: CreateAppointmentRequest) {
    return this.request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async updateAppointment(id: string, data: UpdateAppointmentRequest) {
    return this.request<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async cancelAppointment(id: string, reason: string) {
    return this.request<Appointment>(`/appointments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
  
  // Medical records endpoints
  async getMedicalRecords(petId: string) {
    return this.request<MedicalRecord[]>(`/pets/${petId}/medical-records`);
  }
  
  async createSOAPNote(data: CreateSOAPNoteRequest) {
    return this.request<MedicalRecord>('/medical-records/soap', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // Prescription endpoints
  async getPrescriptions(petId?: string) {
    const params = petId ? `?pet_id=${petId}` : '';
    return this.request<Prescription[]>(`/prescriptions${params}`);
  }
  
  async requestRefill(prescriptionId: string, notes?: string) {
    return this.request<Prescription>(`/prescriptions/${prescriptionId}/refill`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }
  
  // Invoice endpoints
  async getInvoices(filters?: InvoiceFilters) {
    const params = new URLSearchParams(filters as any);
    return this.request<Invoice[]>(`/invoices?${params}`);
  }
  
  async getInvoice(id: string) {
    return this.request<Invoice>(`/invoices/${id}`);
  }
  
  async payInvoice(id: string, paymentData: PaymentRequest) {
    return this.request<Invoice>(`/invoices/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
  
  // Message endpoints
  async getMessages(folder: 'inbox' | 'sent' = 'inbox') {
    return this.request<Message[]>(`/messages?folder=${folder}`);
  }
  
  async getMessage(id: string) {
    return this.request<Message>(`/messages/${id}`);
  }
  
  async sendMessage(data: SendMessageRequest) {
    return this.request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // Staff-specific endpoints
  async getPatients(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<Pet[]>(`/patients${params}`);
  }
  
  async getSchedule(date: string, providerId?: string) {
    const params = new URLSearchParams({ date });
    if (providerId) params.append('provider_id', providerId);
    return this.request<Appointment[]>(`/schedule?${params}`);
  }
  
  async getInventory() {
    return this.request<Product[]>('/inventory');
  }
  
  async updateInventory(productId: string, data: UpdateInventoryRequest) {
    return this.request<Product>(`/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  // Stats endpoints
  async getDashboardStats() {
    return this.request<DashboardStats>('/stats/dashboard');
  }
}

export const apiClient = new ApiClient();