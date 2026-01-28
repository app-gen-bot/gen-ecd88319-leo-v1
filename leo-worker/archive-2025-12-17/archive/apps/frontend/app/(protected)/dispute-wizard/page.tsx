'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertCircle,
  ArrowRight,
  FileText,
  Home,
  DollarSign,
  Wrench,
  Shield,
  Users,
  Zap,
  Info,
  CheckCircle
} from 'lucide-react';

interface DisputeType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  estimatedTime: string;
  commonIssues: string[];
}

const disputeTypes: DisputeType[] = [
  {
    id: 'repairs',
    title: 'Repairs & Maintenance',
    description: 'Issues with getting your landlord to fix problems',
    icon: Wrench,
    estimatedTime: '15-20 minutes',
    commonIssues: [
      'Broken appliances',
      'Plumbing issues',
      'Heating/cooling problems',
      'Pest infestations',
      'Electrical issues'
    ]
  },
  {
    id: 'deposit',
    title: 'Security Deposit',
    description: 'Problems getting your deposit back or unfair deductions',
    icon: DollarSign,
    estimatedTime: '20-25 minutes',
    commonIssues: [
      'Deposit not returned',
      'Excessive deductions',
      'No itemized list',
      'Normal wear and tear charges',
      'Missing interest'
    ]
  },
  {
    id: 'eviction',
    title: 'Eviction Defense',
    description: 'Facing eviction or received an eviction notice',
    icon: Home,
    estimatedTime: '25-30 minutes',
    commonIssues: [
      'Invalid notice',
      'Retaliation',
      'Discrimination',
      'COVID protections',
      'Improper procedure'
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy & Entry',
    description: 'Landlord entering without proper notice',
    icon: Shield,
    estimatedTime: '10-15 minutes',
    commonIssues: [
      'No 24-hour notice',
      'Excessive inspections',
      'Emergency abuse',
      'Unauthorized entry',
      'Harassment'
    ]
  },
  {
    id: 'discrimination',
    title: 'Discrimination',
    description: 'Unfair treatment based on protected characteristics',
    icon: Users,
    estimatedTime: '20-25 minutes',
    commonIssues: [
      'Denied accommodations',
      'Different treatment',
      'Harassment',
      'Unfair rules',
      'Retaliation'
    ]
  },
  {
    id: 'utilities',
    title: 'Utilities & Services',
    description: 'Issues with utility shutoffs or billing',
    icon: Zap,
    estimatedTime: '15-20 minutes',
    commonIssues: [
      'Illegal shutoffs',
      'Billing disputes',
      'Shared utilities',
      'Service interruptions',
      'Overcharging'
    ]
  }
];

export default function DisputeWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('');
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const handleStartWizard = () => {
    if (!selectedType) {
      toast({
        title: 'Please select a dispute type',
        description: 'Choose the type of issue you\'re facing to continue.',
        variant: 'destructive'
      });
      return;
    }

    router.push(`/dispute-wizard/step/1?type=${selectedType}`);
  };

  const selectedDispute = disputeTypes.find(d => d.id === selectedType);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Dispute Resolution Wizard</h1>
          <p className="text-muted-foreground mt-2">
            Step-by-step guidance to resolve issues with your landlord
          </p>
        </div>

        {/* How it works */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How the Dispute Wizard Works</AlertTitle>
          <AlertDescription>
            <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
              <li>Select your dispute type below</li>
              <li>Answer questions about your specific situation</li>
              <li>Upload any relevant evidence or documentation</li>
              <li>Receive customized forms and action steps</li>
              <li>Track your dispute progress</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Dispute Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>What type of issue are you facing?</CardTitle>
            <CardDescription>
              Select the category that best matches your dispute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedType} onValueChange={setSelectedType}>
              <div className="grid gap-4">
                {disputeTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                      selectedType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-start space-x-4">
                      <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                      <div className="flex-1 space-y-2">
                        <Label
                          htmlFor={type.id}
                          className="flex items-center space-x-2 text-base font-medium cursor-pointer"
                        >
                          <type.icon className="h-5 w-5" />
                          <span>{type.title}</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Estimated time: {type.estimatedTime}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedType(expandedType === type.id ? null : type.id);
                            }}
                          >
                            {expandedType === type.id ? 'Hide' : 'Show'} common issues
                          </Button>
                        </div>
                        {expandedType === type.id && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-md">
                            <p className="text-sm font-medium mb-2">Common issues include:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {type.commonIssues.map((issue, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-600" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Selected Type Details */}
        {selectedDispute && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <selectedDispute.icon className="h-5 w-5" />
                <span>{selectedDispute.title} Selected</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> This wizard will help you understand your rights and create necessary documents. 
                    For urgent matters or if you're facing immediate eviction, consider consulting with a lawyer.
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Ready to resolve your {selectedDispute.title.toLowerCase()} issue?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The wizard will take approximately {selectedDispute.estimatedTime}
                    </p>
                  </div>
                  <Button onClick={handleStartWizard} size="lg">
                    Start Wizard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Resources */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Before You Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Gather your documents</p>
                  <p className="text-muted-foreground">
                    Have your lease agreement, notices, photos, and any correspondence ready
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Know important dates</p>
                  <p className="text-muted-foreground">
                    When did the issue start? When did you notify your landlord?
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Be thorough and honest</p>
                  <p className="text-muted-foreground">
                    Provide accurate information for the best guidance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}