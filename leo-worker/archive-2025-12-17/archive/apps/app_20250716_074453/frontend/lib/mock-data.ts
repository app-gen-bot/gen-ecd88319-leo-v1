import { 
  User, Pet, Appointment, MedicalRecord, Prescription, Invoice, 
  Message, Task, Product, Vaccination, Document as DocType, DashboardStats
} from '@/types';
import { addDays, subDays, addHours, format } from 'date-fns';

// Demo credentials
export const DEMO_USER = {
  email: 'demo@example.com',
  password: 'demo123',
  name: 'Demo User',
  role: 'pet_owner' as const,
};

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'pet_owner',
    phone: '(555) 123-4567',
    avatar: '/avatars/demo.jpg',
    createdAt: subDays(new Date(), 90).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'dr.smith@pawsflow.com',
    firstName: 'Sarah',
    lastName: 'Smith',
    role: 'veterinarian',
    phone: '(555) 234-5678',
    clinicId: 'clinic1',
    avatar: '/avatars/vet1.jpg',
    createdAt: subDays(new Date(), 365).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'tech.jones@pawsflow.com',
    firstName: 'Mike',
    lastName: 'Jones',
    role: 'technician',
    phone: '(555) 345-6789',
    clinicId: 'clinic1',
    avatar: '/avatars/tech1.jpg',
    createdAt: subDays(new Date(), 180).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'front.desk@pawsflow.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    role: 'front_desk',
    phone: '(555) 456-7890',
    clinicId: 'clinic1',
    avatar: '/avatars/front1.jpg',
    createdAt: subDays(new Date(), 120).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock pets
export const mockPets: Pet[] = [
  {
    id: '1',
    ownerId: '1',
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    dateOfBirth: subDays(new Date(), 1095).toISOString(), // 3 years old
    sex: 'male',
    isNeutered: true,
    weight: 75,
    weightUnit: 'lbs',
    microchipNumber: '123456789012345',
    color: 'Golden',
    photo: '/pets/golden-retriever.jpg',
    allergies: ['Chicken'],
    conditions: ['Hip Dysplasia'],
    createdAt: subDays(new Date(), 90).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    ownerId: '1',
    name: 'Luna',
    species: 'cat',
    breed: 'Persian',
    dateOfBirth: subDays(new Date(), 730).toISOString(), // 2 years old
    sex: 'female',
    isNeutered: true,
    weight: 12,
    weightUnit: 'lbs',
    color: 'White',
    photo: '/pets/persian-cat.jpg',
    allergies: [],
    conditions: [],
    createdAt: subDays(new Date(), 60).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    petId: '1',
    ownerId: '1',
    providerId: '2',
    serviceType: 'Annual Checkup',
    date: addDays(new Date(), 3).toISOString(),
    time: '10:00',
    duration: 30,
    status: 'scheduled',
    roomNumber: '101',
    reason: 'Annual wellness exam and vaccinations',
    createdAt: subDays(new Date(), 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    petId: '2',
    ownerId: '1',
    providerId: '2',
    serviceType: 'Dental Cleaning',
    date: addDays(new Date(), 10).toISOString(),
    time: '14:00',
    duration: 60,
    status: 'scheduled',
    roomNumber: '102',
    reason: 'Routine dental cleaning',
    createdAt: subDays(new Date(), 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    petId: '1',
    ownerId: '1',
    providerId: '2',
    serviceType: 'Sick Visit',
    date: subDays(new Date(), 7).toISOString(),
    time: '11:00',
    duration: 30,
    status: 'completed',
    roomNumber: '101',
    reason: 'Vomiting and lethargy',
    notes: 'Diagnosed with mild gastroenteritis. Prescribed medication.',
    createdAt: subDays(new Date(), 8).toISOString(),
    updatedAt: subDays(new Date(), 7).toISOString(),
  },
];

// Mock prescriptions
export const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    petId: '1',
    medication: 'Carprofen 75mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '14 days',
    quantity: 28,
    refills: 2,
    instructions: 'Give with food. For pain management.',
    prescribedBy: '2',
    prescribedDate: subDays(new Date(), 7).toISOString(),
    status: 'active',
    createdAt: subDays(new Date(), 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    petId: '2',
    medication: 'Revolution Plus',
    dosage: '0.5ml',
    frequency: 'Monthly',
    duration: '6 months',
    quantity: 6,
    refills: 1,
    instructions: 'Apply topically between shoulder blades',
    prescribedBy: '2',
    prescribedDate: subDays(new Date(), 30).toISOString(),
    status: 'active',
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock invoices
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    appointmentId: '3',
    petId: '1',
    ownerId: '1',
    date: subDays(new Date(), 7).toISOString(),
    dueDate: addDays(new Date(), 23).toISOString(),
    status: 'sent',
    lineItems: [
      {
        id: '1',
        description: 'Sick Visit Examination',
        quantity: 1,
        unitPrice: 75.00,
        total: 75.00,
        category: 'service',
      },
      {
        id: '2',
        description: 'Carprofen 75mg (28 tablets)',
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00,
        category: 'medication',
      },
      {
        id: '3',
        description: 'Anti-nausea injection',
        quantity: 1,
        unitPrice: 35.00,
        total: 35.00,
        category: 'service',
      },
    ],
    subtotal: 155.00,
    tax: 12.40,
    discount: 0,
    total: 167.40,
    paidAmount: 0,
    balance: 167.40,
    createdAt: subDays(new Date(), 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock messages
export const mockMessages: Message[] = [
  {
    id: '1',
    fromId: 'clinic1',
    toId: '1',
    subject: 'Appointment Reminder',
    content: 'This is a reminder that Max has an appointment scheduled for ' + format(addDays(new Date(), 3), 'MMMM d, yyyy') + ' at 10:00 AM.',
    read: false,
    priority: 'normal',
    relatedPetId: '1',
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: '2',
    fromId: '2',
    toId: '1',
    subject: 'Lab Results Available',
    content: 'Good news! Max\'s lab results from the recent visit are normal. All blood work came back within healthy ranges.',
    read: true,
    priority: 'normal',
    relatedPetId: '1',
    createdAt: subDays(new Date(), 5).toISOString(),
    updatedAt: subDays(new Date(), 4).toISOString(),
  },
];

// Mock products (inventory)
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Carprofen 75mg',
    sku: 'MED-CARP-75',
    category: 'Medications',
    description: 'Anti-inflammatory pain medication for dogs',
    supplier: 'VetMeds Inc',
    cost: 0.50,
    price: 1.60,
    currentStock: 450,
    reorderPoint: 100,
    reorderQuantity: 500,
    unit: 'tablets',
    location: 'Pharmacy Shelf A-3',
    createdAt: subDays(new Date(), 180).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Rabies Vaccine',
    sku: 'VAC-RAB-1ML',
    category: 'Vaccines',
    description: 'Rabies vaccine for dogs and cats',
    supplier: 'BioVet Supplies',
    cost: 8.00,
    price: 25.00,
    currentStock: 45,
    reorderPoint: 20,
    reorderQuantity: 50,
    unit: 'doses',
    expirationDate: addDays(new Date(), 180).toISOString(),
    location: 'Refrigerator Unit 1',
    createdAt: subDays(new Date(), 90).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Surgical Gloves (Medium)',
    sku: 'SUP-GLOVE-M',
    category: 'Supplies',
    description: 'Sterile surgical gloves, size medium',
    supplier: 'Medical Supply Co',
    cost: 0.20,
    price: 0.50,
    currentStock: 800,
    reorderPoint: 200,
    reorderQuantity: 1000,
    unit: 'pairs',
    location: 'Supply Room B-2',
    createdAt: subDays(new Date(), 60).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Prepare exam room for Max',
    description: 'Set up room 101 for annual checkup. Include vaccination tray.',
    assignedTo: '3',
    assignedBy: '2',
    dueDate: addDays(new Date(), 3).toISOString(),
    priority: 'medium',
    status: 'pending',
    relatedPatientId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Order more rabies vaccines',
    description: 'Stock is running low. Need to order before end of week.',
    assignedTo: '4',
    assignedBy: '2',
    dueDate: addDays(new Date(), 2).toISOString(),
    priority: 'high',
    status: 'in_progress',
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock vaccinations
export const mockVaccinations: Vaccination[] = [
  {
    id: '1',
    petId: '1',
    vaccineName: 'Rabies',
    dateGiven: subDays(new Date(), 365).toISOString(),
    nextDueDate: addDays(new Date(), 0).toISOString(), // Due now
    batchNumber: 'RAB2023-1234',
    manufacturer: 'Merial',
    administeredBy: '2',
    createdAt: subDays(new Date(), 365).toISOString(),
    updatedAt: subDays(new Date(), 365).toISOString(),
  },
  {
    id: '2',
    petId: '1',
    vaccineName: 'DHPP',
    dateGiven: subDays(new Date(), 365).toISOString(),
    nextDueDate: addDays(new Date(), 0).toISOString(), // Due now
    batchNumber: 'DHPP2023-5678',
    manufacturer: 'Zoetis',
    administeredBy: '2',
    createdAt: subDays(new Date(), 365).toISOString(),
    updatedAt: subDays(new Date(), 365).toISOString(),
  },
  {
    id: '3',
    petId: '2',
    vaccineName: 'FVRCP',
    dateGiven: subDays(new Date(), 180).toISOString(),
    nextDueDate: addDays(new Date(), 185).toISOString(),
    batchNumber: 'FVRCP2023-9012',
    manufacturer: 'Elanco',
    administeredBy: '2',
    createdAt: subDays(new Date(), 180).toISOString(),
    updatedAt: subDays(new Date(), 180).toISOString(),
  },
];

// Helper functions for mock data
export function getMockUser(email: string, password: string): User | null {
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    return mockUsers[0];
  }
  // In a real app, this would check against the database
  const user = mockUsers.find(u => u.email === email);
  return user || null;
}

export function getMockPetsByOwner(ownerId: string): Pet[] {
  return mockPets.filter(pet => pet.ownerId === ownerId);
}

export function getMockAppointmentsByOwner(ownerId: string): Appointment[] {
  return mockAppointments
    .filter(apt => apt.ownerId === ownerId)
    .map(apt => ({
      ...apt,
      pet: mockPets.find(p => p.id === apt.petId),
      provider: mockUsers.find(u => u.id === apt.providerId),
    }));
}

export function getMockUpcomingAppointments(ownerId: string): Appointment[] {
  const now = new Date();
  return getMockAppointmentsByOwner(ownerId)
    .filter(apt => new Date(apt.date) > now && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getMockPastAppointments(ownerId: string): Appointment[] {
  const now = new Date();
  return getMockAppointmentsByOwner(ownerId)
    .filter(apt => new Date(apt.date) <= now || apt.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMockPrescriptionsByOwner(ownerId: string): Prescription[] {
  const ownerPetIds = getMockPetsByOwner(ownerId).map(p => p.id);
  return mockPrescriptions
    .filter(rx => ownerPetIds.includes(rx.petId))
    .map(rx => ({
      ...rx,
      pet: mockPets.find(p => p.id === rx.petId),
    }));
}

export function getMockInvoicesByOwner(ownerId: string): Invoice[] {
  return mockInvoices
    .filter(inv => inv.ownerId === ownerId)
    .map(inv => ({
      ...inv,
      pet: mockPets.find(p => p.id === inv.petId),
    }));
}

export function getMockMessagesByUser(userId: string): Message[] {
  return mockMessages
    .filter(msg => msg.toId === userId)
    .map(msg => ({
      ...msg,
      from: mockUsers.find(u => u.id === msg.fromId) || { 
        id: 'clinic1', 
        email: 'clinic@pawsflow.com',
        firstName: 'PawsFlow',
        lastName: 'Clinic',
        role: 'admin' as const,
        createdAt: '',
        updatedAt: '',
      },
      relatedPet: msg.relatedPetId ? mockPets.find(p => p.id === msg.relatedPetId) : undefined,
    }));
}

export function getMockVaccinationsByPet(petId: string): Vaccination[] {
  return mockVaccinations.filter(vac => vac.petId === petId);
}

// Mock dashboard stats
export function getMockDashboardStats(userId: string): DashboardStats {
  const user = mockUsers.find(u => u.id === userId);
  
  if (user?.role === 'pet_owner') {
    const appointments = getMockUpcomingAppointments(userId);
    const messages = getMockMessagesByUser(userId);
    const invoices = getMockInvoicesByOwner(userId);
    
    return {
      upcomingAppointments: appointments.length,
      unreadMessages: messages.filter(m => !m.read).length,
      outstandingBalance: invoices
        .filter(i => i.status !== 'paid')
        .reduce((sum, inv) => sum + inv.balance, 0),
      petsCount: getMockPetsByOwner(userId).length,
    };
  }
  
  // Staff dashboard stats
  return {
    todayAppointments: 8,
    pendingTasks: mockTasks.filter(t => t.status !== 'completed').length,
    unreadMessages: 3,
    lowStockItems: mockProducts.filter(p => p.currentStock <= p.reorderPoint).length,
    dailyRevenue: 1250.00,
    patientsCheckedIn: 4,
  };
}

// Additional exports needed by the application
export const mockPatients = mockPets; // Alias for consistency
export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    petId: '1',
    providerId: 'staff_1',
    type: 'soap',
    date: '2024-01-15T10:00:00',
    soapNote: {
      subjective: {
        chiefComplaint: 'Annual wellness exam',
        history: 'Owner reports Max is doing well, eating normally',
      },
      objective: {
        temperature: 101.5,
        heartRate: 80,
        respiratoryRate: 20,
        weight: 65,
        bodyConditionScore: 5,
        physicalExam: {
          general: 'Healthy adult dog, no concerns'
        }
      },
      assessment: {
        diagnosis: ['Healthy adult dog'],
        prognosis: 'Excellent'
      },
      plan: {
        procedures: ['Annual exam completed'],
        followUp: 'Return in 1 year',
        clientEducation: ['Continue current diet']
      }
    },
    createdAt: '2024-01-15T10:00:00',
    updatedAt: '2024-01-15T10:00:00'
  },
  {
    id: '2',
    petId: '1',
    providerId: 'staff_1',
    type: 'vaccination',
    date: '2024-01-15T10:30:00',
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    id: '3',
    petId: '2',
    providerId: 'staff_2',
    type: 'soap',
    date: '2024-01-10T14:00:00',
    soapNote: {
      subjective: {
        chiefComplaint: 'Bad breath',
        ownerObservations: 'Bad breath reported by owner'
      },
      objective: {
        physicalExam: {
          dental: 'Grade 2 dental disease, plaque buildup'
        }
      },
      assessment: {
        diagnosis: ['Moderate dental disease'],
        prognosis: 'Good with treatment'
      },
      plan: {
        procedures: ['Dental cleaning completed'],
        homeInstructions: 'Home dental care recommended'
      }
    },
    createdAt: '2024-01-10T14:00:00',
    updatedAt: '2024-01-10T14:00:00'
  }
];

export function getMockPets(): Pet[] {
  return mockPets;
}

export function getMockStaff(): User[] {
  return mockUsers.filter(u => u.role !== 'pet_owner');
}

export function getMockOwners(): User[] {
  return mockUsers.filter(u => u.role === 'pet_owner');
}

export function getMockPetById(id: string): Pet | undefined {
  return mockPets.find(p => p.id === id);
}

export function getMockOwnerById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getMockAppointmentsByVet(vetId: string): Appointment[] {
  // For demo, return all appointments
  return mockAppointments;
}