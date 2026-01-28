"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon, CalendarIcon, ClockIcon, CheckCircleIcon, UserIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/layout'

interface InvestorForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  firm: string
  title: string
  linkedinUrl: string
  firmWebsite: string
  investmentStage: string[]
  investmentFocus: string[]
  typicalCheckSize: string
  portfolioCompanies: string
  referralSource: string
  meetingPurpose: string
  specificInterests: string[]
  timeframe: string
  preferredMeetingType: string
  availableTimes: string[]
  nda: boolean
  message: string
}

interface MeetingSlot {
  id: string
  date: string
  time: string
  duration: string
  type: 'virtual' | 'in-person'
  location?: string
}

const investmentStages = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Growth/Late Stage'
]

const investmentFoci = [
  'AI/ML',
  'Developer Tools',
  'Enterprise Software',
  'No-Code/Low-Code',
  'Infrastructure',
  'Security',
  'Fintech',
  'Healthcare Tech',
  'Productivity Tools'
]

const checkSizes = [
  { value: '100k-500k', label: '$100K - $500K' },
  { value: '500k-1m', label: '$500K - $1M' },
  { value: '1m-5m', label: '$1M - $5M' },
  { value: '5m-10m', label: '$5M - $10M' },
  { value: '10m+', label: '$10M+' }
]

const meetingPurposes = [
  { value: 'initial-interest', label: 'Initial Interest Discussion' },
  { value: 'due-diligence', label: 'Due Diligence Meeting' },
  { value: 'partnership', label: 'Strategic Partnership' },
  { value: 'follow-up', label: 'Follow-up Discussion' },
  { value: 'other', label: 'Other' }
]

const specificInterests = [
  'Market opportunity & TAM',
  'Technology differentiation',
  'Business model & unit economics',
  'Team background & expertise',
  'Traction & growth metrics',
  'Competitive landscape',
  'Go-to-market strategy',
  'Funding history & use of funds',
  'Product roadmap',
  'Partnership opportunities'
]

const availableSlots: MeetingSlot[] = [
  { id: '1', date: '2025-02-03', time: '10:00 AM PST', duration: '45 min', type: 'virtual' },
  { id: '2', date: '2025-02-03', time: '2:00 PM PST', duration: '45 min', type: 'virtual' },
  { id: '3', date: '2025-02-04', time: '9:00 AM PST', duration: '45 min', type: 'virtual' },
  { id: '4', date: '2025-02-04', time: '11:00 AM PST', duration: '45 min', type: 'virtual' },
  { id: '5', date: '2025-02-04', time: '3:00 PM PST', duration: '45 min', type: 'in-person', location: 'San Francisco Office' },
  { id: '6', date: '2025-02-05', time: '10:00 AM PST', duration: '45 min', type: 'virtual' },
  { id: '7', date: '2025-02-05', time: '1:00 PM PST', duration: '45 min', type: 'in-person', location: 'San Francisco Office' },
  { id: '8', date: '2025-02-05', time: '4:00 PM PST', duration: '45 min', type: 'virtual' }
]

export default function InvestorMeetingPage() {
  const [formData, setFormData] = useState<InvestorForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    firm: '',
    title: '',
    linkedinUrl: '',
    firmWebsite: '',
    investmentStage: [],
    investmentFocus: [],
    typicalCheckSize: '',
    portfolioCompanies: '',
    referralSource: '',
    meetingPurpose: '',
    specificInterests: [],
    timeframe: '',
    preferredMeetingType: 'virtual',
    availableTimes: [],
    nda: false,
    message: ''
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])

  const handleChange = (field: keyof InvestorForm, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field: keyof InvestorForm, item: string) => {
    const currentArray = formData[field] as string[]
    const updated = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    handleChange(field, updated)
  }

  const handleSlotToggle = (slotId: string) => {
    const updated = selectedSlots.includes(slotId)
      ? selectedSlots.filter(id => id !== slotId)
      : [...selectedSlots, slotId]
    setSelectedSlots(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSubmitted(true)
    setLoading(false)
  }

  const canProceedToStep2 = formData.firstName && formData.lastName && formData.email && formData.firm && formData.title
  const canProceedToStep3 = canProceedToStep2 && formData.investmentStage.length > 0 && formData.meetingPurpose
  const canSubmit = canProceedToStep3 && selectedSlots.length > 0 && formData.nda

  if (submitted) {
    return (
      <Layout>
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Meeting Request Submitted
              </h1>
              <p className="text-xl text-gray-600">
                Thank you for your interest in Happy Llama. Our team will review your request and respond within 24 hours.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">Next Steps</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
                  Our team will review your investor profile and meeting request
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
                  We'll send you calendar options within 24 hours
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</div>
                  Investment deck and materials will be shared upon confirmation
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</div>
                  Meeting confirmation with Zoom/location details
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Access Investment Materials</h3>
              <p className="text-sm text-gray-600 mb-4">
                While you wait, you can request access to our public investment materials:
              </p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/resources/whitepapers">Company Overview</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/investors">Investor Page</Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/investors">Investor Resources</Link>
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
            <Link href="/investors" className="hover:text-gray-700">Investors</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-900">Meeting Request</span>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Schedule Investor Meeting
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Request a meeting with our founding team to discuss Happy Llama's investment opportunity and growth potential.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Qualified Investors Only:</strong> This form is for accredited investors, VCs, 
                  family offices, and strategic partners. All materials are confidential and subject to NDA.
                </div>
              </div>
            </div>
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
                  Profile
                </span>
                <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
                  Investment
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
            
            {/* Step 1: Profile Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Investor Profile
                  </CardTitle>
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
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@vc-firm.com"
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
                      <Label htmlFor="firm">Firm/Organization *</Label>
                      <Input
                        id="firm"
                        required
                        value={formData.firm}
                        onChange={(e) => handleChange('firm', e.target.value)}
                        placeholder="Acme Ventures"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Title/Position *</Label>
                      <Input
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Managing Partner, Principal, etc."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="firmWebsite">Firm Website</Label>
                      <Input
                        id="firmWebsite"
                        type="url"
                        value={formData.firmWebsite}
                        onChange={(e) => handleChange('firmWebsite', e.target.value)}
                        placeholder="https://acmeventures.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="referralSource">How did you hear about Happy Llama?</Label>
                    <Input
                      id="referralSource"
                      value={formData.referralSource}
                      onChange={(e) => handleChange('referralSource', e.target.value)}
                      placeholder="Referral, news article, event, etc."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!canProceedToStep2}
                    >
                      Next: Investment Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Investment Profile */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Investment Profile & Interest</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Investment Stage Focus *</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {investmentStages.map((stage) => (
                        <div key={stage} className="flex items-center space-x-2">
                          <Checkbox
                            id={stage}
                            checked={formData.investmentStage.includes(stage)}
                            onCheckedChange={() => handleArrayToggle('investmentStage', stage)}
                          />
                          <Label htmlFor={stage} className="text-sm cursor-pointer">
                            {stage}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Investment Focus Areas</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {investmentFoci.map((focus) => (
                        <div key={focus} className="flex items-center space-x-2">
                          <Checkbox
                            id={focus}
                            checked={formData.investmentFocus.includes(focus)}
                            onCheckedChange={() => handleArrayToggle('investmentFocus', focus)}
                          />
                          <Label htmlFor={focus} className="text-sm cursor-pointer">
                            {focus}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="typicalCheckSize">Typical Check Size</Label>
                      <Select value={formData.typicalCheckSize} onValueChange={(value) => handleChange('typicalCheckSize', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select check size range" />
                        </SelectTrigger>
                        <SelectContent>
                          {checkSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeframe">Investment Timeframe</Label>
                      <Select value={formData.timeframe} onValueChange={(value) => handleChange('timeframe', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="When are you looking to invest?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate (&lt; 3 months)</SelectItem>
                          <SelectItem value="short-term">Short term (3-6 months)</SelectItem>
                          <SelectItem value="medium-term">Medium term (6-12 months)</SelectItem>
                          <SelectItem value="exploring">Just exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meetingPurpose">Meeting Purpose *</Label>
                    <Select value={formData.meetingPurpose} onValueChange={(value) => handleChange('meetingPurpose', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="What's the purpose of this meeting?" />
                      </SelectTrigger>
                      <SelectContent>
                        {meetingPurposes.map((purpose) => (
                          <SelectItem key={purpose.value} value={purpose.value}>
                            {purpose.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Specific Areas of Interest</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {specificInterests.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest}
                            checked={formData.specificInterests.includes(interest)}
                            onCheckedChange={() => handleArrayToggle('specificInterests', interest)}
                          />
                          <Label htmlFor={interest} className="text-sm cursor-pointer">
                            {interest}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="portfolioCompanies">Relevant Portfolio Companies (Optional)</Label>
                    <Textarea
                      id="portfolioCompanies"
                      value={formData.portfolioCompanies}
                      onChange={(e) => handleChange('portfolioCompanies', e.target.value)}
                      placeholder="List companies in your portfolio that might be relevant to Happy Llama..."
                      rows={3}
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
                      Next: Schedule Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Schedule Meeting */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Your Meeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Select your preferred meeting times (choose multiple options)</Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {availableSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedSlots.includes(slot.id)
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => handleSlotToggle(slot.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <Checkbox
                              checked={selectedSlots.includes(slot.id)}
                              onCheckedChange={() => handleSlotToggle(slot.id)}
                            />
                            <div className="flex items-center space-x-2">
                              <Badge variant={slot.type === 'virtual' ? 'default' : 'secondary'}>
                                {slot.type === 'virtual' ? 'Virtual' : 'In-Person'}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-medium">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {new Date(slot.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4 mr-2" />
                              {slot.time} ({slot.duration})
                            </div>
                            {slot.location && (
                              <div className="text-xs text-gray-500">
                                📍 {slot.location}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Notes</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Any specific topics you'd like to discuss, questions about the company, or other notes..."
                      rows={4}
                    />
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="nda"
                        checked={formData.nda}
                        onCheckedChange={(checked) => handleChange('nda', checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor="nda" className="font-medium cursor-pointer">
                          Non-Disclosure Agreement *
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          I acknowledge that any information shared during this meeting is confidential and 
                          proprietary to Happy Llama. I agree to maintain confidentiality and not disclose 
                          any information to third parties without prior written consent.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Meeting Materials
                    </h3>
                    <p className="text-sm text-blue-800 mb-2">
                      Upon confirmation, you'll receive access to:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Executive pitch deck</li>
                      <li>• Financial model and projections</li>
                      <li>• Technology whitepaper</li>
                      <li>• Market analysis report</li>
                      <li>• Team backgrounds and advisor profiles</li>
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
                      {loading ? 'Submitting...' : 'Request Meeting'}
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