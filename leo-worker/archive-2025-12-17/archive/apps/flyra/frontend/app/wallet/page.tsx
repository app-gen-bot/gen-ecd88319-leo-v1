'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { 
  Wallet as WalletIcon,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Wallet, Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Mock sparkline data
const sparklineData = [45, 52, 38, 65, 48, 75, 62];

export default function WalletPage() {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showAsUSDC, setShowAsUSDC] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const [walletData, transactionsData] = await Promise.all([
        apiClient.getWallet(),
        apiClient.getTransactions(),
      ]);
      setWallet(walletData);
      
      // Filter transactions to only show deposits and withdrawals
      const walletTransactions = transactionsData.filter(
        t => t.type === 'deposit' || t.type === 'withdrawal'
      );
      setTransactions(walletTransactions);
    } catch (error) {
      toast({
        title: 'Error loading wallet',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = () => {
    // Mock wallet address
    const address = '0x1234...5678';
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Wallet address copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadStatement = () => {
    toast({
      title: 'Downloading statement',
      description: 'Your statement will be ready shortly',
    });
  };

  if (isLoading || !wallet) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container py-6">
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-muted rounded-lg" />
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  // Calculate 24h change (mock)
  const change24h = 125.50;
  const changePercent = 5.2;
  const isPositive = change24h > 0;

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container py-6 pb-24 md:pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Wallet</h1>
                <p className="text-muted-foreground">
                  Manage your USDC balance and transactions
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/wallet/fund">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Funds
                  </Button>
                </Link>
                <Link href="/wallet/withdraw">
                  <Button variant="outline">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Withdraw
                  </Button>
                </Link>
              </div>
            </div>

            {/* Balance Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Balance Overview</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Link href="/profile/security#wallet">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Balance Display */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-4xl font-bold">
                      {showBalance ? (
                        showAsUSDC ? `${wallet.balance.toFixed(2)} USDC` : formatCurrency(wallet.balance)
                      ) : (
                        '••••••'
                      )}
                    </h2>
                    {showBalance && (
                      <div className={cn(
                        "flex items-center gap-1 text-sm",
                        isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span>{isPositive ? '+' : ''}{formatCurrency(change24h)}</span>
                        <span>({changePercent}%)</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle
                      pressed={showAsUSDC}
                      onPressedChange={setShowAsUSDC}
                      size="sm"
                    >
                      View as USDC
                    </Toggle>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="h-20 flex items-end gap-1">
                  {sparklineData.map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-primary/20 rounded-t"
                      style={{ height: `${value}%` }}
                    />
                  ))}
                </div>

                {/* Wallet Address */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Wallet Address (Advanced)</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-3 py-1 rounded flex-1 truncate">
                      0x1234...5678
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Wallet Activity</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadStatement}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Statement
                  </Button>
                </div>
                <CardDescription>
                  Deposits and withdrawals from your wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="deposits">Deposits</TabsTrigger>
                    <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <WalletIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No wallet activity yet</p>
                        <Link href="/wallet/fund">
                          <Button>Make Your First Deposit</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transactions.map((transaction) => (
                          <Link
                            key={transaction.id}
                            href={`/transactions/${transaction.id}`}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2 rounded-full",
                                transaction.type === 'deposit' 
                                  ? "bg-green-100 dark:bg-green-900/20" 
                                  : "bg-red-100 dark:bg-red-900/20"
                              )}>
                                {transaction.type === 'deposit' ? (
                                  <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(transaction.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "font-medium",
                                transaction.type === 'deposit' 
                                  ? "text-green-600 dark:text-green-400" 
                                  : "text-red-600 dark:text-red-400"
                              )}>
                                {transaction.type === 'deposit' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <Badge variant={
                                transaction.status === 'completed' ? 'default' :
                                transaction.status === 'pending' ? 'secondary' :
                                'destructive'
                              }>
                                {transaction.status}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="deposits" className="space-y-4">
                    {(() => {
                      const deposits = transactions.filter(t => t.type === 'deposit');
                      return deposits.length === 0 ? (
                        <div className="text-center py-8">
                          <ArrowDownLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">No deposits yet</p>
                          <Link href="/wallet/fund">
                            <Button>Make Your First Deposit</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {deposits.map((transaction) => (
                            <Link
                              key={transaction.id}
                              href={`/transactions/${transaction.id}`}
                              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                                  <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium">Deposit</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDateTime(transaction.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-green-600 dark:text-green-400">
                                  +{formatCurrency(transaction.amount)}
                                </p>
                                <Badge variant="default">completed</Badge>
                              </div>
                            </Link>
                          ))}
                        </div>
                      );
                    })()}
                  </TabsContent>

                  <TabsContent value="withdrawals" className="space-y-4">
                    {(() => {
                      const withdrawals = transactions.filter(t => t.type === 'withdrawal');
                      return withdrawals.length === 0 ? (
                        <div className="text-center py-8">
                          <ArrowUpRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">No withdrawals yet</p>
                          <Link href="/wallet/withdraw">
                            <Button variant="outline">Withdraw Funds</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {withdrawals.map((transaction) => (
                            <Link
                              key={transaction.id}
                              href={`/transactions/${transaction.id}`}
                              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                                  <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                  <p className="font-medium">Withdrawal</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDateTime(transaction.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-red-600 dark:text-red-400">
                                  -{formatCurrency(transaction.amount)}
                                </p>
                                <Badge variant="default">completed</Badge>
                              </div>
                            </Link>
                          ))}
                        </div>
                      );
                    })()}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}