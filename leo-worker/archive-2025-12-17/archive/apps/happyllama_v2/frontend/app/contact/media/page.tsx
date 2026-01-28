"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/layout'

interface MediaForm {
  fullName: string
  email: string
  phone: string
  organization: string
  publication: string
  inquiryType: string
  topic: string
  deadline: string
  message: string
}

const inquiryTypes = [
  { value: 'press-release', label: 'Press Release Request' },
  { value: 'interview', label: 'Interview Request' },
  { value: 'product-demo', label: 'Product Demo' },
  { value: 'expert-comment', label: 'Expert Commentary' },
  { value: 'background-briefing', label: 'Background Briefing' },
  { value: 'data-statistics', label: 'Data & Statistics' },
  { value: 'other', label: 'Other' }
]

const mediaResources = [
  {
    title: "Company Fact Sheet",
    description: "Key facts, figures, and company overview",
    type: "PDF",
    size: "2.1 MB"
  },
  {
    title: "Executive Headshots",
    description: "High-resolution photos of leadership team",
    type: "ZIP",
    size: "15.3 MB"
  },
  {
    title: "Product Screenshots",
    description: "Interface screenshots and product images",
    type: "ZIP",
    size: "8.7 MB"
  },
  {
    title: "Logo Package",
    description: "Brand logos in various formats",
    type: "ZIP",
    size: "3.4 MB"
  },
  {
    title: "Recent Press Coverage",
    description: "Archive of media mentions and coverage",
    type: "PDF",
    size: "4.2 MB"
  }
]

export default function MediaContactPage() {
  const [formData, setFormData] = useState<MediaForm>({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    publication: '',
    inquiryType: '',
    topic: '',
    deadline: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSubmitted(true)
    setLoading(false)
  }

  const handleChange = (field: keyof MediaForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <Layout>
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Media Inquiry Received
              </h1>
              <p className="text-xl text-gray-600">
                Thank you for your interest in Happy Llama. Our media relations team will respond within 2 business hours.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div>• Our PR team will review your request</div>
                <div>• You'll receive a response within 2 business hours</div>
                <div>• For urgent requests, call our media line: +1 (555) 123-MEDIA</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Other Inquiries</Link>
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
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link href="/contact" className="hover:text-gray-700">Contact</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-900">Media Inquiries</span>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Media Inquiries
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Press, journalists, and media professionals - we&apos;re here to help with your stories about AI, development tools, and the future of software creation.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Media Inquiry</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="john@publication.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="organization">Media Organization *</Label>
                    <Input
                      id="organization"
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => handleChange('organization', e.target.value)}
                      placeholder="TechCrunch, Wired, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="publication">Publication/Show Name *</Label>
                  <Input
                    id="publication"
                    type="text"
                    required
                    value={formData.publication}
                    onChange={(e) => handleChange('publication', e.target.value)}
                    placeholder="The AI Weekly Podcast, Tech Today, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="inquiryType">Type of Inquiry *</Label>
                  <Select value={formData.inquiryType} onValueChange={(value) => handleChange('inquiryType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="topic">Story Topic/Angle</Label>
                    <Input
                      id="topic"
                      type="text"
                      value={formData.topic}
                      onChange={(e) => handleChange('topic', e.target.value)}
                      placeholder="AI Development Tools, Startup Funding, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message/Questions *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Please describe your story idea, specific questions, or what you're looking for from Happy Llama..."
                    rows={5}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Media Inquiry'}
                </Button>
              </form>
            </div>

            {/* Media Resources & Contact Info */}
            <div className="space-y-8">
              
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Direct Media Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-semibold">Sarah Mitchell</div>
                    <div className="text-sm text-gray-600">PR & Communications Director</div>
                    <div className="text-sm text-blue-600">sarah@happyllama.com</div>
                    <div className="text-sm text-gray-600">+1 (555) 123-MEDIA</div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600">
                      <strong>Response Time:</strong> Within 2 business hours<br />
                      <strong>Urgent Requests:</strong> Call the media line directly<br />
                      <strong>Time Zone:</strong> PST (UTC-8)
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Press Kit */}
              <Card>
                <CardHeader>
                  <CardTitle>Press Kit & Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mediaResources.map((resource, index) => (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{resource.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                          <Badge variant="secondary" className="text-xs">{resource.size}</Badge>
                          <Button size="sm" variant="outline">Download</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent News */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent News & Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="text-sm font-medium text-gray-900">Series A Funding Announcement</div>
                      <div className="text-xs text-gray-500">January 15, 2025</div>
                      <div className="text-sm text-gray-600 mt-1">Happy Llama raises $15M Series A to democratize AI development</div>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="text-sm font-medium text-gray-900">Enterprise Launch</div>
                      <div className="text-xs text-gray-500">December 10, 2024</div>
                      <div className="text-sm text-gray-600 mt-1">New enterprise features for SOC2 compliance</div>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <div className="text-sm font-medium text-gray-900">Beta Program Launch</div>
                      <div className="text-xs text-gray-500">November 8, 2024</div>
                      <div className="text-sm text-gray-600 mt-1">5,000+ developers join Happy Llama beta program</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Press Releases
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}