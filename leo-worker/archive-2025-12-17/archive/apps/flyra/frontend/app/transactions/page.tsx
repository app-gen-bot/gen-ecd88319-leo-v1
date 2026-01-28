'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  FileText,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, filterType, filterStatus, dateRange, transactions]);

  const loadTransactions = async () => {
    try {
      const data = await apiClient.getTransactions();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      toast({
        title: 'Error loading transactions',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.recipient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.recipient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(t => new Date(t.createdAt) >= dateRange.from!);
    }
    if (dateRange.to) {
      const endOfDay = new Date(dateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.createdAt) <= endOfDay);
    }

    setFilteredTransactions(filtered);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTransactions();
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    toast({
      title: `Exporting as ${format.toUpperCase()}`,
      description: 'Your download will start shortly',
    });
    // In a real app, this would generate and download the file
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterStatus('all');
    setDateRange({ from: undefined, to: undefined });
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'send':
        return <Send className="h-4 w-4" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4" />;
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.type === 'send' || transaction.type === 'withdrawal') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-green-600 dark:text-green-400';
  };

  const hasActiveFilters = searchQuery || filterType !== 'all' || filterStatus !== 'all' || dateRange.from || dateRange.to;

  // Calculate stats
  const totalSent = filteredTransactions
    .filter(t => t.type === 'send' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = filteredTransactions
    .filter(t => t.type === 'receive' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container py-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container py-6 pb-24 md:pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground">
                  View and manage all your transactions
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="end">
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleExport('pdf')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Export as PDF
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleExport('csv')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Export as CSV
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    -{formatCurrency(totalSent)}
                  </div>
                  <p className="text-xs text-muted-foreground">This period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                  <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    +{formatCurrency(totalReceived)}
                  </div>
                  <p className="text-xs text-muted-foreground">This period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredTransactions.length}</div>
                  <p className="text-xs text-muted-foreground">Total transactions</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Filters</CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by name, amount, or ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="send">Sent</SelectItem>
                      <SelectItem value="receive">Received</SelectItem>
                      <SelectItem value="deposit">Deposits</SelectItem>
                      <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                            </>
                          ) : (
                            format(dateRange.from, 'MMM d, yyyy')
                          )
                        ) : (
                          'Date range'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{
                          from: dateRange.from,
                          to: dateRange.to,
                        }}
                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Transaction List */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                    <p className="text-muted-foreground mb-4">
                      {hasActiveFilters 
                        ? 'Try adjusting your filters'
                        : 'Your transaction history will appear here'
                      }
                    </p>
                    {!hasActiveFilters && (
                      <Link href="/send">
                        <Button>Make Your First Transfer</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map((transaction) => (
                      <Link
                        key={transaction.id}
                        href={`/transactions/${transaction.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-2 rounded-full",
                              transaction.type === 'send' || transaction.type === 'withdrawal'
                                ? "bg-red-100 dark:bg-red-900/20" 
                                : "bg-green-100 dark:bg-green-900/20"
                            )}>
                              {getTransactionIcon(transaction)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {transaction.type === 'send' ? (
                                    `To ${transaction.recipient.firstName} ${transaction.recipient.lastName}`
                                  ) : transaction.type === 'receive' ? (
                                    `From ${transaction.recipient.firstName} ${transaction.recipient.lastName}`
                                  ) : transaction.type === 'deposit' ? (
                                    'Deposit'
                                  ) : (
                                    'Withdrawal'
                                  )}
                                </p>
                                {getStatusIcon(transaction.status)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatDateTime(transaction.createdAt)}</span>
                                {transaction.type === 'send' && (
                                  <span>{transaction.localAmount} {transaction.localCurrency}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn("font-semibold", getTransactionColor(transaction))}>
                              {transaction.type === 'send' || transaction.type === 'withdrawal' ? '-' : '+'}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <Badge variant={
                              transaction.status === 'completed' ? 'default' :
                              transaction.status === 'pending' ? 'secondary' :
                              'destructive'
                            }>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}