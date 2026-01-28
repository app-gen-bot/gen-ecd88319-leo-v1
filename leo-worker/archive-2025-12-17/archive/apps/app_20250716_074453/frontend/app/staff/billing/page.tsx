'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  FunnelIcon,
  PlusIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ChartBarIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
  EllipsisVerticalIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import {
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
} from '@heroicons/react/24/solid';

// Mock data for invoices
const mockInvoices = [
  {
    id: 'INV-2024-001',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    patient: 'Max (Golden Retriever)',
    owner: 'John Smith',
    amount: 450.00,
    status: 'overdue',
    daysOverdue: 5,
    services: ['Annual Checkup', 'Vaccinations', 'Blood Work'],
  },
  {
    id: 'INV-2024-002',
    date: '2024-01-16',
    dueDate: '2024-02-16',
    patient: 'Luna (Siamese Cat)',
    owner: 'Sarah Johnson',
    amount: 285.50,
    status: 'pending',
    daysOverdue: 0,
    services: ['Dental Cleaning', 'X-Ray'],
  },
  {
    id: 'INV-2024-003',
    date: '2024-01-17',
    dueDate: '2024-01-17',
    patient: 'Charlie (Labrador)',
    owner: 'Mike Wilson',
    amount: 125.00,
    status: 'paid',
    daysOverdue: 0,
    services: ['Vaccination'],
    paidDate: '2024-01-17',
  },
];

// Mock data for daily revenue
const dailyRevenue = {
  total: 2845.50,
  cash: 450.00,
  card: 1895.50,
  check: 300.00,
  insurance: 200.00,
  transactionCount: 12,
};

// Mock aging report data
const agingReport = [
  { range: 'Current', count: 15, amount: 3450.00, percentage: 45 },
  { range: '1-30 days', count: 8, amount: 1200.00, percentage: 15.6 },
  { range: '31-60 days', count: 5, amount: 890.50, percentage: 11.6 },
  { range: '61-90 days', count: 3, amount: 650.00, percentage: 8.5 },
  { range: 'Over 90 days', count: 2, amount: 1480.00, percentage: 19.3 },
];

export default function StaffBillingPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isProcessPaymentOpen, setIsProcessPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIconSolid className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIconSolid className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <ExclamationTriangleIconSolid className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/20 text-green-400 border-0">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-400 border-0">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Billing & Payments</h1>
          <p className="text-gray-400 mt-1">Manage invoices, process payments, and track revenue</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Generate a new invoice for veterinary services
                </DialogDescription>
              </DialogHeader>
              {/* Invoice creation form would go here */}
              <div className="space-y-4 py-4">
                <p className="text-gray-400">Invoice creation form to be implemented</p>
              </div>
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-100">
              <DropdownMenuLabel>Export Reports</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="hover:bg-gray-700">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Financial Summary Report
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                <ReceiptPercentIcon className="h-4 w-4 mr-2" />
                Tax Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Daily Revenue Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
            Today's Revenue Summary
          </CardTitle>
          <CardDescription className="text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">${dailyRevenue.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{dailyRevenue.transactionCount} transactions</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <BanknotesIcon className="h-4 w-4" />
                Cash
              </p>
              <p className="text-xl font-semibold text-gray-100">${dailyRevenue.cash.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <CreditCardIcon className="h-4 w-4" />
                Card
              </p>
              <p className="text-xl font-semibold text-gray-100">${dailyRevenue.card.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <DocumentTextIcon className="h-4 w-4" />
                Check
              </p>
              <p className="text-xl font-semibold text-gray-100">${dailyRevenue.check.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <DocumentDuplicateIcon className="h-4 w-4" />
                Insurance
              </p>
              <p className="text-xl font-semibold text-gray-100">${dailyRevenue.insurance.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Accepted Methods</p>
              <div className="flex gap-2 mt-2">
                <BanknotesIcon className="h-5 w-5 text-gray-400" />
                <CreditCardIcon className="h-5 w-5 text-gray-400" />
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="invoices" className="data-[state=active]:bg-gray-700">
            Outstanding Invoices
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-gray-700">
            Payment Processing
          </TabsTrigger>
          <TabsTrigger value="aging" className="data-[state=active]:bg-gray-700">
            Aging Report
          </TabsTrigger>
        </TabsList>

        {/* Outstanding Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
                <FunnelIcon className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-gray-300">Search</Label>
                  <Input
                    placeholder="Patient, owner, or invoice #"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Date Range</Label>
                  <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Patient</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                      <SelectValue placeholder="All patients" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectItem value="all">All Patients</SelectItem>
                      <SelectItem value="max">Max (Golden Retriever)</SelectItem>
                      <SelectItem value="luna">Luna (Siamese Cat)</SelectItem>
                      <SelectItem value="charlie">Charlie (Labrador)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Invoice #</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Patient</TableHead>
                    <TableHead className="text-gray-300">Owner</TableHead>
                    <TableHead className="text-gray-300">Services</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Due Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          {invoice.status === 'overdue' && (
                            <span className="text-xs text-red-400">{invoice.daysOverdue}d</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-100">{invoice.id}</TableCell>
                      <TableCell className="text-gray-300">{invoice.date}</TableCell>
                      <TableCell className="text-gray-300">{invoice.patient}</TableCell>
                      <TableCell className="text-gray-300">{invoice.owner}</TableCell>
                      <TableCell className="text-gray-300">
                        <div className="max-w-[200px]">
                          <p className="text-sm truncate">{invoice.services.join(', ')}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-100 font-semibold">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-300">{invoice.dueDate}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <EllipsisVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-100">
                            <DropdownMenuItem
                              className="hover:bg-gray-700"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsProcessPaymentOpen(true);
                              }}
                            >
                              <CreditCardIcon className="h-4 w-4 mr-2" />
                              Process Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-700">
                              <DocumentTextIcon className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-700">
                              <PrinterIcon className="h-4 w-4 mr-2" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-700">
                              <EnvelopeIcon className="h-4 w-4 mr-2" />
                              Email Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem className="hover:bg-gray-700">
                              <PhoneIcon className="h-4 w-4 mr-2" />
                              Contact Owner
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-gray-700">
                              <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                              Archive
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

        {/* Payment Processing Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Process Payment</CardTitle>
              <CardDescription className="text-gray-400">
                Accept payments for outstanding invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Select Invoice</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                      <SelectValue placeholder="Choose an invoice" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                      {mockInvoices
                        .filter(inv => inv.status !== 'paid')
                        .map(invoice => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.id} - {invoice.patient} - ${invoice.amount.toFixed(2)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Payment Method</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Process Payment
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Recent Payments</CardTitle>
              <CardDescription className="text-gray-400">
                Payments processed today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Recent payments list to be implemented</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aging Report Tab */}
        <TabsContent value="aging" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                Accounts Receivable Aging Report
              </CardTitle>
              <CardDescription className="text-gray-400">
                Overview of overdue accounts by age
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {agingReport.map((range) => (
                    <Card key={range.range} className="bg-gray-700/50 border-gray-600">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-400">{range.range}</p>
                        <p className="text-2xl font-bold text-gray-100 mt-1">
                          ${range.amount.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{range.count} invoices</span>
                          <Badge className="bg-gray-600 text-gray-300 border-0">
                            {range.percentage}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Overdue Accounts List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">Overdue Accounts</h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Owner</TableHead>
                        <TableHead className="text-gray-300">Patient</TableHead>
                        <TableHead className="text-gray-300">Total Due</TableHead>
                        <TableHead className="text-gray-300">Oldest Invoice</TableHead>
                        <TableHead className="text-gray-300">Days Overdue</TableHead>
                        <TableHead className="text-gray-300">Contact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-gray-700">
                        <TableCell className="text-gray-100">John Smith</TableCell>
                        <TableCell className="text-gray-300">Max (Golden Retriever)</TableCell>
                        <TableCell className="text-gray-100 font-semibold">$450.00</TableCell>
                        <TableCell className="text-gray-300">INV-2024-001</TableCell>
                        <TableCell>
                          <Badge className="bg-red-500/20 text-red-400 border-0">5 days</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <PhoneIcon className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <EnvelopeIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Payment Dialog */}
      <Dialog open={isProcessPaymentOpen} onOpenChange={setIsProcessPaymentOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Accept payment for invoice {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedInvoice && (
              <>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Invoice Details</p>
                  <p className="text-gray-100">{selectedInvoice.patient}</p>
                  <p className="text-2xl font-bold text-green-400 mt-2">
                    ${selectedInvoice.amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <Label className="text-gray-300">Payment Method</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    Confirm Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsProcessPaymentOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}