/**
 * WizardTemplate - Template for multi-step forms and workflow processes
 * 
 * This template provides:
 * - Multi-step form navigation
 * - Progress tracking with visual indicators
 * - Form validation at each step
 * - Data persistence across steps
 * - Dynamic step configuration
 */

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  User,
  Mail,
  CreditCard,
  FileText
} from 'lucide-react';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

interface WizardProps {
  title?: string;
  description?: string;
  submitEndpoint?: string;
  onComplete?: (data: any) => void;
}

export function WizardPage({ 
  title = 'Multi-Step Process',
  description = 'Complete the following steps to finish your request.',
  submitEndpoint = 'submissions',
  onComplete
}: WizardProps = {}) {
  // Define wizard steps (customize based on your needs)
  const [steps, setSteps] = useState<WizardStep[]>([
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic details about you',
      icon: User,
      completed: false
    },
    {
      id: 'contact',
      title: 'Contact Details',
      description: 'How we can reach you',
      icon: Mail,
      completed: false
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Your preferences and requirements',
      icon: FileText,
      completed: false
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review your information',
      icon: CheckCircle,
      completed: false
    }
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    
    // Contact Details
    email: '',
    phone: '',
    address: '',
    
    // Preferences
    preferences: '',
    notifications: true,
    newsletter: false,
    
    // Additional fields can be added based on your needs
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Submission mutation
  const submitMutation = useMutation({
    mutationFn: (data: any) => {
      const apiMethod = (api as any)[submitEndpoint]?.create;
      if (apiMethod) {
        return apiMethod(data);
      }
      // Fallback for demonstration
      return new Promise((resolve) => {
        setTimeout(() => resolve({ id: Date.now(), ...data }), 1000);
      });
    },
    onSuccess: (data) => {
      // Mark final step as completed
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        completed: index <= steps.length - 1
      })));
      
      if (onComplete) {
        onComplete(data);
      } else {
        // Default redirect to success page or dashboard
        window.location.href = '/dashboard';
      }
    },
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepIndex) {
      case 0: // Personal Information
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        break;

      case 1: // Contact Details
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        break;

      case 2: // Preferences
        if (!formData.preferences.trim()) {
          newErrors.preferences = 'Please provide your preferences';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      // Mark current step as completed
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        completed: index === currentStep ? true : step.completed
      })));
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    // Allow going to completed steps or the next step
    const canGoToStep = stepIndex <= currentStep || steps[stepIndex - 1]?.completed;
    if (canGoToStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      submitMutation.mutate(formData);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
        );

      case 1: // Contact Details
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Enter your full address"
                rows={3}
              />
            </div>
          </div>
        );

      case 2: // Preferences
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="preferences">Your Preferences</Label>
              <Textarea
                id="preferences"
                value={formData.preferences}
                onChange={(e) => updateFormData('preferences', e.target.value)}
                placeholder="Tell us about your preferences and requirements..."
                rows={4}
              />
              {errors.preferences && (
                <p className="text-sm text-red-600 mt-1">{errors.preferences}</p>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={formData.notifications}
                  onChange={(e) => updateFormData('notifications', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="notifications">
                  Enable email notifications
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={(e) => updateFormData('newsletter', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="newsletter">
                  Subscribe to newsletter
                </Label>
              </div>
            </div>
          </div>
        );

      case 3: // Review & Submit
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Review Your Information</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                    {formData.dateOfBirth && (
                      <p><strong>Date of Birth:</strong> {new Date(formData.dateOfBirth).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Phone:</strong> {formData.phone}</p>
                    {formData.address && (
                      <p><strong>Address:</strong> {formData.address}</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Preferences</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Preferences:</strong> {formData.preferences}</p>
                    <p><strong>Notifications:</strong> {formData.notifications ? 'Enabled' : 'Disabled'}</p>
                    <p><strong>Newsletter:</strong> {formData.newsletter ? 'Subscribed' : 'Not subscribed'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {submitMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {submitMutation.error instanceof Error 
                    ? submitMutation.error.message 
                    : 'Submission failed. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-900">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = step.completed;
              const isAccessible = index <= currentStep || isCompleted;

              return (
                <React.Fragment key={step.id}>
                  <div 
                    className={`flex flex-col items-center cursor-pointer ${
                      isAccessible ? 'text-blue-600' : 'text-gray-400'
                    }`}
                    onClick={() => isAccessible && goToStep(index)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : ''
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div 
                      className={`flex-1 h-px mx-4 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {React.createElement(currentStepData.icon, { className: "h-5 w-5" })}
              {currentStepData.title}
            </CardTitle>
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}