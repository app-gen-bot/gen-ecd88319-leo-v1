'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  UserPlus, 
  RefreshCw, 
  Clock, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDateTime, getInitials } from '@/lib/utils';
import { DashboardStats, Transaction, Recipient, RecurringTransfer } from '@/types';
import { DashboardNav } from '@/components/dashboard-nav';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast({
        title: 'Error loading dashboard',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    setIsLoading(true);
    await loadDashboardData();
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        
        <main className="container py-6 space-y-6">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s an overview of your account activity
              </p>
            </div>
            <Link href="/send">
              <Button size="lg">
                <Send className="mr-2 h-4 w-4" />
                Send Money
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Wallet Balance
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : formatCurrency(stats?.walletBalance || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  USDC available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sent
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : formatCurrency(stats?.totalSent || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recipients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats?.totalRecipients || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active recipients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recurring
                </CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats?.activeRecurringTransfers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active transfers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/send">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="flex flex-row items-center space-y-0">
                  <Send className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <CardTitle className="text-base">Send Money</CardTitle>
                    <CardDescription className="text-xs">
                      Transfer to recipients
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wallet/fund">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="flex flex-row items-center space-y-0">
                  <Plus className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <CardTitle className="text-base">Add Funds</CardTitle>
                    <CardDescription className="text-xs">
                      Top up your wallet
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/recipients/add">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="flex flex-row items-center space-y-0">
                  <UserPlus className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <CardTitle className="text-base">Add Recipient</CardTitle>
                    <CardDescription className="text-xs">
                      New beneficiary
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/recurring/new">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="flex flex-row items-center space-y-0">
                  <RefreshCw className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <CardTitle className="text-base">Recurring</CardTitle>
                    <CardDescription className="text-xs">
                      Set up automatic
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="recipients">Recent Recipients</TabsTrigger>
              <TabsTrigger value="recurring">Upcoming Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Transactions</CardTitle>
                    <Link href="/transactions">
                      <Button variant="ghost" size="sm">
                        View All
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {!stats?.recentTransactions?.length ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No transactions yet</p>
                      <Link href="/send">
                        <Button>Send Your First Payment</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.recentTransactions.map((transaction) => (
                        <Link
                          key={transaction.id}
                          href={`/transactions/${transaction.id}`}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              transaction.type === 'send' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
                            }`}>
                              {transaction.type === 'send' ? (
                                <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                              ) : (
                                <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.recipient.firstName} {transaction.recipient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDateTime(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transaction.type === 'send' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                            }`}>
                              {transaction.type === 'send' ? '-' : '+'}
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
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipients" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Recipients</CardTitle>
                    <Link href="/recipients">
                      <Button variant="ghost" size="sm">
                        View All
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {!stats?.recentTransactions?.length ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No recipients yet</p>
                      <Link href="/recipients/add">
                        <Button>Add Your First Recipient</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {Array.from(new Map(
                        stats.recentTransactions.map(t => [t.recipientId, t.recipient])
                      ).values()).slice(0, 4).map((recipient) => (
                        <Link
                          key={recipient.id}
                          href={`/send?recipient=${recipient.id}`}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(`${recipient.firstName} ${recipient.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {recipient.firstName} {recipient.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {recipient.city}, {recipient.country}
                            </p>
                          </div>
                          <Button size="sm">Send</Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Recurring Payments</CardTitle>
                    <Link href="/recurring">
                      <Button variant="ghost" size="sm">
                        View All
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {!stats?.upcomingRecurringPayments?.length ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No recurring transfers set up</p>
                      <Link href="/recurring/new">
                        <Button>Create Recurring Transfer</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.upcomingRecurringPayments.map((recurring) => (
                        <Link
                          key={recurring.id}
                          href={`/recurring/${recurring.id}`}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <RefreshCw className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">
                                {recurring.recipient.firstName} {recurring.recipient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {recurring.frequency} • Next: {formatDateTime(recurring.nextPaymentDate)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(recurring.amount)}</p>
                            <Badge>{recurring.status}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthCheck>
  );
}