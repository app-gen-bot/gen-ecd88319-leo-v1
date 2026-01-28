'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Info, AlertCircle, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function WithdrawFundsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'review' | 'success'>('amount');
  
  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    bankAccount: 'Chase Checking ****4567', // Mock connected account
  });

  // Mock wallet balance
  const walletBalance = {
    usdc: 523.45,
    usd: 523.45,
  };

  const withdrawalFee = 0; // Free withdrawals
  const processingTime = '1-2 business days';
  const minWithdrawal = 10;
  const maxWithdrawal = walletBalance.usdc;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setWithdrawData(prev => ({ ...prev, amount: value }));
    }
  };

  const handleReview = () => {
    const amount = parseFloat(withdrawData.amount);
    
    if (amount < minWithdrawal) {
      toast({
        title: 'Amount Too Low',
        description: `Minimum withdrawal is $${minWithdrawal}`,
        variant: 'destructive',
      });
      return;
    }

    if (amount > maxWithdrawal) {
      toast({
        title: 'Insufficient Balance',
        description: `You can withdraw up to $${maxWithdrawal.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    setStep('review');
  };

  const handleWithdraw = async () => {
    setIsLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStep('success');
      toast({
        title: 'Withdrawal Initiated',
        description: 'Your funds are on the way to your bank account.',
      });
    } catch (error) {
      toast({
        title: 'Withdrawal Failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Withdrawal Initiated</h2>
                  <p className="text-muted-foreground mb-6">
                    ${withdrawData.amount} will be deposited to your bank account within {processingTime}
                  </p>
                  
                  <div className="bg-muted rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold mb-2">Transaction Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span>${withdrawData.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fee</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">To</span>
                        <span>{withdrawData.bankAccount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="font-mono">WD{Date.now()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      className="w-full"
                      onClick={() => router.push('/wallet')}
                    >
                      Back to Wallet
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push('/transactions')}
                    >
                      View Transaction History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </AuthCheck>
    );
  }

  if (step === 'review') {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => setStep('amount')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Review Withdrawal</h1>
              <p className="text-muted-foreground">Confirm your withdrawal details</p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Withdrawal Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Withdrawal Amount</span>
                    <span className="font-medium">${withdrawData.amount}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Withdrawal Fee</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">Total Deducted</span>
                    <span className="font-semibold">${withdrawData.amount}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">To Bank Account</p>
                      <p className="text-sm text-muted-foreground">{withdrawData.bankAccount}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Arrives in {processingTime}
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Withdrawals are processed on business days only. Banks may take additional time to credit your account.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('amount')}
                disabled={isLoading}
              >
                Edit Amount
              </Button>
              <Button
                className="flex-1"
                onClick={handleWithdraw}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm Withdrawal'}
              </Button>
            </div>
          </main>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push('/wallet')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wallet
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Withdraw Funds</h1>
            <p className="text-muted-foreground">Transfer money back to your bank account</p>
          </div>

          {/* Balance Display */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available to Withdraw</p>
                  <p className="text-3xl font-bold">${walletBalance.usdc.toFixed(2)}</p>
                </div>
                <Badge variant="secondary">USDC Balance</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Withdrawal Details</CardTitle>
              <CardDescription>
                Enter the amount you want to withdraw
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0.00"
                    className="pl-8"
                    value={withdrawData.amount}
                    onChange={handleAmountChange}
                    autoFocus
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Min: ${minWithdrawal} • Max: ${maxWithdrawal.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setWithdrawData(prev => ({ 
                      ...prev, 
                      amount: maxWithdrawal.toFixed(2) 
                    }))}
                  >
                    Withdraw all
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Destination</Label>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{withdrawData.bankAccount}</p>
                      <p className="text-sm text-muted-foreground">ACH Transfer • Free</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <Button variant="link" className="p-0 h-auto">
                    Change bank account
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Processing Time</h3>
                <p className="text-sm text-muted-foreground">
                  {processingTime}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Withdrawal Fee</h3>
                <p className="text-sm text-muted-foreground">
                  Free - No fees for withdrawals
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Withdrawals are irreversible once processed. Please double-check the amount and destination account.
            </AlertDescription>
          </Alert>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleReview}
            disabled={!withdrawData.amount || parseFloat(withdrawData.amount) <= 0}
          >
            Continue to Review
          </Button>
        </main>
      </div>
    </AuthCheck>
  );
}