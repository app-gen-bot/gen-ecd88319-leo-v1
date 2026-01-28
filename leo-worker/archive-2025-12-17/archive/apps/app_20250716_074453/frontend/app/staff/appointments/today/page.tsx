'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDaysIcon, ClockIcon, UserIcon, MapPinIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/auth-context';
import { getMockAppointmentsByVet } from '@/lib/mock-data';
import { Appointment } from '@/types';
import { format, isToday } from 'date-fns';

export default function TodayAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        const allAppointments = getMockAppointmentsByVet(user.id);
        const todayAppointments = allAppointments.filter(apt => isToday(new Date(apt.date)));
        setAppointments(todayAppointments);
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff/appointments">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Today's Appointments</h1>
            <p className="text-gray-400">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>
        <Link href="/staff/schedule/new">
          <Button>
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </Link>
      </div>

      {appointments.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-12">
            <CalendarDaysIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">No appointments today</h3>
            <p className="text-gray-400">Your schedule is clear for today.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CalendarDaysIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg text-gray-100">{appointment.serviceType}</h4>
                        <Badge className={`${getStatusColor(appointment.status)} text-white border-0`}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 space-x-4">
                        <span className="flex items-center">
                          <ClockIcon className="mr-1 h-3 w-3" />
                          {appointment.time} ({appointment.duration} min)
                        </span>
                        <span className="flex items-center">
                          <UserIcon className="mr-1 h-3 w-3" />
                          {appointment.owner?.firstName} {appointment.owner?.lastName}
                        </span>
                        {appointment.roomNumber && (
                          <span className="flex items-center">
                            <MapPinIcon className="mr-1 h-3 w-3" />
                            Room {appointment.roomNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 pt-1">
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {appointment.pet?.name} - {appointment.pet?.species}
                        </Badge>
                      </div>
                      {appointment.reason && (
                        <p className="text-sm text-gray-300 pt-2">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link href={`/staff/patients/${appointment.petId}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Patient
                      </Button>
                    </Link>
                    {appointment.status === 'scheduled' && (
                      <Button size="sm" className="w-full">
                        Check In
                      </Button>
                    )}
                    {appointment.status === 'checked_in' && (
                      <Link href={`/staff/records/soap/new?patient=${appointment.petId}`}>
                        <Button size="sm" className="w-full">
                          Start Visit
                        </Button>
                      </Link>
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