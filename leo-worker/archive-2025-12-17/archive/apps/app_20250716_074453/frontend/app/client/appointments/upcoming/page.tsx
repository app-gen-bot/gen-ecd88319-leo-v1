'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { getMockUpcomingAppointments } from '@/lib/mock-data';
import { Appointment } from '@/types';
import { format, isToday, isTomorrow } from 'date-fns';
import { Calendar, Clock, MapPin, User, Plus, X } from 'lucide-react';
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

export default function UpcomingAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        setAppointments(getMockUpcomingAppointments(user.id));
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      setCancellingId(null);
      
      toast({
        title: 'Appointment cancelled',
        description: 'Your appointment has been cancelled successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getDateLabel = (date: string) => {
    const aptDate = new Date(date);
    if (isToday(aptDate)) return 'Today';
    if (isTomorrow(aptDate)) return 'Tomorrow';
    return format(aptDate, 'EEEE, MMMM d');
  };

  const groupAppointmentsByDate = (apts: Appointment[]) => {
    const grouped: { [key: string]: Appointment[] } = {};
    apts.forEach(apt => {
      const dateKey = format(new Date(apt.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const groupedAppointments = groupAppointmentsByDate(appointments);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your upcoming visits</p>
        </div>
        <Link href="/client/appointments/book">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past" asChild>
            <Link href="/client/appointments/past">Past</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6 mt-6">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground mb-4">
                  Schedule a visit for your pets to keep them healthy
                </p>
                <Link href="/client/appointments/book">
                  <Button>Book an Appointment</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
              <div key={date} className="space-y-4">
                <h3 className="font-semibold text-lg">{getDateLabel(date)}</h3>
                {dayAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold text-lg">{appointment.serviceType}</h4>
                            <div className="flex items-center text-sm text-muted-foreground space-x-4">
                              <span className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {appointment.time} ({appointment.duration} min)
                              </span>
                              <span className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                Dr. {appointment.provider?.lastName}
                              </span>
                              {appointment.roomNumber && (
                                <span className="flex items-center">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  Room {appointment.roomNumber}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 pt-1">
                              <Badge variant="outline">{appointment.pet?.name}</Badge>
                              <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </div>
                            {appointment.reason && (
                              <p className="text-sm text-muted-foreground pt-2">
                                <span className="font-medium">Reason:</span> {appointment.reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Link href={`/client/appointments/${appointment.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCancellingId(appointment.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
              You may be charged a cancellation fee if cancelled within 24 hours of the appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancellingId && handleCancelAppointment(cancellingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}