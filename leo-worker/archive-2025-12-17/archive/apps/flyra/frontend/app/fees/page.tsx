'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Check, X, Calculator, TrendingDown, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FeesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [calculatorAmount, setCalculatorAmount] = useState('100');

  const exchangeRates = {
    KES: 154.50,  // Kenya Shilling
    INR: 83.25,   // Indian Rupee
    NGN: 912.50,  // Nigerian Naira
    PHP: 56.40,   // Philippine Peso
  };

  const competitors = [
    { name: 'Bank Wire', fee: '$25-45', rate: '3-5%', time: '3-5 days' },
    { name: 'Traditional Remittance', fee: '$10-20', rate: '2-4%', time: '1-3 days' },
    { name: 'Other Apps', fee: '$5-15', rate: '1-3%', time: '1-2 days' },
  ];

  const calculateSavings = (amount: number, country: keyof typeof exchangeRates) => {
    const flyraFee = 2.99;
    const flyraTotal = amount + flyraFee;
    const flyraReceived = amount * exchangeRates[country];

    // Traditional service (average)
    const traditionalFee = 15;
    const traditionalRateMarkup = 0.03; // 3%
    const traditionalTotal = amount + traditionalFee;
    const traditionalRate = exchangeRates[country] * (1 - traditionalRateMarkup);
    const traditionalReceived = amount * traditionalRate;

    const savings = traditionalTotal - flyraTotal;
    const moreReceived = flyraReceived - traditionalReceived;

    return {
      flyraTotal,
      flyraReceived,
      traditionalTotal,
      traditionalReceived,
      savings,
      moreReceived,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {user && <DashboardNav />}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Transparent Pricing</h1>
          <p className="text-muted-foreground">Simple, fair fees with no hidden costs</p>
        </div>

        {/* Main Fee Card */}
        <Card className="mb-8 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl">$2.99</CardTitle>
            <CardDescription className="text-lg">
              Flat fee per transfer, any amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>No exchange rate markup</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Same fee for $1 or $2,999</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Recipient gets full amount</span>
              </div>
            </div>
            {!user && (
              <div className="mt-6 text-center">
                <Button onClick={() => router.push('/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fee Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Transfer Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">$2.99</p>
              <p className="text-sm text-muted-foreground">
                Fixed fee regardless of transfer amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingDown className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Exchange Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">0% Markup</p>
              <p className="text-sm text-muted-foreground">
                Real-time mid-market rates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calculator className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Other Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">None</p>
              <p className="text-sm text-muted-foreground">
                No hidden fees or surprises
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Compare with Others</CardTitle>
            <CardDescription>
              See how much you save with Flyra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Transfer Fee</th>
                    <th className="text-left py-3 px-4">Exchange Rate</th>
                    <th className="text-left py-3 px-4">Delivery Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-primary/5">
                    <td className="py-3 px-4 font-semibold">
                      Flyra
                      <Badge className="ml-2" variant="default">Best Value</Badge>
                    </td>
                    <td className="py-3 px-4">$2.99</td>
                    <td className="py-3 px-4">No markup</td>
                    <td className="py-3 px-4">Instant</td>
                  </tr>
                  {competitors.map((competitor, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{competitor.name}</td>
                      <td className="py-3 px-4">{competitor.fee}</td>
                      <td className="py-3 px-4">{competitor.rate} markup</td>
                      <td className="py-3 px-4">{competitor.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Savings Calculator */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Calculator</CardTitle>
            <CardDescription>
              See how much you'll save on your transfer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Transfer Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={calculatorAmount}
                  onChange={(e) => setCalculatorAmount(e.target.value)}
                  min="1"
                  max="2999"
                  placeholder="Enter amount"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(exchangeRates).map(([currency, rate]) => {
                  const amount = parseFloat(calculatorAmount) || 0;
                  const calc = calculateSavings(amount, currency as keyof typeof exchangeRates);
                  
                  return (
                    <Card key={currency} className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">To {currency}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">You save</p>
                          <p className="text-xl font-bold text-green-600">
                            ${calc.savings.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Recipient gets</p>
                          <p className="font-semibold">
                            {calc.moreReceived.toFixed(2)} more {currency}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Services */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Additional Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">ACH Bank Deposits</p>
                  <p className="text-sm text-muted-foreground">Free - Add funds from your bank account</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Wallet Withdrawals</p>
                  <p className="text-sm text-muted-foreground">Free - Withdraw to your linked bank account</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Recurring Transfers</p>
                  <p className="text-sm text-muted-foreground">No additional fees - Same $2.99 per transfer</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <X className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Debit Card Deposits</p>
                  <p className="text-sm text-muted-foreground">Coming soon - Instant funding option</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}