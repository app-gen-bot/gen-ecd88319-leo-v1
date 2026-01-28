'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus, Check, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Recipient } from '@/types';
import { getInitials, formatPhoneNumber } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function SendMoneyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check if recipient was pre-selected
  const preselectedRecipient = searchParams.get('recipient');

  useEffect(() => {
    loadRecipients();
  }, []);

  useEffect(() => {
    if (preselectedRecipient && recipients.length > 0) {
      const recipient = recipients.find(r => r.id === preselectedRecipient);
      if (recipient) {
        setSelectedRecipient(recipient.id);
      }
    }
  }, [preselectedRecipient, recipients]);

  useEffect(() => {
    filterRecipients();
  }, [searchQuery, recipients]);

  const loadRecipients = async () => {
    try {
      const data = await apiClient.getRecipients();
      setRecipients(data);
      setFilteredRecipients(data);
    } catch (error) {
      toast({
        title: 'Error loading recipients',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecipients = () => {
    if (!searchQuery) {
      setFilteredRecipients(recipients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = recipients.filter(recipient => 
      recipient.firstName.toLowerCase().includes(query) ||
      recipient.lastName.toLowerCase().includes(query) ||
      recipient.phoneNumber.includes(query) ||
      recipient.city.toLowerCase().includes(query)
    );
    setFilteredRecipients(filtered);
  };

  const handleContinue = () => {
    if (!selectedRecipient) return;
    
    // Store selected recipient in session
    sessionStorage.setItem('send_recipient_id', selectedRecipient);
    router.push('/send/amount');
  };

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
                onClick={() => router.push('/dashboard')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold">Send Money</h1>
              <p className="text-muted-foreground">
                Select a recipient to send money to
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Recipients Grid */}
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRecipients.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  {searchQuery ? (
                    <>
                      <p className="text-muted-foreground mb-4">
                        No recipients found matching "{searchQuery}"
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        You haven't added any recipients yet
                      </p>
                      <Link href="/send/new-recipient">
                        <Button>Add Your First Recipient</Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredRecipients.map((recipient) => (
                  <Card
                    key={recipient.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedRecipient === recipient.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedRecipient(recipient.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {getInitials(`${recipient.firstName} ${recipient.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          {selectedRecipient === recipient.id && (
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {recipient.firstName} {recipient.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {recipient.city}, {recipient.country}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPhoneNumber(recipient.phoneNumber)}
                          </p>
                          {recipient.lastTransactionDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last sent: {new Date(recipient.lastTransactionDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add New Recipient Option */}
            <Link href="/send/new-recipient">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Add New Recipient</p>
                      <p className="text-sm text-muted-foreground">
                        Send money to someone new
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Continue Button */}
            {filteredRecipients.length > 0 && (
              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={handleContinue}
                  disabled={!selectedRecipient}
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}