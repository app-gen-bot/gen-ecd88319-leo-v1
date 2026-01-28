'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { format, differenceInMonths, differenceInDays } from 'date-fns';
import {
  DollarSign,
  Calendar as CalendarIcon,
  Calculator,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  Info,
  TrendingUp,
  CheckCircle,
  Home,
  FileText,
  Clock
} from 'lucide-react';

interface Deduction {
  id: string;
  description: string;
  amount: number;
  category: 'cleaning' | 'damage' | 'unpaid-rent' | 'other';
  disputed: boolean;
}

interface DepositData {
  amount: number;
  moveInDate: Date | undefined;
  moveOutDate: Date | undefined;
  propertyAddress: string;
  landlordName: string;
  interestRate: number;
  deductions: Deduction[];
}

const CALIFORNIA_INTEREST_RATE = 0.005; // 0.5% per year for security deposits

export default function SecurityDepositPage() {
  const { toast } = useToast();
  const [depositData, setDepositData] = useState<DepositData>({
    amount: 0,
    moveInDate: undefined,
    moveOutDate: undefined,
    propertyAddress: '',
    landlordName: '',
    interestRate: CALIFORNIA_INTEREST_RATE,
    deductions: []
  });

  const calculateInterest = () => {
    if (!depositData.moveInDate || !depositData.moveOutDate || depositData.amount === 0) {
      return 0;
    }

    const months = differenceInMonths(depositData.moveOutDate, depositData.moveInDate);
    const yearlyInterest = depositData.amount * depositData.interestRate;
    const totalInterest = (yearlyInterest / 12) * months;
    
    return Math.round(totalInterest * 100) / 100;
  };

  const calculateDaysOverdue = () => {
    if (!depositData.moveOutDate) return 0;
    const dueDate = new Date(depositData.moveOutDate);
    dueDate.setDate(dueDate.getDate() + 21); // California law: 21 days
    const today = new Date();
    return Math.max(0, differenceInDays(today, dueDate));
  };

  const totalDeductions = depositData.deductions.reduce((sum, d) => sum + d.amount, 0);
  const interest = calculateInterest();
  const totalOwed = depositData.amount + interest - totalDeductions;
  const daysOverdue = calculateDaysOverdue();

  const addDeduction = () => {
    const newDeduction: Deduction = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      category: 'other',
      disputed: false
    };
    setDepositData({
      ...depositData,
      deductions: [...depositData.deductions, newDeduction]
    });
  };

  const updateDeduction = (id: string, updates: Partial<Deduction>) => {
    setDepositData({
      ...depositData,
      deductions: depositData.deductions.map(d => 
        d.id === id ? { ...d, ...updates } : d
      )
    });
  };

  const removeDeduction = (id: string) => {
    setDepositData({
      ...depositData,
      deductions: depositData.deductions.filter(d => d.id !== id)
    });
  };

  const exportReport = () => {
    const report = `Security Deposit Report
Generated: ${format(new Date(), 'PPP')}

Property: ${depositData.propertyAddress}
Landlord: ${depositData.landlordName}

Deposit Details:
- Original Amount: $${depositData.amount}
- Move-in Date: ${depositData.moveInDate ? format(depositData.moveInDate, 'PPP') : 'Not set'}
- Move-out Date: ${depositData.moveOutDate ? format(depositData.moveOutDate, 'PPP') : 'Not set'}
- Interest Earned: $${interest}

Deductions:
${depositData.deductions.map(d => `- ${d.description}: $${d.amount} (${d.category}${d.disputed ? ' - DISPUTED' : ''})`).join('\n')}

Total Deductions: $${totalDeductions}
Total Owed: $${totalOwed}
${daysOverdue > 0 ? `\nOVERDUE BY ${daysOverdue} DAYS` : ''}`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-deposit-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();

    toast({
      title: 'Report exported',
      description: 'Check your downloads folder.',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Security Deposit Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Calculate interest, track deductions, and know your rights
          </p>
        </div>

        {/* California Law Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>California Security Deposit Law</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Landlords must return deposits within 21 days of move-out</li>
              <li>• Interest may be owed on deposits held for 1+ years</li>
              <li>• Deductions allowed only for: unpaid rent, cleaning beyond normal wear, and damage beyond normal wear</li>
              <li>• Landlords must provide itemized statement for any deductions</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Information</CardTitle>
                <CardDescription>Enter your security deposit details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Deposit Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="1500"
                      value={depositData.amount || ''}
                      onChange={(e) => setDepositData({ ...depositData, amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="landlord">Landlord Name</Label>
                    <Input
                      id="landlord"
                      placeholder="John Smith or ABC Property Management"
                      value={depositData.landlordName}
                      onChange={(e) => setDepositData({ ...depositData, landlordName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <Home className="h-4 w-4 inline mr-1" />
                    Property Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, Apt 4B, Los Angeles, CA 90001"
                    value={depositData.propertyAddress}
                    onChange={(e) => setDepositData({ ...depositData, propertyAddress: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Move-in Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !depositData.moveInDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {depositData.moveInDate ? (
                            format(depositData.moveInDate, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={depositData.moveInDate}
                          onSelect={(date) => setDepositData({ ...depositData, moveInDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Move-out Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !depositData.moveOutDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {depositData.moveOutDate ? (
                            format(depositData.moveOutDate, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={depositData.moveOutDate}
                          onSelect={(date) => setDepositData({ ...depositData, moveOutDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deductions</CardTitle>
                <CardDescription>Track any deductions your landlord is claiming</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {depositData.deductions.map((deduction) => (
                    <div key={deduction.id} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="md:col-span-2">
                          <Input
                            placeholder="Description"
                            value={deduction.description}
                            onChange={(e) => updateDeduction(deduction.id, { description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={deduction.amount || ''}
                            onChange={(e) => updateDeduction(deduction.id, { amount: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={deduction.category}
                            onChange={(e) => updateDeduction(deduction.id, { category: e.target.value as Deduction['category'] })}
                          >
                            <option value="cleaning">Cleaning</option>
                            <option value="damage">Damage</option>
                            <option value="unpaid-rent">Unpaid Rent</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <Button
                        variant={deduction.disputed ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateDeduction(deduction.id, { disputed: !deduction.disputed })}
                      >
                        {deduction.disputed ? 'Disputed' : 'Dispute'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDeduction(deduction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addDeduction}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deduction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculations Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calculations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Original Deposit</span>
                    <span className="font-medium">${depositData.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Interest Earned
                    </span>
                    <span className="font-medium text-green-600">+${interest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Deductions</span>
                    <span className="font-medium text-red-600">-${totalDeductions.toFixed(2)}</span>
                  </div>
                  {depositData.deductions.filter(d => d.disputed).length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Disputed Amount</span>
                      <span className="font-medium text-amber-600">
                        ${depositData.deductions
                          .filter(d => d.disputed)
                          .reduce((sum, d) => sum + d.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Owed</span>
                      <span className="text-xl font-bold">${totalOwed.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {daysOverdue > 0 && (
                  <Alert className="border-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Overdue by {daysOverdue} days!</strong>
                      <br />
                      Your landlord may owe penalties for late return.
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={exportReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {depositData.moveOutDate && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Move-out</p>
                          <p className="text-muted-foreground">
                            {format(depositData.moveOutDate, 'PPP')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Return Due</p>
                          <p className="text-muted-foreground">
                            {format(new Date(depositData.moveOutDate.getTime() + 21 * 24 * 60 * 60 * 1000), 'PPP')}
                          </p>
                        </div>
                      </div>
                      {daysOverdue > 0 && (
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                          <div>
                            <p className="font-medium text-destructive">Overdue</p>
                            <p className="text-muted-foreground">
                              {daysOverdue} days past due date
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="rights" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="rights">Your Rights</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="rights">
                <Card>
                  <CardContent className="pt-6 space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <p>21-day return deadline is strict</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <p>Bad faith retention = 2x damages</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <p>Normal wear and tear not deductible</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <p>Right to pre-move inspection</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="actions">
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Demand Letter
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Penalties
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      File Small Claims
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}