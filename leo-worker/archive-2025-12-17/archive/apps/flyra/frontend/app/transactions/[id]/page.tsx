'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Copy,
  Share2,
  Download,
  MapPin,
  Phone,
  Building2,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Transaction } from '@/types';
import { formatCurrency, formatDateTime, formatPhoneNumber, getInitials } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function TransactionDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    try {
      const transactions = await apiClient.getTransactions();
      const found = transactions.find(t => t.id === id);
      
      if (!found) {
        throw new Error('Transaction not found');
      }
      
      setTransaction(found);
    } catch (error) {
      toast({
        title: 'Error loading transaction',
        description: 'Transaction not found',
        variant: 'destructive',
      });
      router.push('/transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (!transaction) return;
    
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Transaction ID copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!transaction) return;
    
    const shareData = {
      title: 'Flyra Transaction',
      text: `Transaction ${transaction.id} - ${formatCurrency(transaction.amount)}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Transaction link copied to clipboard',
      });
    }
  };

  const handleDownloadReceipt = () => {
    toast({
      title: 'Downloading receipt',
      description: 'Your receipt will be ready shortly',
    });
    // In a real app, this would generate and download a PDF receipt
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return '';
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

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container py-6">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-64 bg-muted rounded-lg" />
              <div className="h-48 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  if (!transaction) {
    return null;
  }

  const isTransfer = transaction.type === 'send' || transaction.type === 'receive';

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container max-w-4xl py-6 pb-24 md:pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/transactions">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">Transaction Details</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownloadReceipt}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Card */}
            <Card className={cn(
              "border-2",
              transaction.status === 'completed' && "border-green-500/20",
              transaction.status === 'pending' && "border-yellow-500/20",
              transaction.status === 'failed' && "border-red-500/20"
            )}>
              <CardContent className="text-center py-8">
                <div className="flex justify-center mb-4">
                  {getStatusIcon(transaction.status)}
                </div>
                <h2 className={cn("text-2xl font-bold mb-2", getStatusColor(transaction.status))}>
                  Transaction {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </h2>
                <p className="text-3xl font-bold mb-4">
                  {formatCurrency(transaction.amount)}
                </p>
                {transaction.type === 'send' && (
                  <p className="text-muted-foreground">
                    Sent to {transaction.recipient.firstName} {transaction.recipient.lastName}
                  </p>
                )}
                {transaction.status === 'completed' && transaction.completedAt && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Completed on {formatDateTime(transaction.completedAt)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Transaction Info */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">{transaction.id}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopyId}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className="capitalize">
                    {transaction.type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={
                    transaction.status === 'completed' ? 'default' :
                    transaction.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {transaction.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDateTime(transaction.createdAt)}</span>
                </div>

                {transaction.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{formatDateTime(transaction.completedAt)}</span>
                  </div>
                )}

                {transaction.failureReason && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Failure Reason</span>
                    <span className="text-red-600 dark:text-red-400 text-sm">
                      {transaction.failureReason}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amount Details */}
            <Card>
              <CardHeader>
                <CardTitle>Amount Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                </div>

                {transaction.fee > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Transfer Fee</span>
                      <span>{formatCurrency(transaction.fee)}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Total Charged</span>
                      <span className="font-semibold">{formatCurrency(transaction.totalAmount)}</span>
                    </div>
                  </>
                )}

                {isTransfer && (
                  <>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Exchange Rate</span>
                      <span>1 USD = {transaction.exchangeRate} {transaction.localCurrency}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Recipient Received</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {transaction.localAmount.toLocaleString()} {transaction.localCurrency}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recipient Details (for transfers) */}
            {isTransfer && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {transaction.type === 'send' ? 'Recipient' : 'Sender'} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {getInitials(`${transaction.recipient.firstName} ${transaction.recipient.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold">
                          {transaction.recipient.firstName} {transaction.recipient.lastName}
                        </h3>
                        {transaction.recipient.relationship && (
                          <Badge variant="secondary" className="capitalize mt-1">
                            {transaction.recipient.relationship}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{formatPhoneNumber(transaction.recipient.phoneNumber)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {getCountryFlag(transaction.recipient.country)} {transaction.recipient.city}
                          </span>
                        </div>
                        {transaction.recipient.mobileMoneyProvider && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{transaction.recipient.mobileMoneyProvider}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/recipients/${transaction.recipientId}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-3">
              {transaction.type === 'send' && transaction.status === 'completed' && (
                <Link href={`/send?recipient=${transaction.recipientId}`} className="flex-1">
                  <Button className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Again
                  </Button>
                </Link>
              )}
              <Link href="/transactions" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Transactions
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}