'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, Building, MapPin, Info, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CashOutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [cashOutData, setCashOutData] = useState({
    method: 'mpesa',
    amount: '',
    phone: '+254712345678',
    accountNumber: '',
  });

  // Mock data
  const availableBalance = {
    amount: 7710,
    currency: 'KES',
    usdEquivalent: 50,
  };

  const cashOutMethods = [
    {
      id: 'mpesa',
      name: 'M-PESA',
      icon: Smartphone,
      description: 'Instant delivery',
      fee: 'Free',
      limit: 'Up to KES 150,000',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building,
      description: '1-2 business days',
      fee: 'Free',
      limit: 'No limit',
    },
    {
      id: 'agent',
      name: 'Cash Pickup',
      icon: MapPin,
      description: 'Same day',
      fee: 'Free',
      limit: 'Up to KES 50,000',
    },
  ];

  const nearbyAgents = [
    {
      name: 'Flyra Agent - Nairobi CBD',
      address: '123 Kenyatta Avenue, Nairobi',
      distance: '0.5 km',
      hours: 'Mon-Sat 8AM-6PM',
    },
    {
      name: 'Flyra Agent - Westlands',
      address: '45 Westlands Road, Nairobi',
      distance: '2.3 km',
      hours: 'Mon-Fri 9AM-5PM',
    },
  ];

  const handleCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
      
      toast({
        title: 'Cash Out Initiated',
        description: 'Your money is on the way!',
      });
    } catch (error) {
      toast({
        title: 'Cash Out Failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Cash Out Successful!</h2>
              
              {cashOutData.method === 'mpesa' && (
                <>
                  <p className="text-muted-foreground mb-4">
                    KES {cashOutData.amount} has been sent to your M-PESA
                  </p>
                  <div className="bg-muted rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium">Transaction Details</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reference: TXN{Date.now()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      To: {cashOutData.phone}
                    </p>
                  </div>
                </>
              )}
              
              {cashOutData.method === 'agent' && (
                <>
                  <p className="text-muted-foreground mb-4">
                    Your cash pickup code is ready
                  </p>
                  <div className="bg-muted rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium mb-2">Pickup Code</p>
                    <p className="text-2xl font-mono font-bold">7829-4156</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Show this code at any Flyra agent
                    </p>
                  </div>
                </>
              )}
              
              <Button 
                className="w-full"
                onClick={() => router.push('/receiver')}
              >
                Back to Dashboard
              </Button>
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

      <main className="max-w-2xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Cash Out</h1>
          <p className="text-muted-foreground">Choose how to receive your money</p>
        </div>

        {/* Balance Display */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">
                  {availableBalance.currency} {availableBalance.amount.toLocaleString()}
                </p>
              </div>
              <Badge variant="secondary">
                ≈ ${availableBalance.usdEquivalent}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleCashOut} className="space-y-6">
          {/* Cash Out Method */}
          <Card>
            <CardHeader>
              <CardTitle>Select Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={cashOutData.method}
                onValueChange={(value) => setCashOutData(prev => ({ ...prev, method: value }))}
              >
                {cashOutMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.id} className="mb-4 last:mb-0">
                      <label
                        htmlFor={method.id}
                        className="flex items-start space-x-3 cursor-pointer p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{method.name}</p>
                            <Badge variant="secondary">{method.fee}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          <p className="text-sm text-muted-foreground">{method.limit}</p>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Amount Input */}
          <Card>
            <CardHeader>
              <CardTitle>Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="amount">Enter amount to cash out</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    KES
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    className="pl-12"
                    value={cashOutData.amount}
                    onChange={(e) => setCashOutData(prev => ({ ...prev, amount: e.target.value }))}
                    max={availableBalance.amount}
                    required
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setCashOutData(prev => ({ 
                      ...prev, 
                      amount: availableBalance.amount.toString() 
                    }))}
                  >
                    Cash out all
                  </button>
                  <span className="text-muted-foreground">
                    Max: KES {availableBalance.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Method-specific Details */}
          {cashOutData.method === 'mpesa' && (
            <Card>
              <CardHeader>
                <CardTitle>M-PESA Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="phone">M-PESA Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={cashOutData.phone}
                    onChange={(e) => setCashOutData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Money will be sent instantly to this number
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {cashOutData.method === 'bank' && (
            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Bank transfers take 1-2 business days to process
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label htmlFor="account">Account Number</Label>
                    <Input
                      id="account"
                      type="text"
                      placeholder="Enter your bank account number"
                      value={cashOutData.accountNumber}
                      onChange={(e) => setCashOutData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {cashOutData.method === 'agent' && (
            <Card>
              <CardHeader>
                <CardTitle>Nearby Agents</CardTitle>
                <CardDescription>
                  Visit any of these locations with your pickup code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nearbyAgents.map((agent, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">{agent.address}</p>
                          <p className="text-sm text-muted-foreground">{agent.hours}</p>
                        </div>
                        <Badge variant="secondary">{agent.distance}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!cashOutData.amount || isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm Cash Out'}
          </Button>
        </form>
      </main>
    </div>
  );
}