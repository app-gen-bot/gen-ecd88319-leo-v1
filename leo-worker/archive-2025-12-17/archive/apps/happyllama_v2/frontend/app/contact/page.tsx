"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Layout from '@/components/layout'

const contactOptions = [
  {
    title: "Sales Inquiry",
    description: "Questions about pricing, enterprise features, or demos",
    icon: "💼",
    href: "/contact/sales",
    responseTime: "Within 24 hours",
    recommended: "Enterprise users"
  },
  {
    title: "Technical Support",
    description: "Help with using Happy Llama or troubleshooting issues",
    icon: "🛠️",
    href: "/contact/support", 
    responseTime: "Within 12 hours",
    recommended: "Current users"
  },
  {
    title: "Partnership",
    description: "Integration partnerships, reseller opportunities",
    icon: "🤝",
    href: "/contact/partners",
    responseTime: "Within 48 hours", 
    recommended: "Business partners"
  },
  {
    title: "Media & Press",
    description: "Press inquiries, interview requests, media kits",
    icon: "📰",
    href: "/contact/media",
    responseTime: "Within 24 hours",
    recommended: "Journalists & analysts"
  }
]

export default function ContactPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    inquiry: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('Thank you! We\'ll get back to you within 24 hours.')
      setFormData({ name: '', email: '', company: '', message: '', inquiry: '' })
    } catch (_error) {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto container-padding">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Contact</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How Can We Help?
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the best way to reach us and we&apos;ll respond as quickly as possible.
            </p>
          </div>

          {!selectedOption ? (
            /* Contact Options */
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {contactOptions.map((option, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => window.location.href = option.href}
                >
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{option.icon}</div>
                    <CardTitle>{option.title}</CardTitle>
                    <CardDescription className="text-center">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-center">
                      <div className="text-green-600 font-medium">
                        Response: {option.responseTime}
                      </div>
                      <div className="text-gray-500">
                        Best for: {option.recommended}
                      </div>
                    </div>
                    <Button className="w-full mt-4">
                      Get Help
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* General Contact Form */
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name *</label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email *</label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Your company (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">What can we help with? *</label>
                      <select
                        required
                        value={formData.inquiry}
                        onChange={(e) => setFormData(prev => ({ ...prev, inquiry: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Please select...</option>
                        <option value="sales">Sales & Pricing</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="media">Media & Press</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message *</label>
                      <Textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Tell us how we can help you..."
                        className="min-h-[120px]"
                        maxLength={1000}
                      />
                      <p className="text-xs text-gray-500">
                        {formData.message.length}/1000 characters
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        'Send Message'
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      We typically respond within 24 hours during business days.
                    </p>
                  </form>
                </CardContent>
              </Card>

              <div className="text-center mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedOption(null)}
                >
                  ← Back to Contact Options
                </Button>
              </div>
            </div>
          )}

          {/* Alternative Contact Methods */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Other Ways to Reach Us</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <div className="text-3xl mb-2">📧</div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-gray-600 mb-2">For general inquiries</p>
                <a href="mailto:hello@happyllama.com" className="text-blue-600 hover:underline">
                  hello@happyllama.com
                </a>
              </Card>
              
              <Card className="text-center p-6">
                <div className="text-3xl mb-2">💬</div>
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-gray-600 mb-2">Join our Discord</p>
                <Button size="sm" variant="outline">
                  Join Community
                </Button>
              </Card>
              
              <Card className="text-center p-6">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold mb-2">Help Center</h3>
                <p className="text-sm text-gray-600 mb-2">Find answers instantly</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/resources/documentation">
                    Browse Help
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}