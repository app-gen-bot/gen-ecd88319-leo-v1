"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/layout'
import { validateEmail } from '@/lib/utils'

interface FormData {
  email: string
  fullName: string
  phone: string
  company: string
  userType: string
  appTitle: string
  appDescription: string
  targetUsers: string
  referralSource: string
  termsAccepted: boolean
  marketingConsent: boolean
}

const initialFormData: FormData = {
  email: '',
  fullName: '',
  phone: '',
  company: '',
  userType: '',
  appTitle: '',
  appDescription: '',
  targetUsers: '',
  referralSource: '',
  termsAccepted: false,
  marketingConsent: true
}

const steps = [
  { id: 1, name: 'Account', description: 'Basic information' },
  { id: 2, name: 'Idea', description: 'Tell us your vision' },
  { id: 3, name: 'Details', description: 'Final details' },
  { id: 4, name: 'Verify', description: 'Email verification' }
]

export default function BetaSignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [waitlistPosition, _setWaitlistPosition] = useState<number | null>(null)

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required'
      else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email'
      if (!formData.fullName) newErrors.fullName = 'Full name is required'
      if (!formData.userType) newErrors.userType = 'Please select your user type'
    }

    if (step === 2) {
      if (formData.userType === 'Citizen Developer') {
        if (!formData.appTitle) newErrors.appTitle = 'App title is required'
        if (!formData.appDescription || formData.appDescription.length < 50) {
          newErrors.appDescription = 'Please provide at least 50 characters'
        }
        if (!formData.targetUsers) newErrors.targetUsers = 'Target users is required'
      }
    }

    if (step === 3) {
      if (!formData.referralSource) newErrors.referralSource = 'Please tell us how you heard about us'
      if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    try {
      // Mock API call to submit beta signup
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock verification token and redirect to email verification
      const verificationToken = 'vt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      // In real app, this would send email with verification link
      console.log('Verification email would be sent to:', formData.email)
      console.log('Verification link would be: /verify/' + verificationToken)
      
      // Redirect to email verification page with email parameter
      router.push(`/beta-signup/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (_error) {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center">
                ← Back to Home
              </Link>
              <Badge variant="outline">Beta Signup</Badge>
            </div>
            
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join the Happy Llama Beta</h1>
              <p className="text-gray-600">
                Be among the first to experience the future of AI-powered development
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
              <Progress value={progress} className="h-2 mb-4" />
              <div className="flex justify-between">
                {steps.map((step) => (
                  <div 
                    key={step.id} 
                    className={`flex flex-col items-center cursor-pointer ${
                      step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      step.id < currentStep 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : step.id === currentStep
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {step.id < currentStep ? '✓' : step.id}
                    </div>
                    <div className="mt-2 text-xs text-center">
                      <div className="font-medium">{step.name}</div>
                      <div className="text-gray-500">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardContent className="p-8">
              {/* Step 1: Account Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <CardHeader className="px-0 pb-0">
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Let&apos;s start with some basic information about you
                    </CardDescription>
                  </CardHeader>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name *</label>
                      <Input
                        placeholder="John Smith"
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number (Optional)</label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company (Optional)</label>
                      <Input
                        placeholder="Acme Corp"
                        value={formData.company}
                        onChange={(e) => updateFormData('company', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">I am a *</label>
                    <div className="space-y-3">
                      {[
                        { value: 'Citizen Developer', label: 'Citizen Developer', desc: 'I want to build apps without coding' },
                        { value: 'Enterprise User', label: 'Enterprise User', desc: 'I represent a business or organization' },
                        { value: 'Investor/Partner', label: 'Investor/Partner', desc: 'I&apos;m interested in investment or partnership' },
                        { value: 'Other', label: 'Other', desc: 'Something else' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="userType"
                            value={option.value}
                            checked={formData.userType === option.value}
                            onChange={(e) => updateFormData('userType', e.target.value)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.userType && <p className="text-red-500 text-sm">{errors.userType}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Your Idea */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <CardHeader className="px-0 pb-0">
                    <CardTitle>Tell Us About Your Vision</CardTitle>
                    <CardDescription>
                      Help us understand what you want to build
                    </CardDescription>
                  </CardHeader>

                  {formData.userType === 'Citizen Developer' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">App Idea Title *</label>
                        <Input
                          placeholder="My Recipe Sharing App"
                          value={formData.appTitle}
                          onChange={(e) => updateFormData('appTitle', e.target.value)}
                          maxLength={60}
                          className={errors.appTitle ? 'border-red-500' : ''}
                        />
                        <div className="flex justify-between">
                          {errors.appTitle && <p className="text-red-500 text-sm">{errors.appTitle}</p>}
                          <p className="text-xs text-gray-500">{formData.appTitle.length}/60 characters</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Describe Your App *</label>
                        <Textarea
                          placeholder="I want to build an app that..."
                          value={formData.appDescription}
                          onChange={(e) => updateFormData('appDescription', e.target.value)}
                          className={`min-h-[120px] ${errors.appDescription ? 'border-red-500' : ''}`}
                          maxLength={500}
                        />
                        <div className="flex justify-between">
                          {errors.appDescription && <p className="text-red-500 text-sm">{errors.appDescription}</p>}
                          <p className="text-xs text-gray-500">{formData.appDescription.length}/500 characters</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target Users *</label>
                        <Input
                          placeholder="Small business owners"
                          value={formData.targetUsers}
                          onChange={(e) => updateFormData('targetUsers', e.target.value)}
                          className={errors.targetUsers ? 'border-red-500' : ''}
                        />
                        {errors.targetUsers && <p className="text-red-500 text-sm">{errors.targetUsers}</p>}
                      </div>
                    </>
                  )}

                  {formData.userType !== 'Citizen Developer' && (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Thank you for your interest! We&apos;ll be in touch soon.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Additional Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <CardHeader className="px-0 pb-0">
                    <CardTitle>Almost Done!</CardTitle>
                    <CardDescription>
                      Just a few more details and you&apos;re in
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">How did you hear about us? *</label>
                    <div className="space-y-2">
                      {[
                        'Search Engine',
                        'Social Media',
                        'Friend/Colleague',
                        'Blog/Article',
                        'Conference/Event',
                        'Other'
                      ].map((source) => (
                        <label key={source} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="referralSource"
                            value={source}
                            checked={formData.referralSource === source}
                            onChange={(e) => updateFormData('referralSource', e.target.value)}
                          />
                          <span className="text-sm">{source}</span>
                        </label>
                      ))}
                    </div>
                    {errors.referralSource && <p className="text-red-500 text-sm">{errors.referralSource}</p>}
                  </div>

                  <div className="border-t pt-6">
                    <div className="space-y-4">
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.termsAccepted}
                          onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                          className="mt-1"
                        />
                        <span className="text-sm">
                          I agree to the{' '}
                          <Link href="/legal/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </Link>
                          *
                        </span>
                      </label>
                      {errors.termsAccepted && <p className="text-red-500 text-sm ml-6">{errors.termsAccepted}</p>}

                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.marketingConsent}
                          onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
                          className="mt-1"
                        />
                        <span className="text-sm">
                          Send me occasional updates about Happy Llama
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Verification */}
              {currentStep === 4 && waitlistPosition && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <div className="text-3xl">🎉</div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome to Happy Llama Beta!
                    </h2>
                    <p className="text-gray-600">
                      You&apos;re #{waitlistPosition.toLocaleString()} on our waitlist
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">What&apos;s Next?</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <div>
                          <div className="font-medium">Check Your Email</div>
                          <div className="text-gray-600">We&apos;ve sent you a welcome email with resources</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <div>
                          <div className="font-medium">Join Our Community</div>
                          <div className="text-gray-600">Connect with other builders</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <div>
                          <div className="font-medium">Prepare Your Ideas</div>
                          <div className="text-gray-600">Start thinking about what to build first</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Share the Love</h4>
                      <div className="flex justify-center space-x-4">
                        <Button size="sm" variant="outline">
                          Share on Twitter
                        </Button>
                        <Button size="sm" variant="outline">
                          Share on LinkedIn
                        </Button>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/resources">
                        Explore Resources
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-2">
                    {currentStep < 3 && (
                      <Button onClick={handleNext}>
                        Continue
                      </Button>
                    )}
                    {currentStep === 3 && (
                      <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          'Complete Signup'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}