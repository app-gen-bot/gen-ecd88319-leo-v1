'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, DollarSign, Briefcase, Home, Plane, Wallet } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

const INCOME_RANGES = [
  { value: 'under-25k', label: 'Under $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k-75k', label: '$50,000 - $75,000' },
  { value: '75k-100k', label: '$75,000 - $100,000' },
  { value: '100k-150k', label: '$100,000 - $150,000' },
  { value: 'over-150k', label: 'Over $150,000' },
];

const EMPLOYMENT_STATUSES = [
  { value: 'employed', label: 'Employed', icon: Briefcase },
  { value: 'self-employed', label: 'Self-employed', icon: Home },
  { value: 'retired', label: 'Retired', icon: Wallet },
  { value: 'student', label: 'Student', icon: Plane },
  { value: 'unemployed', label: 'Unemployed', icon: DollarSign },
];

const INTENDED_USE = [
  { value: 'family-support', label: 'Family support' },
  { value: 'business-payments', label: 'Business payments' },
  { value: 'savings', label: 'Savings' },
  { value: 'other', label: 'Other' },
];

export default function IncomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    incomeRange: '',
    employmentStatus: '',
    intendedUse: [] as string[],
  });

  // Check if user has completed previous steps
  useEffect(() => {
    const email = sessionStorage.getItem('registration_email');
    const phone = sessionStorage.getItem('registration_phone');
    const kyc = sessionStorage.getItem('registration_kyc');
    if (!email || !phone || !kyc) {
      router.push('/register');
    }
  }, [router]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIntendedUseChange = (value: string, checked: boolean) => {
    if (checked) {
      handleChange('intendedUse', [...formData.intendedUse, value]);
    } else {
      handleChange('intendedUse', formData.intendedUse.filter(item => item !== value));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.incomeRange) {
      newErrors.incomeRange = 'Please select your income range';
    }

    if (!formData.employmentStatus) {
      newErrors.employmentStatus = 'Please select your employment status';
    }

    if (formData.intendedUse.length === 0) {
      newErrors.intendedUse = 'Please select at least one intended use';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Gather all registration data
      const email = sessionStorage.getItem('registration_email');
      const password = sessionStorage.getItem('registration_password');
      const phone = sessionStorage.getItem('registration_phone');
      const kycData = JSON.parse(sessionStorage.getItem('registration_kyc') || '{}');

      const registrationData = {
        email,
        password,
        phoneNumber: phone,
        ...kycData,
        annualIncome: formData.incomeRange,
        employmentStatus: formData.employmentStatus,
        intendedUse: formData.intendedUse,
        address: {
          street: kycData.street,
          apt: kycData.apt,
          city: kycData.city,
          state: kycData.state,
          zipCode: kycData.zipCode,
          country: 'US',
        },
      };

      // Submit registration
      await apiClient.register(registrationData);

      // Clear session storage
      sessionStorage.removeItem('registration_email');
      sessionStorage.removeItem('registration_password');
      sessionStorage.removeItem('registration_phone');
      sessionStorage.removeItem('registration_kyc');

      // Navigate to completion page
      router.push('/register/complete');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Step 4 of 4</span>
            <span className="text-muted-foreground">Income Verification</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/register/kyc')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl">Income Verification</CardTitle>
            </div>
            <CardDescription>
              This helps us understand your financial needs and comply with regulations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Income Range */}
              <div className="space-y-2">
                <Label>Annual Income Range</Label>
                <Select value={formData.incomeRange} onValueChange={(value) => handleChange('incomeRange', value)}>
                  <SelectTrigger className={errors.incomeRange ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.incomeRange && (
                  <p className="text-sm text-destructive">{errors.incomeRange}</p>
                )}
              </div>

              {/* Employment Status */}
              <div className="space-y-2">
                <Label>Employment Status</Label>
                <RadioGroup 
                  value={formData.employmentStatus} 
                  onValueChange={(value) => handleChange('employmentStatus', value)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {EMPLOYMENT_STATUSES.map((status) => {
                      const Icon = status.icon;
                      return (
                        <label
                          key={status.value}
                          htmlFor={status.value}
                          className={cn(
                            'flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent',
                            formData.employmentStatus === status.value ? 'border-primary bg-accent' : ''
                          )}
                        >
                          <RadioGroupItem value={status.value} id={status.value} className="sr-only" />
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{status.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
                {errors.employmentStatus && (
                  <p className="text-sm text-destructive">{errors.employmentStatus}</p>
                )}
              </div>

              {/* Intended Use */}
              <div className="space-y-2">
                <Label>How do you plan to use Flyra? (Select all that apply)</Label>
                <div className="space-y-3">
                  {INTENDED_USE.map((use) => (
                    <div key={use.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={use.value}
                        checked={formData.intendedUse.includes(use.value)}
                        onCheckedChange={(checked) => handleIntendedUseChange(use.value, checked as boolean)}
                      />
                      <label
                        htmlFor={use.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {use.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.intendedUse && (
                  <p className="text-sm text-destructive">{errors.intendedUse}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Completing registration...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}