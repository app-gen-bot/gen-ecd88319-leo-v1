'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BeakerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';

// Mock lab data
const mockLabResults = [
  {
    id: '1',
    petName: 'Max',
    petId: '1',
    ownerName: 'John Smith',
    testType: 'Complete Blood Count (CBC)',
    status: 'pending',
    orderedBy: 'Dr. Wilson',
    orderedDate: '2024-01-15T10:00:00',
    labId: 'LAB-2024-001',
    priority: 'urgent',
  },
  {
    id: '2',
    petName: 'Luna',
    petId: '2',
    ownerName: 'Sarah Johnson',
    testType: 'Urinalysis',
    status: 'completed',
    orderedBy: 'Dr. Thompson',
    orderedDate: '2024-01-14T14:00:00',
    completedDate: '2024-01-15T09:00:00',
    labId: 'LAB-2024-002',
    results: {
      appearance: 'Clear',
      color: 'Yellow',
      specificGravity: '1.025',
      pH: '6.5',
      protein: 'Negative',
      glucose: 'Negative',
      ketones: 'Negative',
      blood: 'Negative',
      wbc: '0-2 HPF',
      rbc: '0-1 HPF',
      bacteria: 'None seen',
      crystals: 'None seen',
    },
    interpretation: 'Normal urinalysis. No signs of infection or other abnormalities.',
  },
  {
    id: '3',
    petName: 'Charlie',
    petId: '3',
    ownerName: 'Mike Davis',
    testType: 'Blood Chemistry Panel',
    status: 'in-progress',
    orderedBy: 'Dr. Wilson',
    orderedDate: '2024-01-15T11:30:00',
    labId: 'LAB-2024-003',
    priority: 'routine',
  },
];

export default function LabResultsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const filteredResults = mockLabResults.filter(result => {
    const matchesSearch = searchTerm === '' ||
      result.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.labId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, priority?: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <ClockIcon className="h-3 w-3 mr-1" />
              Pending
            </Badge>
            {priority === 'urgent' && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
          </div>
        );
      case 'in-progress':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">
          <BeakerIcon className="h-3 w-3 mr-1" />
          In Progress
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Completed
        </Badge>;
      default:
        return null;
    }
  };

  const handleEnterResults = (labId: string) => {
    // In real app, would open a modal or navigate to results entry page
    toast({
      title: "Enter Results",
      description: `Opening result entry for ${labId}`,
    });
  };

  const handleReviewResults = (result: any) => {
    setSelectedResult(result);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Laboratory Results</h1>
            <p className="text-muted-foreground">Manage lab tests and results</p>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Order Lab Test
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {mockLabResults.filter(r => r.status === 'pending').length}
                </span>
                <Badge variant="destructive" className="text-xs">
                  {mockLabResults.filter(r => r.priority === 'urgent').length} urgent
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {mockLabResults.filter(r => r.status === 'in-progress').length}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">8</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Abnormal Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">2</span>
                <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
              </div>
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
                  placeholder="Search by pet, owner, test type, or lab ID..."
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
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lab Results List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Lab Tests</h2>
            {filteredResults.map((result) => (
              <Card key={result.id} className={result.priority === 'urgent' ? 'border-destructive' : ''}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{result.testType}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.petName} • {result.ownerName}
                        </p>
                      </div>
                      {getStatusBadge(result.status, result.priority)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Lab ID</p>
                        <p className="font-medium">{result.labId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ordered By</p>
                        <p className="font-medium">{result.orderedBy}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ordered</p>
                        <p className="font-medium">
                          {new Date(result.orderedDate).toLocaleDateString()}
                        </p>
                      </div>
                      {result.completedDate && (
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-medium">
                            {new Date(result.completedDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      {result.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleEnterResults(result.labId)}
                        >
                          Enter Results
                        </Button>
                      )}
                      {result.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewResults(result)}
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Result Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Result Details</h2>
            {selectedResult && selectedResult.results ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedResult.testType}</CardTitle>
                  <CardDescription>
                    {selectedResult.petName} • Lab ID: {selectedResult.labId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedResult.testType === 'Urinalysis' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Physical Examination</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Appearance:</span>
                            <span className="font-medium">{selectedResult.results.appearance}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Color:</span>
                            <span className="font-medium">{selectedResult.results.color}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Specific Gravity:</span>
                            <span className="font-medium">{selectedResult.results.specificGravity}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">pH:</span>
                            <span className="font-medium">{selectedResult.results.pH}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Chemical Analysis</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Protein:</span>
                            <span className="font-medium">{selectedResult.results.protein}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Glucose:</span>
                            <span className="font-medium">{selectedResult.results.glucose}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Ketones:</span>
                            <span className="font-medium">{selectedResult.results.ketones}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Blood:</span>
                            <span className="font-medium">{selectedResult.results.blood}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Microscopic Examination</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">WBC:</span>
                            <span className="font-medium">{selectedResult.results.wbc}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">RBC:</span>
                            <span className="font-medium">{selectedResult.results.rbc}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Bacteria:</span>
                            <span className="font-medium">{selectedResult.results.bacteria}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Crystals:</span>
                            <span className="font-medium">{selectedResult.results.crystals}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Interpretation</h4>
                        <p className="text-sm">{selectedResult.interpretation}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" size="sm">
                      Print Results
                    </Button>
                    <Button size="sm">
                      Add to Medical Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BeakerIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Select a completed test to view results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}