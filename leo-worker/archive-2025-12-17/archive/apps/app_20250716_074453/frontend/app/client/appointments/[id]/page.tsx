'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { mockAppointments, mockPets, mockUsers } from '@/lib/mock-data';
import { Appointment } from '@/types';
import { format, isAfter } from 'date-fns';
import { 
  ArrowLeft, Calendar, Clock, MapPin, User, Phone, 
  FileText, Download, X, AlertCircle, Map
} from 'lucide-react';
import { toast } from '@/lib/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AppointmentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundAppointment = mockAppointments.find(apt => apt.id === params.id);
      if (foundAppointment) {
        // Enrich with related data
        const enrichedAppointment = {
          ...foundAppointment,
          pet: mockPets.find(p => p.id === foundAppointment.petId),
          provider: mockUsers.find(u => u.id === foundAppointment.providerId),
        };
        setAppointment(enrichedAppointment);
      }
      setIsLoading(false);
    }, 1000);
  }, [params.id]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Appointment cancelled',
        description: 'Your appointment has been cancelled successfully.',
      });
      
      router.push('/client/appointments/upcoming');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleReschedule = () => {
    router.push(`/client/appointments/book?reschedule=${appointment?.id}`);
  };

  const addToCalendar = () => {
    if (!appointment) return;
    
    const startDate = new Date(`${appointment.date.split('T')[0]}T${appointment.time}`);
    const endDate = new Date(startDate.getTime() + appointment.duration * 60000);
    
    const event = {
      title: `Vet Appointment - ${appointment.pet?.name}`,
      start: startDate.toISOString().replace(/-|:|\.\d\d\d/g, ''),
      end: endDate.toISOString().replace(/-|:|\.\d\d\d/g, ''),
      description: `${appointment.serviceType} for ${appointment.pet?.name} with Dr. ${appointment.provider?.lastName}`,
      location: 'PawsFlow Veterinary Clinic, 123 Main St, Anytown, USA',
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.start}
DTEND:${event.end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-${appointment.id}.ics`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'Calendar event created',
      description: 'The appointment has been added to your calendar.',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Appointment not found</p>
          <Link href="/client/appointments/upcoming">
            <Button>Back to Appointments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isUpcoming = isAfter(new Date(appointment.date), new Date()) && appointment.status !== 'cancelled';
  const canCancel = isUpcoming && appointment.status !== 'cancelled';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/client/appointments/upcoming">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Appointment Details</h1>
        </div>
        {canCancel && (
          <div className="space-x-2">
            <Button variant="outline" onClick={handleReschedule}>
              Reschedule
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              Cancel Appointment
            </Button>
          </div>
        )}
      </div>

      {/* Status Alert */}
      {appointment.status === 'cancelled' && (
        <Card className="border-destructive">
          <CardContent className="flex items-center space-x-2 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm">This appointment has been cancelled</p>
          </CardContent>
        </Card>
      )}

      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{appointment.serviceType}</CardTitle>
              <CardDescription>
                Appointment ID: #{appointment.id}
              </CardDescription>
            </div>
            <Badge variant={
              appointment.status === 'completed' ? 'default' :
              appointment.status === 'cancelled' ? 'destructive' :
              appointment.status === 'confirmed' ? 'secondary' :
              'outline'
            }>
              {appointment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date and Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p>{appointment.time} ({appointment.duration} minutes)</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p>PawsFlow Veterinary Clinic</p>
              </div>
              {appointment.roomNumber && (
                <p className="text-sm text-muted-foreground pl-6">Room {appointment.roomNumber}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Pet Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Pet Information</h3>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl">
                  {appointment.pet?.species === 'dog' ? '🐕' : appointment.pet?.species === 'cat' ? '🐈' : '🐾'}
                </span>
              </div>
              <div>
                <p className="font-medium">{appointment.pet?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.pet?.breed} • {appointment.pet?.sex === 'male' ? 'Male' : 'Female'}
                </p>
                <Link href={`/client/pets/${appointment.pet?.id}`}>
                  <Button variant="link" size="sm" className="px-0 h-auto">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <Separator />

          {/* Provider Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Provider</h3>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Dr. {appointment.provider?.firstName} {appointment.provider?.lastName}</p>
                <p className="text-sm text-muted-foreground">General Practice</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason and Notes */}
          {(appointment.reason || appointment.notes) && (
            <>
              <div className="space-y-3">
                {appointment.reason && (
                  <div>
                    <h3 className="font-semibold mb-2">Reason for Visit</h3>
                    <p className="text-sm">{appointment.reason}</p>
                  </div>
                )}
                {appointment.notes && appointment.status === 'completed' && (
                  <div>
                    <h3 className="font-semibold mb-2">Visit Notes</h3>
                    <p className="text-sm">{appointment.notes}</p>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {isUpcoming && (
                <Button variant="outline" onClick={addToCalendar}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
              )}
              <Button variant="outline">
                <Map className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
              <Button variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Call Clinic
              </Button>
              {appointment.status === 'completed' && (
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Visit Summary
                </Button>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Clinic Contact</h4>
            <div className="text-sm space-y-1">
              <p>Phone: (555) 123-4567</p>
              <p>Email: info@pawsflow.com</p>
              <p>Address: 123 Main St, Anytown, USA 12345</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
              {isAfter(new Date(appointment.date), new Date()) && 
                new Date(appointment.date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 && (
                  <span className="block mt-2 text-destructive">
                    Warning: This appointment is within 24 hours. A cancellation fee may apply.
                  </span>
                )
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}