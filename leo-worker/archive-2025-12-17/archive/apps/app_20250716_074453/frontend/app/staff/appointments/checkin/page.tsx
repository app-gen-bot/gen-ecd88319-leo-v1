'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeftIcon, MagnifyingGlassIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/auth-context';
import { getMockAppointmentsByVet, mockPatients } from '@/lib/mock-data';
import { Appointment } from '@/types';
import { format } from 'date-fns';
import { toast } from '@/lib/use-toast';

export default function CheckInPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        const todayAppointments = getMockAppointmentsByVet(user.id)
          .filter(apt => {
            const aptDate = new Date(apt.date);
            const today = new Date();
            return aptDate.toDateString() === today.toDateString() && apt.status === 'scheduled';
          })
          .map(apt => ({
            ...apt,
            pet: mockPatients.find(p => p.id === apt.petId),
          }));
        setAppointments(todayAppointments);
        setFilteredAppointments(todayAppointments);
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  useEffect(() => {
    const filtered = appointments.filter(apt => {
      const searchLower = searchTerm.toLowerCase();
      return (
        apt.owner?.lastName?.toLowerCase().includes(searchLower) ||
        apt.owner?.firstName?.toLowerCase().includes(searchLower) ||
        apt.pet?.name?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const handleCheckIn = async (appointmentId: string) => {
    setCheckingIn(appointmentId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update appointment status
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: 'checked_in' as const } : apt
        )
      );
      
      toast({
        title: 'Patient checked in',
        description: 'The patient has been successfully checked in.',
      });
    } catch (error) {
      toast({
        title: 'Check-in failed',
        description: 'Unable to check in patient. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff/appointments">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Check In Patients</h1>
          <p className="text-gray-400">Check in arriving patients for their appointments</p>
        </div>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <Label htmlFor="search" className="sr-only">Search</Label>
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            placeholder="Search by owner or pet name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
          />
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">No patients waiting</h3>
            <p className="text-gray-400">
              {searchTerm ? 'No appointments match your search.' : 'All scheduled patients have been checked in.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-100">
                      {appointment.pet?.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {appointment.pet?.species} • {appointment.pet?.breed}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {appointment.time}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p className="text-gray-400">
                    <span className="font-medium text-gray-300">Owner:</span> {appointment.owner?.firstName} {appointment.owner?.lastName}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium text-gray-300">Service:</span> {appointment.serviceType}
                  </p>
                  {appointment.provider && (
                    <p className="text-gray-400">
                      <span className="font-medium text-gray-300">Provider:</span> Dr. {appointment.provider.lastName}
                    </p>
                  )}
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleCheckIn(appointment.id)}
                  disabled={checkingIn === appointment.id || appointment.status === 'checked_in'}
                >
                  {checkingIn === appointment.id ? (
                    'Checking in...'
                  ) : appointment.status === 'checked_in' ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Checked In
                    </>
                  ) : (
                    'Check In'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}