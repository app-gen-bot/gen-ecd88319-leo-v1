'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { getMockPastAppointments } from '@/lib/mock-data';
import { Appointment } from '@/types';
import { format } from 'date-fns';
import { Calendar, Clock, User, FileText, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/use-toast';

export default function PastAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        setAppointments(getMockPastAppointments(user.id));
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  const handleRebook = (appointment: Appointment) => {
    toast({
      title: 'Feature coming soon',
      description: 'Rebooking will be available soon. Please book a new appointment.',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">View your appointment history</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="past">
        <TabsList>
          <TabsTrigger value="upcoming" asChild>
            <Link href="/client/appointments/upcoming">Upcoming</Link>
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="past" className="space-y-4 mt-6">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past appointments</h3>
                <p className="text-muted-foreground mb-4">
                  Your appointment history will appear here
                </p>
                <Link href="/client/appointments/book">
                  <Button>Book Your First Appointment</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">{appointment.serviceType}</h4>
                          <div className="flex items-center text-sm text-muted-foreground space-x-4">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {format(new Date(appointment.date), 'MMM d, yyyy')} at {appointment.time}
                            </span>
                            <span className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              Dr. {appointment.provider?.lastName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 pt-1">
                            <Badge variant="outline">{appointment.pet?.name}</Badge>
                            <Badge variant={
                              appointment.status === 'completed' ? 'default' : 
                              appointment.status === 'cancelled' ? 'destructive' : 
                              'secondary'
                            }>
                              {appointment.status}
                            </Badge>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground pt-2">
                              <span className="font-medium">Notes:</span> {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Link href={`/client/appointments/${appointment.id}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRebook(appointment)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Rebook
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}