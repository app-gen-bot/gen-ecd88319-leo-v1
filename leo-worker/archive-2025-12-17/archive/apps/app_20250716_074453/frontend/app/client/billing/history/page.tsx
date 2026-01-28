'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CreditCardIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Mock payment history data
const mockPaymentHistory = [
  {
    id: '1',
    date: '2024-01-14',
    invoiceNumber: 'INV-2024-002',
    petName: 'Luna',
    amount: 450.00,
    paymentMethod: 'Credit Card',
    cardLast4: '4242',
    status: 'completed',
    receiptUrl: '#',
  },
  {
    id: '2',
    date: '2024-01-10',
    invoiceNumber: 'INV-2023-145',
    petName: 'Luna',
    amount: 125.00,
    paymentMethod: 'Credit Card',
    cardLast4: '4242',
    status: 'completed',
    receiptUrl: '#',
  },
  {
    id: '3',
    date: '2023-12-15',
    invoiceNumber: 'INV-2023-132',
    petName: 'Luna',
    amount: 285.50,
    paymentMethod: 'Cash',
    status: 'completed',
    receiptUrl: '#',
  },
  {
    id: '4',
    date: '2023-11-20',
    invoiceNumber: 'INV-2023-098',
    petName: 'Luna',
    amount: 95.00,
    paymentMethod: 'Check',
    checkNumber: '1234',
    status: 'completed',
    receiptUrl: '#',
  },
  {
    id: '5',
    date: '2023-10-05',
    invoiceNumber: 'INV-2023-067',
    petName: 'Luna',
    amount: 350.00,
    paymentMethod: 'Credit Card',
    cardLast4: '5555',
    status: 'refunded',
    refundAmount: 50.00,
    receiptUrl: '#',
  },
];

export default function PaymentHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Calculate total paid
  const totalPaid = mockPaymentHistory
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  // Filter payments
  const filteredPayments = mockPaymentHistory.filter(payment => {
    const matchesSearch = searchTerm === '' ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.petName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = paymentMethodFilter === 'all' || 
      payment.paymentMethod.toLowerCase() === paymentMethodFilter.toLowerCase();
    
    // Simple date filtering
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.date);
      const now = new Date();
      
      switch (dateFilter) {
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= monthAgo;
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= quarterAgo;
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= yearAgo;
          break;
      }
    }
    
    return matchesSearch && matchesMethod && matchesDate;
  });

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Credit Card':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'Cash':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'Check':
        return <CheckBadgeIcon className="h-5 w-5" />;
      default:
        return <CreditCardIcon className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Refunded</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground">View your past payments and receipts</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Paid (All Time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">${totalPaid.toFixed(2)}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payments This Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {mockPaymentHistory.filter(p => 
                  new Date(p.date).getFullYear() === new Date().getFullYear()
                ).length}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                ${(totalPaid / mockPaymentHistory.filter(p => p.status === 'completed').length).toFixed(2)}
              </span>
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
                  placeholder="Search by invoice or pet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="credit card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History List */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No payments found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{payment.invoiceNumber}</h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {payment.petName} • {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold">${payment.amount.toFixed(2)}</p>
                          {payment.refundAmount && (
                            <p className="text-sm text-yellow-600">
                              Refunded: ${payment.refundAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {getPaymentIcon(payment.paymentMethod)}
                            <span>{payment.paymentMethod}</span>
                            {payment.cardLast4 && <span>•••• {payment.cardLast4}</span>}
                            {payment.checkNumber && <span>#{payment.checkNumber}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{new Date(payment.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/client/billing/invoices/${payment.id}`}>
                            <Button variant="outline" size="sm">
                              <DocumentTextIcon className="h-4 w-4 mr-2" />
                              View Invoice
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm">
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}