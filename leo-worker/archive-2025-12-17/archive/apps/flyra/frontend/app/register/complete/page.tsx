'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Wallet, Send, LayoutDashboard } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegistrationCompletePage() {
  const router = useRouter();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Auto-login would happen here in a real app
    // For now, we'll just show the success page
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Success Animation */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 animate-checkmark" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to Flyra!</h1>
          <p className="text-xl text-muted-foreground">
            Your account has been created successfully
          </p>
        </div>

        {/* Next Steps Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Fund Your Wallet
              </CardTitle>
              <CardDescription>
                Add USDC to start sending money instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/wallet/fund">
                <Button className="w-full">Fund Wallet</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Money
              </CardTitle>
              <CardDescription>
                Transfer funds to family and friends worldwide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/send">
                <Button variant="outline" className="w-full">Send Money</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Explore Dashboard
              </CardTitle>
              <CardDescription>
                View your wallet, transactions, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help getting started?{' '}
            <Link href="/support" className="text-primary hover:underline">
              Visit our support center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}