'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  BeakerIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PrinterIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  BeakerIcon as BeakerIconSolid,
  ClockIcon as ClockIconSolid,
} from '@heroicons/react/24/solid';

// Mock data for pending tests
const pendingTests = [
  {
    id: 'LAB001',
    patientName: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    ownerName: 'John Smith',
    testType: 'Complete Blood Count',
    category: 'Hematology',
    priority: 'urgent',
    orderedBy: 'Dr. Sarah Johnson',
    orderedAt: '2024-03-14T09:30:00Z',
    estimatedTurnaround: '2 hours',
    status: 'in_progress',
  },
  {
    id: 'LAB002',
    patientName: 'Luna',
    species: 'Cat',
    breed: 'Persian',
    ownerName: 'Emily Davis',
    testType: 'Urinalysis',
    category: 'Urinalysis',
    priority: 'normal',
    orderedBy: 'Dr. Michael Chen',
    orderedAt: '2024-03-14T10:15:00Z',
    estimatedTurnaround: '1 hour',
    status: 'pending',
  },
  {
    id: 'LAB003',
    patientName: 'Charlie',
    species: 'Dog',
    breed: 'Labrador',
    ownerName: 'Robert Wilson',
    testType: 'Blood Chemistry Panel',
    category: 'Chemistry',
    priority: 'stat',
    orderedBy: 'Dr. Sarah Johnson',
    orderedAt: '2024-03-14T10:45:00Z',
    estimatedTurnaround: '30 minutes',
    status: 'pending',
  },
];

// Mock data for completed tests
const completedTests = [
  {
    id: 'LAB004',
    patientName: 'Bella',
    species: 'Dog',
    breed: 'Poodle',
    ownerName: 'Lisa Anderson',
    testType: 'Thyroid Panel',
    category: 'Endocrinology',
    priority: 'normal',
    orderedBy: 'Dr. Michael Chen',
    orderedAt: '2024-03-14T08:00:00Z',
    completedAt: '2024-03-14T10:30:00Z',
    turnaroundTime: '2.5 hours',
    status: 'completed',
    hasCriticalValues: true,
    results: {
      T4: { value: 0.8, unit: 'μg/dL', range: '1.0-4.0', flag: 'L' },
      TSH: { value: 5.2, unit: 'μg/dL', range: '0.05-3.5', flag: 'H' },
      fT4: { value: 0.7, unit: 'ng/dL', range: '0.8-1.8', flag: 'L' },
    },
  },
  {
    id: 'LAB005',
    patientName: 'Oscar',
    species: 'Cat',
    breed: 'Maine Coon',
    ownerName: 'James Brown',
    testType: 'Complete Blood Count',
    category: 'Hematology',
    priority: 'normal',
    orderedBy: 'Dr. Sarah Johnson',
    orderedAt: '2024-03-14T07:30:00Z',
    completedAt: '2024-03-14T09:45:00Z',
    turnaroundTime: '2.25 hours',
    status: 'completed',
    hasCriticalValues: false,
    results: {
      WBC: { value: 12.3, unit: 'K/μL', range: '5.5-19.5', flag: null },
      RBC: { value: 8.5, unit: 'M/μL', range: '5.0-10.0', flag: null },
      HGB: { value: 13.2, unit: 'g/dL', range: '9.0-15.0', flag: null },
      HCT: { value: 39.5, unit: '%', range: '29.0-45.0', flag: null },
    },
  },
];

// Test type categories
const testCategories = [
  'All Categories',
  'Hematology',
  'Chemistry',
  'Urinalysis',
  'Endocrinology',
  'Microbiology',
  'Parasitology',
  'Cytology',
  'Histopathology',
];

// Priority levels
const priorityLevels = {
  stat: { label: 'STAT', color: 'bg-red-500', textColor: 'text-white' },
  urgent: { label: 'Urgent', color: 'bg-orange-500', textColor: 'text-white' },
  normal: { label: 'Normal', color: 'bg-gray-500', textColor: 'text-white' },
};

// Status indicators
const statusIndicators = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: ClockIcon },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', icon: ArrowPathIcon },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircleIcon },
};

export default function LaboratoryPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  // Calculate statistics
  const criticalValuesCount = completedTests.filter(test => test.hasCriticalValues).length;
  const statTestsCount = pendingTests.filter(test => test.priority === 'stat').length;
  const avgTurnaroundTime = '1.8 hours';

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const calculateTimeElapsed = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Laboratory</h1>
          <p className="text-gray-400 mt-1">Manage lab tests and results</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Order New Test
        </Button>
      </div>

      {/* Critical Values Alert */}
      {criticalValuesCount > 0 && (
        <Alert className="bg-red-900/20 border-red-800">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-400">Critical Values Alert</AlertTitle>
          <AlertDescription className="text-gray-300">
            {criticalValuesCount} test(s) with critical values require immediate attention.
            <Button 
              variant="link" 
              className="text-red-400 hover:text-red-300 p-0 ml-2"
              onClick={() => setActiveTab('results')}
            >
              View Results
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">
                Pending Tests
              </CardTitle>
              <BeakerIcon className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {pendingTests.length}
            </div>
            {statTestsCount > 0 && (
              <p className="text-xs text-red-400 mt-1">
                {statTestsCount} STAT
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">
                Results Today
              </CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {completedTests.length}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">
                Critical Values
              </CardTitle>
              <ExclamationCircleIcon className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {criticalValuesCount}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">
                Avg. Turnaround
              </CardTitle>
              <ClockIcon className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {avgTurnaroundTime}
            </div>
            <p className="text-xs text-green-400 mt-1">
              Within target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <CardTitle className="text-lg text-gray-100">Filters</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400">
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search patient or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-gray-100"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectValue placeholder="Test Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {testCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="pending" className="data-[state=active]:bg-gray-700">
            <BeakerIcon className="h-4 w-4 mr-2" />
            Pending Tests
            {pendingTests.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-400">
                {pendingTests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-gray-700">
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Test Results
            {criticalValuesCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-red-500/20 text-red-400">
                {criticalValuesCount} Critical
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gray-700">
            <ClockIcon className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Pending Tests Tab */}
        <TabsContent value="pending">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Pending Laboratory Tests</CardTitle>
              <CardDescription className="text-gray-400">
                Tests awaiting processing or in progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Test ID</TableHead>
                    <TableHead className="text-gray-400">Patient</TableHead>
                    <TableHead className="text-gray-400">Test Type</TableHead>
                    <TableHead className="text-gray-400">Priority</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Time Elapsed</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTests.map((test) => {
                    const StatusIcon = statusIndicators[test.status as keyof typeof statusIndicators].icon;
                    const priority = priorityLevels[test.priority as keyof typeof priorityLevels];
                    
                    return (
                      <TableRow key={test.id} className="border-gray-700">
                        <TableCell className="font-mono text-sm text-gray-300">
                          {test.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-100">{test.patientName}</p>
                            <p className="text-sm text-gray-400">
                              {test.species} - {test.breed}
                            </p>
                            <p className="text-xs text-gray-500">{test.ownerName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-100">{test.testType}</p>
                            <p className="text-sm text-gray-400">{test.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${priority.color} ${priority.textColor} border-0`}
                          >
                            {priority.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4 text-gray-400" />
                            <Badge 
                              variant="secondary" 
                              className={`${statusIndicators[test.status as keyof typeof statusIndicators].color} text-white border-0`}
                            >
                              {statusIndicators[test.status as keyof typeof statusIndicators].label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-300">
                              {calculateTimeElapsed(test.orderedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-gray-400 hover:text-gray-100"
                              >
                                Actions
                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="bg-gray-800 border-gray-700"
                            >
                              <DropdownMenuLabel>Test Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem className="hover:bg-gray-700">
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-gray-700">
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-gray-700">
                                Enter Results
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-gray-700">
                                Print Label
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem className="text-red-400 hover:bg-gray-700">
                                Cancel Test
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Test Results</CardTitle>
              <CardDescription className="text-gray-400">
                Completed tests with results available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Test ID</TableHead>
                    <TableHead className="text-gray-400">Patient</TableHead>
                    <TableHead className="text-gray-400">Test Type</TableHead>
                    <TableHead className="text-gray-400">Completed</TableHead>
                    <TableHead className="text-gray-400">Turnaround</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTests.map((test) => (
                    <TableRow key={test.id} className="border-gray-700">
                      <TableCell className="font-mono text-sm text-gray-300">
                        {test.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-100">{test.patientName}</p>
                          <p className="text-sm text-gray-400">
                            {test.species} - {test.breed}
                          </p>
                          <p className="text-xs text-gray-500">{test.ownerName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-100">{test.testType}</p>
                          <p className="text-sm text-gray-400">{test.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDateTime(test.completedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ClockIconSolid className="h-4 w-4 text-green-500" />
                          <span className="text-gray-300">{test.turnaroundTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {test.hasCriticalValues && (
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                          )}
                          <Badge 
                            variant={test.hasCriticalValues ? "destructive" : "secondary"}
                            className={test.hasCriticalValues ? "bg-red-500/20 text-red-400 border-red-500" : "bg-green-500/20 text-green-400 border-green-500"}
                          >
                            {test.hasCriticalValues ? "Critical Values" : "Normal"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-400 hover:text-gray-100"
                          >
                            View Results
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-gray-400 hover:text-gray-100"
                              >
                                <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="bg-gray-800 border-gray-700"
                            >
                              <DropdownMenuItem className="hover:bg-gray-700">
                                <PrinterIcon className="h-4 w-4 mr-2" />
                                Print Results
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-gray-700">
                                <EnvelopeIcon className="h-4 w-4 mr-2" />
                                Email Results
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-gray-700">
                                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem className="hover:bg-gray-700">
                                Add to Medical Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-100">Test History</CardTitle>
                  <CardDescription className="text-gray-400">
                    View historical lab tests and results
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-gray-700">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Custom Date Range
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700">
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Export History
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-400">
                <BeakerIconSolid className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-lg font-medium mb-2">No history available</p>
                <p className="text-sm">Historical test data will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}