// API Request and Response types

import { User, Pet, Appointment, Invoice, Prescription, Product, Message, SOAPNote } from './index';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  portal?: 'client' | 'staff';
  rememberMe?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  accountType: 'pet_owner' | 'clinic';
  clinicName?: string;
}

export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface SessionResponse {
  valid: boolean;
  user: User | null;
}

// Pet types
export interface CreatePetRequest {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  dateOfBirth: string;
  sex: 'male' | 'female';
  isNeutered: boolean;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  microchipNumber?: string;
  color?: string;
  allergies?: string[];
  conditions?: string[];
}

export interface UpdatePetRequest extends Partial<CreatePetRequest> {}

// Appointment types
export interface AppointmentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  petId?: string;
  providerId?: string;
}

export interface CreateAppointmentRequest {
  petId: string;
  serviceType: string;
  date: string;
  time: string;
  duration: number;
  providerId?: string;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
  status?: string;
  roomNumber?: string;
}

// SOAP Note types
export interface CreateSOAPNoteRequest {
  petId: string;
  appointmentId?: string;
  subjective: {
    chiefComplaint: string;
    history?: string;
    ownerObservations?: string;
    duration?: string;
  };
  objective: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    weight?: number;
    bodyConditionScore?: number;
    physicalExam?: Record<string, string>;
  };
  assessment: {
    diagnosis: string[];
    prognosis?: string;
    differentials?: string[];
  };
  plan: {
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    procedures?: string[];
    followUp?: string;
    clientEducation?: string[];
    homeInstructions?: string;
  };
}

// Invoice types
export interface InvoiceFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  petId?: string;
  ownerId?: string;
}

export interface PaymentRequest {
  amount: number;
  paymentMethod: 'credit' | 'debit' | 'cash' | 'check';
  cardDetails?: {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
    zipCode: string;
  };
  checkDetails?: {
    checkNumber: string;
    bankName?: string;
  };
  discount?: {
    type: 'percentage' | 'amount';
    value: number;
  };
}

// Message types
export interface SendMessageRequest {
  toId: string;
  subject: string;
  content: string;
  priority?: 'normal' | 'high' | 'urgent';
  relatedPetId?: string;
  attachments?: File[];
}

// Inventory types
export interface UpdateInventoryRequest {
  currentStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  price?: number;
  cost?: number;
}

// Generic API response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}