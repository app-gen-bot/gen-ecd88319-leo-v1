"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon, CalendarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/layout'

interface DemoForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  title: string
  companySize: string
  industry: string
  useCase: string
  timeline: string
  currentSolution: string
  specificInterests: string[]
  preferredTime: string
  timeZone: string
  demoType: string
  message: string
}

interface TimeSlot {
  id: string
  date: string
  time: string
  available: boolean
  duration: string
}

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' }
]

const industries = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' }
]

const useCases = [
  { value: 'internal-tools', label: 'Internal Business Tools' },
  { value: 'customer-apps', label: 'Customer-Facing Applications' },
  { value: 'automation', label: 'Process Automation' },
  { value: 'data-analytics', label: 'Data & Analytics' },
  { value: 'integration', label: 'System Integration' },
  { value: 'modernization', label: 'Legacy Modernization' },
  { value: 'other', label: 'Other' }
]

const timelines = [
  { value: 'immediate', label: 'Immediate (< 1 month)' },
  { value: 'short-term', label: 'Short term (1-3 months)' },
  { value: 'medium-term', label: 'Medium term (3-6 months)' },
  { value: 'long-term', label: 'Long term (6+ months)' },
  { value: 'exploring', label: 'Just exploring' }
]

const demoTypes = [
  { value: 'general', label: 'General Product Demo (30 min)', description: 'Overview of Happy Llama platform and capabilities' },
  { value: 'technical', label: 'Technical Deep Dive (60 min)', description: 'Detailed technical discussion and architecture review' },
  { value: 'custom', label: 'Custom Use Case Demo (45 min)', description: 'Tailored demo focused on your specific requirements' }
]

const specificInterests = [
  'AI-powered development',
  'Enterprise security',
  'Scalability & performance',
  'Integration capabilities',
  'Compliance features',
  'Pricing & licensing',
  'Implementation timeline',
  'Support & training'
]

const availableSlots: TimeSlot[] = [
  { id: '1', date: '2025-01-28', time: '10:00 AM PST', available: true, duration: '30 min' },
  { id: '2', date: '2025-01-28', time: '2:00 PM PST', available: true, duration: '30 min' },
  { id: '3', date: '2025-01-28', time: '4:00 PM PST', available: false, duration: '30 min' },
  { id: '4', date: '2025-01-29', time: '9:00 AM PST', available: true, duration: '30 min' },
  { id: '5', date: '2025-01-29', time: '11:00 AM PST', available: true, duration: '30 min' },
  { id: '6', date: '2025-01-29', time: '3:00 PM PST', available: true, duration: '30 min' },
  { id: '7', date: '2025-01-30', time: '10:00 AM PST', available: true, duration: '30 min' },
  { id: '8', date: '2025-01-30', time: '1:00 PM PST', available: false, duration: '30 min' },
  { id: '9', date: '2025-01-30', time: '3:00 PM PST', available: true, duration: '30 min' }
]

export default function DemoRequestPage() {
  const [formData, setFormData] = useState<DemoForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    companySize: '',
    industry: '',
    useCase: '',
    timeline: '',
    currentSolution: '',
    specificInterests: [],
    preferredTime: '',
    timeZone: 'PST',
    demoType: 'general',
    message: ''
  })
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof DemoForm, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInterestToggle = (interest: string) => {
    const currentInterests = formData.specificInterests
    const updated = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest]
    handleChange('specificInterests', updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSubmitted(true)
    setLoading(false)
  }

  const canProceedToStep2 = formData.firstName && formData.lastName && formData.email && formData.company
  const canProceedToStep3 = canProceedToStep2 && formData.companySize && formData.useCase && formData.demoType
  const canSubmit = canProceedToStep3 && selectedSlot

  if (submitted) {
    return (
      <Layout>
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Demo Scheduled Successfully
              </h1>
              <p className="text-xl text-gray-600">
                Thank you for booking a demo with Happy Llama. We're excited to show you what our platform can do for your business.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">Your Demo Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-800">Date & Time</div>
                  <div className="text-blue-700">
                    {availableSlots.find(slot => slot.id === selectedSlot)?.date} at{' '}
                    {availableSlots.find(slot => slot.id === selectedSlot)?.time}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">Duration</div>
                  <div className="text-blue-700">
                    {demoTypes.find(type => type.value === formData.demoType)?.label.match(/\(([^)]+)\)/)?.[1] || '30 min'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">Demo Type</div>
                  <div className="text-blue-700">
                    {demoTypes.find(type => type.value === formData.demoType)?.label.split('(')[0]}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-blue-800">Your Use Case</div>
                  <div className="text-blue-700">
                    {useCases.find(uc => uc.value === formData.useCase)?.label}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div>• You'll receive a calendar invite with Zoom link within 5 minutes</div>
                <div>• Our demo specialist will send you a preparation email 24 hours before</div>
                <div>• We'll customize the demo based on your specific use case and interests</div>
                <div>• You'll have time for Q&A and next steps discussion</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/resources">Explore Resources</Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-900">Request Demo</span>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Schedule Your Personal Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See Happy Llama in action with a customized demo tailored to your business needs and use cases.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step ? '✓' : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <div className="flex space-x-20 text-sm text-gray-600">
                <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>
                  Contact Info
                </span>
                <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
                  Requirements
                </span>
                <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>
                  Schedule
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        required
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="CTO, Developer, Product Manager"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!canProceedToStep2}
                    >
                      Next: Requirements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Requirements */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tell Us About Your Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companySize">Company Size *</Label>
                      <Select value={formData.companySize} onValueChange={(value) => handleChange('companySize', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={formData.industry} onValueChange={(value) => handleChange('industry', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry.value} value={industry.value}>
                              {industry.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="useCase">Primary Use Case *</Label>
                    <Select value={formData.useCase} onValueChange={(value) => handleChange('useCase', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="What do you want to build?" />
                      </SelectTrigger>
                      <SelectContent>
                        {useCases.map((useCase) => (
                          <SelectItem key={useCase.value} value={useCase.value}>
                            {useCase.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeline">Implementation Timeline</Label>
                    <Select value={formData.timeline} onValueChange={(value) => handleChange('timeline', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="When do you need this?" />
                      </SelectTrigger>
                      <SelectContent>
                        {timelines.map((timeline) => (
                          <SelectItem key={timeline.value} value={timeline.value}>
                            {timeline.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Demo Type *</Label>
                    <div className="space-y-3 mt-2">
                      {demoTypes.map((type) => (
                        <div key={type.value} className="flex items-start space-x-3">
                          <input
                            type="radio"
                            id={type.value}
                            name="demoType"
                            value={type.value}
                            checked={formData.demoType === type.value}
                            onChange={(e) => handleChange('demoType', e.target.value)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label htmlFor={type.value} className="font-medium text-gray-900 cursor-pointer">
                              {type.label}
                            </label>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Specific Areas of Interest (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {specificInterests.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest}
                            checked={formData.specificInterests.includes(interest)}
                            onCheckedChange={() => handleInterestToggle(interest)}
                          />
                          <Label htmlFor={interest} className="text-sm cursor-pointer">
                            {interest}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currentSolution">Current Solution (Optional)</Label>
                    <Input
                      id="currentSolution"
                      value={formData.currentSolution}
                      onChange={(e) => handleChange('currentSolution', e.target.value)}
                      placeholder="What tools/platforms do you currently use?"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!canProceedToStep3}
                    >
                      Next: Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Schedule */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Preferred Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          !slot.available
                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                            : selectedSlot === slot.id
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => slot.available && setSelectedSlot(slot.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="radio"
                            name="timeSlot"
                            value={slot.id}
                            checked={selectedSlot === slot.id}
                            onChange={() => setSelectedSlot(slot.id)}
                            disabled={!slot.available}
                          />
                          {!slot.available && (
                            <Badge variant="secondary" className="text-xs">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-medium">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(slot.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {slot.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Notes (Optional)</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Any specific topics you'd like us to cover or questions you have..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">What to Expect</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Personalized demo based on your use case</li>
                      <li>• Live Q&A session with our product experts</li>
                      <li>• Technical deep dive if requested</li>
                      <li>• Discussion of implementation timeline and next steps</li>
                      <li>• No sales pressure - we focus on education first</li>
                    </ul>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canSubmit || loading}
                    >
                      {loading ? 'Scheduling...' : 'Schedule Demo'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </section>
    </Layout>
  )
}