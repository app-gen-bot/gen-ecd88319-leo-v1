'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { getMockPrescriptionsByOwner } from '@/lib/mock-data';
import { Prescription } from '@/types';
import { format } from 'date-fns';
import { Pill, Search, RefreshCw } from 'lucide-react';

export default function PrescriptionHistoryPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        const allPrescriptions = getMockPrescriptionsByOwner(user.id);
        // Include all prescriptions for history (both active and completed)
        setPrescriptions(allPrescriptions);
        setFilteredPrescriptions(allPrescriptions);
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  useEffect(() => {
    const filtered = prescriptions.filter(rx => 
      rx.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.pet?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPrescriptions(filtered);
  }, [searchTerm, prescriptions]);

  const handleRefill = (prescriptionId: string) => {
    // Navigate to refill page
    window.location.href = `/client/prescriptions/refill/${prescriptionId}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-sm" />
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
        <p className="text-muted-foreground">View your prescription history</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="active" asChild>
            <Link href="/client/prescriptions/active">Active</Link>
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4 mt-6">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by medication or pet name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Prescription List */}
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No prescriptions found' : 'No prescription history'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Your prescription history will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Pill className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">{prescription.medication}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                            </p>
                            <p>
                              Prescribed: {format(new Date(prescription.prescribedDate), 'MMM d, yyyy')} by Dr. Smith
                            </p>
                            <p>
                              Quantity: {prescription.quantity} • Total refills: {prescription.refills}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 pt-1">
                            <Badge variant="outline">{prescription.pet?.name}</Badge>
                            <Badge 
                              variant={prescription.status === 'active' ? 'default' : 'secondary'}
                            >
                              {prescription.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {prescription.status === 'active' && prescription.refills > 0 && (
                          <Button
                            size="sm"
                            onClick={() => handleRefill(prescription.id)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refill
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Summary Card */}
          {filteredPrescriptions.length > 0 && (
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-base">Prescription Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Prescriptions</p>
                    <p className="text-2xl font-semibold">{filteredPrescriptions.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active Prescriptions</p>
                    <p className="text-2xl font-semibold">
                      {filteredPrescriptions.filter(rx => rx.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}