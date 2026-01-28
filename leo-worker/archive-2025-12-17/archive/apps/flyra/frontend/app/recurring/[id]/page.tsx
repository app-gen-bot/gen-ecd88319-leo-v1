'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Pause,
  Play,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { RecurringTransfer, Transaction } from '@/types';
import { formatCurrency, formatDate, formatDateTime, formatPhoneNumber, getInitials } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function RecurringTransferDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [recurringTransfer, setRecurringTransfer] = useState<RecurringTransfer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [transferData, transactionsData] = await Promise.all([
        apiClient.getRecurringTransfer(id as string),
        apiClient.getTransactions(),
      ]);
      
      setRecurringTransfer(transferData);
      
      // Filter transactions for this recurring transfer
      // In a real app, there would be a recurringTransferId field
      const relatedTransactions = transactionsData.filter(
        t => t.recipientId === transferData.recipientId && t.type === 'send'
      ).slice(0, 5); // Show last 5 for demo
      
      setTransactions(relatedTransactions);
    } catch (error) {
      toast({
        title: 'Error loading recurring transfer',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
      router.push('/recurring');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePause = async () => {
    if (!recurringTransfer) return;
    
    try {
      const newStatus = recurringTransfer.status === 'active' ? 'paused' : 'active';
      await apiClient.updateRecurringTransfer(id as string, { status: newStatus });
      
      toast({
        title: newStatus === 'active' ? 'Transfer resumed' : 'Transfer paused',
        description: newStatus === 'active' 
          ? 'Recurring transfer has been resumed'
          : 'Recurring transfer has been paused',
      });
      
      loadData();
    } catch (error) {
      toast({
        title: 'Error updating transfer',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.deleteRecurringTransfer(id as string);
      toast({
        title: 'Transfer deleted',
        description: 'Recurring transfer has been removed',
      });
      router.push('/recurring');
    } catch (error) {
      toast({
        title: 'Error deleting transfer',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const getFrequencyLabel = (transfer: RecurringTransfer) => {
    switch (transfer.frequency) {
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Every ${days[transfer.dayOfWeek || 0]}`;
      case 'biweekly':
        return 'Every 2 weeks';
      case 'monthly':
        if (transfer.dayOfMonth === 32) {
          return 'Last day of month';
        }
        const suffix = ['th', 'st', 'nd', 'rd'][transfer.dayOfMonth! % 10 > 3 ? 0 : transfer.dayOfMonth! % 10];
        return `${transfer.dayOfMonth}${suffix} of each month`;
      case 'custom':
        if (transfer.customFrequency) {
          return `Every ${transfer.customFrequency.interval} ${transfer.customFrequency.unit}`;
        }
        return 'Custom';
      default:
        return transfer.frequency;
    }
  };

  const getDaysUntilNext = (nextPaymentDate: string) => {
    const next = new Date(nextPaymentDate);
    const now = new Date();
    const diffTime = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgress = (transfer: RecurringTransfer) => {
    if (!transfer.endDate) return 0;
    
    const start = new Date(transfer.startDate).getTime();
    const end = new Date(transfer.endDate).getTime();
    const now = Date.now();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'KE': '🇰🇪',
      'NG': '🇳🇬',
      'GH': '🇬🇭',
      'ZA': '🇿🇦',
      'UG': '🇺🇬',
      'TZ': '🇹🇿',
      'RW': '🇷🇼',
      'IN': '🇮🇳',
    };
    return flags[countryCode] || '🌍';
  };

  if (isLoading || !recurringTransfer) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container py-6">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-64 bg-muted rounded-lg" />
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  const daysUntilNext = getDaysUntilNext(recurringTransfer.nextPaymentDate);
  const isOverdue = daysUntilNext < 0 && recurringTransfer.status === 'active';

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container py-6 pb-24 md:pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/recurring">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">Recurring Transfer Details</h1>
              </div>
              <div className="flex gap-2">
                <Link href={`/recurring/${id}/edit`}>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Card */}
            <Card className={cn(
              "border-2",
              recurringTransfer.status === 'active' && "border-green-500/20",
              recurringTransfer.status === 'paused' && "border-yellow-500/20"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge
                      variant={recurringTransfer.status === 'active' ? 'default' : 'secondary'}
                      className="mb-2"
                    >
                      {recurringTransfer.status}
                    </Badge>
                    <h2 className="text-2xl font-bold">{formatCurrency(recurringTransfer.amount)}</h2>
                    <p className="text-muted-foreground">{getFrequencyLabel(recurringTransfer)}</p>
                  </div>
                  <Switch
                    checked={recurringTransfer.status === 'active'}
                    onCheckedChange={togglePause}
                  />
                </div>

                {recurringTransfer.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Next Payment</span>
                      <span className={cn(
                        "font-medium",
                        isOverdue && "text-red-600 dark:text-red-400"
                      )}>
                        {isOverdue ? 'Overdue' : formatDate(recurringTransfer.nextPaymentDate)}
                      </span>
                    </div>
                    {!isOverdue && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>In {daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                )}

                {recurringTransfer.endDate && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">
                        Ends {formatDate(recurringTransfer.endDate)}
                      </span>
                    </div>
                    <Progress value={getProgress(recurringTransfer)} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recipient Card */}
            <Card>
              <CardHeader>
                <CardTitle>Recipient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {getInitials(`${recurringTransfer.recipient.firstName} ${recurringTransfer.recipient.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {recurringTransfer.recipient.firstName} {recurringTransfer.recipient.lastName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{formatPhoneNumber(recurringTransfer.recipient.phoneNumber)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {getCountryFlag(recurringTransfer.recipient.country)} {recurringTransfer.recipient.city}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/recipients/${recurringTransfer.recipientId}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Details Tabs */}
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Transfer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">{formatCurrency(recurringTransfer.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <p className="font-medium">{getFrequencyLabel(recurringTransfer)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">{formatDate(recurringTransfer.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">
                          {recurringTransfer.endDate ? formatDate(recurringTransfer.endDate) : 'No end date'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Transfers</p>
                        <p className="font-medium">
                          {recurringTransfer.completedTransfers} of {recurringTransfer.totalTransfers || '∞'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(recurringTransfer.createdAt)}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Estimated Impact</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">
                            {formatCurrency(
                              recurringTransfer.amount * (
                                recurringTransfer.frequency === 'weekly' ? 4.33 :
                                recurringTransfer.frequency === 'biweekly' ? 2.17 :
                                1
                              )
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">Per month</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">
                            {formatCurrency(
                              recurringTransfer.amount * (
                                recurringTransfer.frequency === 'weekly' ? 52 :
                                recurringTransfer.frequency === 'biweekly' ? 26 :
                                12
                              )
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">Per year</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">
                            {formatCurrency(recurringTransfer.amount * recurringTransfer.completedTransfers)}
                          </p>
                          <p className="text-sm text-muted-foreground">Total sent</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Transfer History</CardTitle>
                    <CardDescription>
                      Recent transfers from this recurring schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No transfers yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transactions.map((transaction) => (
                          <Link
                            key={transaction.id}
                            href={`/transactions/${transaction.id}`}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2 rounded-full",
                                transaction.status === 'completed' 
                                  ? "bg-green-100 dark:bg-green-900/20" 
                                  : transaction.status === 'pending'
                                  ? "bg-yellow-100 dark:bg-yellow-900/20"
                                  : "bg-red-100 dark:bg-red-900/20"
                              )}>
                                {transaction.status === 'completed' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : transaction.status === 'pending' ? (
                                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(transaction.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Badge variant={
                              transaction.status === 'completed' ? 'default' :
                              transaction.status === 'pending' ? 'secondary' :
                              'destructive'
                            }>
                              {transaction.status}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Recurring Transfer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this recurring transfer to {recurringTransfer.recipient.firstName} {recurringTransfer.recipient.lastName}? 
                This action cannot be undone. No future payments will be made.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthCheck>
  );
}