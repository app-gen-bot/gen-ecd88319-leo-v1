'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, DollarSign, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';

export default function ReceiverHistoryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  // Mock transaction history
  const transactions = [
    {
      id: 1,
      type: 'received',
      senderName: 'John Doe',
      amount: 15420,
      amountUSD: 100,
      date: '2025-01-13',
      time: '14:30',
      status: 'completed',
      reference: 'TXN001234',
    },
    {
      id: 2,
      type: 'cashout',
      method: 'M-PESA',
      amount: 7710,
      amountUSD: 50,
      date: '2025-01-12',
      time: '10:15',
      status: 'completed',
      reference: 'CASH001235',
    },
    {
      id: 3,
      type: 'received',
      senderName: 'Sarah Johnson',
      amount: 7710,
      amountUSD: 50,
      date: '2025-01-10',
      time: '09:45',
      status: 'completed',
      reference: 'TXN001236',
    },
    {
      id: 4,
      type: 'cashout',
      method: 'Bank Transfer',
      amount: 23130,
      amountUSD: 150,
      date: '2025-01-08',
      time: '16:20',
      status: 'completed',
      reference: 'CASH001237',
    },
    {
      id: 5,
      type: 'received',
      senderName: 'Michael Chen',
      amount: 23130,
      amountUSD: 150,
      date: '2025-01-08',
      time: '08:00',
      status: 'completed',
      reference: 'TXN001238',
    },
  ];

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  const stats = {
    totalReceived: transactions
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0),
    totalCashedOut: transactions
      .filter(t => t.type === 'cashout')
      .reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/receiver')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">View all your received funds and cash outs</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                  <p className="text-2xl font-bold">KES {stats.totalReceived.toLocaleString()}</p>
                </div>
                <ArrowDownLeft className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cashed Out</p>
                  <p className="text-2xl font-bold">KES {stats.totalCashedOut.toLocaleString()}</p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{stats.transactionCount}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transactions</CardTitle>
              <Filter className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
                <TabsTrigger value="cashout">Cash Outs</TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="space-y-4 mt-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {/* Navigate to details if needed */}}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'received' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        {transaction.type === 'received' ? (
                          <ArrowDownLeft className={`h-4 w-4 ${
                            transaction.type === 'received'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'received' 
                            ? `From ${transaction.senderName}`
                            : `Cash out to ${transaction.method}`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.date} at {transaction.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'received' ? 'text-green-600' : ''
                      }`}>
                        {transaction.type === 'received' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">${transaction.amountUSD}</p>
                    </div>
                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}