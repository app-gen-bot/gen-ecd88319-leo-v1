'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneInput } from '@/components/phone-input';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
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
import { Recipient } from '@/types';

const recipientSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(1, 'Please select a country'),
  city: z.string().min(2, 'Please enter a city'),
  mobileMoneyProvider: z.string().optional(),
  relationship: z.enum(['family', 'friend', 'business', 'other']).optional(),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

export default function EditRecipientPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');

  const form = useForm<RecipientFormData>({
    resolver: zodResolver(recipientSchema),
  });

  useEffect(() => {
    loadRecipient();
  }, [id]);

  const loadRecipient = async () => {
    try {
      const data = await apiClient.getRecipient(id as string);
      setRecipient(data);
      setSelectedCountry(data.country);
      
      // Set form values
      form.reset({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        country: data.country,
        city: data.city,
        mobileMoneyProvider: data.mobileMoneyProvider || '',
        relationship: data.relationship,
      });
    } catch (error) {
      toast({
        title: 'Error loading recipient',
        description: 'Please try again',
        variant: 'destructive',
      });
      router.push('/recipients');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RecipientFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.updateRecipient(id as string, data);
      
      toast({
        title: 'Recipient updated',
        description: 'The recipient information has been updated',
      });
      
      router.push(`/recipients/${id}`);
    } catch (error) {
      toast({
        title: 'Error updating recipient',
        description: 'Please check your information and try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProvidersByCountry = (country: string) => {
    const providers: Record<string, string[]> = {
      'KE': ['M-PESA', 'Airtel Money'],
      'NG': ['Paga', 'OPay', 'PalmPay'],
      'GH': ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money'],
      'IN': ['PayTM', 'PhonePe', 'Google Pay', 'Amazon Pay'],
      'ZA': ['FNB eWallet', 'Standard Bank Instant Money'],
      'UG': ['MTN Mobile Money', 'Airtel Money'],
      'TZ': ['M-Pesa', 'Tigo Pesa', 'Airtel Money'],
      'RW': ['MTN Mobile Money', 'Airtel Money'],
    };
    return providers[country] || [];
  };

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-background">
          <DashboardNav />
          <div className="container max-w-2xl py-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  if (!recipient) {
    return null;
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="container max-w-2xl py-6 pb-24 md:pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href={`/recipients/${id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Edit Recipient</h1>
                <p className="text-muted-foreground">
                  Update {recipient.firstName} {recipient.lastName}'s information
                </p>
              </div>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Recipient Information</CardTitle>
                <CardDescription>
                  Update the recipient's details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <PhoneInput
                              value={field.value}
                              onChange={field.onChange}
                              defaultCountry={selectedCountry}
                            />
                          </FormControl>
                          <FormDescription>
                            The recipient's mobile money number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedCountry(value);
                                form.setValue('mobileMoneyProvider', '');
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="KE">🇰🇪 Kenya</SelectItem>
                                <SelectItem value="NG">🇳🇬 Nigeria</SelectItem>
                                <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                                <SelectItem value="IN">🇮🇳 India</SelectItem>
                                <SelectItem value="ZA">🇿🇦 South Africa</SelectItem>
                                <SelectItem value="UG">🇺🇬 Uganda</SelectItem>
                                <SelectItem value="TZ">🇹🇿 Tanzania</SelectItem>
                                <SelectItem value="RW">🇷🇼 Rwanda</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {selectedCountry && (
                      <FormField
                        control={form.control}
                        name="mobileMoneyProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Money Provider</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getProvidersByCountry(selectedCountry).map((provider) => (
                                  <SelectItem key={provider} value={provider}>
                                    {provider}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The recipient's mobile money service
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="family">Family</SelectItem>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-1">Important</p>
                          <p>
                            Changes to the phone number or mobile money provider may affect future transfers. 
                            Make sure the information is correct before saving.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Link href={`/recipients/${id}`} className="flex-1">
                        <Button variant="outline" className="w-full" type="button">
                          Cancel
                        </Button>
                      </Link>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}