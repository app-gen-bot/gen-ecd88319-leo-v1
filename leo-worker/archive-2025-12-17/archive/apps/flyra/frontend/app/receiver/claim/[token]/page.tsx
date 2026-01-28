'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, AlertCircle, ArrowLeft, DollarSign, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ClaimFundsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'verify' | 'success'>('verify');
  
  const [verificationData, setVerificationData] = useState({
    phone: '',
    otp: '',
  });

  // Mock transfer data (would come from API based on token)
  const transferData = {
    amount: 15420, // KES
    amountUSD: 100,
    senderName: 'John Doe',
    senderLocation: 'United States',
    date: new Date().toISOString(),
    message: 'For family support',
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setStep('success');
      toast({
        title: 'Funds Claimed Successfully',
        description: 'The money has been added to your balance.',
      });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: 'Please check your details and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Funds Claimed!</h2>
              <p className="text-muted-foreground mb-6">
                KES {transferData.amount.toLocaleString()} has been added to your balance
              </p>
              
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/receiver/cash-out')}
                >
                  Cash Out Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/receiver')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/receiver')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto py-6 px-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Claim Your Money</h1>
          <p className="text-muted-foreground">Verify your identity to receive funds</p>
        </div>

        {/* Transfer Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount</span>
              <div className="text-right">
                <p className="font-semibold">KES {transferData.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">${transferData.amountUSD} USD</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">From</span>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">{transferData.senderName}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Location</span>
              <span>{transferData.senderLocation}</span>
            </div>
            {transferData.message && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Message</p>
                <p className="text-sm mt-1">{transferData.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verify Your Identity</CardTitle>
            <CardDescription>
              Enter your registered phone number to claim these funds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254712345678"
                  value={verificationData.phone}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter the phone number associated with this transfer
                </p>
              </div>

              {verificationData.phone && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    We'll send a verification code to {verificationData.phone}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Claim'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Having trouble? {' '}
            <Button variant="link" className="p-0" onClick={() => router.push('/support')}>
              Contact Support
            </Button>
          </p>
        </div>
      </main>
    </div>
  );
}