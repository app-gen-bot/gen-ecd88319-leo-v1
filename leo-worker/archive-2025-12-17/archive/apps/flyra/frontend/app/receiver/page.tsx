'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Smartphone, 
  MapPin, 
  Clock, 
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Banknote,
  Building
} from 'lucide-react';

export default function ReceiverDashboard() {
  const router = useRouter();
  const [userPhone] = useState('+254712345678'); // Mock receiver phone

  // Mock data
  const pendingMoney = {
    amount: 15420, // in KES
    amountUSD: 100,
    senderName: 'John Doe',
    token: 'ABC123XYZ',
    expiresIn: '24 hours',
  };

  const availableBalance = {
    usdc: 50,
    localCurrency: 7710, // in KES
    currency: 'KES',
  };

  const recentTransfers = [
    {
      id: 1,
      senderName: 'Sarah Johnson',
      amount: 7710,
      amountUSD: 50,
      date: '2025-01-10',
      status: 'completed',
    },
    {
      id: 2,
      senderName: 'Michael Chen',
      amount: 23130,
      amountUSD: 150,
      date: '2025-01-08',
      status: 'completed',
    },
  ];

  const cashOutOptions = [
    {
      id: 'mpesa',
      name: 'M-PESA',
      icon: Smartphone,
      description: 'Instant delivery to your M-PESA wallet',
      available: true,
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building,
      description: '1-2 business days to any bank',
      available: true,
    },
    {
      id: 'agent',
      name: 'Cash Pickup',
      icon: MapPin,
      description: 'Pick up cash at nearest agent',
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header for Receivers */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">Flyra</h1>
            <p className="text-sm text-muted-foreground">{userPhone}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Pending Money Alert */}
        {pendingMoney && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  You have KES {pendingMoney.amount.toLocaleString()} (${pendingMoney.amountUSD}) from {pendingMoney.senderName}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Expires in {pendingMoney.expiresIn}
                </p>
              </div>
              <Button 
                size="sm" 
                className="ml-4"
                onClick={() => router.push(`/receiver/claim/${pendingMoney.token}`)}
              >
                Claim Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Balance Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>
              Ready to cash out to your preferred method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {availableBalance.currency} {availableBalance.localCurrency.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  ≈ ${availableBalance.usdc} USDC
                </p>
              </div>
              <Button onClick={() => router.push('/receiver/cash-out')}>
                <Banknote className="mr-2 h-4 w-4" />
                Cash Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cash Out Options */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Cash Out Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cashOutOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={option.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/receiver/cash-out')}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{option.name}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      {option.available && (
                        <Badge variant="secondary" className="mt-2">Available</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Transfers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transfers</CardTitle>
                <CardDescription>
                  Money you've received
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/receiver/history')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">From {transfer.senderName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transfer.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">KES {transfer.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">${transfer.amountUSD}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/receiver/profile')}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold">Update Profile</h3>
                <p className="text-sm text-muted-foreground">Manage your payment methods</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/support')}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold">Get Help</h3>
                <p className="text-sm text-muted-foreground">Contact support team</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}