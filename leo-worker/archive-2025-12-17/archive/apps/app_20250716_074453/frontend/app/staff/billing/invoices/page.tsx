'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  EnvelopeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';

// Mock invoice data
const mockInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    petName: 'Max',
    petId: '1',
    ownerName: 'John Smith',
    ownerEmail: 'john@example.com',
    date: '2024-01-15',
    dueDate: '2024-01-30',
    amount: 285.50,
    status: 'unpaid',
    items: [
      { description: 'Wellness Exam', quantity: 1, price: 65.00 },
      { description: 'Rabies Vaccine', quantity: 1, price: 35.00 },
      { description: 'DHPP Vaccine', quantity: 1, price: 45.00 },
      { description: 'Heartworm Test', quantity: 1, price: 55.00 },
      { description: 'Flea Prevention (6 months)', quantity: 1, price: 85.50 },
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    petName: 'Luna',
    petId: '2',
    ownerName: 'Sarah Johnson',
    ownerEmail: 'sarah@example.com',
    date: '2024-01-14',
    dueDate: '2024-01-29',
    amount: 450.00,
    status: 'paid',
    paidDate: '2024-01-14',
    paymentMethod: 'Credit Card',
    items: [
      { description: 'Dental Cleaning', quantity: 1, price: 350.00 },
      { description: 'Pre-Anesthetic Blood Work', quantity: 1, price: 100.00 },
    ]
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    petName: 'Charlie',
    petId: '3',
    ownerName: 'Mike Davis',
    ownerEmail: 'mike@example.com',
    date: '2024-01-10',
    dueDate: '2024-01-25',
    amount: 125.00,
    status: 'overdue',
    items: [
      { description: 'Sick Visit Exam', quantity: 1, price: 85.00 },
      { description: 'Antibiotics', quantity: 1, price: 40.00 },
    ]
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    petName: 'Bella',
    petId: '4',
    ownerName: 'Emily Brown',
    ownerEmail: 'emily@example.com',
    date: '2024-01-15',
    dueDate: '2024-01-30',
    amount: 95.00,
    status: 'partial',
    paidAmount: 50.00,
    items: [
      { description: 'Follow-up Exam', quantity: 1, price: 45.00 },
      { description: 'Ear Medication', quantity: 1, price: 50.00 },
    ]
  },
];

export default function InvoicesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = searchTerm === '' ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Paid
        </Badge>;
      case 'unpaid':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          <ClockIcon className="h-3 w-3 mr-1" />
          Unpaid
        </Badge>;
      case 'overdue':
        return <Badge variant="destructive">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          Overdue
        </Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">
          Partial
        </Badge>;
      default:
        return null;
    }
  };

  const handleSendReminder = (invoice: any) => {
    toast({
      title: "Reminder sent",
      description: `Payment reminder sent to ${invoice.ownerEmail}`,
    });
  };

  // Calculate totals
  const totalUnpaid = mockInvoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const totalOverdue = mockInvoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage billing and payments</p>
          </div>
          <Link href="/staff/billing/invoices/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">${totalUnpaid.toFixed(2)}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-destructive">${totalOverdue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Invoices Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {mockInvoices.filter(inv => inv.date === new Date().toISOString().split('T')[0]).length}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Collection Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">87%</span>
                <span className="text-sm text-green-600">+2.5%</span>
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
                  placeholder="Search by invoice #, pet, or owner..."
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
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.petName} • {invoice.ownerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold">${invoice.amount.toFixed(2)}</p>
                        {invoice.status === 'partial' && invoice.paidAmount && (
                          <p className="text-sm text-muted-foreground">
                            Paid: ${invoice.paidAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Date: {new Date(invoice.date).toLocaleDateString()}</span>
                      <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      {invoice.paidDate && (
                        <span className="text-green-600">
                          Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-2">
                        <Link href={`/staff/billing/invoices/${invoice.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <DocumentTextIcon className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <PrinterIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSendReminder(invoice)}>
                          <EnvelopeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {(invoice.status === 'unpaid' || invoice.status === 'overdue' || invoice.status === 'partial') && (
                        <Link href={`/staff/billing/payment?invoice=${invoice.id}`}>
                          <Button size="sm">
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                            Process Payment
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}