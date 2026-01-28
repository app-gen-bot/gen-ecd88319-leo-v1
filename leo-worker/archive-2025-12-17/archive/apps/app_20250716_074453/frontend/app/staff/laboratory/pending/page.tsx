'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, BeakerIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface PendingTest {
  id: string;
  patientName: string;
  petName: string;
  testType: string;
  orderedBy: string;
  orderedDate: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in_progress' | 'completed';
}

const mockPendingTests: PendingTest[] = [
  {
    id: '1',
    patientName: 'John Smith',
    petName: 'Max',
    testType: 'Complete Blood Count (CBC)',
    orderedBy: 'Dr. Sarah Smith',
    orderedDate: new Date().toISOString(),
    priority: 'routine',
    status: 'pending',
  },
  {
    id: '2',
    patientName: 'Jane Doe',
    petName: 'Luna',
    testType: 'Urinalysis',
    orderedBy: 'Dr. Sarah Smith',
    orderedDate: new Date().toISOString(),
    priority: 'urgent',
    status: 'in_progress',
  },
];

export default function PendingLabTestsPage() {
  const [tests] = useState<PendingTest[]>(mockPendingTests);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat':
        return 'bg-red-500';
      case 'urgent':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <ClockIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <BeakerIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff/laboratory">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Pending Lab Tests</h1>
          <p className="text-gray-400">Tests awaiting processing</p>
        </div>
      </div>

      {tests.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-12">
            <BeakerIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">No pending tests</h3>
            <p className="text-gray-400">All lab tests have been processed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      {test.testType}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {test.petName} • {test.patientName}
                    </CardDescription>
                  </div>
                  <Badge className={`${getPriorityColor(test.priority)} text-white border-0`}>
                    {test.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p className="text-gray-400">
                    <span className="font-medium text-gray-300">Ordered by:</span> {test.orderedBy}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium text-gray-300">Date:</span> {format(new Date(test.orderedDate), 'MMM d, yyyy h:mm a')}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium text-gray-300">Status:</span> {test.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {test.status === 'pending' && (
                    <Button className="flex-1" size="sm">
                      Start Processing
                    </Button>
                  )}
                  {test.status === 'in_progress' && (
                    <Button className="flex-1" size="sm">
                      Enter Results
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}