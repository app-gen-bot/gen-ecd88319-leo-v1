'use client';

import { useState, useMemo } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Pet, User, Appointment } from '@/types';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  EllipsisVerticalIcon,
  BellIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  TrashIcon,
  HeartIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';

// Mock data for patients with owners
interface PatientWithOwner extends Pet {
  owner: User;
  lastVisit?: string;
  nextAppointment?: Appointment;
  totalVisits: number;
}

const mockPatients: PatientWithOwner[] = [
  {
    id: '1',
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    ownerId: '1',
    owner: { id: '1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'pet_owner', phone: '555-0123', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    dateOfBirth: '2020-01-15',
    sex: 'male',
    isNeutered: true,
    weight: 70,
    weightUnit: 'lbs',
    color: 'Golden',
    microchipNumber: '123456789',
    allergies: ['Chicken'],
    conditions: ['Hip dysplasia'],
    lastVisit: '2024-03-01',
    totalVisits: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Luna',
    species: 'cat',
    breed: 'Siamese',
    ownerId: '2',
    owner: { id: '2', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith', role: 'pet_owner', phone: '555-0124', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    dateOfBirth: '2021-06-20',
    sex: 'female',
    isNeutered: true,
    weight: 10,
    weightUnit: 'lbs',
    color: 'Seal Point',
    microchipNumber: '987654321',
    allergies: [],
    conditions: ['Dental disease'],
    lastVisit: '2024-02-15',
    totalVisits: 5,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Charlie',
    species: 'dog',
    breed: 'Labrador',
    ownerId: '3',
    owner: { id: '3', email: 'bob@example.com', firstName: 'Bob', lastName: 'Johnson', role: 'pet_owner', phone: '555-0125', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    dateOfBirth: '2019-03-10',
    sex: 'male',
    isNeutered: false,
    weight: 75,
    weightUnit: 'lbs',
    color: 'Black',
    allergies: ['Beef', 'Corn'],
    conditions: [],
    lastVisit: '2024-03-10',
    totalVisits: 12,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'Bella',
    species: 'cat',
    breed: 'Persian',
    ownerId: '4',
    owner: { id: '4', email: 'alice@example.com', firstName: 'Alice', lastName: 'Williams', role: 'pet_owner', phone: '555-0126', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    dateOfBirth: '2018-11-25',
    sex: 'female',
    isNeutered: true,
    weight: 12,
    weightUnit: 'lbs',
    color: 'White',
    microchipNumber: '456789123',
    conditions: ['Kidney disease'],
    lastVisit: '2024-03-05',
    totalVisits: 15,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '5',
    name: 'Rocky',
    species: 'dog',
    breed: 'Bulldog',
    ownerId: '5',
    owner: { id: '5', email: 'mike@example.com', firstName: 'Mike', lastName: 'Brown', role: 'pet_owner', phone: '555-0127', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    dateOfBirth: '2020-07-15',
    sex: 'male',
    isNeutered: true,
    weight: 50,
    weightUnit: 'lbs',
    color: 'Brindle',
    allergies: [],
    conditions: ['Brachycephalic syndrome'],
    lastVisit: '2024-01-20',
    totalVisits: 6,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '6',
    name: 'Tweety',
    species: 'bird',
    breed: 'Canary',
    ownerId: '6',
    owner: { id: '6', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Davis', role: 'pet_owner', phone: '555-0128', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    dateOfBirth: '2022-03-01',
    sex: 'male',
    isNeutered: false,
    weight: 0.05,
    weightUnit: 'lbs',
    color: 'Yellow',
    allergies: [],
    conditions: [],
    lastVisit: '2024-02-28',
    totalVisits: 3,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '7',
    name: 'Snowball',
    species: 'rabbit',
    breed: 'Holland Lop',
    ownerId: '7',
    owner: { id: '7', email: 'emma@example.com', firstName: 'Emma', lastName: 'Wilson', role: 'pet_owner', phone: '555-0129', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    dateOfBirth: '2021-12-10',
    sex: 'female',
    isNeutered: true,
    weight: 3.5,
    weightUnit: 'lbs',
    color: 'White',
    allergies: [],
    conditions: ['Dental malocclusion'],
    lastVisit: '2024-03-12',
    totalVisits: 4,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

// Species configuration with colors and icons
const speciesConfig = {
  dog: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', emoji: '🐕' },
  cat: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', emoji: '🐈' },
  bird: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', emoji: '🦜' },
  rabbit: { color: 'bg-pink-500/20 text-pink-400 border-pink-500/50', emoji: '🐰' },
  other: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', emoji: '🐾' },
};

type SortOption = 'name' | 'lastVisit' | 'species' | 'owner';

export default function PatientsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showOnlyWithConditions, setShowOnlyWithConditions] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = mockPatients.filter(patient => {
      const matchesSearch = searchQuery === '' || 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.owner.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.owner.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.microchipNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecies = selectedSpecies === 'all' || patient.species === selectedSpecies;
      const matchesConditions = !showOnlyWithConditions || (patient.conditions && patient.conditions.length > 0);

      return matchesSearch && matchesSpecies && matchesConditions;
    });

    // Sort patients
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastVisit':
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        case 'species':
          return a.species.localeCompare(b.species) || a.name.localeCompare(b.name);
        case 'owner':
          const ownerA = `${a.owner.lastName} ${a.owner.firstName}`;
          const ownerB = `${b.owner.lastName} ${b.owner.firstName}`;
          return ownerA.localeCompare(ownerB);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedSpecies, sortBy, showOnlyWithConditions]);

  const handleExport = () => {
    // In real app, generate CSV or PDF
    toast({
      title: 'Export Started',
      description: `Exporting ${filteredAndSortedPatients.length} patient records...`,
    });
  };

  const handleQuickAction = (patientId: string, action: string) => {
    // In real app, navigate or perform action
    const messages: Record<string, string> = {
      view: 'Opening patient profile...',
      appointment: 'Opening appointment scheduler...',
      reminder: 'Reminder sent successfully',
      edit: 'Opening patient editor...',
      delete: 'Patient deleted',
    };
    
    toast({
      title: action === 'delete' ? 'Patient Deleted' : 'Action Performed',
      description: messages[action] || 'Action completed',
      variant: action === 'delete' ? 'destructive' : 'default',
    });
  };

  const getPatientAge = (dateOfBirth: string) => {
    const birthDate = parseISO(dateOfBirth);
    const ageInDays = differenceInDays(new Date(), birthDate);
    
    if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return months === 1 ? '1 month' : `${months} months`;
    } else {
      const years = Math.floor(ageInDays / 365);
      return years === 1 ? '1 year' : `${years} years`;
    }
  };

  const getDaysSinceLastVisit = (lastVisit?: string) => {
    if (!lastVisit) return null;
    const days = differenceInDays(new Date(), parseISO(lastVisit));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Patients</h1>
          <p className="text-gray-400 mt-1">Manage patient records and information</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-gray-600 hover:bg-gray-700"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export
          </Button>
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new patient record
                </DialogDescription>
              </DialogHeader>
              {/* Add patient form would go here */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setIsAddPatientOpen(false);
                    toast({
                      title: 'Success',
                      description: 'Patient added successfully',
                    });
                  }}
                >
                  Add Patient
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name, owner, breed, or microchip..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="species-filter" className="text-gray-300 mb-1">Species</Label>
                <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                  <SelectTrigger id="species-filter" className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="All species" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All species</SelectItem>
                    <SelectItem value="dog">Dogs</SelectItem>
                    <SelectItem value="cat">Cats</SelectItem>
                    <SelectItem value="bird">Birds</SelectItem>
                    <SelectItem value="rabbit">Rabbits</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="sort-filter" className="text-gray-300 mb-1">Sort by</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger id="sort-filter" className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="lastVisit">Last Visit</SelectItem>
                    <SelectItem value="species">Species</SelectItem>
                    <SelectItem value="owner">Owner Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant={showOnlyWithConditions ? 'default' : 'outline'}
                  onClick={() => setShowOnlyWithConditions(!showOnlyWithConditions)}
                  className={cn(
                    'gap-2',
                    showOnlyWithConditions 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'border-gray-600 hover:bg-gray-700'
                  )}
                >
                  <HeartIcon className="h-5 w-5" />
                  Medical Conditions
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing {filteredAndSortedPatients.length} of {mockPatients.length} patients
        </p>
      </div>

      {/* Patient Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAndSortedPatients.map((patient) => {
          const speciesStyle = speciesConfig[patient.species] || speciesConfig.other;
          const daysSinceVisit = getDaysSinceLastVisit(patient.lastVisit);
          const isOverdue = daysSinceVisit && daysSinceVisit > 365;

          return (
            <Card key={patient.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-6">
                {/* Header with Pet Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div 
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                        speciesStyle.color
                      )}
                    >
                      {speciesStyle.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-100 truncate">{patient.name}</h3>
                      <p className="text-sm text-gray-400">
                        {patient.breed} • {getPatientAge(patient.dateOfBirth)} • {patient.sex === 'male' ? 'Male' : 'Female'}
                        {patient.isNeutered && ' • Neutered'}
                      </p>
                      {patient.microchipNumber && (
                        <p className="text-xs text-gray-500 mt-1">Chip: {patient.microchipNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem onClick={() => handleQuickAction(patient.id, 'view')}>
                        <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleQuickAction(patient.id, 'edit')}>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleQuickAction(patient.id, 'delete')}
                        className="text-red-400 focus:text-red-400"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Patient
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Medical Conditions */}
                {patient.conditions && patient.conditions.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {patient.conditions.map((condition, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs border-red-500/50 text-red-400 bg-red-500/10"
                        >
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Owner Info */}
                <div className="border-t border-gray-700 pt-3 mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Owner</p>
                  <p className="text-sm text-gray-300 font-medium">
                    {patient.owner.firstName} {patient.owner.lastName}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <a 
                      href={`tel:${patient.owner.phone}`} 
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <PhoneIcon className="h-3 w-3 mr-1" />
                      {patient.owner.phone}
                    </a>
                    <a 
                      href={`mailto:${patient.owner.email}`} 
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <EnvelopeIcon className="h-3 w-3 mr-1" />
                      Email
                    </a>
                  </div>
                </div>

                {/* Visit Info */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Last Visit</p>
                      <p className={cn(
                        'text-gray-300',
                        isOverdue && 'text-orange-400'
                      )}>
                        {patient.lastVisit ? (
                          <>
                            {format(parseISO(patient.lastVisit), 'MMM d, yyyy')}
                            <span className="text-xs text-gray-500 ml-1">
                              ({daysSinceVisit}d ago)
                            </span>
                          </>
                        ) : (
                          'No visits yet'
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Total Visits</p>
                      <p className="text-gray-300">{patient.totalVisits}</p>
                    </div>
                  </div>
                  {isOverdue && (
                    <p className="text-xs text-orange-400 mt-2 flex items-center">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      Overdue for annual checkup
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction(patient.id, 'view')}
                    className="flex-1 border-gray-600 hover:bg-gray-700"
                  >
                    <UserIcon className="h-4 w-4 mr-1" />
                    Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction(patient.id, 'appointment')}
                    className="flex-1 border-gray-600 hover:bg-gray-700"
                  >
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    Appointment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction(patient.id, 'reminder')}
                    className="flex-1 border-gray-600 hover:bg-gray-700"
                  >
                    <BellIcon className="h-4 w-4 mr-1" />
                    Remind
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAndSortedPatients.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <UserIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No patients found matching your filters</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecies('all');
                setShowOnlyWithConditions(false);
              }}
              variant="outline"
              className="mt-4 border-gray-600 hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}