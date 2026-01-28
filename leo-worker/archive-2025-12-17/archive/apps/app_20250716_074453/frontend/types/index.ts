// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  clinicId?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'pet_owner' | 'veterinarian' | 'technician' | 'front_desk' | 'practice_manager' | 'admin';

// Pet types
export interface Pet {
  id: string;
  ownerId: string;
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
  photo?: string;
  allergies?: string[];
  conditions?: string[];
  createdAt: string;
  updatedAt: string;
}

// Appointment types
export interface Appointment {
  id: string;
  petId: string;
  pet?: Pet;
  ownerId: string;
  owner?: User;
  providerId: string;
  provider?: User;
  serviceType: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  roomNumber?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

// Medical record types
export interface MedicalRecord {
  id: string;
  petId: string;
  pet?: Pet;
  appointmentId?: string;
  appointment?: Appointment;
  providerId: string;
  provider?: User;
  type: RecordType;
  date: string;
  soapNote?: SOAPNote;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export type RecordType = 'soap' | 'lab_result' | 'imaging' | 'vaccination' | 'surgery' | 'other';

export interface SOAPNote {
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
    physicalExam?: { [system: string]: string };
  };
  assessment: {
    diagnosis: string[];
    prognosis?: string;
    differentials?: string[];
  };
  plan: {
    medications?: Prescription[];
    procedures?: string[];
    followUp?: string;
    clientEducation?: string[];
    homeInstructions?: string;
  };
}

// Prescription types
export interface Prescription {
  id: string;
  petId: string;
  pet?: Pet;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions: string;
  prescribedBy: string;
  prescribedDate: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Billing types
export interface Invoice {
  id: string;
  appointmentId?: string;
  petId: string;
  pet?: Pet;
  ownerId: string;
  owner?: User;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'service' | 'product' | 'medication';
}

// Inventory types
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  supplier?: string;
  cost: number;
  price: number;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unit: string;
  expirationDate?: string;
  location?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Message types
export interface Message {
  id: string;
  fromId: string;
  from?: User;
  toId: string;
  to?: User;
  subject: string;
  content: string;
  read: boolean;
  attachments?: Attachment[];
  priority?: 'normal' | 'high' | 'urgent';
  relatedPetId?: string;
  relatedPet?: Pet;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToUser?: User;
  assignedBy: string;
  assignedByUser?: User;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  relatedPatientId?: string;
  relatedPatient?: Pet;
  createdAt: string;
  updatedAt: string;
}

// Vaccination types
export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
  batchNumber?: string;
  manufacturer?: string;
  administeredBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Document types
export interface Document {
  id: string;
  petId: string;
  category: 'lab_results' | 'xray' | 'certificate' | 'insurance' | 'other';
  name: string;
  url: string;
  uploadedBy: string;
  uploadedDate: string;
  fileSize: number;
  mimeType: string;
}

// Clinic types
export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  operatingHours: OperatingHours;
  services: string[];
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

// Dashboard statistics
export interface DashboardStats {
  // Staff properties
  todayAppointments?: number;
  pendingTasks?: number;
  lowStockItems?: number;
  dailyRevenue?: number;
  patientsCheckedIn?: number;
  
  // Client properties
  upcomingAppointments?: number;
  petsCount?: number;
  outstandingBalance?: number;
  
  // Shared properties
  unreadMessages: number;
}