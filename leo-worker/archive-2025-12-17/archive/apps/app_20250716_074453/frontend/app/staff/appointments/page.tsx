'use client';

import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isSameDay, addDays, addWeeks, addMonths, subWeeks, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus, User, Pet } from '@/types';
import {
  CalendarDays as CalendarDaysIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Search as MagnifyingGlassIcon,
  Filter as FunnelIcon,
  Plus as PlusIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircle as PlayCircleIcon,
  XCircle as XCircleIcon,
  User as UserIcon,
  TestTube as BeakerIcon,
  Phone as PhoneIcon,
  Mail as EnvelopeIcon,
  MapPin as MapPinIcon,
  AlertTriangle as ExclamationTriangleIcon,
} from 'lucide-react';
// Using same icons from lucide-react

// Mock data - in real app, fetch from API
const mockProviders: User[] = [
  { id: '1', email: 'smith@pawsflow.com', firstName: 'Dr. Sarah', lastName: 'Smith', role: 'veterinarian', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', email: 'johnson@pawsflow.com', firstName: 'Dr. Mike', lastName: 'Johnson', role: 'veterinarian', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', email: 'chen@pawsflow.com', firstName: 'Dr. Lisa', lastName: 'Chen', role: 'veterinarian', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    petId: '1',
    pet: { id: '1', name: 'Max', species: 'dog', breed: 'Golden Retriever', ownerId: '1', dateOfBirth: '2020-01-15', sex: 'male', isNeutered: true, weight: 70, weightUnit: 'lbs', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ownerId: '1',
    owner: { id: '1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'pet_owner', phone: '555-0123', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    providerId: '1',
    provider: mockProviders[0],
    serviceType: 'Annual Checkup',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 30,
    status: 'scheduled',
    roomNumber: '1',
    reason: 'Annual wellness exam',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    petId: '2',
    pet: { id: '2', name: 'Luna', species: 'cat', breed: 'Siamese', ownerId: '2', dateOfBirth: '2021-06-20', sex: 'female', isNeutered: true, weight: 10, weightUnit: 'lbs', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ownerId: '2',
    owner: { id: '2', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith', role: 'pet_owner', phone: '555-0124', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    providerId: '1',
    provider: mockProviders[0],
    serviceType: 'Dental Cleaning',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:30',
    duration: 60,
    status: 'checked_in',
    roomNumber: '2',
    reason: 'Routine dental cleaning',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    petId: '3',
    pet: { id: '3', name: 'Charlie', species: 'dog', breed: 'Labrador', ownerId: '3', dateOfBirth: '2019-03-10', sex: 'male', isNeutered: false, weight: 75, weightUnit: 'lbs', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ownerId: '3',
    owner: { id: '3', email: 'bob@example.com', firstName: 'Bob', lastName: 'Johnson', role: 'pet_owner', phone: '555-0125', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    providerId: '2',
    provider: mockProviders[1],
    serviceType: 'Surgery',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    duration: 120,
    status: 'in_progress',
    roomNumber: 'Surgery 1',
    reason: 'Neuter surgery',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '4',
    petId: '4',
    pet: { id: '4', name: 'Bella', species: 'cat', breed: 'Persian', ownerId: '4', dateOfBirth: '2018-11-25', sex: 'female', isNeutered: true, weight: 12, weightUnit: 'lbs', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ownerId: '4',
    owner: { id: '4', email: 'alice@example.com', firstName: 'Alice', lastName: 'Williams', role: 'pet_owner', phone: '555-0126', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    providerId: '3',
    provider: mockProviders[2],
    serviceType: 'Emergency',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '11:00',
    duration: 45,
    status: 'confirmed',
    roomNumber: '3',
    reason: 'Vomiting and lethargy',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '5',
    petId: '5',
    pet: { id: '5', name: 'Rocky', species: 'dog', breed: 'Bulldog', ownerId: '5', dateOfBirth: '2020-07-15', sex: 'male', isNeutered: true, weight: 50, weightUnit: 'lbs', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ownerId: '5',
    owner: { id: '5', email: 'mike@example.com', firstName: 'Mike', lastName: 'Brown', role: 'pet_owner', phone: '555-0127', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    providerId: '2',
    provider: mockProviders[1],
    serviceType: 'Vaccination',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '14:00',
    duration: 20,
    status: 'scheduled',
    roomNumber: '1',
    reason: 'Annual vaccinations',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const serviceTypes = [
  'Annual Checkup',
  'Vaccination',
  'Dental Cleaning',
  'Surgery',
  'Emergency',
  'Follow-up',
  'Grooming',
  'Lab Work',
];

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: CalendarIcon },
  confirmed: { label: 'Confirmed', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: CheckCircleIcon },
  checked_in: { label: 'Checked In', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: ClockIcon },
  in_progress: { label: 'In Progress', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: PlayCircleIcon },
  completed: { label: 'Completed', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: XCircleIcon },
  no_show: { label: 'No Show', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: ExclamationTriangleIcon },
};

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter appointments based on search and filters
  const filteredAppointments = useMemo(() => {
    return mockAppointments.filter(appointment => {
      const matchesSearch = searchQuery === '' || 
        appointment.pet?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.owner?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.owner?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.serviceType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProvider = selectedProvider === 'all' || appointment.providerId === selectedProvider;
      const matchesServiceType = selectedServiceType === 'all' || appointment.serviceType === selectedServiceType;
      const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;

      return matchesSearch && matchesProvider && matchesServiceType && matchesStatus;
    });
  }, [searchQuery, selectedProvider, selectedServiceType, selectedStatus]);

  // Get appointments for current view
  const viewAppointments = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    switch (view) {
      case 'day':
        startDate = currentDate;
        endDate = currentDate;
        break;
      case 'week':
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
        break;
      case 'month':
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
    }

    return filteredAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
  }, [filteredAppointments, currentDate, view]);

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (view) {
      case 'day':
        setCurrentDate(direction === 'prev' ? addDays(currentDate, -1) : addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        break;
    }
  };

  const handleQuickAction = (appointmentId: string, action: 'check_in' | 'start' | 'cancel') => {
    // In real app, make API call
    const messages = {
      check_in: 'Patient checked in successfully',
      start: 'Consultation started',
      cancel: 'Appointment cancelled',
    };
    
    toast({
      title: 'Success',
      description: messages[action],
    });
  };

  const getDateRangeLabel = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Appointments</h1>
          <p className="text-gray-400 mt-1">Manage and track all patient appointments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
              <DialogDescription className="text-gray-400">
                Schedule a new appointment for a patient
              </DialogDescription>
            </DialogHeader>
            {/* Add appointment form here */}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  toast({
                    title: 'Success',
                    description: 'Appointment created successfully',
                  });
                }}
              >
                Create Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                placeholder="Search by pet name, owner, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="provider-filter" className="text-gray-300">Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger id="provider-filter" className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="All providers" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All providers</SelectItem>
                    {mockProviders.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.firstName} {provider.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service-filter" className="text-gray-300">Service Type</Label>
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger id="service-filter" className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All services</SelectItem>
                    {serviceTypes.map(service => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-filter" className="text-gray-300">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status-filter" className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All statuses</SelectItem>
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center">
                          <config.icon className={cn('h-4 w-4 mr-2', config.color)} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View Toggle and Navigation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* View Toggle */}
            <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
              <TabsList className="bg-gray-700">
                <TabsTrigger value="day" className="data-[state=active]:bg-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Day
                </TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-gray-600">
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-gray-600">
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  Month
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('prev')}
                className="border-gray-600 hover:bg-gray-700"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              
              <div className="min-w-[200px] text-center">
                <p className="text-sm font-medium text-gray-100">{getDateRangeLabel()}</p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('next')}
                className="border-gray-600 hover:bg-gray-700"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
                className={cn(
                  'ml-2 border-gray-600 hover:bg-gray-700',
                  isToday(currentDate) && 'bg-blue-600/20 border-blue-500'
                )}
              >
                Today
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {viewAppointments.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <CalendarDaysIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No appointments found for the selected filters</p>
            </CardContent>
          </Card>
        ) : (
          viewAppointments.map(appointment => {
            const status = statusConfig[appointment.status];
            const StatusIcon = status.icon;
            
            return (
              <Card key={appointment.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* Appointment Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-100">
                              {appointment.pet?.name} - {appointment.serviceType}
                            </h3>
                            <Badge className={cn(status.bgColor, status.color, 'border-0')}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {appointment.time} - {format(new Date(`2000-01-01T${appointment.time}`).getTime() + appointment.duration * 60000, 'HH:mm')}
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              Room {appointment.roomNumber}
                            </div>
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              {appointment.provider?.firstName} {appointment.provider?.lastName}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Pet Info */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pet</p>
                          <p className="text-sm text-gray-300">
                            {appointment.pet?.name} ({appointment.pet?.species}, {appointment.pet?.breed})
                          </p>
                          <p className="text-xs text-gray-400">
                            {appointment.pet?.sex === 'male' ? 'Male' : 'Female'}, {appointment.pet?.weight} {appointment.pet?.weightUnit}
                          </p>
                        </div>

                        {/* Owner Info */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Owner</p>
                          <p className="text-sm text-gray-300">
                            {appointment.owner?.firstName} {appointment.owner?.lastName}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <a href={`tel:${appointment.owner?.phone}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              {appointment.owner?.phone}
                            </a>
                            <a href={`mailto:${appointment.owner?.email}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                              <EnvelopeIcon className="h-3 w-3 mr-1" />
                              Email
                            </a>
                          </div>
                        </div>

                        {/* Reason */}
                        {appointment.reason && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                            <p className="text-sm text-gray-300">{appointment.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 lg:flex-col">
                      {appointment.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction(appointment.id, 'check_in')}
                          className="border-gray-600 hover:bg-gray-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                      )}
                      {appointment.status === 'checked_in' && (
                        <Button
                          size="sm"
                          onClick={() => handleQuickAction(appointment.id, 'start')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <PlayCircleIcon className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {['scheduled', 'confirmed'].includes(appointment.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction(appointment.id, 'cancel')}
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}