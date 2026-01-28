'use client';

import { useState } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  Send,
  DollarSign,
  Users,
  Shield,
  Clock,
  CreditCard,
  Globe
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    message: '',
  });

  const faqs: FAQItem[] = [
    {
      category: 'Getting Started',
      question: 'How do I send money to someone?',
      answer: 'To send money: 1) Add funds to your wallet, 2) Click "Send Money", 3) Select or add a recipient, 4) Enter the amount, 5) Review and confirm. The money will be delivered instantly to your recipient\'s mobile money account.'
    },
    {
      category: 'Getting Started',
      question: 'What countries are supported?',
      answer: 'We currently support sending money to Kenya (M-PESA), India (UPI/PayTM), Nigeria (bank transfer), and the Philippines (GCash). We\'re constantly adding new countries and payment methods.'
    },
    {
      category: 'Fees',
      question: 'How much does it cost to send money?',
      answer: 'We charge a flat fee of $2.99 per transfer, regardless of the amount. There are no hidden fees or exchange rate markups. The recipient receives the full amount in their local currency.'
    },
    {
      category: 'Fees',
      question: 'Are there any limits on transfers?',
      answer: 'Yes, you can send between $1 and $2,999 per transfer. Daily and monthly limits may apply based on your verification status. Verified users enjoy higher limits.'
    },
    {
      category: 'Account',
      question: 'How do I verify my account?',
      answer: 'Go to Profile > KYC Status to complete verification. You\'ll need: 1) A valid government ID, 2) Proof of address (utility bill or bank statement), 3) A selfie for identity confirmation. Verification usually takes 1-2 business days.'
    },
    {
      category: 'Account',
      question: 'Is my money safe with Flyra?',
      answer: 'Yes! Your funds are held in USDC stablecoin, backed 1:1 with US dollars. We use bank-level encryption and security measures. All transfers are protected and we\'re regulated as a money transmitter.'
    },
    {
      category: 'Transfers',
      question: 'How long do transfers take?',
      answer: 'Most transfers are completed instantly (within 30 seconds). In rare cases, it may take up to 5 minutes depending on the recipient\'s mobile money provider.'
    },
    {
      category: 'Transfers',
      question: 'Can I cancel a transfer?',
      answer: 'Transfers are processed instantly and cannot be cancelled once confirmed. Please double-check all details before confirming your transfer.'
    },
    {
      category: 'Wallet',
      question: 'How do I add funds to my wallet?',
      answer: 'Go to Wallet > Add Funds. You can fund your wallet via ACH bank transfer (3-5 business days, no fees). Debit card and wire transfer options are coming soon.'
    },
    {
      category: 'Wallet',
      question: 'Can I withdraw funds from my wallet?',
      answer: 'Yes, you can withdraw funds back to your linked bank account. Go to Wallet > Withdraw. Withdrawals typically take 1-2 business days to process.'
    },
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(faqs.map(faq => faq.category))];

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Support Ticket Created',
        description: 'We\'ll respond to your inquiry within 24 hours.',
      });
      setTicketForm({ subject: '', category: '', message: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit ticket. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const categoryIcons: Record<string, any> = {
    'Getting Started': Send,
    'Fees': DollarSign,
    'Account': Users,
    'Transfers': Globe,
    'Wallet': CreditCard,
  };

  return (
    <div className="min-h-screen bg-background">
      {user && <DashboardNav />}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="text-muted-foreground">Find answers and get support</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-sm text-muted-foreground mb-3">Mon-Fri 9AM-6PM EST</p>
              <Button variant="outline" size="sm" asChild>
                <a href="tel:+1-800-FLYRA-US">1-800-FLYRA-US</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-3">We'll respond within 24 hours</p>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:support@flyra.com">support@flyra.com</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-3">Chat with our support team</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast({
                  title: 'Live Chat',
                  description: 'Live chat feature coming soon!',
                })}
              >
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={searchQuery === '' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSearchQuery('')}
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={searchQuery === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSearchQuery(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => {
                const Icon = categoryIcons[faq.category] || Shield;
                return (
                  <Card 
                    key={index}
                    className="cursor-pointer"
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <Badge variant="secondary" className="mb-2 text-xs">
                              {faq.category}
                            </Badge>
                            <h3 className="font-semibold">{faq.question}</h3>
                          </div>
                        </div>
                        {expandedFAQ === index ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                    {expandedFAQ === index && (
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {filteredFAQs.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No results found. Try a different search or contact support.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a message and we'll help you out.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="account">Account Issues</option>
                      <option value="transfer">Transfer Problems</option>
                      <option value="wallet">Wallet & Funding</option>
                      <option value="verification">Verification Help</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      className="w-full px-3 py-2 border rounded-md bg-background min-h-[150px]"
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please provide as much detail as possible..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}