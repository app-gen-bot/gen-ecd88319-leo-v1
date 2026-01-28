'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';
import { mockPets, getMockVaccinationsByPet, mockAppointments } from '@/lib/mock-data';
import { Pet, Vaccination, Appointment } from '@/types';
import { format, differenceInYears, differenceInDays, isBefore, isAfter } from 'date-fns';
import { 
  ArrowLeft, Calendar, FileText, Pill, Printer, Weight, 
  MapPin, AlertCircle, Edit, Clock, Download, Eye
} from 'lucide-react';
import { toast } from '@/lib/use-toast';

export default function PetDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundPet = mockPets.find(p => p.id === params.id);
      if (foundPet) {
        setPet(foundPet);
        setVaccinations(getMockVaccinationsByPet(params.id));
        setAppointments(mockAppointments.filter(apt => apt.petId === params.id));
      }
      setIsLoading(false);
    }, 1000);
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Pet not found</p>
          <Link href="/client/pets">
            <Button>Back to Pets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const calculateAge = (dateOfBirth: string) => {
    const years = differenceInYears(new Date(), new Date(dateOfBirth));
    const months = Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30)) % 12;
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''} old`;
    }
    return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''} old`;
  };

  const getVaccinationStatus = (nextDueDate?: string) => {
    if (!nextDueDate) return 'current';
    const daysUntilDue = differenceInDays(new Date(nextDueDate), new Date());
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 30) return 'due-soon';
    return 'current';
  };

  const pastAppointments = appointments.filter(apt => 
    isBefore(new Date(apt.date), new Date()) || apt.status === 'completed'
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcomingAppointments = appointments.filter(apt => 
    isAfter(new Date(apt.date), new Date()) && apt.status !== 'cancelled'
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/client/pets">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pets
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{pet.name}</h1>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pet Info Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Pet Photo */}
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  {pet.photo ? (
                    <img
                      src={pet.photo}
                      alt={pet.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-6xl">
                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Species & Breed</p>
                    <p className="font-medium capitalize">{pet.species} • {pet.breed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{calculateAge(pet.dateOfBirth)}</p>
                    <p className="text-xs text-muted-foreground">Born {format(new Date(pet.dateOfBirth), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sex</p>
                    <p className="font-medium">
                      {pet.sex === 'male' ? 'Male' : 'Female'} • {pet.isNeutered ? 'Neutered' : 'Intact'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{pet.weight} {pet.weightUnit}</p>
                  </div>
                  {pet.microchipNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Microchip</p>
                      <p className="font-medium flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {pet.microchipNumber}
                      </p>
                    </div>
                  )}
                  {pet.color && (
                    <div>
                      <p className="text-sm text-muted-foreground">Color/Markings</p>
                      <p className="font-medium">{pet.color}</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-4">
                  <Link href={`/client/appointments/book?pet=${pet.id}`} className="block">
                    <Button className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Pill className="mr-2 h-4 w-4" />
                    Request Prescription Refill
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Weight className="mr-2 h-4 w-4" />
                    Update Weight
                  </Button>
                  <Link href={`/client/messages/new?pet=${pet.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Message About This Pet
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Medical Summary
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical Alerts */}
          {(pet.allergies?.length || pet.conditions?.length) && (
            <Card className="border-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-destructive flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Medical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pet.allergies && pet.allergies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Allergies:</p>
                    <div className="flex flex-wrap gap-2">
                      {pet.allergies.map((allergy, i) => (
                        <Badge key={i} variant="destructive">{allergy}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {pet.conditions && pet.conditions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Conditions:</p>
                    <div className="flex flex-wrap gap-2">
                      {pet.conditions.map((condition, i) => (
                        <Badge key={i} variant="secondary">{condition}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Next Appointment */}
              {upcomingAppointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Next Appointment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{upcomingAppointments[0].serviceType}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(upcomingAppointments[0].date), 'MMMM d, yyyy')} at {upcomingAppointments[0].time}
                        </p>
                      </div>
                      <Link href={`/client/appointments/${upcomingAppointments[0].id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vaccination Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Vaccination Status</CardTitle>
                  <CardDescription>Current vaccination status and upcoming due dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vaccinations.map((vac) => {
                      const status = getVaccinationStatus(vac.nextDueDate);
                      return (
                        <div key={vac.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{vac.vaccineName}</p>
                            <p className="text-sm text-muted-foreground">
                              Last given: {format(new Date(vac.dateGiven), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge variant={
                            status === 'overdue' ? 'destructive' : 
                            status === 'due-soon' ? 'secondary' : 
                            'default'
                          }>
                            {status === 'overdue' ? 'Overdue' :
                             status === 'due-soon' ? 'Due Soon' :
                             'Current'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  <Link href={`/client/appointments/book?pet=${pet.id}`}>
                    <Button className="w-full mt-4">Schedule Vaccinations</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pastAppointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="flex items-start space-x-3">
                        <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm">{apt.serviceType}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(apt.date), 'MMM d, yyyy')} • {apt.notes || 'No notes'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Visit History</CardTitle>
                  <CardDescription>Complete medical history and visit records</CardDescription>
                </CardHeader>
                <CardContent>
                  {pastAppointments.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No visit history yet</p>
                  ) : (
                    <div className="space-y-4">
                      {pastAppointments.map((apt) => (
                        <div key={apt.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{apt.serviceType}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(apt.date), 'MMMM d, yyyy')}
                              </p>
                            </div>
                            <Badge>{apt.status}</Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <p><span className="font-medium">Provider:</span> Dr. Smith</p>
                            <p><span className="font-medium">Reason:</span> {apt.reason}</p>
                            {apt.notes && (
                              <p><span className="font-medium">Notes:</span> {apt.notes}</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Record
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vaccinations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vaccination Schedule</CardTitle>
                  <CardDescription>Complete vaccination history and upcoming due dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vaccine</TableHead>
                        <TableHead>Last Given</TableHead>
                        <TableHead>Next Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vaccinations.map((vac) => {
                        const status = getVaccinationStatus(vac.nextDueDate);
                        return (
                          <TableRow key={vac.id}>
                            <TableCell className="font-medium">{vac.vaccineName}</TableCell>
                            <TableCell>{format(new Date(vac.dateGiven), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                              {vac.nextDueDate ? format(new Date(vac.nextDueDate), 'MMM d, yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                status === 'overdue' ? 'destructive' : 
                                status === 'due-soon' ? 'secondary' : 
                                'default'
                              }>
                                {status === 'overdue' ? 'Overdue' :
                                 status === 'due-soon' ? 'Due Soon' :
                                 'Current'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {(status === 'overdue' || status === 'due-soon') && (
                                <Link href={`/client/appointments/book?pet=${pet.id}`}>
                                  <Button variant="ghost" size="sm">Schedule</Button>
                                </Link>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-6 space-y-4">
                    <Card className="bg-muted">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Vaccination History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {vaccinations.map((vac) => (
                            <div key={vac.id} className="flex justify-between">
                              <span>{vac.vaccineName}</span>
                              <span className="text-muted-foreground">
                                {format(new Date(vac.dateGiven), 'MMM yyyy')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Medical records, test results, and other documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                          <div>
                            <p className="font-medium">Annual Checkup Report</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded on {format(new Date(), 'MMM d, yyyy')} • PDF • 245 KB
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Drop files here or click to upload
                      </p>
                      <Button variant="outline">Upload Document</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}