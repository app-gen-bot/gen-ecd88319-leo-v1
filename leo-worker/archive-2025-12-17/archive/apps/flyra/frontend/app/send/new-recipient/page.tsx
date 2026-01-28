'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Phone, User, MapPin, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Country, MobileMoneyProvider } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const RELATIONSHIPS = [
  { value: 'family', label: 'Family' },
  { value: 'friend', label: 'Friend' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
];

export default function NewRecipientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    countryCode: '+254',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    country: 'KE',
    city: '',
    relationship: '',
    mobileMoneyProvider: '',
  });

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const data = await apiClient.getSupportedCountries();
      setCountries(data);
    } catch (error) {
      toast({
        title: 'Error loading countries',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update country code when country changes
    if (field === 'country') {
      const country = countries.find(c => c.code === value);
      if (country) {
        setFormData(prev => ({ 
          ...prev, 
          countryCode: country.phoneCode,
          mobileMoneyProvider: '', // Reset provider when country changes
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phoneNumber || formData.phoneNumber.length < 7) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.mobileMoneyProvider) {
      newErrors.mobileMoneyProvider = 'Please select a mobile money provider';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const recipient = await apiClient.addRecipient({
        phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        city: formData.city,
        relationship: formData.relationship || undefined,
        mobileMoneyProvider: formData.mobileMoneyProvider,
      });

      // Store the new recipient ID and continue to amount
      sessionStorage.setItem('send_recipient_id', recipient.id);
      
      toast({
        title: 'Recipient added',
        description: `${recipient.firstName} has been added successfully`,
      });

      router.push('/send/amount');
    } catch (error: any) {
      toast({
        title: 'Error adding recipient',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCountry = countries.find(c => c.code === formData.country);
  const mobileMoneyProviders = selectedCountry?.mobileMoneyProviders || [];

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
                onClick={() => router.push('/send')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">Add New Recipient</h1>
              <p className="text-muted-foreground">
                Enter the details of the person you want to send money to
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recipient Information</CardTitle>
                <CardDescription>
                  Make sure the phone number matches their mobile money account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.country} 
                        onValueChange={(value) => handleChange('country', value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.phoneCode}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="712 345 678"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
                        className={`flex-1 ${errors.phoneNumber ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Recipient Name
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          className={errors.firstName ? 'border-destructive' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          className={errors.lastName ? 'border-destructive' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Select 
                          value={formData.country} 
                          onValueChange={(value) => handleChange('country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <span className="flex items-center gap-2">
                                  <span>{country.flag}</span>
                                  <span>{country.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className={errors.city ? 'border-destructive' : ''}
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">{errors.city}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Relationship (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship (Optional)</Label>
                    <Select 
                      value={formData.relationship} 
                      onValueChange={(value) => handleChange('relationship', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIPS.map((rel) => (
                          <SelectItem key={rel.value} value={rel.value}>
                            {rel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mobile Money Provider */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Mobile Money Provider
                    </Label>
                    <Select 
                      value={formData.mobileMoneyProvider} 
                      onValueChange={(value) => handleChange('mobileMoneyProvider', value)}
                    >
                      <SelectTrigger className={errors.mobileMoneyProvider ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {mobileMoneyProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.name}>
                            <div>
                              <p>{provider.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {provider.deliveryTime}
                              </p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mobileMoneyProvider && (
                      <p className="text-sm text-destructive">{errors.mobileMoneyProvider}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/send')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save & Continue'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}