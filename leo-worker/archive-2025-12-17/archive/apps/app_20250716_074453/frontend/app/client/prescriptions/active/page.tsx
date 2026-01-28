'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { getMockPrescriptionsByOwner } from '@/lib/mock-data';
import { Prescription } from '@/types';
import { format, addDays, isAfter } from 'date-fns';
import { Pill, Calendar, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ActivePrescriptionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        const allPrescriptions = getMockPrescriptionsByOwner(user.id);
        const activePrescriptions = allPrescriptions.filter(rx => rx.status === 'active');
        setPrescriptions(activePrescriptions);
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  const calculateRefillDate = (prescription: Prescription) => {
    // Calculate when medication will run out based on quantity and frequency
    const daysSupply = prescription.quantity / 2; // Simplified calculation
    return addDays(new Date(prescription.prescribedDate), daysSupply);
  };

  const canRefill = (prescription: Prescription) => {
    return prescription.refills > 0;
  };

  const handleRefillRequest = (prescriptionId: string) => {
    // In a real app, this would navigate to the refill page
    toast({
      title: 'Refill request submitted',
      description: 'Your pharmacy will be notified. You\'ll receive a confirmation soon.',
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
        <h1 className="text-3xl font-bold">Prescriptions</h1>
        <p className="text-muted-foreground">Manage your pets' medications</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="history" asChild>
            <Link href="/client/prescriptions/history">History</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {prescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active prescriptions</h3>
                <p className="text-muted-foreground">
                  Your pets' active medications will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => {
                const refillDate = calculateRefillDate(prescription);
                const needsRefillSoon = isAfter(new Date(), addDays(refillDate, -7));
                
                return (
                  <Card key={prescription.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Pill className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-lg">{prescription.medication}</h4>
                              {needsRefillSoon && (
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Refill Soon</span>
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                Prescribed: {format(new Date(prescription.prescribedDate), 'MMM d, yyyy')}
                              </p>
                              <p>
                                Dosage: {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                              </p>
                              <p>
                                Quantity: {prescription.quantity} • Refills remaining: {prescription.refills}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 pt-1">
                              <Badge variant="outline">{prescription.pet?.name}</Badge>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <div className="pt-2">
                              <p className="text-sm font-medium">Instructions:</p>
                              <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {canRefill(prescription) ? (
                            <Link href={`/client/prescriptions/refill/${prescription.id}`}>
                              <Button size="sm">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Request Refill
                              </Button>
                            </Link>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              No Refills
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Refill Reminders Card */}
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Refill Reminders
                  </CardTitle>
                  <CardDescription>
                    We'll notify you when it's time to refill medications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    You'll receive reminders via email and SMS 7 days before your pet's medication runs out.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}