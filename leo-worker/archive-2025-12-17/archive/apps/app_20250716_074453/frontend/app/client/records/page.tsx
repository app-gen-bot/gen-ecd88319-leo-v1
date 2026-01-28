'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { getMockPetsByOwner, mockAppointments } from '@/lib/mock-data';
import { Pet, Appointment } from '@/types';
import { format } from 'date-fns';
import { FileText, Download, Eye, Filter, Calendar } from 'lucide-react';

interface MedicalRecord {
  id: string;
  petId: string;
  pet?: Pet;
  appointmentId: string;
  appointment?: Appointment;
  type: 'visit' | 'lab' | 'vaccination' | 'surgery';
  date: string;
  title: string;
  provider: string;
  summary: string;
  hasDocument: boolean;
}

// Mock medical records
const getMockMedicalRecords = (userId: string): MedicalRecord[] => {
  const pets = getMockPetsByOwner(userId);
  const records: MedicalRecord[] = [];
  
  pets.forEach(pet => {
    const petAppointments = mockAppointments
      .filter(apt => apt.petId === pet.id && apt.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    petAppointments.forEach((apt, index) => {
      records.push({
        id: `record-${apt.id}`,
        petId: pet.id,
        pet,
        appointmentId: apt.id,
        appointment: apt,
        type: 'visit',
        date: apt.date,
        title: apt.serviceType,
        provider: 'Dr. Smith',
        summary: apt.notes || 'Routine examination completed. Patient in good health.',
        hasDocument: index === 0, // Most recent has document
      });
    });
    
    // Add some additional records
    if (pet.id === '1') {
      records.push({
        id: 'lab-1',
        petId: pet.id,
        pet,
        appointmentId: 'apt-lab',
        type: 'lab',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Blood Work Results',
        provider: 'Dr. Smith',
        summary: 'Complete blood count and chemistry panel. All values within normal range.',
        hasDocument: true,
      });
      
      records.push({
        id: 'vac-1',
        petId: pet.id,
        pet,
        appointmentId: 'apt-vac',
        type: 'vaccination',
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Annual Vaccinations',
        provider: 'Dr. Smith',
        summary: 'Rabies, DHPP vaccines administered. Next due in 1 year.',
        hasDocument: true,
      });
    }
  });
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [pets, setPets] = useState<Pet[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [selectedPet, setSelectedPet] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        const userPets = getMockPetsByOwner(user.id);
        const userRecords = getMockMedicalRecords(user.id);
        
        setPets(userPets);
        setRecords(userRecords);
        
        // Check if pet filter was passed in URL
        const petId = searchParams.get('pet');
        if (petId && userPets.find(p => p.id === petId)) {
          setSelectedPet(petId);
        }
        
        setIsLoading(false);
      }, 1000);
    }
  }, [user, searchParams]);

  useEffect(() => {
    let filtered = records;
    
    if (selectedPet !== 'all') {
      filtered = filtered.filter(record => record.petId === selectedPet);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(record => record.type === selectedType);
    }
    
    setFilteredRecords(filtered);
  }, [records, selectedPet, selectedType]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return '🏥';
      case 'lab':
        return '🔬';
      case 'vaccination':
        return '💉';
      case 'surgery':
        return '🏥';
      default:
        return '📋';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'visit':
        return 'default';
      case 'lab':
        return 'secondary';
      case 'vaccination':
        return 'outline';
      case 'surgery':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <p className="text-muted-foreground">Access your pets' medical history and documents</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedPet} onValueChange={setSelectedPet}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by pet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pets</SelectItem>
            {pets.map(pet => (
              <SelectItem key={pet.id} value={pet.id}>
                {pet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="visit">Visits</SelectItem>
            <SelectItem value="lab">Lab Results</SelectItem>
            <SelectItem value="vaccination">Vaccinations</SelectItem>
            <SelectItem value="surgery">Surgeries</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No records found</h3>
            <p className="text-muted-foreground">
              {selectedPet !== 'all' || selectedType !== 'all' 
                ? 'Try adjusting your filters'
                : 'Medical records will appear here after visits'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                      {getTypeIcon(record.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-lg">{record.title}</h4>
                        <Badge variant={getTypeBadgeVariant(record.type)}>
                          {record.type}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </span>
                        <span>{record.provider}</span>
                      </div>
                      <div className="flex items-center space-x-2 pt-1">
                        <Badge variant="outline">{record.pet?.name}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground pt-2">
                        {record.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link href={`/client/records/${record.petId}/${record.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    {record.hasDocument && (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}