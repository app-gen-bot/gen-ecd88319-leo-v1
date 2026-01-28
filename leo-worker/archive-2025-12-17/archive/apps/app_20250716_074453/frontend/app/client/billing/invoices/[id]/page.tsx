'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { mockInvoices } from '@/lib/mock-data';
import { Invoice } from '@/types';
import { format } from 'date-fns';
import { ArrowLeft, Download, Printer, Mail, CreditCard, DollarSign, Calendar } from 'lucide-react';
import { toast } from '@/lib/use-toast';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundInvoice = mockInvoices.find(inv => inv.id === params.id);
      if (foundInvoice) {
        setInvoice(foundInvoice);
      }
      setIsLoading(false);
    }, 1000);

    // Check if payment section should be shown
    if (window.location.hash === '#payment') {
      setShowPayment(true);
    }
  }, [params.id]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Payment successful!',
        description: 'Your payment has been processed successfully.',
      });
      
      // Update invoice status locally
      if (invoice) {
        setInvoice({
          ...invoice,
          status: 'paid',
          paidAmount: invoice.total,
          balance: 0,
        });
      }
      
      setShowPayment(false);
    } catch (error) {
      toast({
        title: 'Payment failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    toast({
      title: 'Downloading invoice',
      description: 'Your invoice PDF is being generated.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast({
      title: 'Email sent',
      description: 'Invoice has been emailed to your registered email address.',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Invoice not found</p>
          <Link href="/client/billing/invoices">
            <Button>Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
      case 'partial':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/client/billing/invoices">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Invoice #{invoice.id}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handleEmail}>
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Issued on {format(new Date(invoice.date), 'MMMM d, yyyy')}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(invoice.status)}>
              {invoice.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Billing Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Bill To</h3>
              <p className="text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Invoice Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Number:</span>
                  <span>#{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span>{format(new Date(invoice.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pet:</span>
                  <span>{invoice.pet?.name}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="font-semibold mb-4">Services & Products</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Subtotal</TableCell>
                  <TableCell className="text-right">${invoice.subtotal.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>Tax</TableCell>
                  <TableCell className="text-right">${invoice.tax.toFixed(2)}</TableCell>
                </TableRow>
                {invoice.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>Discount</TableCell>
                    <TableCell className="text-right">-${invoice.discount.toFixed(2)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">${invoice.total.toFixed(2)}</TableCell>
                </TableRow>
                {invoice.paidAmount > 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>Paid</TableCell>
                    <TableCell className="text-right">-${invoice.paidAmount.toFixed(2)}</TableCell>
                  </TableRow>
                )}
                {invoice.balance > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="font-semibold">Balance Due</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      ${invoice.balance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
              </TableFooter>
            </Table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            </>
          )}
        </CardContent>
        {invoice.status !== 'paid' && !showPayment && (
          <CardFooter>
            <Button className="w-full" onClick={() => setShowPayment(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now - ${invoice.balance.toFixed(2)}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Payment Form */}
      {showPayment && invoice.status !== 'paid' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Choose your payment method and complete the payment
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePayment}>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount Due</span>
                  <span className="text-2xl font-bold">${invoice.balance.toFixed(2)}</span>
                </div>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <label
                    htmlFor="card"
                    className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-muted-foreground">Pay with your card</p>
                    </div>
                  </label>
                  <label
                    htmlFor="saved"
                    className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value="saved" id="saved" />
                    <CreditCard className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">Saved Card</p>
                      <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowPayment(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Pay $${invoice.balance.toFixed(2)}`}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}