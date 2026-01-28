'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeftIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckIcon,
  ReceiptPercentIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';

// Mock invoice data (same as invoices page)
const mockInvoice = {
  id: '1',
  invoiceNumber: 'INV-2024-001',
  petName: 'Max',
  petId: '1',
  ownerName: 'John Smith',
  ownerEmail: 'john@example.com',
  date: '2024-01-15',
  dueDate: '2024-01-30',
  amount: 285.50,
  status: 'unpaid',
  items: [
    { description: 'Wellness Exam', quantity: 1, price: 65.00 },
    { description: 'Rabies Vaccine', quantity: 1, price: 35.00 },
    { description: 'DHPP Vaccine', quantity: 1, price: 45.00 },
    { description: 'Heartworm Test', quantity: 1, price: 55.00 },
    { description: 'Flea Prevention (6 months)', quantity: 1, price: 85.50 },
  ]
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const _invoiceId = searchParams.get('invoice');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [paymentAmount, setPaymentAmount] = useState(mockInvoice.amount.toString());
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  
  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Check payment fields
  const [checkNumber, setCheckNumber] = useState('');
  const [bankName, setBankName] = useState('');

  const calculateDiscount = () => {
    if (!applyDiscount || !discountValue) return 0;
    
    const value = parseFloat(discountValue);
    if (discountType === 'percentage') {
      return (mockInvoice.amount * value) / 100;
    }
    return value;
  };

  const calculateFinalAmount = () => {
    return mockInvoice.amount - calculateDiscount();
  };

  useEffect(() => {
    if (applyDiscount) {
      setPaymentAmount(calculateFinalAmount().toFixed(2));
    } else {
      setPaymentAmount(mockInvoice.amount.toFixed(2));
    }
  }, [applyDiscount, discountValue, discountType]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment amount
    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Payment amount must be greater than $0",
        variant: "destructive",
      });
      return;
    }

    if (amount > calculateFinalAmount()) {
      toast({
        title: "Amount exceeds balance",
        description: "Payment amount cannot exceed the invoice balance",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment processed successfully",
        description: `$${amount.toFixed(2)} has been applied to invoice ${mockInvoice.invoiceNumber}`,
      });
      
      // Print receipt automatically
      setTimeout(() => {
        window.print();
      }, 500);
      
      router.push('/staff/billing/invoices');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/staff/billing/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Process Payment</h1>
            <p className="text-muted-foreground">Accept payment for invoice</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select how the customer is paying</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit" className="flex items-center gap-2 cursor-pointer">
                        <CreditCardIcon className="h-4 w-4" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                        <BanknotesIcon className="h-4 w-4" />
                        Cash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="check" id="check" />
                      <Label htmlFor="check" className="flex items-center gap-2 cursor-pointer">
                        <ReceiptPercentIcon className="h-4 w-4" />
                        Check
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Details */}
              {paymentMethod === 'credit' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Card Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-name">Cardholder Name</Label>
                      <Input
                        id="card-name"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          placeholder="12345"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          maxLength={5}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === 'check' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Check Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="check-number">Check Number</Label>
                      <Input
                        id="check-number"
                        placeholder="1234"
                        value={checkNumber}
                        onChange={(e) => setCheckNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name (Optional)</Label>
                      <Input
                        id="bank-name"
                        placeholder="First National Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Discount */}
              <Card>
                <CardHeader>
                  <CardTitle>Discount (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="apply-discount"
                      checked={applyDiscount}
                      onChange={(e) => setApplyDiscount(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="apply-discount">Apply discount</Label>
                  </div>
                  
                  {applyDiscount && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discount-type">Type</Label>
                        <Select value={discountType} onValueChange={setDiscountType}>
                          <SelectTrigger id="discount-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="amount">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount-value">
                          {discountType === 'percentage' ? 'Percentage' : 'Amount'}
                        </Label>
                        <Input
                          id="discount-value"
                          type="number"
                          step="0.01"
                          placeholder={discountType === 'percentage' ? '10' : '25.00'}
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Amount */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount to Pay</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="pl-8"
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter partial payment or full amount
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? (
                  <>Processing Payment...</>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Process Payment of ${parseFloat(paymentAmount || '0').toFixed(2)}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Invoice Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
                <CardDescription>{mockInvoice.invoiceNumber}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{mockInvoice.petName}</p>
                  <p className="text-sm text-muted-foreground">{mockInvoice.ownerName}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  {mockInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.description}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${(mockInvoice.amount / 1.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8%)</span>
                    <span>${(mockInvoice.amount - mockInvoice.amount / 1.08).toFixed(2)}</span>
                  </div>
                  {applyDiscount && discountValue && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Due</span>
                    <span>${calculateFinalAmount().toFixed(2)}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}