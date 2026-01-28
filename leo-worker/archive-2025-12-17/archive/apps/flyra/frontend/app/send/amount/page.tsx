'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  Info,
  Calculator
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Recipient, Wallet } from '@/types';
import { 
  formatCurrency, 
  getInitials, 
  formatPhoneNumber,
  getExchangeRate,
  getCurrencySymbol,
  calculateFees
} from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const PRESET_AMOUNTS = [50, 100, 250, 500];

export default function AmountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get recipient ID from session
      const recipientId = sessionStorage.getItem('send_recipient_id');
      if (!recipientId) {
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

      // Get exchange rate for recipient's country
      const countryInfo = await apiClient.getSupportedCountries();
      const country = countryInfo.find(c => c.code === selectedRecipient.country);
      if (country) {
        const rate = getExchangeRate('USD', country.currency);
        setExchangeRate(rate);
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

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;

    setAmount(cleaned);
    setError('');
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount === 0) {
      setError('Please enter an amount');
      return false;
    }

    if (numAmount < 1) {
      setError('Minimum amount is $1');
      return false;
    }

    if (numAmount > 2999) {
      setError('Maximum amount is $2,999');
      return false;
    }

    const { total } = calculateFees(numAmount);
    if (wallet && total > wallet.balance) {
      setError('Insufficient balance');
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateAmount()) return;

    // Store amount in session
    sessionStorage.setItem('send_amount', amount);
    router.push('/send/review');
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

  const numAmount = parseFloat(amount || '0');
  const { transferFee, total } = calculateFees(numAmount);
  const localAmount = numAmount * exchangeRate;
  const localCurrency = recipient.country === 'KE' ? 'KES' : 
                       recipient.country === 'NG' ? 'NGN' : 
                       recipient.country === 'IN' ? 'INR' : 'USD';

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
                onClick={() => router.push('/send')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">Enter Amount</h1>
              <p className="text-muted-foreground">
                How much do you want to send?
              </p>
            </div>

            {/* Recipient Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/send')}
                  >
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Amount Input */}
            <Card>
              <CardHeader>
                <CardTitle>Amount</CardTitle>
                <CardDescription>
                  Enter the amount in USD
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Large Amount Input */}
                <div className="text-center space-y-4">
                  <div className="relative inline-flex items-center">
                    <span className="text-4xl font-bold text-muted-foreground mr-2">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={cn(
                        "text-5xl font-bold bg-transparent border-none outline-none text-center w-48",
                        error && "text-destructive"
                      )}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>

                {/* Preset Amounts */}
                <div className="flex gap-2 justify-center">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAmount(preset.toString());
                        setError('');
                      }}
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>

                <Separator />

                {/* Live Conversion */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exchange rate</span>
                    <span className="text-sm font-medium">
                      1 USD = {exchangeRate.toFixed(2)} {localCurrency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transfer fee</span>
                    <span className="text-sm font-medium">${transferFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total cost</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary">Recipient gets</span>
                    <span className="font-bold text-lg text-primary">
                      {getCurrencySymbol(localCurrency)}
                      {localAmount.toLocaleString('en-US', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                </div>

                {/* Balance Info */}
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Available balance</span>
                    <span className={cn(
                      "font-medium",
                      total > wallet.balance && "text-destructive"
                    )}>
                      {formatCurrency(wallet.balance)}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mt-0.5" />
                  <p>
                    Transfer will be delivered instantly to {recipient.mobileMoneyProvider} 
                    {' '}in {recipient.city}, {recipient.country}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleContinue}
              disabled={!amount || !!error}
            >
              Continue
            </Button>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}