'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/layout';

interface FormData {
  companyName: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  jobTitle: string;
  companySize: string;
  currentArchitecture: string;
  mainChallenges: string;
  businessGoals: string;
  timeline: string;
  budget: string;
  hasExistingDocs: boolean;
  priorityAreas: string[];
  additionalInfo: string;
  consent: boolean;
}

const initialFormData: FormData = {
  companyName: '',
  contactName: '',
  email: '',
  phoneNumber: '',
  jobTitle: '',
  companySize: '',
  currentArchitecture: '',
  mainChallenges: '',
  businessGoals: '',
  timeline: '',
  budget: '',
  hasExistingDocs: false,
  priorityAreas: [],
  additionalInfo: '',
  consent: false
};

const companySizes = [
  '1-10 employees',
  '11-50 employees', 
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const timelineOptions = [
  'Immediate (within 1 month)',
  'Short term (1-3 months)',
  'Medium term (3-6 months)',
  'Long term (6+ months)',
  'Exploring options'
];

const budgetRanges = [
  'Less than $25K',
  '$25K - $50K',
  '$50K - $100K',
  '$100K - $250K',
  '$250K - $500K',
  '$500K+',
  'Not determined'
];

const priorityAreaOptions = [
  'Security Architecture',
  'Scalability & Performance', 
  'Integration Strategy',
  'Data Architecture',
  'DevOps & Deployment',
  'Team Structure & Processes',
  'Technology Stack Review',
  'Cost Optimization'
];

const reviewPackages = [
  {
    name: 'Quick Assessment',
    duration: '2-3 hours',
    deliverables: [
      'Architecture overview review',
      'Quick wins identification',
      'High-level recommendations'
    ],
    price: 'Complimentary',
    popular: false
  },
  {
    name: 'Comprehensive Review',
    duration: '1-2 weeks', 
    deliverables: [
      'Detailed architecture analysis',
      'Security assessment',
      'Performance optimization plan',
      'Integration strategy',
      'Executive summary with ROI projections'
    ],
    price: 'Starting at $15K',
    popular: true
  },
  {
    name: 'Strategic Planning',
    duration: '2-4 weeks',
    deliverables: [
      'Everything in Comprehensive',
      'Multi-phase implementation roadmap',
      'Team training plan',
      '3-month success metrics',
      'Ongoing advisory retainer options'
    ],
    price: 'Starting at $35K',
    popular: false
  }
];

export default function ArchitectureReviewPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePriorityAreaToggle = (area: string) => {
    const currentAreas = formData.priorityAreas;
    if (currentAreas.includes(area)) {
      updateFormData('priorityAreas', currentAreas.filter(a => a !== area));
    } else {
      updateFormData('priorityAreas', [...currentAreas, area]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.contactName) newErrors.contactName = 'Contact name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
    if (!formData.companySize) newErrors.companySize = 'Company size is required';
    if (!formData.currentArchitecture) newErrors.currentArchitecture = 'Current architecture description is required';
    if (!formData.mainChallenges) newErrors.mainChallenges = 'Main challenges description is required';
    if (!formData.businessGoals) newErrors.businessGoals = 'Business goals description is required';
    if (!formData.timeline) newErrors.timeline = 'Timeline is required';
    if (formData.priorityAreas.length === 0) newErrors.priorityAreas = 'Please select at least one priority area';
    if (!formData.consent) newErrors.consent = 'You must agree to the terms to proceed';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Architecture review request:', formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-12 text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Request Submitted Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for your architecture review request. Our team will analyze your requirements and contact you within 24 hours to schedule your review.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next:</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Our architect will review your submission</li>
                  <li>• We'll schedule a discovery call within 24 hours</li>
                  <li>• You'll receive a detailed review proposal</li>
                  <li>• Upon approval, we begin the architecture review</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button onClick={() => setSubmitted(false)} className="w-full">
                  Submit Another Request
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <DocumentMagnifyingGlassIcon className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Architecture Review
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get expert analysis of your current architecture and strategic recommendations for leveraging AI-powered development at scale.
            </p>
          </div>

          {/* Review Packages */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Review Packages</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {reviewPackages.map((pkg, index) => (
                <Card key={index} className={`relative ${pkg.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.duration}</CardDescription>
                    <div className="text-2xl font-bold text-blue-600">{pkg.price}</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pkg.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Request Form */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Request Architecture Review</CardTitle>
              <CardDescription>
                Provide details about your current architecture and goals to help us prepare a tailored review.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Company Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        className={errors.companyName ? 'border-red-500' : ''}
                        placeholder="Acme Corporation"
                      />
                      {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="companySize">Company Size *</Label>
                      <select
                        id="companySize"
                        value={formData.companySize}
                        onChange={(e) => updateFormData('companySize', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.companySize ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select company size</option>
                        {companySizes.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                      {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
                    </div>

                    <div>
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => updateFormData('contactName', e.target.value)}
                        className={errors.contactName ? 'border-red-500' : ''}
                        placeholder="John Smith"
                      />
                      {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => updateFormData('jobTitle', e.target.value)}
                        className={errors.jobTitle ? 'border-red-500' : ''}
                        placeholder="CTO, Lead Architect, etc."
                      />
                      {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                        placeholder="john@company.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                        className={errors.phoneNumber ? 'border-red-500' : ''}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                </div>

                {/* Technical Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CpuChipIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Current Architecture
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="currentArchitecture">Current Architecture Overview *</Label>
                      <Textarea
                        id="currentArchitecture"
                        value={formData.currentArchitecture}
                        onChange={(e) => updateFormData('currentArchitecture', e.target.value)}
                        className={errors.currentArchitecture ? 'border-red-500' : ''}
                        placeholder="Describe your current tech stack, deployment model, team structure, and development processes..."
                        rows={4}
                      />
                      {errors.currentArchitecture && <p className="text-red-500 text-sm mt-1">{errors.currentArchitecture}</p>}
                    </div>

                    <div>
                      <Label htmlFor="mainChallenges">Main Challenges *</Label>
                      <Textarea
                        id="mainChallenges"
                        value={formData.mainChallenges}
                        onChange={(e) => updateFormData('mainChallenges', e.target.value)}
                        className={errors.mainChallenges ? 'border-red-500' : ''}
                        placeholder="What are your biggest technical challenges, pain points, or areas where you need improvement?"
                        rows={3}
                      />
                      {errors.mainChallenges && <p className="text-red-500 text-sm mt-1">{errors.mainChallenges}</p>}
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hasExistingDocs"
                        checked={formData.hasExistingDocs}
                        onCheckedChange={(checked) => updateFormData('hasExistingDocs', checked)}
                      />
                      <Label htmlFor="hasExistingDocs" className="text-sm">
                        I have existing architecture documentation to share
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Business Goals */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Business Goals
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="businessGoals">Business Goals & Objectives *</Label>
                      <Textarea
                        id="businessGoals"
                        value={formData.businessGoals}
                        onChange={(e) => updateFormData('businessGoals', e.target.value)}
                        className={errors.businessGoals ? 'border-red-500' : ''}
                        placeholder="What business outcomes are you trying to achieve? How do you measure success?"
                        rows={3}
                      />
                      {errors.businessGoals && <p className="text-red-500 text-sm mt-1">{errors.businessGoals}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="timeline">Timeline *</Label>
                        <select
                          id="timeline"
                          value={formData.timeline}
                          onChange={(e) => updateFormData('timeline', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.timeline ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Select timeline</option>
                          {timelineOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        {errors.timeline && <p className="text-red-500 text-sm mt-1">{errors.timeline}</p>}
                      </div>

                      <div>
                        <Label htmlFor="budget">Budget Range (optional)</Label>
                        <select
                          id="budget"
                          value={formData.budget}
                          onChange={(e) => updateFormData('budget', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select budget range</option>
                          {budgetRanges.map((range) => (
                            <option key={range} value={range}>{range}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority Areas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Priority Areas
                  </h3>
                  <p className="text-gray-600 mb-4">Select areas you'd like us to focus on during the review:</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {priorityAreaOptions.map((area) => (
                      <div key={area} className="flex items-start space-x-3">
                        <Checkbox
                          id={area}
                          checked={formData.priorityAreas.includes(area)}
                          onCheckedChange={() => handlePriorityAreaToggle(area)}
                        />
                        <Label htmlFor={area} className="text-sm">{area}</Label>
                      </div>
                    ))}
                  </div>
                  {errors.priorityAreas && <p className="text-red-500 text-sm mt-2">{errors.priorityAreas}</p>}
                </div>

                {/* Additional Information */}
                <div>
                  <Label htmlFor="additionalInfo">Additional Information (optional)</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => updateFormData('additionalInfo', e.target.value)}
                    placeholder="Any additional context, specific questions, or requirements you'd like us to know about..."
                    rows={3}
                  />
                </div>

                {/* Consent */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => updateFormData('consent', checked)}
                  />
                  <div className="text-sm">
                    <Label htmlFor="consent" className="font-medium">
                      I agree to the Terms of Service and Privacy Policy *
                    </Label>
                    {errors.consent && <p className="text-red-500 mt-1">{errors.consent}</p>}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <DocumentMagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      Request Architecture Review
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}