'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  PrinterIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  BeakerIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon,
  ClockIcon as ClockIconSolid,
} from '@heroicons/react/24/solid';

// Mock data for SOAP notes
const mockSOAPNotes = [
  {
    id: '1',
    patientName: 'Max',
    species: 'Canine',
    breed: 'Golden Retriever',
    date: '2024-01-15',
    time: '10:30 AM',
    provider: 'Dr. Sarah Smith',
    chiefComplaint: 'Annual wellness exam',
    diagnosis: 'Healthy - routine checkup',
    status: 'finalized',
    type: 'soap',
    reviewed: true,
    reviewer: 'Dr. John Wilson',
    reviewDate: '2024-01-15',
  },
  {
    id: '2',
    patientName: 'Luna',
    species: 'Feline',
    breed: 'Siamese',
    date: '2024-01-15',
    time: '2:15 PM',
    provider: 'Dr. Sarah Smith',
    chiefComplaint: 'Vomiting and lethargy',
    diagnosis: 'Gastroenteritis',
    status: 'finalized',
    type: 'soap',
    reviewed: false,
  },
  {
    id: '3',
    patientName: 'Buddy',
    species: 'Canine',
    breed: 'Labrador',
    date: '2024-01-14',
    time: '4:00 PM',
    provider: 'Dr. Emily Chen',
    chiefComplaint: 'Limping on right hind leg',
    diagnosis: 'Soft tissue injury',
    status: 'draft',
    type: 'soap',
    reviewed: false,
  },
  {
    id: '4',
    patientName: 'Whiskers',
    species: 'Feline',
    breed: 'Persian',
    date: '2024-01-14',
    time: '11:00 AM',
    provider: 'Dr. Sarah Smith',
    chiefComplaint: 'Dental cleaning',
    diagnosis: 'Grade 2 dental disease',
    status: 'finalized',
    type: 'procedure',
    reviewed: true,
    reviewer: 'Dr. Emily Chen',
    reviewDate: '2024-01-14',
  },
];

// Common condition templates
const conditionTemplates = [
  { id: '1', name: 'Annual Wellness Exam', category: 'Preventive' },
  { id: '2', name: 'Vaccination Visit', category: 'Preventive' },
  { id: '3', name: 'Gastroenteritis', category: 'Gastrointestinal' },
  { id: '4', name: 'Otitis Externa', category: 'Dermatological' },
  { id: '5', name: 'Dental Disease', category: 'Dental' },
  { id: '6', name: 'Soft Tissue Injury', category: 'Orthopedic' },
  { id: '7', name: 'Upper Respiratory Infection', category: 'Respiratory' },
  { id: '8', name: 'Urinary Tract Infection', category: 'Urinary' },
];

// Providers list
const providers = [
  'All Providers',
  'Dr. Sarah Smith',
  'Dr. Emily Chen',
  'Dr. John Wilson',
  'Dr. Michael Brown',
];

// Record types
const recordTypes = [
  { value: 'all', label: 'All Records' },
  { value: 'soap', label: 'SOAP Notes' },
  { value: 'procedure', label: 'Procedure Notes' },
  { value: 'surgery', label: 'Surgery Reports' },
  { value: 'lab', label: 'Lab Results' },
  { value: 'imaging', label: 'Imaging Reports' },
];

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [selectedRecordType, setSelectedRecordType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get status icon and color
  const getStatusBadge = (status: string, reviewed: boolean) => {
    if (status === 'draft') {
      return (
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-0">
          <ClockIconSolid className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      );
    }
    if (status === 'finalized' && reviewed) {
      return (
        <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-0">
          <CheckCircleIconSolid className="h-3 w-3 mr-1" />
          Reviewed
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 border-0">
        <DocumentTextIcon className="h-3 w-3 mr-1" />
        Finalized
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground mt-1">
            Manage SOAP notes, lab results, and medical documentation
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                New SOAP Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New SOAP Note</DialogTitle>
                <DialogDescription>
                  Select a template or start from scratch
                </DialogDescription>
              </DialogHeader>
              
              {/* Template Selection */}
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-3">Common Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                  {conditionTemplates.slice(0, 6).map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="justify-start"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                      {template.name}
                    </Button>
                  ))}
                </div>
                <Button variant="link" className="mt-2 px-0">
                  View all templates →
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Records
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShareIcon className="h-4 w-4 mr-2" />
                Share via Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, date, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Provider Filter */}
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-[200px]">
                <UserIcon className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Record Type Filter */}
            <Select value={selectedRecordType} onValueChange={setSelectedRecordType}>
              <SelectTrigger className="w-[180px]">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recordTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* More Filters */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-accent' : ''}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Additional Filters */}
          {showFilters && (
            <div className="mt-4 flex items-center gap-4 pt-4 border-t">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <TagIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm" onClick={() => {
                setDateFilter('all');
                setStatusFilter('all');
                setSelectedProvider('All Providers');
                setSelectedRecordType('all');
                setSearchTerm('');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">34</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft Notes</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <PencilSquareIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Records</TabsTrigger>
          <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
          <TabsTrigger value="labs">
            <BeakerIcon className="h-4 w-4 mr-2" />
            Lab Results
          </TabsTrigger>
          <TabsTrigger value="imaging">
            <PhotoIcon className="h-4 w-4 mr-2" />
            Imaging
          </TabsTrigger>
          <TabsTrigger value="prescriptions">
            <BeakerIcon className="h-4 w-4 mr-2" />
            Prescriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Medical Records</CardTitle>
              <CardDescription>
                All medical records from the past 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Chief Complaint / Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSOAPNotes.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.date}</p>
                          <p className="text-sm text-muted-foreground">{record.time}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.species} - {record.breed}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {record.type === 'soap' ? 'SOAP Note' : record.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.provider}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.chiefComplaint}</p>
                          <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status, record.reviewed)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Record
                            </DropdownMenuItem>
                            {record.status === 'draft' && (
                              <DropdownMenuItem>
                                <PencilSquareIcon className="h-4 w-4 mr-2" />
                                Edit Draft
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <PrinterIcon className="h-4 w-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                              Export PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ShareIcon className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="soap">
          <Card>
            <CardHeader>
              <CardTitle>SOAP Notes</CardTitle>
              <CardDescription>
                Subjective, Objective, Assessment, and Plan documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">SOAP notes content would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs">
          <Card>
            <CardHeader>
              <CardTitle>Laboratory Results</CardTitle>
              <CardDescription>
                Blood work, urinalysis, and other diagnostic test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lab results content would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imaging">
          <Card>
            <CardHeader>
              <CardTitle>Imaging Studies</CardTitle>
              <CardDescription>
                X-rays, ultrasounds, and other imaging reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Imaging content would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>
                Medication prescriptions and treatment plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Prescriptions content would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}