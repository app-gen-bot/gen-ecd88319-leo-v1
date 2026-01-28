'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeftIcon, BeakerIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Equipment {
  id: string;
  name: string;
  model: string;
  status: 'operational' | 'maintenance' | 'error';
  lastMaintenance: string;
  nextMaintenance: string;
  usage: number;
  tests: string[];
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Hematology Analyzer',
    model: 'IDEXX ProCyte Dx',
    status: 'operational',
    lastMaintenance: new Date(Date.now() - 30 * 86400000).toISOString(),
    nextMaintenance: new Date(Date.now() + 60 * 86400000).toISOString(),
    usage: 78,
    tests: ['CBC', 'Differential', 'Reticulocyte Count'],
  },
  {
    id: '2',
    name: 'Chemistry Analyzer',
    model: 'IDEXX Catalyst One',
    status: 'operational',
    lastMaintenance: new Date(Date.now() - 45 * 86400000).toISOString(),
    nextMaintenance: new Date(Date.now() + 45 * 86400000).toISOString(),
    usage: 65,
    tests: ['Chemistry Panel', 'Electrolytes', 'Liver Function'],
  },
  {
    id: '3',
    name: 'Microscope',
    model: 'Olympus CX23',
    status: 'maintenance',
    lastMaintenance: new Date(Date.now() - 90 * 86400000).toISOString(),
    nextMaintenance: new Date().toISOString(),
    usage: 92,
    tests: ['Cytology', 'Parasite Exam', 'Urinalysis'],
  },
];

export default function LabEquipmentPage() {
  const [equipment] = useState<Equipment[]>(mockEquipment);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <Badge className="bg-green-500 text-white border-0">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Operational
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-yellow-500 text-white border-0">
            <WrenchScrewdriverIcon className="h-3 w-3 mr-1" />
            Maintenance
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500 text-white border-0">
            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff/laboratory">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Lab Equipment</h1>
            <p className="text-gray-400">Monitor and manage laboratory equipment</p>
          </div>
        </div>
        <Button>
          <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {equipment.map((item) => (
          <Card key={item.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-100">{item.name}</CardTitle>
                  <CardDescription className="text-gray-400">{item.model}</CardDescription>
                </div>
                {getStatusBadge(item.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Usage</span>
                  <span className="text-gray-200">{item.usage}%</span>
                </div>
                <Progress value={item.usage} className="h-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Maintenance</span>
                  <span className="text-gray-200">
                    {format(new Date(item.lastMaintenance), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Next Maintenance</span>
                  <span className={`${
                    new Date(item.nextMaintenance) < new Date() ? 'text-red-400' : 'text-gray-200'
                  }`}>
                    {format(new Date(item.nextMaintenance), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Available Tests</p>
                <div className="flex flex-wrap gap-1">
                  {item.tests.map((test, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                      {test}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View History
                </Button>
                {item.status === 'maintenance' && (
                  <Button size="sm" className="flex-1">
                    Complete Maintenance
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}