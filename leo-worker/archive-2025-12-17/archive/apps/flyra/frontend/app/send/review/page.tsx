'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  User,
  DollarSign,
  Clock,
  Wallet,
  AlertCircle,
  Edit2,
  Shield
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Recipient, Wallet as WalletType } from '@/types';
import { 
  formatCurrency, 
  getInitials, 
  formatPhoneNumber,
  getExchangeRate,
  getCurrencySymbol,
  calculateFees
} from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function ReviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [localCurrency, setLocalCurrency] = useState('USD');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get data from session
      const recipientId = sessionStorage.getItem('send_recipient_id');
      const amountStr = sessionStorage.getItem('send_amount');
      
      if (!recipientId || !amountStr) {
        router.push('/send');
        return;
      }

      // Load recipient and wallet data
      const [recipients, walletData] = await Promise.all([
        apiClient.getRecipients(),
        apiClient.getWallet(),
      ]);

      const selectedRecipient = recipients.find(r => r.id === recipientId);
      if (!selectedRecipient) {
        router.push('/send');
        return;
      }

      setRecipient(selectedRecipient);
      setWallet(walletData);
      setAmount(parseFloat(amountStr));

      // Get exchange rate and currency for recipient's country
      const countryInfo = await apiClient.getSupportedCountries();
      const country = countryInfo.find(c => c.code === selectedRecipient.country);
      if (country) {
        const rate = getExchangeRate('USD', country.currency);
        setExchangeRate(rate);
        setLocalCurrency(country.currency);
      }
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Please try again',
        variant: 'destructive',
      });
      router.push('/send');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!agreeToTerms || !recipient || !wallet) return;

    setIsProcessing(true);
    
    try {
      const { transferFee, total } = calculateFees(amount);
      
      // In a real app, this would show a PIN/biometric prompt
      const transaction = await apiClient.sendMoney({
        recipientId: recipient.id,
        amount,
        fee: transferFee,
        totalAmount: total,
        localAmount: amount * exchangeRate,
        localCurrency,
        exchangeRate,
      });

      // Clear session data
      sessionStorage.removeItem('send_recipient_id');
      sessionStorage.removeItem('send_amount');

      // Navigate to confirmation page
      router.push(`/send/confirm?id=${transaction.id}`);
    } catch (error: any) {
      toast({
        title: 'Transaction failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  if (isLoading || !recipient || !wallet) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container py-6 flex items-center justify-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  const { transferFee, total } = calculateFees(amount);
  const localAmount = amount * exchangeRate;
  const insufficientFunds = total > wallet.balance;

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container py-6 pb-24 md:pb-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/send/amount')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">Review Transaction</h1>
              <p className="text-muted-foreground">
                Please review the details before confirming
              </p>
            </div>

            {/* Transaction Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipient Details */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Recipient Details
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/send')}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(`${recipient.firstName} ${recipient.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {recipient.firstName} {recipient.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPhoneNumber(recipient.phoneNumber)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        Location: {recipient.city}, {recipient.country}
                      </p>
                      <p className="text-muted-foreground">
                        Provider: {recipient.mobileMoneyProvider}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Amount Details */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Amount Details
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/send/amount')}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-2 pl-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sending</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transfer fee</span>
                      <span className="font-medium">{formatCurrency(transferFee)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Total charged</span>
                      <span className="font-bold">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-medium text-primary">Recipient gets</span>
                      <span className="font-bold text-primary">
                        {getCurrencySymbol(localCurrency)}
                        {localAmount.toLocaleString('en-US', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground pt-2">
                      Exchange rate: 1 USD = {exchangeRate.toFixed(2)} {localCurrency}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Delivery Time */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <h3 className="font-medium">Delivery Time</h3>
                  </div>
                  <div className="pl-6">
                    <Badge variant="secondary" className="font-normal">
                      Instant (usually under 30 seconds)
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Funds will be available immediately in recipient's {recipient.mobileMoneyProvider} account
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4" />
                    <h3 className="font-medium">Payment Method</h3>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm">
                      From: Flyra Wallet ({formatCurrency(wallet.balance)} available)
                    </p>
                    {insufficientFunds && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Insufficient funds. You need {formatCurrency(total - wallet.balance)} more.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms Acknowledgment */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I understand and agree to the transaction
                    </label>
                    <p className="text-sm text-muted-foreground">
                      By confirming, you authorize Flyra to debit {formatCurrency(total)} from 
                      your wallet and send {formatCurrency(amount)} to {recipient.firstName} {recipient.lastName}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                This transaction is protected by bank-level encryption and will require 
                your PIN or biometric authentication to complete.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => router.push('/send/amount')}
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleConfirm}
                disabled={!agreeToTerms || insufficientFunds || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm & Send'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}