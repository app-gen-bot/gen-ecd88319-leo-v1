'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Building2,
  CreditCard,
  Zap,
  Clock,
  DollarSign,
  Info,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { BankAccount } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const PRESET_AMOUNTS = [100, 250, 500, 1000];
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 10000;

interface FundingMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  processingTime: string;
  fee: number;
  available: boolean;
}

const FUNDING_METHODS: FundingMethod[] = [
  {
    id: 'ach',
    name: 'Bank Transfer (ACH)',
    description: 'Transfer from your bank account',
    icon: Building2,
    processingTime: '3-5 business days',
    fee: 0,
    available: true,
  },
  {
    id: 'debit',
    name: 'Debit Card',
    description: 'Instant funding with debit card',
    icon: CreditCard,
    processingTime: 'Instant',
    fee: 2.9,
    available: false,
  },
  {
    id: 'wire',
    name: 'Wire Transfer',
    description: 'For large amounts',
    icon: Zap,
    processingTime: '1-2 business days',
    fee: 15,
    available: false,
  },
];

export default function FundWalletPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState('ach');
  const [amount, setAmount] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState('');

  // Load bank accounts on mount
  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      const accounts = await apiClient.getBankAccounts();
      setBankAccounts(accounts);
      if (accounts.length > 0) {
        setSelectedBank(accounts[0].id);
      }
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    }
  };

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;

    setAmount(cleaned);
    setError('');
    setShowReview(false);
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount === 0) {
      setError('Please enter an amount');
      return false;
    }

    if (numAmount < MIN_AMOUNT) {
      setError(`Minimum amount is ${formatCurrency(MIN_AMOUNT)}`);
      return false;
    }

    if (numAmount > MAX_AMOUNT) {
      setError(`Maximum amount is ${formatCurrency(MAX_AMOUNT)}`);
      return false;
    }

    return true;
  };

  const handleConnectBank = () => {
    // In real app, this would open Plaid Link
    setShowPlaidModal(true);
    
    // Mock adding a bank account
    setTimeout(() => {
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        userId: '1',
        accountName: 'John Doe',
        accountNumber: '****1234',
        routingNumber: '****5678',
        bankName: 'Chase Bank',
        accountType: 'checking',
        isVerified: true,
        isDefault: bankAccounts.length === 0,
        createdAt: new Date().toISOString(),
      };
      
      setBankAccounts([...bankAccounts, newAccount]);
      setSelectedBank(newAccount.id);
      setShowPlaidModal(false);
      
      toast({
        title: 'Bank account connected',
        description: 'Your bank account has been connected successfully',
      });
    }, 2000);
  };

  const handleRemoveBank = (accountId: string) => {
    setBankAccounts(bankAccounts.filter(acc => acc.id !== accountId));
    if (selectedBank === accountId) {
      setSelectedBank(bankAccounts[0]?.id || null);
    }
  };

  const handleReview = () => {
    if (!validateAmount()) return;
    if (!selectedBank) {
      setError('Please connect a bank account');
      return;
    }
    setShowReview(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    
    try {
      const result = await apiClient.fundWallet(parseFloat(amount), selectedBank!);
      
      toast({
        title: 'Deposit initiated',
        description: `Your deposit of ${formatCurrency(parseFloat(amount))} has been initiated`,
      });

      // Navigate to wallet with success state
      router.push('/wallet?deposit=success');
    } catch (error: any) {
      toast({
        title: 'Deposit failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMethodDetails = FUNDING_METHODS.find(m => m.id === selectedMethod)!;
  const numAmount = parseFloat(amount || '0');
  const fee = selectedMethodDetails.fee * numAmount / 100;
  const total = numAmount + fee;

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
                onClick={() => router.push('/wallet')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Wallet
              </Button>
              <h1 className="text-3xl font-bold">Add Funds</h1>
              <p className="text-muted-foreground">
                Add USDC to your Flyra wallet
              </p>
            </div>

            {/* Funding Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Method</CardTitle>
                <CardDescription>
                  Choose how you want to add funds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                  <div className="space-y-3">
                    {FUNDING_METHODS.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.id}
                          htmlFor={method.id}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
                            selectedMethod === method.id && "border-primary bg-accent",
                            !method.available && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <RadioGroupItem 
                            value={method.id} 
                            id={method.id}
                            disabled={!method.available}
                            className="mt-1"
                          />
                          <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{method.name}</p>
                              {!method.available && (
                                <Badge variant="secondary" className="text-xs">
                                  Coming Soon
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {method.processingTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {method.fee === 0 ? 'No fees' : `${method.fee}% fee`}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Bank Account Selection (for ACH) */}
            {selectedMethod === 'ach' && (
              <Card>
                <CardHeader>
                  <CardTitle>Bank Account</CardTitle>
                  <CardDescription>
                    Select or add a bank account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bankAccounts.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No bank accounts connected
                      </p>
                      <Button onClick={handleConnectBank}>
                        <Plus className="mr-2 h-4 w-4" />
                        Connect Bank Account
                      </Button>
                    </div>
                  ) : (
                    <>
                      <RadioGroup value={selectedBank || ''} onValueChange={setSelectedBank}>
                        <div className="space-y-3">
                          {bankAccounts.map((account) => (
                            <div
                              key={account.id}
                              className="flex items-center justify-between p-4 rounded-lg border"
                            >
                              <label
                                htmlFor={account.id}
                                className="flex items-center gap-3 flex-1 cursor-pointer"
                              >
                                <RadioGroupItem value={account.id} id={account.id} />
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{account.bankName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {account.accountType === 'checking' ? 'Checking' : 'Savings'} {account.accountNumber}
                                  </p>
                                </div>
                                {account.isVerified && (
                                  <Badge variant="secondary" className="ml-auto mr-2">
                                    <Check className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </label>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveBank(account.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleConnectBank}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Bank Account
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Amount Input */}
            <Card>
              <CardHeader>
                <CardTitle>Amount</CardTitle>
                <CardDescription>
                  How much do you want to add?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={cn("pl-10", error && "border-destructive")}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive mt-2">{error}</p>
                  )}
                </div>

                {/* Preset Amounts */}
                <div className="flex gap-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAmount(preset.toString());
                        setError('');
                        setShowReview(false);
                      }}
                      className="flex-1"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Minimum: {formatCurrency(MIN_AMOUNT)} • Maximum: {formatCurrency(MAX_AMOUNT)} per transaction
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Review Section */}
            {showReview && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Deposit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span>{formatCurrency(numAmount)}</span>
                    </div>
                    {fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Processing fee</span>
                        <span>{formatCurrency(fee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Funds will be available in your wallet in {selectedMethodDetails.processingTime}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => router.push('/wallet')}
              >
                Cancel
              </Button>
              {!showReview ? (
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleReview}
                  disabled={!amount || !!error || (selectedMethod === 'ach' && !selectedBank)}
                >
                  Review Deposit
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm Deposit'}
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Mock Plaid Modal */}
        {showPlaidModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Connecting to your bank...</CardTitle>
                <CardDescription>
                  This is a demo. In production, Plaid Link would handle bank connections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthCheck>
  );
}