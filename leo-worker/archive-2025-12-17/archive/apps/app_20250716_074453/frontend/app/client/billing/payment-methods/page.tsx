'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Shield, 
  AlertCircle,
  Check,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  isDefault: boolean;
  card?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  bank?: {
    bankName: string;
    last4: string;
    accountType: 'checking' | 'savings';
  };
  createdAt: string;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    isDefault: true,
    card: {
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
    },
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    type: 'card',
    isDefault: false,
    card: {
      brand: 'Mastercard',
      last4: '5555',
      expiryMonth: 6,
      expiryYear: 2026,
    },
    createdAt: '2024-01-15',
  },
];

const cardSchema = z.object({
  cardNumber: z.string()
    .min(13, 'Card number must be at least 13 digits')
    .max(19, 'Card number must be at most 19 digits')
    .regex(/^\d+$/, 'Card number must contain only digits'),
  cardholderName: z.string().min(1, 'Cardholder name is required'),
  expiryMonth: z.string().min(1, 'Expiry month is required'),
  expiryYear: z.string().min(1, 'Expiry year is required'),
  cvv: z.string()
    .min(3, 'CVV must be at least 3 digits')
    .max(4, 'CVV must be at most 4 digits')
    .regex(/^\d+$/, 'CVV must contain only digits'),
  zipCode: z.string().min(5, 'ZIP code is required'),
});

const bankSchema = z.object({
  accountType: z.enum(['checking', 'savings']),
  accountNumber: z.string().min(4, 'Account number is required'),
  routingNumber: z.string()
    .length(9, 'Routing number must be 9 digits')
    .regex(/^\d+$/, 'Routing number must contain only digits'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
});

type CardFormValues = z.infer<typeof cardSchema>;
type BankFormValues = z.infer<typeof bankSchema>;

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentType, setPaymentType] = useState<'card' | 'bank'>('card');

  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      zipCode: '',
    },
  });

  const bankForm = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountType: 'checking',
      accountNumber: '',
      routingNumber: '',
      accountHolderName: '',
    },
  });

  const handleAddCard = async (data: CardFormValues) => {
    // Simulate API call
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      isDefault: paymentMethods.length === 0,
      card: {
        brand: getCardBrand(data.cardNumber),
        last4: data.cardNumber.slice(-4),
        expiryMonth: parseInt(data.expiryMonth),
        expiryYear: parseInt(data.expiryYear),
      },
      createdAt: new Date().toISOString(),
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    setIsAddDialogOpen(false);
    cardForm.reset();
    
    toast({
      title: 'Payment method added',
      description: 'Your card has been added successfully.',
    });
  };

  const handleAddBank = async (data: BankFormValues) => {
    // Simulate API call
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'bank',
      isDefault: paymentMethods.length === 0,
      bank: {
        bankName: 'Bank Name', // Would be determined from routing number
        last4: data.accountNumber.slice(-4),
        accountType: data.accountType,
      },
      createdAt: new Date().toISOString(),
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    setIsAddDialogOpen(false);
    bankForm.reset();
    
    toast({
      title: 'Payment method added',
      description: 'Your bank account has been added successfully.',
    });
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId,
    })));
    
    toast({
      title: 'Default payment method updated',
      description: 'Your default payment method has been changed.',
    });
  };

  const handleDelete = () => {
    if (!selectedMethod) return;

    setPaymentMethods(prev => {
      const filtered = prev.filter(m => m.id !== selectedMethod.id);
      // If deleting the default, make the first remaining method default
      if (selectedMethod.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });

    setIsDeleteDialogOpen(false);
    setSelectedMethod(null);
    
    toast({
      title: 'Payment method removed',
      description: 'The payment method has been removed from your account.',
    });
  };

  const getCardBrand = (cardNumber: string): string => {
    const firstDigit = cardNumber[0];
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'Amex';
    return 'Unknown';
  };

  const getCardIcon = (brand: string) => {
    // In a real app, you'd have brand-specific icons
    return <CreditCard className="h-8 w-8" />;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, '0'),
    label: (i + 1).toString().padStart(2, '0'),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your payment methods for faster checkout</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Add a credit/debit card or bank account for payments
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as 'card' | 'bank')}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Credit or Debit Card</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Bank Account (ACH)</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentType === 'card' ? (
                <Form {...cardForm}>
                  <form onSubmit={cardForm.handleSubmit(handleAddCard)} className="space-y-4">
                    <FormField
                      control={cardForm.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="1234 5678 9012 3456"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\s/g, '');
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={cardForm.control}
                      name="cardholderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cardholder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={cardForm.control}
                        name="expiryMonth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Month</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {months.map((month) => (
                                  <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={cardForm.control}
                        name="expiryYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="YYYY" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={cardForm.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input placeholder="123" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={cardForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Card</Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <Form {...bankForm}>
                  <form onSubmit={bankForm.handleSubmit(handleAddBank)} className="space-y-4">
                    <FormField
                      control={bankForm.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="checking">Checking</SelectItem>
                              <SelectItem value="savings">Savings</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="routingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Routing Number</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789" {...field} />
                          </FormControl>
                          <FormDescription>9-digit routing number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Bank Account</Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your payment information is encrypted and securely stored. We never store your CVV or full card numbers.
        </AlertDescription>
      </Alert>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
            <p className="text-muted-foreground mb-4">
              Add a payment method to make checkout faster
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {method.type === 'card' ? (
                      <>
                        {getCardIcon(method.card!.brand)}
                        <div>
                          <p className="font-semibold">
                            {method.card!.brand} •••• {method.card!.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {method.card!.expiryMonth.toString().padStart(2, '0')}/{method.card!.expiryYear}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-8 w-8" />
                        <div>
                          <p className="font-semibold">
                            {method.bank!.bankName} •••• {method.bank!.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {method.bank!.accountType === 'checking' ? 'Checking' : 'Savings'} Account
                          </p>
                        </div>
                      </>
                    )}
                    {method.isDefault && (
                      <Badge variant="secondary" className="ml-2">
                        <Check className="mr-1 h-3 w-3" />
                        Default
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedMethod(method);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}