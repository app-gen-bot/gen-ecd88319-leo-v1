'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeftIcon, BeakerIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface LabResult {
  id: string;
  patientName: string;
  petName: string;
  testType: string;
  resultDate: string;
  status: 'normal' | 'abnormal' | 'critical';
  reviewedBy?: string;
  values: {
    parameter: string;
    value: string;
    unit: string;
    reference: string;
    flag?: 'H' | 'L' | 'C';
  }[];
}

const mockResults: LabResult[] = [
  {
    id: '1',
    patientName: 'John Smith',
    petName: 'Max',
    testType: 'Complete Blood Count (CBC)',
    resultDate: new Date().toISOString(),
    status: 'normal',
    reviewedBy: 'Dr. Sarah Smith',
    values: [
      { parameter: 'WBC', value: '10.5', unit: 'K/µL', reference: '6.0-17.0' },
      { parameter: 'RBC', value: '7.2', unit: 'M/µL', reference: '5.5-8.5' },
      { parameter: 'HGB', value: '15.2', unit: 'g/dL', reference: '12.0-18.0' },
      { parameter: 'HCT', value: '45.5', unit: '%', reference: '37.0-55.0' },
    ],
  },
  {
    id: '2',
    patientName: 'Jane Doe',
    petName: 'Luna',
    testType: 'Blood Chemistry Panel',
    resultDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'abnormal',
    values: [
      { parameter: 'Glucose', value: '185', unit: 'mg/dL', reference: '70-150', flag: 'H' },
      { parameter: 'BUN', value: '25', unit: 'mg/dL', reference: '10-30' },
      { parameter: 'Creatinine', value: '1.8', unit: 'mg/dL', reference: '0.5-1.5', flag: 'H' },
      { parameter: 'ALT', value: '65', unit: 'U/L', reference: '10-100' },
    ],
  },
];

export default function LabResultsPage() {
  const [results] = useState<LabResult[]>(mockResults);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);

  const filteredResults = results.filter(result => {
    const matchesSearch = searchTerm === '' || 
      result.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge className="bg-red-500 text-white border-0">Critical</Badge>;
      case 'abnormal':
        return <Badge className="bg-orange-500 text-white border-0">Abnormal</Badge>;
      default:
        return <Badge className="bg-green-500 text-white border-0">Normal</Badge>;
    }
  };

  const getFlagColor = (flag?: string) => {
    switch (flag) {
      case 'H':
        return 'text-orange-400';
      case 'L':
        return 'text-blue-400';
      case 'C':
        return 'text-red-400';
      default:
        return 'text-gray-300';
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
          <h1 className="text-3xl font-bold text-gray-100">Lab Results</h1>
          <p className="text-gray-400">Review and manage laboratory test results</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="abnormal">Abnormal</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-12">
            <BeakerIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">No results found</h3>
            <p className="text-gray-400">Try adjusting your search filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredResults.map((result) => (
            <Card 
              key={result.id} 
              className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => setSelectedResult(result)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-100">
                      {result.testType}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {result.petName} • {result.patientName} • {format(new Date(result.resultDate), 'MMM d, yyyy h:mm a')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {result.reviewedBy && (
                      <span className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                        Reviewed by {result.reviewedBy}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal/Panel - simplified inline display */}
      {selectedResult && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-100">Result Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedResult(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Patient: <span className="text-gray-200">{selectedResult.petName}</span></p>
                  <p className="text-gray-400">Owner: <span className="text-gray-200">{selectedResult.patientName}</span></p>
                </div>
                <div>
                  <p className="text-gray-400">Test: <span className="text-gray-200">{selectedResult.testType}</span></p>
                  <p className="text-gray-400">Date: <span className="text-gray-200">{format(new Date(selectedResult.resultDate), 'MMM d, yyyy h:mm a')}</span></p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Parameter</TableHead>
                    <TableHead className="text-gray-300">Value</TableHead>
                    <TableHead className="text-gray-300">Reference</TableHead>
                    <TableHead className="text-gray-300">Flag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedResult.values.map((value, index) => (
                    <TableRow key={index} className="border-gray-700">
                      <TableCell className="text-gray-300">{value.parameter}</TableCell>
                      <TableCell className={getFlagColor(value.flag)}>
                        {value.value} {value.unit}
                      </TableCell>
                      <TableCell className="text-gray-400">{value.reference}</TableCell>
                      <TableCell>
                        {value.flag && (
                          <Badge className={`${
                            value.flag === 'C' ? 'bg-red-500' : 
                            value.flag === 'H' ? 'bg-orange-500' : 
                            'bg-blue-500'
                          } text-white border-0`}>
                            {value.flag}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}