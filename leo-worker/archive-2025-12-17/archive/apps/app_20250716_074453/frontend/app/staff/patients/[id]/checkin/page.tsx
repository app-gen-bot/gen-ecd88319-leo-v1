'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Mock data - in real app, fetch based on appointment ID
const mockAppointment = {
  id: '1',
  patient: {
    id: '1',
    name: 'Max',
    species: 'Canine',
    breed: 'Golden Retriever',
    owner: {
      name: 'John Doe',
      phone: '(555) 123-4567',
      email: 'john.doe@example.com',
    },
    alerts: [
      { type: 'allergy', message: 'Allergic to chicken' },
      { type: 'behavior', message: 'Anxious during nail trims' },
    ],
  },
  date: '2024-02-15',
  time: '2:30 PM',
  serviceType: 'Wellness Exam',
  provider: 'Dr. Sarah Smith',
  reason: 'Annual checkup and vaccinations',
  estimatedCost: '$150-200',
};

interface CheckInStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'in-progress' | 'completed';
}

export default function PatientCheckInPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Check-in form data
  const [formData, setFormData] = useState({
    // Verify Info
    ownerPresent: true,
    emergencyContactUpdated: false,
    addressVerified: false,
    phoneVerified: false,
    
    // Update Reason
    primaryConcerns: '',
    additionalSymptoms: '',
    symptomsStartDate: '',
    
    // Forms & Consent
    consentSigned: false,
    anesthesiaConsentSigned: false,
    paymentMethodConfirmed: false,
    depositReceived: false,
    
    // Complete
    specialInstructions: '',
    preferredContactMethod: 'phone',
  });

  const steps: CheckInStep[] = [
    {
      id: 'verify',
      title: 'Verify Information',
      description: 'Confirm patient and owner details',
      icon: UserGroupIcon,
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'in-progress' : 'pending',
    },
    {
      id: 'reason',
      title: 'Update Visit Reason',
      description: 'Record current symptoms and concerns',
      icon: ClipboardDocumentCheckIcon,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'in-progress' : 'pending',
    },
    {
      id: 'forms',
      title: 'Forms & Consent',
      description: 'Complete required paperwork',
      icon: DocumentTextIcon,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'in-progress' : 'pending',
    },
    {
      id: 'payment',
      title: 'Payment Method',
      description: 'Confirm payment arrangements',
      icon: CreditCardIcon,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'in-progress' : 'pending',
    },
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete check-in
      toast({
        title: 'Check-In Complete',
        description: `${mockAppointment.patient.name} has been checked in successfully.`,
      });
      router.push(`/staff/appointments/today`);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/staff/appointments/today">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Patient Check-In</h1>
            <p className="text-muted-foreground">
              {mockAppointment.patient.name} • {mockAppointment.time} {mockAppointment.serviceType}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {mockAppointment.patient.alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {mockAppointment.patient.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border flex items-center gap-2 ${
                alert.type === 'allergy'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              }`}
            >
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>
                <strong>{alert.type === 'allergy' ? 'Allergy Alert:' : 'Behavior Note:'}</strong> {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.status === 'completed'
                    ? 'bg-primary border-primary text-primary-foreground'
                    : step.status === 'in-progress'
                    ? 'border-primary'
                    : 'border-muted-foreground'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs mt-2 text-center hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Verify Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{mockAppointment.patient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Species:</span>
                      <span>{mockAppointment.patient.species}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Breed:</span>
                      <span>{mockAppointment.patient.breed}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Owner Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{mockAppointment.patient.owner.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{mockAppointment.patient.owner.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{mockAppointment.patient.owner.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ownerPresent"
                    checked={formData.ownerPresent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, ownerPresent: checked as boolean })
                    }
                  />
                  <Label htmlFor="ownerPresent">Owner is present for appointment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="phoneVerified"
                    checked={formData.phoneVerified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, phoneVerified: checked as boolean })
                    }
                  />
                  <Label htmlFor="phoneVerified">Phone number verified</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addressVerified"
                    checked={formData.addressVerified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, addressVerified: checked as boolean })
                    }
                  />
                  <Label htmlFor="addressVerified">Address verified</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergencyContactUpdated"
                    checked={formData.emergencyContactUpdated}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, emergencyContactUpdated: checked as boolean })
                    }
                  />
                  <Label htmlFor="emergencyContactUpdated">Emergency contact updated</Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Update Visit Reason */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Original reason for visit:</strong> {mockAppointment.reason}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryConcerns">Primary Concerns Today</Label>
                  <Textarea
                    id="primaryConcerns"
                    value={formData.primaryConcerns}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryConcerns: e.target.value })
                    }
                    placeholder="Describe the main reason for today's visit..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalSymptoms">Additional Symptoms or Changes</Label>
                  <Textarea
                    id="additionalSymptoms"
                    value={formData.additionalSymptoms}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalSymptoms: e.target.value })
                    }
                    placeholder="Any new symptoms or behavioral changes..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="symptomsStartDate">When did symptoms start?</Label>
                  <Input
                    id="symptomsStartDate"
                    type="date"
                    value={formData.symptomsStartDate}
                    onChange={(e) =>
                      setFormData({ ...formData, symptomsStartDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Forms & Consent */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consentSigned"
                      checked={formData.consentSigned}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, consentSigned: checked as boolean })
                      }
                    />
                    <div>
                      <Label htmlFor="consentSigned" className="font-semibold">
                        General Treatment Consent
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Owner consents to examination and treatment as deemed necessary by the veterinarian
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="anesthesiaConsentSigned"
                      checked={formData.anesthesiaConsentSigned}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, anesthesiaConsentSigned: checked as boolean })
                      }
                    />
                    <div>
                      <Label htmlFor="anesthesiaConsentSigned" className="font-semibold">
                        Anesthesia Consent (if applicable)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Owner understands risks and consents to anesthesia if required for procedures
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Digital signatures can be collected on the tablet at the front desk
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Payment Method */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Estimated cost for today's visit:</strong> {mockAppointment.estimatedCost}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Payment Method</Label>
                  <RadioGroup defaultValue="card" className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">Credit/Debit Card on File</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="check" id="check" />
                      <Label htmlFor="check">Check</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="insurance" id="insurance" />
                      <Label htmlFor="insurance">Pet Insurance</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="paymentMethodConfirmed"
                      checked={formData.paymentMethodConfirmed}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, paymentMethodConfirmed: checked as boolean })
                      }
                    />
                    <Label htmlFor="paymentMethodConfirmed">Payment method confirmed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="depositReceived"
                      checked={formData.depositReceived}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, depositReceived: checked as boolean })
                      }
                    />
                    <Label htmlFor="depositReceived">
                      Deposit received (if required for procedure)
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) =>
                      setFormData({ ...formData, specialInstructions: e.target.value })
                    }
                    placeholder="Any special pickup arrangements or instructions..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Navigation Buttons */}
        <div className="px-6 pb-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNextStep}>
            {currentStep === steps.length - 1 ? (
              <>
                Complete Check-In
                <CheckCircleIcon className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next Step
                <ArrowLeftIcon className="h-4 w-4 ml-2 rotate-180" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Appointment Summary Sidebar */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Appointment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span>{mockAppointment.date} at {mockAppointment.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span>{mockAppointment.serviceType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provider:</span>
            <span>{mockAppointment.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. Duration:</span>
            <span>30 minutes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}