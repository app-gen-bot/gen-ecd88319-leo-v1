'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { getMockAppointmentsByVet, getMockStaff } from '@/lib/mock-data';
import { Appointment, User } from '@/types';
import { format, addDays, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon, Phone, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Time slots from 7 AM to 7 PM in 15-minute increments
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 4) + 7;
  const minute = (i % 4) * 15;
  return {
    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    label: `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
  };
});

// Appointment type colors
const appointmentTypeColors: Record<string, string> = {
  wellness: 'bg-green-500',
  sick: 'bg-red-500',
  surgery: 'bg-purple-500',
  dental: 'bg-blue-500',
  grooming: 'bg-pink-500',
  emergency: 'bg-orange-500',
  followup: 'bg-yellow-500',
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  appointment: Appointment;
  color: string;
}

export default function ScheduleCalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['all']);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    // Load staff and appointments
    setTimeout(() => {
      const mockStaff = getMockStaff().filter(s => s.role === 'veterinarian');
      setStaff(mockStaff);
      
      const allAppointments = mockStaff.flatMap(vet => 
        getMockAppointmentsByVet(vet.id)
      );
      setAppointments(allAppointments);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePrevious = () => {
    switch (view) {
      case 'day':
        setSelectedDate(prev => addDays(prev, -1));
        break;
      case 'week':
        setSelectedDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setSelectedDate(prev => subMonths(prev, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'day':
        setSelectedDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setSelectedDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setSelectedDate(prev => addMonths(prev, 1));
        break;
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const getDateRange = () => {
    switch (view) {
      case 'day':
        return [selectedDate];
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(selectedDate),
          end: endOfWeek(selectedDate)
        });
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        });
      default:
        return [selectedDate];
    }
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;
    
    // Filter by provider
    if (!selectedProviders.includes('all')) {
      filtered = filtered.filter(apt => 
        selectedProviders.includes(apt.providerId || '')
      );
    }

    // Filter by date range
    const dateRange = getDateRange();
    filtered = filtered.filter(apt => {
      const aptDate = new Date(apt.date);
      return dateRange.some(date => isSameDay(aptDate, date));
    });

    return filtered;
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleNewAppointment = () => {
    router.push('/staff/schedule/new');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6">
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">Manage appointments and availability</p>
        </div>
        <Button onClick={handleNewAppointment}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* View Toggle */}
            <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                {view === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                {view === 'week' && `Week of ${format(startOfWeek(selectedDate), 'MMM d, yyyy')}`}
                {view === 'month' && format(selectedDate, 'MMMM yyyy')}
              </div>
            </div>

            {/* Provider Filter */}
            <Select 
              value={selectedProviders[0]} 
              onValueChange={(value) => setSelectedProviders([value])}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {staff.map((vet) => (
                  <SelectItem key={vet.id} value={vet.id}>
                    Dr. {vet.firstName} {vet.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main Calendar */}
        <Card className="lg:col-span-4">
          <CardContent className="p-0">
            {view === 'day' && <DayView date={selectedDate} appointments={getFilteredAppointments()} onAppointmentClick={handleAppointmentClick} />}
            {view === 'week' && <WeekView date={selectedDate} appointments={getFilteredAppointments()} onAppointmentClick={handleAppointmentClick} />}
            {view === 'month' && <MonthView date={selectedDate} appointments={getFilteredAppointments()} onAppointmentClick={handleAppointmentClick} />}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Appointments</span>
                <span className="font-medium">{getFilteredAppointments().length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Slots</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Providers on Duty</span>
                <span className="font-medium">{staff.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appointment Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(appointmentTypeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <div className={cn("h-3 w-3 rounded", color)} />
                  <span className="capitalize">{type}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {format(new Date(selectedAppointment.date), 'MMM d, yyyy')} • {selectedAppointment.time}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedAppointment.duration} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pet</p>
                  <p className="font-medium">{selectedAppointment.pet?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p className="font-medium">{selectedAppointment.owner ? `${selectedAppointment.owner.firstName} ${selectedAppointment.owner.lastName}` : ''}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedAppointment.serviceType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge>{selectedAppointment.status}</Badge>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/staff/patients/${selectedAppointment.pet?.id}`)}
                >
                  View Patient
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    // Would implement check-in logic
                  }}
                >
                  Check In
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Day View Component
function DayView({ 
  date, 
  appointments, 
  onAppointmentClick 
}: { 
  date: Date; 
  appointments: Appointment[]; 
  onAppointmentClick: (apt: Appointment) => void;
}) {
  return (
    <div className="h-[600px] overflow-auto">
      <div className="min-w-[600px]">
        {/* Time column */}
        <div className="grid grid-cols-[80px_1fr] border-t">
          {timeSlots.map((slot) => (
            <div key={slot.time} className="contents">
              <div className="border-r border-b p-2 text-xs text-muted-foreground text-right">
                {slot.label}
              </div>
              <div className="border-b relative h-16">
                {/* Appointment blocks would go here */}
                {appointments
                  .filter(apt => apt.time === slot.time)
                  .map(apt => (
                    <div
                      key={apt.id}
                      className={cn(
                        "absolute inset-x-2 inset-y-1 rounded p-2 text-xs text-white cursor-pointer hover:opacity-90",
                        appointmentTypeColors[apt.serviceType?.toLowerCase().replace(/\s+/g, '')] || 'bg-gray-500'
                      )}
                      onClick={() => onAppointmentClick(apt)}
                    >
                      <p className="font-medium">{apt.pet?.name}</p>
                      <p>{apt.serviceType}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Week View Component
function WeekView({ 
  date, 
  appointments, 
  onAppointmentClick 
}: { 
  date: Date; 
  appointments: Appointment[]; 
  onAppointmentClick: (apt: Appointment) => void;
}) {
  const weekDays = eachDayOfInterval({
    start: startOfWeek(date),
    end: endOfWeek(date)
  });

  return (
    <div className="h-[600px] overflow-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] sticky top-0 bg-background z-10 border-b">
          <div className="border-r p-2" />
          {weekDays.map((day) => (
            <div 
              key={day.toISOString()} 
              className={cn(
                "border-r p-2 text-center",
                isToday(day) && "bg-primary/10"
              )}
            >
              <p className="text-sm font-medium">{format(day, 'EEE')}</p>
              <p className={cn(
                "text-lg",
                isToday(day) && "font-bold"
              )}>{format(day, 'd')}</p>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        {timeSlots.map((slot) => (
          <div key={slot.time} className="grid grid-cols-[80px_repeat(7,1fr)] border-b">
            <div className="border-r p-2 text-xs text-muted-foreground text-right">
              {slot.label}
            </div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="border-r relative h-16">
                {appointments
                  .filter(apt => 
                    isSameDay(new Date(apt.date), day) &&
                    apt.time === slot.time
                  )
                  .map(apt => (
                    <div
                      key={apt.id}
                      className={cn(
                        "absolute inset-x-1 inset-y-1 rounded p-1 text-xs text-white cursor-pointer hover:opacity-90",
                        appointmentTypeColors[apt.serviceType?.toLowerCase().replace(/\s+/g, '')] || 'bg-gray-500'
                      )}
                      onClick={() => onAppointmentClick(apt)}
                    >
                      <p className="font-medium truncate">{apt.pet?.name}</p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Month View Component
function MonthView({ 
  date, 
  appointments, 
  onAppointmentClick 
}: { 
  date: Date; 
  appointments: Appointment[]; 
  onAppointmentClick: (apt: Appointment) => void;
}) {
  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date)),
    end: endOfWeek(endOfMonth(date))
  });

  return (
    <div className="h-[600px]">
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 h-full">
        {monthDays.map((day) => {
          const dayAppointments = appointments.filter(apt => 
            isSameDay(new Date(apt.date), day)
          );

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "border-r border-b p-2 min-h-[100px]",
                !isSameDay(day, date) && day.getMonth() !== date.getMonth() && "bg-muted/50",
                isToday(day) && "bg-primary/10"
              )}
            >
              <p className={cn(
                "text-sm font-medium mb-1",
                isToday(day) && "text-primary"
              )}>
                {format(day, 'd')}
              </p>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "text-xs p-1 rounded text-white cursor-pointer hover:opacity-90 truncate",
                      appointmentTypeColors[apt.serviceType?.toLowerCase().replace(/\s+/g, '')] || 'bg-gray-500'
                    )}
                    onClick={() => onAppointmentClick(apt)}
                  >
                    {apt.time} {apt.pet?.name}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{dayAppointments.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}