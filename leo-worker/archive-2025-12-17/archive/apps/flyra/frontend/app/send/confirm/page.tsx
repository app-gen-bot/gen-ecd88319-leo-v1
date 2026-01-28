'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle,
  Copy,
  Share2,
  Send,
  Home,
  Clock,
  DollarSign,
  User,
  Phone
} from 'lucide-react';
import { formatCurrency, formatDateTime, getCurrencySymbol } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import confetti from 'canvas-confetti';

// Mock transaction data - in real app, this would be fetched from API
const mockTransaction = {
  id: 'TXN1234567890',
  amount: 100,
  fee: 2.99,
  totalAmount: 102.99,
  localAmount: 15650,
  localCurrency: 'KES',
  exchangeRate: 156.50,
  recipient: {
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+254712345678',
    city: 'Nairobi',
    country: 'KE',
    mobileMoneyProvider: 'M-PESA',
  },
  status: 'completed',
  createdAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  estimatedArrival: 'Delivered',
};

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const transactionId = searchParams.get('id');

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(mockTransaction.id);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Transaction ID copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Flyra Transaction',
      text: `Transaction ${mockTransaction.id} - Sent ${formatCurrency(mockTransaction.amount)} to ${mockTransaction.recipient.firstName} ${mockTransaction.recipient.lastName}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying link
        const url = window.location.href;
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link copied!',
          description: 'Transaction link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container py-6 pb-24 md:pb-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Success Animation */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold">Transaction Successful!</h1>
              <p className="text-xl text-muted-foreground">
                Your money is on its way to {mockTransaction.recipient.firstName}
              </p>
            </div>

            {/* Transaction Details Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transaction Details</CardTitle>
                  <Badge variant="default" className="bg-green-600">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transaction ID */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {mockTransaction.id}
                    </code>
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

                {/* Amount Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4" />
                    Amount Details
                  </div>
                  <div className="space-y-2 pl-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount sent</span>
                      <span>{formatCurrency(mockTransaction.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transfer fee</span>
                      <span>{formatCurrency(mockTransaction.fee)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total charged</span>
                      <span>{formatCurrency(mockTransaction.totalAmount)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="font-medium text-primary">Recipient received</span>
                      <span className="font-bold text-primary">
                        {getCurrencySymbol(mockTransaction.localCurrency)}
                        {mockTransaction.localAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Recipient Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Recipient
                  </div>
                  <div className="space-y-2 pl-6 text-sm">
                    <p className="font-medium">
                      {mockTransaction.recipient.firstName} {mockTransaction.recipient.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {mockTransaction.recipient.phoneNumber}
                    </div>
                    <p className="text-muted-foreground">
                      {mockTransaction.recipient.mobileMoneyProvider} • {mockTransaction.recipient.city}, {mockTransaction.recipient.country}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Timing */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Delivery Status
                  </div>
                  <div className="space-y-2 pl-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sent at</span>
                      <span>{formatDateTime(mockTransaction.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered at</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {formatDateTime(mockTransaction.completedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Receipt
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/send">
                  <Button variant="outline" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Another
                  </Button>
                </Link>
                <Link href={`/transactions/${mockTransaction.id}`}>
                  <Button variant="outline" className="w-full">
                    View Transaction
                  </Button>
                </Link>
              </div>

              <Link href="/dashboard">
                <Button variant="ghost" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Button>
              </Link>
            </div>

            {/* Support Note */}
            <p className="text-center text-sm text-muted-foreground">
              Need help? Transaction ID: {mockTransaction.id}{' '}
              <Link href="/support" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}