'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, DocumentTextIcon, BeakerIcon, PhotoIcon, PlusIcon, ArrowDownTrayIcon, PrinterIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { mockPatients, mockMedicalRecords, mockUsers } from '@/lib/mock-data';

export default function PatientRecordsPage({ params }: { params: { id: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recordType, setRecordType] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const patient = mockPatients.find(p => p.id === params.id);
  const records = mockMedicalRecords.filter(r => r.petId === params.id);

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Patient not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Filter records based on search and filters
  const filteredRecords = records.filter(record => {
    const provider = mockUsers.find(u => u.id === record.providerId);
    const matchesSearch = searchTerm === '' || 
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.soapNote?.subjective?.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = recordType === 'all' || record.type === recordType;
    
    // Simple date filtering (in real app, would be more sophisticated)
    const recordDate = new Date(record.date);
    const now = new Date();
    let matchesDate = true;
    
    if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = recordDate >= weekAgo;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = recordDate >= monthAgo;
    } else if (dateRange === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      matchesDate = recordDate >= yearAgo;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/staff/patients/${params.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Medical Records</h1>
              <p className="text-muted-foreground">{patient.name} - {patient.species}, {patient.breed}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/staff/records/soap/new?patient=${params.id}`}>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                New SOAP Note
              </Button>
            </Link>
            <Button variant="outline">
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Summary
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={recordType} onValueChange={setRecordType}>
                <SelectTrigger>
                  <SelectValue placeholder="Record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="soap">SOAP Notes</SelectItem>
                  <SelectItem value="vaccination">Vaccinations</SelectItem>
                  <SelectItem value="lab_result">Lab Results</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Records
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records Tabs */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
            <TabsTrigger value="labs">Lab Results</TabsTrigger>
            <TabsTrigger value="imaging">Imaging</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            {filteredRecords.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No records found</p>
                </CardContent>
              </Card>
            ) : (
              filteredRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {record.type === 'soap' && 'SOAP Note'}
                            {record.type === 'vaccination' && 'Vaccination'}
                            {record.type === 'surgery' && 'Surgery'}
                            {record.type === 'lab_result' && 'Lab Results'}
                            {record.type === 'imaging' && 'Imaging'}
                            {record.type === 'other' && 'Other Record'}
                          </CardTitle>
                          <Badge variant={
                            record.type === 'soap' ? 'default' :
                            record.type === 'vaccination' ? 'secondary' :
                            record.type === 'surgery' ? 'destructive' :
                            record.type === 'lab_result' ? 'outline' :
                            'outline'
                          }>
                            {record.type}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(record.date).toLocaleDateString()} • Dr. {mockUsers.find(u => u.id === record.providerId)?.lastName || 'Unknown'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                        <Button variant="ghost" size="sm">
                          <PrinterIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {record.type === 'soap' && record.soapNote && (
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold mb-1">Chief Complaint:</p>
                          <p className="text-muted-foreground">{record.soapNote.subjective.chiefComplaint}</p>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Assessment:</p>
                          <p className="text-muted-foreground">{record.soapNote.assessment.diagnosis.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    {record.type === 'vaccination' && (
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">Vaccination Record</p>
                        <Badge variant="secondary">Annual Vaccines Administered</Badge>
                      </div>
                    )}
                    {record.soapNote?.subjective?.chiefComplaint && (
                      <p className="text-sm text-muted-foreground mt-2">{record.soapNote.subjective.chiefComplaint}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="soap" className="space-y-4">
            {filteredRecords.filter(r => r.type === 'soap' && r.soapNote).map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">SOAP Note</CardTitle>
                      <CardDescription>
                        {new Date(record.date).toLocaleDateString()} • Dr. {mockUsers.find(u => u.id === record.providerId)?.lastName || 'Unknown'}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      View Full Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Subjective</h4>
                    <p className="text-sm text-muted-foreground">{record.soapNote?.subjective.chiefComplaint}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Objective</h4>
                    <p className="text-sm text-muted-foreground">
                      {record.soapNote?.objective.temperature && `Temp: ${record.soapNote.objective.temperature}°F, `}
                      {record.soapNote?.objective.heartRate && `HR: ${record.soapNote.objective.heartRate}, `}
                      {record.soapNote?.objective.weight && `Weight: ${record.soapNote.objective.weight} lbs`}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Assessment</h4>
                    <p className="text-sm text-muted-foreground">{record.soapNote?.assessment.diagnosis.join(', ')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      {record.soapNote?.plan.procedures?.join(', ')}
                      {record.soapNote?.plan.followUp && ` • Follow-up: ${record.soapNote.plan.followUp}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="labs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lab Results</CardTitle>
                <CardDescription>View and manage laboratory test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BeakerIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No lab results available</p>
                  <Button variant="outline" className="mt-4">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Lab Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="imaging" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Imaging Studies</CardTitle>
                <CardDescription>X-rays, ultrasounds, and other imaging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PhotoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No imaging studies available</p>
                  <Button variant="outline" className="mt-4">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Medical documents and files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No documents uploaded</p>
                  <Button variant="outline" className="mt-4">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}