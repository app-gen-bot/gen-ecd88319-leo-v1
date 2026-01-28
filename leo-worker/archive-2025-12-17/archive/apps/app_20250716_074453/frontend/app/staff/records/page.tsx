'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DocumentTextIcon, 
  BeakerIcon, 
  CameraIcon, 
  DocumentDuplicateIcon,
  PlusIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { mockMedicalRecords, mockPatients } from '@/lib/mock-data';

export default function RecordsDashboardPage() {

  // Get recent records
  const recentRecords = mockMedicalRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Get pending items
  const pendingSOAP = 3;
  const pendingLabs = 5;
  const pendingPrescriptions = 2;

  // Stats
  const todayRecords = mockMedicalRecords.filter(r => 
    new Date(r.date).toDateString() === new Date().toDateString()
  ).length;
  const weekRecords = mockMedicalRecords.filter(r => {
    const recordDate = new Date(r.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Medical Records</h1>
            <p className="text-muted-foreground">Manage patient records and documentation</p>
          </div>
          <Link href="/staff/records/soap/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New SOAP Note
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{todayRecords}</span>
                <Badge variant="secondary" className="text-xs">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{weekRecords}</span>
                <span className="text-sm text-green-600">+12%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{pendingSOAP + pendingLabs}</span>
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{pendingPrescriptions}</span>
                <span className="text-sm text-muted-foreground">pending</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/staff/records/soap/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">SOAP Note</p>
                  <p className="text-sm text-muted-foreground">Create new</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/staff/records/labs">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BeakerIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Lab Results</p>
                  <p className="text-sm text-muted-foreground">Enter results</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/staff/records/documents">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CameraIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Upload Images</p>
                  <p className="text-sm text-muted-foreground">X-rays, photos</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/staff/records/prescriptions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DocumentDuplicateIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Prescriptions</p>
                  <p className="text-sm text-muted-foreground">
                    <Badge variant="destructive" className="text-xs">
                      {pendingPrescriptions} pending
                    </Badge>
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Records and Pending Items */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Records */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Records</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRecords.map((record) => {
                  const patient = mockPatients.find(p => p.id === record.petId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{patient?.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {record.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pending Items */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="soap" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="soap">
                    SOAP ({pendingSOAP})
                  </TabsTrigger>
                  <TabsTrigger value="labs">
                    Labs ({pendingLabs})
                  </TabsTrigger>
                  <TabsTrigger value="rx">
                    Rx ({pendingPrescriptions})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="soap" className="space-y-3 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Incomplete SOAP Note</p>
                          <p className="text-sm text-muted-foreground">Max (Dog) - Started 2 hours ago</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Complete
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                      <div>
                        <p className="font-medium">Awaiting Signature</p>
                        <p className="text-sm text-muted-foreground">Luna (Cat) - Dr. Smith</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Sign
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="labs" className="space-y-3 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                      <div>
                        <p className="font-medium">CBC Results Ready</p>
                        <p className="text-sm text-muted-foreground">Charlie (Dog) - Lab ID: 12345</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                      <div>
                        <p className="font-medium">Urinalysis Complete</p>
                        <p className="text-sm text-muted-foreground">Bella (Cat) - Lab ID: 12346</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rx" className="space-y-3 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                      <div>
                        <p className="font-medium">Prescription Approval</p>
                        <p className="text-sm text-muted-foreground">Antibiotics - Max (Dog)</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Deny
                        </Button>
                        <Button size="sm">
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}