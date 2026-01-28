'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Send,
  Edit,
  Trash2,
  Star,
  Phone,
  MapPin,
  Building2,
  Users,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Recipient, Transaction } from '@/types';
import { formatCurrency, formatPhoneNumber, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function RecipientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadRecipientData();
  }, [id]);

  const loadRecipientData = async () => {
    try {
      const [recipientData, transactionsData] = await Promise.all([
        apiClient.getRecipient(id as string),
        apiClient.getTransactions(),
      ]);
      
      setRecipient(recipientData);
      // Filter transactions for this recipient
      const recipientTransactions = transactionsData.filter(
        t => t.recipientId === id && t.type === 'send'
      );
      setTransactions(recipientTransactions);
    } catch (error) {
      toast({
        title: 'Error loading recipient',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.deleteRecipient(id as string);
      toast({
        title: 'Recipient deleted',
        description: 'The recipient has been removed from your list',
      });
      router.push('/recipients');
    } catch (error) {
      toast({
        title: 'Error deleting recipient',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = async () => {
    if (!recipient) return;
    
    try {
      await apiClient.updateRecipient(id as string, { isFavorite: !recipient.isFavorite });
      toast({
        title: recipient.isFavorite ? 'Removed from favorites' : 'Added to favorites',
      });
      loadRecipientData();
    } catch (error) {
      toast({
        title: 'Error updating favorite',
        variant: 'destructive',
      });
    }
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

  const getCountryName = (countryCode: string) => {
    const countries: Record<string, string> = {
      'KE': 'Kenya',
      'NG': 'Nigeria',
      'GH': 'Ghana',
      'ZA': 'South Africa',
      'UG': 'Uganda',
      'TZ': 'Tanzania',
      'RW': 'Rwanda',
      'IN': 'India',
    };
    return countries[countryCode] || countryCode;
  };

  if (isLoading) {
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

  if (!recipient) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container py-6">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">Recipient not found</p>
                <Link href="/recipients">
                  <Button>Back to Recipients</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthCheck>
    );
  }

  // Calculate stats
  const totalSent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgAmount = transactions.length > 0 ? totalSent / transactions.length : 0;
  const lastTransaction = transactions[0];

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container py-6 pb-24 md:pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/recipients">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">Recipient Details</h1>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleFavorite}>
                    <Star className="mr-2 h-4 w-4" />
                    {recipient.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/recipients/${id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Recipient
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl">
                      {recipient.firstName[0]}{recipient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">
                          {recipient.firstName} {recipient.lastName}
                        </h2>
                        {recipient.isFavorite && (
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      {recipient.relationship && (
                        <Badge variant="secondary" className="capitalize">
                          {recipient.relationship}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{formatPhoneNumber(recipient.phoneNumber)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {getCountryFlag(recipient.country)} {recipient.city}, {getCountryName(recipient.country)}
                        </span>
                      </div>
                      {recipient.mobileMoneyProvider && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>{recipient.mobileMoneyProvider}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Added {new Date(recipient.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/send?recipient=${recipient.id}`}>
                    <Button size="lg">
                      <Send className="mr-2 h-4 w-4" />
                      Send Money
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalSent)}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {transactions.length} transfer{transactions.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(avgAmount)}</div>
                  <p className="text-xs text-muted-foreground">Per transaction</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Transfer</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {lastTransaction 
                      ? new Date(lastTransaction.createdAt).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lastTransaction ? formatCurrency(lastTransaction.amount) : 'No transfers yet'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  All transfers sent to {recipient.firstName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No transactions yet</p>
                    <Link href={`/send?recipient=${recipient.id}`}>
                      <Button>Send Your First Transfer</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <Link
                        key={transaction.id}
                        href={`/transactions/${transaction.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(transaction.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {transaction.localAmount} {transaction.localCurrency}
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
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Recipient</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {recipient.firstName} {recipient.lastName} from your recipients? 
                This action cannot be undone.
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