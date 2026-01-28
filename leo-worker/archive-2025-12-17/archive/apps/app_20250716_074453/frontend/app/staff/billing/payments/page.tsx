'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeftIcon, CreditCardIcon, BanknotesIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: 'cash' | 'credit' | 'debit' | 'check';
  invoiceId: string;
  patientName: string;
  petName: string;
  status: 'completed' | 'pending' | 'failed';
  processedBy: string;
}

const mockPayments: Payment[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    amount: 167.40,
    method: 'credit',
    invoiceId: 'INV-001',
    patientName: 'John Smith',
    petName: 'Max',
    status: 'completed',
    processedBy: 'Emily Johnson',
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString(),
    amount: 250.00,
    method: 'cash',
    invoiceId: 'INV-002',
    patientName: 'Jane Doe',
    petName: 'Luna',
    status: 'completed',
    processedBy: 'Emily Johnson',
  },
];

export default function PaymentsPage() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.patientName.toLowerCase().includes(searchLower) ||
      payment.petName.toLowerCase().includes(searchLower) ||
      payment.invoiceId.toLowerCase().includes(searchLower)
    );
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <BanknotesIcon className="h-4 w-4 text-green-400" />;
      case 'credit':
      case 'debit':
        return <CreditCardIcon className="h-4 w-4 text-blue-400" />;
      default:
        return <CheckCircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white border-0">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white border-0">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white border-0">Failed</Badge>;
      default:
        return null;
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

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
            <h1 className="text-3xl font-bold text-gray-100">Payments</h1>
            <p className="text-gray-400">Process and manage payments</p>
          </div>
        </div>
        <Link href="/staff/billing/payment">
          <Button>
            <CreditCardIcon className="h-4 w-4 mr-2" />
            Process Payment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">{payments.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">
              ${payments.length > 0 ? (totalRevenue / payments.length).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="relative">
            <Label htmlFor="search" className="sr-only">Search</Label>
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by patient, pet, or invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-700 border-gray-600 text-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Recent Payments</CardTitle>
          <CardDescription className="text-gray-400">
            All payment transactions from today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Date/Time</TableHead>
                <TableHead className="text-gray-300">Invoice</TableHead>
                <TableHead className="text-gray-300">Patient</TableHead>
                <TableHead className="text-gray-300">Method</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Processed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="border-gray-700">
                  <TableCell className="text-gray-300">
                    {format(new Date(payment.date), 'MMM d, h:mm a')}
                  </TableCell>
                  <TableCell>
                    <Link href={`/staff/billing/invoices/${payment.invoiceId}`} className="text-blue-400 hover:underline">
                      {payment.invoiceId}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {payment.patientName}
                    <span className="text-gray-500 text-sm block">{payment.petName}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(payment.method)}
                      <span className="text-gray-300 capitalize">{payment.method}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 font-medium">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-gray-300">{payment.processedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}