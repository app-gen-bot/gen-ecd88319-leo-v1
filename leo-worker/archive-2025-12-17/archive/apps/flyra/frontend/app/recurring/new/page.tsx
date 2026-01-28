'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Calendar as CalendarIcon,
  DollarSign,
  RefreshCw,
  Info,
  Search,
  Check
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Recipient } from '@/types';
import { formatCurrency, formatDate, formatPhoneNumber, getInitials } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const recurringTransferSchema = z.object({
  recipientId: z.string().min(1, 'Please select a recipient'),
  amount: z.number()
    .min(1, 'Amount must be at least $1')
    .max(2999, 'Amount cannot exceed $2,999'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'custom']),
  startDate: z.date().min(new Date(), 'Start date must be today or later'),
  hasEndDate: z.boolean(),
  endDate: z.date().optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(32).optional(), // 32 = last day of month
  customInterval: z.number().min(1).max(365).optional(),
  customUnit: z.enum(['days', 'weeks', 'months']).optional(),
}).refine((data) => {
  if (data.hasEndDate && !data.endDate) {
    return false;
  }
  if (data.hasEndDate && data.endDate && data.endDate <= data.startDate) {
    return false;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine((data) => {
  if (data.frequency === 'custom' && (!data.customInterval || !data.customUnit)) {
    return false;
  }
  return true;
}, {
  message: 'Please specify custom frequency',
  path: ['customInterval'],
});

type RecurringTransferFormData = z.infer<typeof recurringTransferSchema>;

export default function CreateRecurringTransferPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<RecurringTransferFormData>({
    resolver: zodResolver(recurringTransferSchema),
    defaultValues: {
      recipientId: '',
      amount: 100,
      frequency: 'monthly',
      startDate: new Date(),
      hasEndDate: false,
      dayOfWeek: new Date().getDay(),
      dayOfMonth: new Date().getDate(),
      customInterval: 1,
      customUnit: 'months',
    },
  });

  const watchFrequency = form.watch('frequency');
  const watchHasEndDate = form.watch('hasEndDate');
  const watchStartDate = form.watch('startDate');
  const selectedRecipientId = form.watch('recipientId');

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      const data = await apiClient.getRecipients();
      setRecipients(data);
    } catch (error) {
      toast({
        title: 'Error loading recipients',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  const filteredRecipients = recipients.filter(r => 
    r.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phoneNumber.includes(searchQuery)
  );

  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);

  const calculateNextPaymentDates = () => {
    const startDate = watchStartDate;
    const frequency = watchFrequency;
    const dates = [startDate];

    for (let i = 1; i < 5; i++) {
      let nextDate = new Date(startDate);
      
      switch (frequency) {
        case 'weekly':
          nextDate = addWeeks(startDate, i);
          break;
        case 'biweekly':
          nextDate = addWeeks(startDate, i * 2);
          break;
        case 'monthly':
          nextDate = addMonths(startDate, i);
          break;
        case 'custom':
          const interval = form.getValues('customInterval') || 1;
          const unit = form.getValues('customUnit') || 'days';
          if (unit === 'days') {
            nextDate = addDays(startDate, i * interval);
          } else if (unit === 'weeks') {
            nextDate = addWeeks(startDate, i * interval);
          } else {
            nextDate = addMonths(startDate, i * interval);
          }
          break;
      }
      
      dates.push(nextDate);
    }
    
    return dates;
  };

  const onSubmit = async (data: RecurringTransferFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        recipientId: data.recipientId,
        amount: data.amount,
        frequency: data.frequency,
        startDate: data.startDate.toISOString(),
        endDate: data.hasEndDate && data.endDate ? data.endDate.toISOString() : undefined,
        dayOfWeek: data.frequency === 'weekly' ? data.dayOfWeek : undefined,
        dayOfMonth: data.frequency === 'monthly' ? data.dayOfMonth : undefined,
        customFrequency: data.frequency === 'custom' ? {
          interval: data.customInterval!,
          unit: data.customUnit!,
        } : undefined,
      };

      const result = await apiClient.createRecurringTransfer(payload);
      
      toast({
        title: 'Recurring transfer created',
        description: 'Your automatic transfer has been set up',
      });
      
      router.push(`/recurring/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error creating recurring transfer',
        description: 'Please check your information and try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextPaymentDates = calculateNextPaymentDates();
  const estimatedMonthlyAmount = (() => {
    const amount = form.watch('amount') || 0;
    switch (watchFrequency) {
      case 'weekly':
        return amount * 4.33;
      case 'biweekly':
        return amount * 2.17;
      case 'monthly':
        return amount;
      case 'custom':
        const interval = form.getValues('customInterval') || 1;
        const unit = form.getValues('customUnit') || 'days';
        if (unit === 'days') {
          return (amount * 30) / interval;
        } else if (unit === 'weeks') {
          return (amount * 4.33) / interval;
        } else {
          return amount / interval;
        }
      default:
        return amount;
    }
  })();

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container max-w-4xl py-6 pb-24 md:pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/recurring">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Set Up Recurring Transfer</h1>
                <p className="text-muted-foreground">
                  Create automatic transfers that repeat on a schedule
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-center space-x-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                1
              </div>
              <div className={cn("flex-1 h-1", currentStep >= 2 ? "bg-primary" : "bg-muted")} />
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                2
              </div>
              <div className={cn("flex-1 h-1", currentStep >= 3 ? "bg-primary" : "bg-muted")} />
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                3
              </div>
              <div className={cn("flex-1 h-1", currentStep >= 4 ? "bg-primary" : "bg-muted")} />
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= 4 ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                4
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Select Recipient */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Recipient</CardTitle>
                      <CardDescription>
                        Choose who you want to send money to regularly
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search recipients..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="recipientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="space-y-2"
                              >
                                {filteredRecipients.map((recipient) => (
                                  <label
                                    key={recipient.id}
                                    htmlFor={`recipient-${recipient.id}`}
                                    className={cn(
                                      "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                                      field.value === recipient.id 
                                        ? "border-primary bg-primary/5" 
                                        : "hover:bg-accent"
                                    )}
                                  >
                                    <RadioGroupItem value={recipient.id} id={`recipient-${recipient.id}`} />
                                    <Avatar>
                                      <AvatarFallback>
                                        {getInitials(`${recipient.firstName} ${recipient.lastName}`)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {recipient.firstName} {recipient.lastName}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatPhoneNumber(recipient.phoneNumber)} • {recipient.city}
                                      </p>
                                    </div>
                                    {recipient.isFavorite && (
                                      <span className="text-yellow-500">★</span>
                                    )}
                                  </label>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {filteredRecipients.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">No recipients found</p>
                          <Link href="/recipients/add">
                            <Button variant="outline">Add New Recipient</Button>
                          </Link>
                        </div>
                      )}

                      <Button
                        type="button"
                        className="w-full"
                        disabled={!selectedRecipientId}
                        onClick={() => setCurrentStep(2)}
                      >
                        Continue
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Set Amount and Frequency */}
                {currentStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Amount & Frequency</CardTitle>
                      <CardDescription>
                        How much and how often do you want to send?
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                  type="number"
                                  placeholder="100"
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Between $1 and $2,999 per transfer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchFrequency === 'weekly' && (
                        <FormField
                          control={form.control}
                          name="dayOfWeek"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Day of Week</FormLabel>
                              <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0">Sunday</SelectItem>
                                  <SelectItem value="1">Monday</SelectItem>
                                  <SelectItem value="2">Tuesday</SelectItem>
                                  <SelectItem value="3">Wednesday</SelectItem>
                                  <SelectItem value="4">Thursday</SelectItem>
                                  <SelectItem value="5">Friday</SelectItem>
                                  <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {watchFrequency === 'monthly' && (
                        <FormField
                          control={form.control}
                          name="dayOfMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Day of Month</FormLabel>
                              <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <SelectItem key={day} value={day.toString()}>
                                      {day}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="32">Last day of month</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {watchFrequency === 'custom' && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="customInterval"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Every</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="customUnit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="days">Days</SelectItem>
                                    <SelectItem value="weeks">Weeks</SelectItem>
                                    <SelectItem value="months">Months</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm font-medium mb-1">Estimated Monthly</p>
                        <p className="text-2xl font-bold">{formatCurrency(estimatedMonthlyAmount)}</p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          className="flex-1"
                          onClick={() => setCurrentStep(3)}
                        >
                          Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Choose Start Date */}
                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Schedule</CardTitle>
                      <CardDescription>
                        When should the transfers start and end?
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              The first transfer will be sent on this date
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hasEndDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Set End Date</FormLabel>
                              <FormDescription>
                                Stop transfers after a specific date
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {watchHasEndDate && (
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date <= watchStartDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                The last transfer will be sent on or before this date
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">Next Payment Dates</p>
                        <div className="space-y-1">
                          {nextPaymentDates.slice(0, 3).map((date, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              {formatDate(date)} {index === 0 && '(First payment)'}
                            </p>
                          ))}
                          <p className="text-sm text-muted-foreground">...</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(2)}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          className="flex-1"
                          onClick={() => setCurrentStep(4)}
                        >
                          Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Review and Confirm */}
                {currentStep === 4 && selectedRecipient && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Review & Confirm</CardTitle>
                      <CardDescription>
                        Please review your recurring transfer details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground">Recipient</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-sm">
                                {getInitials(`${selectedRecipient.firstName} ${selectedRecipient.lastName}`)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {selectedRecipient.firstName} {selectedRecipient.lastName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-semibold text-lg">
                            {formatCurrency(form.watch('amount') || 0)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground">Frequency</span>
                          <span className="font-medium capitalize">
                            {(() => {
                              switch (watchFrequency) {
                                case 'weekly':
                                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                  return `Every ${days[form.watch('dayOfWeek') || 0]}`;
                                case 'biweekly':
                                  return 'Every 2 weeks';
                                case 'monthly':
                                  const day = form.watch('dayOfMonth');
                                  if (day === 32) return 'Last day of month';
                                  return `${day}${['th', 'st', 'nd', 'rd'][day! % 10 > 3 ? 0 : day! % 10]} of each month`;
                                case 'custom':
                                  return `Every ${form.watch('customInterval')} ${form.watch('customUnit')}`;
                                default:
                                  return watchFrequency;
                              }
                            })()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground">Start Date</span>
                          <span className="font-medium">
                            {formatDate(watchStartDate)}
                          </span>
                        </div>

                        {watchHasEndDate && form.watch('endDate') && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-muted-foreground">End Date</span>
                            <span className="font-medium">
                              {formatDate(form.watch('endDate')!)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between py-2 border-t pt-4">
                          <span className="text-muted-foreground">Estimated Monthly</span>
                          <span className="font-semibold text-lg">
                            {formatCurrency(estimatedMonthlyAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex gap-3">
                          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-1">Important</p>
                            <p>
                              Transfers will be processed automatically on the scheduled dates. 
                              Make sure you maintain sufficient balance in your Flyra wallet.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(3)}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          {isSubmitting ? (
                            <>Creating...</>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Create Recurring Transfer
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </Form>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}