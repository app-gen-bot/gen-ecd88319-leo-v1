'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Pet, User, Appointment, MedicalRecord, Vaccination, Prescription, Document as DocType } from '@/types';
import {
  ArrowLeftIcon,
  PencilIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  CameraIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BeakerIcon,
  ShieldCheckIcon,
  PaperClipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';

// Extended patient interface with all related data
interface PatientProfile extends Pet {
  owner: User;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  vaccinations: Vaccination[];
  prescriptions: Prescription[];
  documents: DocType[];
}

// Mock data for a single patient
const mockPatient: PatientProfile = {
  id: '1',
  name: 'Max',
  species: 'dog',
  breed: 'Golden Retriever',
  ownerId: '1',
  owner: {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'pet_owner',
    phone: '(555) 123-4567',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  dateOfBirth: '2020-01-15',
  sex: 'male',
  isNeutered: true,
  weight: 70,
  weightUnit: 'lbs',
  color: 'Golden',
  microchipNumber: '985112004569871',
  allergies: ['Chicken', 'Dust mites'],
  conditions: ['Hip dysplasia', 'Seasonal allergies'],
  photo: '/api/placeholder/300/300',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  appointments: [
    {
      id: '1',
      petId: '1',
      ownerId: '1',
      providerId: '2',
      provider: { id: '2', email: 'drsmith@example.com', firstName: 'Dr. Sarah', lastName: 'Smith', role: 'veterinarian', createdAt: '', updatedAt: '' },
      serviceType: 'Wellness Exam',
      date: '2024-03-01',
      time: '09:00',
      duration: 30,
      status: 'completed',
      roomNumber: '2',
      reason: 'Annual checkup',
      createdAt: '2024-02-15',
      updatedAt: '2024-03-01'
    },
    {
      id: '2',
      petId: '1',
      ownerId: '1',
      providerId: '2',
      provider: { id: '2', email: 'drsmith@example.com', firstName: 'Dr. Sarah', lastName: 'Smith', role: 'veterinarian', createdAt: '', updatedAt: '' },
      serviceType: 'Dental Cleaning',
      date: '2024-04-15',
      time: '14:00',
      duration: 60,
      status: 'scheduled',
      roomNumber: '3',
      reason: 'Routine dental maintenance',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01'
    }
  ],
  medicalRecords: [
    {
      id: '1',
      petId: '1',
      appointmentId: '1',
      providerId: '2',
      type: 'soap',
      date: '2024-03-01',
      soapNote: {
        subjective: {
          chiefComplaint: 'Annual wellness exam',
          history: 'No concerns reported by owner',
          ownerObservations: 'Eating and drinking normally, good energy levels'
        },
        objective: {
          temperature: 101.5,
          heartRate: 80,
          respiratoryRate: 20,
          weight: 70,
          bodyConditionScore: 5,
          physicalExam: {
            'General': 'Bright, alert, responsive',
            'EENT': 'Clear eyes, clean ears, no nasal discharge',
            'Cardiovascular': 'No murmurs, strong pulses',
            'Respiratory': 'Clear lung sounds bilaterally',
            'Musculoskeletal': 'Mild hip stiffness noted'
          }
        },
        assessment: {
          diagnosis: ['Healthy adult dog', 'Mild hip dysplasia'],
          prognosis: 'Good'
        },
        plan: {
          medications: [
            {
              id: '1',
              petId: '1',
              medication: 'Carprofen',
              dosage: '75mg',
              frequency: 'Twice daily',
              duration: '30 days',
              quantity: 60,
              refills: 2,
              instructions: 'Give with food',
              prescribedBy: 'Dr. Sarah Smith',
              prescribedDate: '2024-03-01',
              status: 'active',
              createdAt: '2024-03-01',
              updatedAt: '2024-03-01'
            }
          ],
          followUp: 'Recheck in 3 months',
          clientEducation: ['Joint health maintenance', 'Weight management']
        }
      },
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01'
    }
  ],
  vaccinations: [
    {
      id: '1',
      petId: '1',
      vaccineName: 'DHPP',
      dateGiven: '2024-03-01',
      nextDueDate: '2025-03-01',
      batchNumber: 'LOT2024A',
      manufacturer: 'Zoetis',
      administeredBy: 'Dr. Sarah Smith',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01'
    },
    {
      id: '2',
      petId: '1',
      vaccineName: 'Rabies',
      dateGiven: '2023-01-15',
      nextDueDate: '2026-01-15',
      batchNumber: 'RB2023X',
      manufacturer: 'Merial',
      administeredBy: 'Dr. Sarah Smith',
      createdAt: '2023-01-15',
      updatedAt: '2023-01-15'
    },
    {
      id: '3',
      petId: '1',
      vaccineName: 'Bordetella',
      dateGiven: '2023-09-01',
      nextDueDate: '2024-03-01',
      batchNumber: 'BD2023Z',
      manufacturer: 'Zoetis',
      administeredBy: 'Dr. Sarah Smith',
      notes: 'Overdue - needs renewal',
      createdAt: '2023-09-01',
      updatedAt: '2023-09-01'
    }
  ],
  prescriptions: [
    {
      id: '1',
      petId: '1',
      medication: 'Carprofen',
      dosage: '75mg',
      frequency: 'Twice daily',
      duration: '30 days',
      quantity: 60,
      refills: 2,
      instructions: 'Give with food to prevent stomach upset',
      prescribedBy: 'Dr. Sarah Smith',
      prescribedDate: '2024-03-01',
      status: 'active',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01'
    },
    {
      id: '2',
      petId: '1',
      medication: 'Apoquel',
      dosage: '16mg',
      frequency: 'Once daily',
      duration: '90 days',
      quantity: 90,
      refills: 3,
      instructions: 'For allergy management',
      prescribedBy: 'Dr. Sarah Smith',
      prescribedDate: '2024-02-01',
      status: 'active',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-01'
    }
  ],
  documents: [
    {
      id: '1',
      petId: '1',
      category: 'lab_results',
      name: 'Blood Work Results - March 2024',
      url: '/documents/bloodwork-2024-03.pdf',
      uploadedBy: 'Dr. Sarah Smith',
      uploadedDate: '2024-03-01',
      fileSize: 245000,
      mimeType: 'application/pdf'
    },
    {
      id: '2',
      petId: '1',
      category: 'xray',
      name: 'Hip X-Ray - January 2024',
      url: '/documents/hip-xray-2024-01.jpg',
      uploadedBy: 'Dr. Sarah Smith',
      uploadedDate: '2024-01-15',
      fileSize: 1200000,
      mimeType: 'image/jpeg'
    },
    {
      id: '3',
      petId: '1',
      category: 'insurance',
      name: 'Pet Insurance Card',
      url: '/documents/insurance-card.pdf',
      uploadedBy: 'John Doe',
      uploadedDate: '2024-01-01',
      fileSize: 150000,
      mimeType: 'application/pdf'
    }
  ]
};

// Species configuration
const speciesConfig = {
  dog: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', emoji: '🐕' },
  cat: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', emoji: '🐈' },
  bird: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', emoji: '🦜' },
  rabbit: { color: 'bg-pink-500/20 text-pink-400 border-pink-500/50', emoji: '🐰' },
  other: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', emoji: '🐾' },
};

// Document category configuration
const documentCategories = {
  lab_results: { label: 'Lab Results', icon: BeakerIcon, color: 'text-green-400' },
  xray: { label: 'X-Rays', icon: PhotoIcon, color: 'text-blue-400' },
  certificate: { label: 'Certificates', icon: ShieldCheckIcon, color: 'text-purple-400' },
  insurance: { label: 'Insurance', icon: DocumentTextIcon, color: 'text-orange-400' },
  other: { label: 'Other', icon: PaperClipIcon, color: 'text-gray-400' },
};

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isScheduleAppointmentOpen, setIsScheduleAppointmentOpen] = useState(false);
  const [isCreateSOAPNoteOpen, setIsCreateSOAPNoteOpen] = useState(false);
  const [isUploadPhotoOpen, setIsUploadPhotoOpen] = useState(false);

  // In a real app, fetch patient data based on params.id
  const patient = mockPatient;
  const speciesStyle = speciesConfig[patient.species] || speciesConfig.other;

  // Calculate age
  const getAge = () => {
    const birthDate = parseISO(patient.dateOfBirth);
    const ageInDays = differenceInDays(new Date(), birthDate);
    
    if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return months === 1 ? '1 month old' : `${months} months old`;
    } else {
      const years = Math.floor(ageInDays / 365);
      return years === 1 ? '1 year old' : `${years} years old`;
    }
  };

  // Check for overdue vaccinations
  const overdueVaccinations = patient.vaccinations.filter(vac => {
    if (!vac.nextDueDate) return false;
    return differenceInDays(new Date(), parseISO(vac.nextDueDate)) > 0;
  });

  // Get upcoming vaccinations (within 30 days)
  const upcomingVaccinations = patient.vaccinations.filter(vac => {
    if (!vac.nextDueDate) return false;
    const daysUntilDue = differenceInDays(parseISO(vac.nextDueDate), new Date());
    return daysUntilDue > 0 && daysUntilDue <= 30;
  });

  const handleQuickAction = (action: string) => {
    const messages: Record<string, string> = {
      schedule: 'Opening appointment scheduler...',
      soap: 'Opening SOAP note creator...',
      photo: 'Opening photo uploader...',
      download: 'Downloading patient record...',
      email: 'Opening email composer...',
    };
    
    toast({
      title: 'Action Initiated',
      description: messages[action] || 'Processing...',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/staff/patients')}
          className="gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Patients
        </Button>
      </div>

      {/* Patient Header Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Pet Photo and Basic Info */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-4xl overflow-hidden">
                  {patient.photo ? (
                    <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className={speciesStyle.color}>{speciesStyle.emoji}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full p-2 border-gray-600 bg-gray-800"
                  onClick={() => setIsUploadPhotoOpen(true)}
                >
                  <CameraIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-2xl font-bold text-gray-100">{patient.name}</h1>
                <p className="text-gray-400">
                  {patient.breed} • {getAge()}
                </p>
                <p className="text-sm text-gray-500">
                  {patient.sex === 'male' ? 'Male' : 'Female'}
                  {patient.isNeutered && ' • Neutered'}
                </p>
              </div>
            </div>

            {/* Pet Details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Weight</p>
                <p className="text-gray-300 font-medium">{patient.weight} {patient.weightUnit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Color</p>
                <p className="text-gray-300 font-medium">{patient.color}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Microchip</p>
                <p className="text-gray-300 font-medium font-mono text-sm">{patient.microchipNumber || 'Not chipped'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                <p className="text-gray-300 font-medium">{format(parseISO(patient.dateOfBirth), 'MMM d, yyyy')}</p>
              </div>
            </div>

            {/* Medical Alerts */}
            <div className="lg:w-72">
              <div className="space-y-3">
                {/* Allergies */}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      <p className="text-sm font-semibold text-red-400">Allergies</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-red-500/50 text-red-300">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Conditions */}
                {patient.conditions && patient.conditions.length > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <HeartIconSolid className="h-5 w-5 text-orange-400" />
                      <p className="text-sm font-semibold text-orange-400">Medical Conditions</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {patient.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-orange-500/50 text-orange-300">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vaccination Alert */}
                {overdueVaccinations.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
                      <p className="text-sm font-semibold text-yellow-400">
                        {overdueVaccinations.length} Overdue Vaccination{overdueVaccinations.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Owner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-gray-300 font-medium">
                    {patient.owner.firstName} {patient.owner.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Primary Owner</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <a href={`tel:${patient.owner.phone}`} className="text-blue-400 hover:text-blue-300">
                    {patient.owner.phone}
                  </a>
                  <p className="text-sm text-gray-500">Mobile</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <a href={`mailto:${patient.owner.email}`} className="text-blue-400 hover:text-blue-300">
                    {patient.owner.email}
                  </a>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-700 flex flex-wrap gap-3">
            <Dialog open={isScheduleAppointmentOpen} onOpenChange={setIsScheduleAppointmentOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <CalendarDaysIcon className="h-5 w-5 mr-2" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-gray-100">
                <DialogHeader>
                  <DialogTitle>Schedule Appointment</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Book a new appointment for {patient.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="service-type">Service Type</Label>
                    <Input
                      id="service-type"
                      placeholder="Select service type"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointment-date">Date & Time</Label>
                    <Input
                      id="appointment-date"
                      type="datetime-local"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <Textarea
                      id="reason"
                      placeholder="Brief description of the reason for visit"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsScheduleAppointmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setIsScheduleAppointmentOpen(false);
                      toast({
                        title: 'Appointment Scheduled',
                        description: 'Appointment has been successfully scheduled.',
                      });
                    }}
                  >
                    Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateSOAPNoteOpen} onOpenChange={setIsCreateSOAPNoteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-600 hover:bg-gray-700">
                  <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                  Create SOAP Note
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create SOAP Note</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Create a new medical record for {patient.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <Label htmlFor="chief-complaint">Chief Complaint (Subjective)</Label>
                    <Textarea
                      id="chief-complaint"
                      placeholder="Reason for visit and owner observations"
                      className="bg-gray-700 border-gray-600"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="objective">Objective Findings</Label>
                    <Textarea
                      id="objective"
                      placeholder="Physical exam findings, vital signs, etc."
                      className="bg-gray-700 border-gray-600"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assessment">Assessment</Label>
                    <Textarea
                      id="assessment"
                      placeholder="Diagnosis and clinical impressions"
                      className="bg-gray-700 border-gray-600"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan">Plan</Label>
                    <Textarea
                      id="plan"
                      placeholder="Treatment plan, medications, follow-up instructions"
                      className="bg-gray-700 border-gray-600"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateSOAPNoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setIsCreateSOAPNoteOpen(false);
                      toast({
                        title: 'SOAP Note Created',
                        description: 'Medical record has been saved.',
                      });
                    }}
                  >
                    Save Note
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              className="border-gray-600 hover:bg-gray-700"
              onClick={() => handleQuickAction('download')}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download Record
            </Button>

            <Button 
              variant="outline" 
              className="border-gray-600 hover:bg-gray-700"
              onClick={() => handleQuickAction('email')}
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Email Owner
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="medical-history" className="data-[state=active]:bg-gray-700">
            <ClockIcon className="h-4 w-4 mr-2" />
            Medical History
          </TabsTrigger>
          <TabsTrigger value="vaccinations" className="data-[state=active]:bg-gray-700">
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Vaccinations
          </TabsTrigger>
          <TabsTrigger value="medications" className="data-[state=active]:bg-gray-700">
            <BeakerIcon className="h-4 w-4 mr-2" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-gray-700">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-gray-700">
            <PaperClipIcon className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Visit Summary */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-400">Visit Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Visits</span>
                    <span className="text-sm font-medium text-gray-300">{patient.medicalRecords.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Visit</span>
                    <span className="text-sm font-medium text-gray-300">
                      {patient.medicalRecords.length > 0 
                        ? format(parseISO(patient.medicalRecords[0].date), 'MMM d, yyyy')
                        : 'No visits yet'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Next Appointment</span>
                    <span className="text-sm font-medium text-gray-300">
                      {patient.appointments.find(apt => apt.status === 'scheduled')
                        ? format(parseISO(patient.appointments.find(apt => apt.status === 'scheduled')!.date), 'MMM d')
                        : 'None scheduled'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vaccination Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-400">Vaccination Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Up to Date</span>
                    <span className="text-sm font-medium text-green-400">
                      {patient.vaccinations.filter(v => !v.nextDueDate || differenceInDays(parseISO(v.nextDueDate), new Date()) > 0).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Due Soon</span>
                    <span className="text-sm font-medium text-yellow-400">{upcomingVaccinations.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Overdue</span>
                    <span className="text-sm font-medium text-red-400">{overdueVaccinations.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Medications */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-400">Active Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patient.prescriptions.filter(rx => rx.status === 'active').map((rx) => (
                    <div key={rx.id} className="text-sm">
                      <p className="font-medium text-gray-300">{rx.medication}</p>
                      <p className="text-xs text-gray-500">{rx.dosage} • {rx.frequency}</p>
                    </div>
                  ))}
                  {patient.prescriptions.filter(rx => rx.status === 'active').length === 0 && (
                    <p className="text-sm text-gray-500">No active medications</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest medical records and appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.medicalRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-start gap-4 pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      "bg-blue-500/20 text-blue-400"
                    )}>
                      <ClipboardDocumentCheckIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-200">
                        {record.type === 'soap' ? 'SOAP Note' : record.type}
                      </p>
                      <p className="text-sm text-gray-400">
                        {record.soapNote?.subjective.chiefComplaint}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(parseISO(record.date), 'MMM d, yyyy')} • Dr. {record.provider?.lastName}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-300"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical-history" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Medical History Timeline</CardTitle>
              <CardDescription>Complete medical record history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patient.medicalRecords.map((record, index) => (
                  <div key={record.id} className="relative">
                    {index < patient.medicalRecords.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-700" />
                    )}
                    <div className="flex gap-4">
                      <div className="relative z-10 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-200">
                              {record.type === 'soap' ? 'SOAP Note' : record.type}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {format(parseISO(record.date), 'MMMM d, yyyy')} at {format(parseISO(record.date), 'h:mm a')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Dr. {record.provider?.lastName}
                          </Badge>
                        </div>
                        
                        {record.soapNote && (
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Chief Complaint</p>
                              <p className="text-gray-300">{record.soapNote.subjective.chiefComplaint}</p>
                            </div>
                            
                            {record.soapNote.objective.physicalExam && (
                              <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Physical Exam</p>
                                <div className="space-y-1">
                                  {Object.entries(record.soapNote.objective.physicalExam).map(([system, finding]) => (
                                    <p key={system} className="text-gray-300">
                                      <span className="font-medium">{system}:</span> {finding}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Assessment</p>
                              <p className="text-gray-300">{record.soapNote.assessment.diagnosis.join(', ')}</p>
                            </div>
                            
                            {record.soapNote.plan.medications && record.soapNote.plan.medications.length > 0 && (
                              <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Medications Prescribed</p>
                                <div className="space-y-1">
                                  {record.soapNote.plan.medications.map((med) => (
                                    <p key={med.id} className="text-gray-300">
                                      {med.medication} - {med.dosage}, {med.frequency}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vaccinations Tab */}
        <TabsContent value="vaccinations" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vaccination Records</CardTitle>
                  <CardDescription>Track vaccination history and due dates</CardDescription>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Vaccination
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.vaccinations.map((vaccination) => {
                  const isOverdue = vaccination.nextDueDate && differenceInDays(new Date(), parseISO(vaccination.nextDueDate)) > 0;
                  const daysUntilDue = vaccination.nextDueDate ? differenceInDays(parseISO(vaccination.nextDueDate), new Date()) : null;
                  
                  return (
                    <div key={vaccination.id} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-200">{vaccination.vaccineName}</h4>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                            {daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 30 && (
                              <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                                Due in {daysUntilDue} days
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Date Given</p>
                              <p className="text-gray-300">{format(parseISO(vaccination.dateGiven), 'MMM d, yyyy')}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Next Due</p>
                              <p className={cn(
                                "font-medium",
                                isOverdue ? "text-red-400" : "text-gray-300"
                              )}>
                                {vaccination.nextDueDate 
                                  ? format(parseISO(vaccination.nextDueDate), 'MMM d, yyyy')
                                  : 'Not scheduled'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Batch Number</p>
                              <p className="text-gray-300 font-mono text-xs">{vaccination.batchNumber || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Administered By</p>
                              <p className="text-gray-300">{vaccination.administeredBy}</p>
                            </div>
                          </div>
                          
                          {vaccination.notes && (
                            <div className="mt-3 p-2 bg-gray-800 rounded">
                              <p className="text-sm text-gray-400">{vaccination.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Medications</CardTitle>
                  <CardDescription>Active prescriptions and medication history</CardDescription>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Prescription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.prescriptions.map((prescription) => (
                  <div key={prescription.id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-200">{prescription.medication}</h4>
                          <Badge 
                            variant={prescription.status === 'active' ? 'default' : 'outline'}
                            className={cn(
                              "text-xs",
                              prescription.status === 'active' && "bg-green-600"
                            )}
                          >
                            {prescription.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-500">Dosage</p>
                            <p className="text-gray-300">{prescription.dosage} • {prescription.frequency}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="text-gray-300">{prescription.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="text-gray-300">{prescription.quantity} • {prescription.refills} refills</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Prescribed By</p>
                            <p className="text-gray-300">{prescription.prescribedBy}</p>
                          </div>
                        </div>
                        
                        <div className="p-2 bg-gray-800 rounded">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Instructions</p>
                          <p className="text-sm text-gray-300">{prescription.instructions}</p>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>Past and upcoming appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.appointments.map((appointment) => {
                  const appointmentDate = parseISO(`${appointment.date}T${appointment.time}`);
                  const isPast = differenceInDays(new Date(), appointmentDate) > 0;
                  
                  return (
                    <div key={appointment.id} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-200">{appointment.serviceType}</h4>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                appointment.status === 'completed' && "border-green-500/50 text-green-400",
                                appointment.status === 'scheduled' && "border-blue-500/50 text-blue-400",
                                appointment.status === 'cancelled' && "border-red-500/50 text-red-400"
                              )}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Date & Time</p>
                              <p className="text-gray-300">
                                {format(appointmentDate, 'MMM d, yyyy')} at {format(appointmentDate, 'h:mm a')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Provider</p>
                              <p className="text-gray-300">
                                {appointment.provider?.firstName} {appointment.provider?.lastName}
                              </p>
                            </div>
                            {appointment.roomNumber && (
                              <div>
                                <p className="text-gray-500">Room</p>
                                <p className="text-gray-300">Room {appointment.roomNumber}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500">Duration</p>
                              <p className="text-gray-300">{appointment.duration} minutes</p>
                            </div>
                          </div>
                          
                          {appointment.reason && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                              <p className="text-sm text-gray-300">{appointment.reason}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          {!isPast && appointment.status === 'scheduled' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-gray-300"
                            >
                              Reschedule
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents & Attachments</CardTitle>
                  <CardDescription>Medical records, test results, and other files</CardDescription>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.documents.map((doc) => {
                  const categoryConfig = documentCategories[doc.category] || documentCategories.other;
                  const Icon = categoryConfig.icon;
                  
                  return (
                    <div key={doc.id} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          "bg-gray-800"
                        )}>
                          <Icon className={cn("h-5 w-5", categoryConfig.color)} />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-200">{doc.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span>{categoryConfig.label}</span>
                            <span>•</span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>•</span>
                            <span>{format(parseISO(doc.uploadedDate), 'MMM d, yyyy')}</span>
                            <span>•</span>
                            <span>by {doc.uploadedBy}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Photo Upload Dialog */}
      <Dialog open={isUploadPhotoOpen} onOpenChange={setIsUploadPhotoOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle>Upload Pet Photo</DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload a new photo for {patient.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <PhotoIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-sm text-gray-400 mb-2">
                Drag and drop a photo here, or click to browse
              </p>
              <Button variant="outline" size="sm" className="border-gray-600">
                Choose File
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadPhotoOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setIsUploadPhotoOpen(false);
                toast({
                  title: 'Photo Uploaded',
                  description: 'Pet photo has been updated successfully.',
                });
              }}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}