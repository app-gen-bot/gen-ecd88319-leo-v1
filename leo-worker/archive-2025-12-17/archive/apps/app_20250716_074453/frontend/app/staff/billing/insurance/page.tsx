'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon, DocumentTextIcon, BuildingOffice2Icon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientName: string;
  petName: string;
  provider: string;
  dateSubmitted: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied' | 'paid';
  services: string[];
}

const mockClaims: InsuranceClaim[] = [
  {
    id: '1',
    claimNumber: 'CLM-2024-001',
    patientName: 'John Smith',
    petName: 'Max',
    provider: 'PetSure Insurance',
    dateSubmitted: new Date(Date.now() - 7 * 86400000).toISOString(),
    amount: 450.00,
    status: 'pending',
    services: ['Annual Exam', 'Vaccinations', 'Blood Work'],
  },
  {
    id: '2',
    claimNumber: 'CLM-2024-002',
    patientName: 'Jane Doe',
    petName: 'Luna',
    provider: 'Healthy Paws',
    dateSubmitted: new Date(Date.now() - 14 * 86400000).toISOString(),
    amount: 1200.00,
    status: 'approved',
    services: ['Dental Cleaning', 'Tooth Extraction'],
  },
];

export default function InsurancePage() {
  const [claims] = useState<InsuranceClaim[]>(mockClaims);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClaims = claims.filter(claim => {
    const searchLower = searchTerm.toLowerCase();
    return (
      claim.claimNumber.toLowerCase().includes(searchLower) ||
      claim.patientName.toLowerCase().includes(searchLower) ||
      claim.petName.toLowerCase().includes(searchLower) ||
      claim.provider.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 text-white border-0">Paid</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500 text-white border-0">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white border-0">Pending</Badge>;
      case 'denied':
        return <Badge className="bg-red-500 text-white border-0">Denied</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'denied':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const totalPending = pendingClaims.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff/billing">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Insurance Claims</h1>
            <p className="text-gray-400">Manage pet insurance claims and reimbursements</p>
          </div>
        </div>
        <Button>
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Submit New Claim
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">{pendingClaims.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">${totalPending.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Approved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">12</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">5 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Search */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="relative">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <BuildingOffice2Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search claims..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Claims List */}
          <div className="grid gap-4">
            {filteredClaims.map((claim) => (
              <Card key={claim.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        {getStatusIcon(claim.status)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-100">{claim.claimNumber}</h4>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="text-sm text-gray-400">
                          {claim.patientName} • {claim.petName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {claim.provider} • Submitted {format(new Date(claim.dateSubmitted), 'MMM d, yyyy')}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {claim.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-100">${claim.amount.toFixed(2)}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {claim.status === 'pending' && (
                          <Button size="sm">
                            Follow Up
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Pending Claims</h3>
              <p className="text-gray-400">Claims awaiting insurance company response</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <CheckCircleIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Approved Claims</h3>
              <p className="text-gray-400">Claims approved for payment</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denied">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <XCircleIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Denied Claims</h3>
              <p className="text-gray-400">Claims that were not approved</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}