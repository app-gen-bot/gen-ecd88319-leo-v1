'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus,
  Calendar,
  DollarSign,
  Pause,
  Play,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { RecurringTransfer } from '@/types';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
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

export default function RecurringTransfersPage() {
  const { toast } = useToast();
  const [recurringTransfers, setRecurringTransfers] = useState<RecurringTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);

  useEffect(() => {
    loadRecurringTransfers();
  }, []);

  const loadRecurringTransfers = async () => {
    try {
      const data = await apiClient.getRecurringTransfers();
      setRecurringTransfers(data);
    } catch (error) {
      toast({
        title: 'Error loading recurring transfers',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePause = async (transferId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await apiClient.updateRecurringTransfer(transferId, { status: newStatus });
      
      toast({
        title: newStatus === 'active' ? 'Transfer resumed' : 'Transfer paused',
        description: newStatus === 'active' 
          ? 'Recurring transfer has been resumed'
          : 'Recurring transfer has been paused',
      });
      
      loadRecurringTransfers();
    } catch (error) {
      toast({
        title: 'Error updating transfer',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedTransferId) return;
    
    try {
      await apiClient.deleteRecurringTransfer(selectedTransferId);
      toast({
        title: 'Transfer deleted',
        description: 'Recurring transfer has been removed',
      });
      loadRecurringTransfers();
    } catch (error) {
      toast({
        title: 'Error deleting transfer',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedTransferId(null);
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

  const activeTransfers = recurringTransfers.filter(t => t.status === 'active');
  const pausedTransfers = recurringTransfers.filter(t => t.status === 'paused');
  const totalMonthlyAmount = activeTransfers.reduce((sum, t) => {
    switch (t.frequency) {
      case 'weekly':
        return sum + (t.amount * 4.33); // Average weeks per month
      case 'biweekly':
        return sum + (t.amount * 2.17); // Average biweekly per month
      case 'monthly':
        return sum + t.amount;
      default:
        return sum + t.amount; // Assume monthly for custom
    }
  }, 0);

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container py-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-32 bg-muted rounded-lg" />
                <div className="h-32 bg-muted rounded-lg" />
                <div className="h-32 bg-muted rounded-lg" />
              </div>
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
                <h1 className="text-3xl font-bold">Recurring Transfers</h1>
                <p className="text-muted-foreground">
                  Manage your automatic transfers
                </p>
              </div>
              <Link href="/recurring/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Set Up Recurring Transfer
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeTransfers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {pausedTransfers.length} paused
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalMonthlyAmount)}</div>
                  <p className="text-xs text-muted-foreground">Estimated monthly spend</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {activeTransfers.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold">
                        {getDaysUntilNext(activeTransfers[0].nextPaymentDate)} days
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activeTransfers[0].nextPaymentDate)}
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">—</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Active Transfers */}
            {activeTransfers.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Active Transfers</h2>
                {activeTransfers.map((transfer) => (
                  <Card key={transfer.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {getInitials(`${transfer.recipient.firstName} ${transfer.recipient.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link href={`/recurring/${transfer.id}`}>
                                <h3 className="font-semibold hover:underline">
                                  {transfer.recipient.firstName} {transfer.recipient.lastName}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {getFrequencyLabel(transfer)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(transfer.amount)}</p>
                              <Badge variant="default" className="mt-1">Active</Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Next: {formatDate(transfer.nextPaymentDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{transfer.completedTransfers} of {transfer.totalTransfers || '∞'} sent</span>
                            </div>
                          </div>

                          {transfer.endDate && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="text-muted-foreground">Ends {formatDate(transfer.endDate)}</span>
                              </div>
                              <Progress value={getProgress(transfer)} className="h-2" />
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={transfer.status === 'active'}
                              onCheckedChange={() => togglePause(transfer.id, transfer.status)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {transfer.status === 'active' ? 'Active' : 'Paused'}
                            </span>
                            <div className="ml-auto flex gap-2">
                              <Link href={`/recurring/${transfer.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransferId(transfer.id);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Paused Transfers */}
            {pausedTransfers.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Paused Transfers</h2>
                {pausedTransfers.map((transfer) => (
                  <Card key={transfer.id} className="opacity-60">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {getInitials(`${transfer.recipient.firstName} ${transfer.recipient.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link href={`/recurring/${transfer.id}`}>
                                <h3 className="font-semibold hover:underline">
                                  {transfer.recipient.firstName} {transfer.recipient.lastName}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {getFrequencyLabel(transfer)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(transfer.amount)}</p>
                              <Badge variant="secondary" className="mt-1">Paused</Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={false}
                              onCheckedChange={() => togglePause(transfer.id, transfer.status)}
                            />
                            <span className="text-sm text-muted-foreground">Paused</span>
                            <div className="ml-auto flex gap-2">
                              <Link href={`/recurring/${transfer.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransferId(transfer.id);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {recurringTransfers.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recurring transfers</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up automatic transfers to never miss a payment
                  </p>
                  <Link href="/recurring/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Recurring Transfer
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Recurring Transfer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this recurring transfer? 
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