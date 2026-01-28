'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';

// Mock prescription data
const mockPrescriptions = [
  {
    id: '1',
    petName: 'Max',
    petId: '1',
    ownerName: 'John Smith',
    medication: 'Amoxicillin 250mg',
    dosage: '1 tablet twice daily',
    duration: '10 days',
    quantity: 20,
    refills: 2,
    status: 'pending',
    prescribedBy: 'Dr. Wilson',
    prescribedDate: '2024-01-15T10:00:00',
    notes: 'For bacterial infection',
  },
  {
    id: '2',
    petName: 'Luna',
    petId: '2',
    ownerName: 'Sarah Johnson',
    medication: 'Prednisolone 5mg',
    dosage: '0.5 tablet once daily',
    duration: '7 days',
    quantity: 3.5,
    refills: 0,
    status: 'active',
    prescribedBy: 'Dr. Thompson',
    prescribedDate: '2024-01-14T14:30:00',
    dispensedDate: '2024-01-14T15:00:00',
    notes: 'Taper dose after 5 days',
  },
  {
    id: '3',
    petName: 'Charlie',
    petId: '3',
    ownerName: 'Mike Davis',
    medication: 'Heartgard Plus',
    dosage: '1 chew monthly',
    duration: '6 months',
    quantity: 6,
    refills: 1,
    status: 'completed',
    prescribedBy: 'Dr. Wilson',
    prescribedDate: '2024-01-10T09:00:00',
    dispensedDate: '2024-01-10T09:30:00',
    completedDate: '2024-01-14T10:00:00',
    notes: 'Heartworm prevention',
  },
];

export default function PrescriptionsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPrescriptions = mockPrescriptions.filter(rx => {
    const matchesSearch = searchTerm === '' ||
      rx.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.medication.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (_id: string) => {
    toast({
      title: "Prescription approved",
      description: "The prescription has been approved and sent to the pharmacy.",
    });
  };

  const handleDeny = (_id: string) => {
    toast({
      title: "Prescription denied",
      description: "The prescriber will be notified of the denial.",
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          <ClockIcon className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Active
        </Badge>;
      case 'completed':
        return <Badge variant="secondary">
          Completed
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Prescription Management</h1>
            <p className="text-muted-foreground">Review and manage prescription requests</p>
          </div>
          <Button>
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            New Prescription
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {mockPrescriptions.filter(rx => rx.status === 'pending').length}
                </span>
                <Badge variant="destructive" className="text-xs">Urgent</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {mockPrescriptions.filter(rx => rx.status === 'active').length}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Refill Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">3</span>
                <span className="text-sm text-muted-foreground">today</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">12</span>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by pet, owner, or medication..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Prescriptions</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({mockPrescriptions.filter(rx => rx.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="refills">Refill Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                            {getStatusBadge(prescription.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {prescription.petName} • {prescription.ownerName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Dr. {prescription.prescribedBy}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(prescription.prescribedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Dosage</p>
                          <p className="font-medium">{prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{prescription.duration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{prescription.quantity} • {prescription.refills} refills</p>
                        </div>
                      </div>

                      {prescription.notes && (
                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground">Notes: {prescription.notes}</p>
                        </div>
                      )}
                    </div>

                    {prescription.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeny(prescription.id)}
                        >
                          Deny
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(prescription.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredPrescriptions.filter(rx => rx.status === 'pending').map((prescription) => (
              <Card key={prescription.id} className="border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Requires Approval</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                      <p className="text-sm text-muted-foreground">
                        {prescription.petName} • {prescription.ownerName}
                      </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Dosage</p>
                        <p className="font-medium">{prescription.dosage}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{prescription.duration}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prescribed By</p>
                        <p className="font-medium">Dr. {prescription.prescribedBy}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => handleDeny(prescription.id)}
                      >
                        Deny
                      </Button>
                      <Button
                        onClick={() => handleApprove(prescription.id)}
                      >
                        Approve &amp; Dispense
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="refills" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <ArrowPathIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No refill requests at this time</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}