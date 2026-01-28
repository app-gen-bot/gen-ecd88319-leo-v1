'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Send,
  Paperclip,
  AlertCircle,
  CheckCircle,
  Zap,
  CreditCard,
  Bug,
  HelpCircle,
  FileText,
  MessageCircle,
  Video,
  Twitter,
  Globe,
  X
} from 'lucide-react'

const contactReasons = [
  { value: 'registration-issue', label: 'Registration Problem', icon: AlertCircle },
  { value: 'platform-connection', label: 'Platform Connection Issue', icon: Zap },
  { value: 'billing', label: 'Billing & Subscription', icon: CreditCard },
  { value: 'bug-report', label: 'Report a Bug', icon: Bug },
  { value: 'feature-request', label: 'Feature Request', icon: Zap },
  { value: 'general', label: 'General Question', icon: HelpCircle },
  { value: 'other', label: 'Other', icon: MessageSquare }
]

const priorityLevels = [
  { value: 'low', label: 'Low - General question' },
  { value: 'medium', label: 'Medium - Some impact on usage' },
  { value: 'high', label: 'High - Blocking my work' },
  { value: 'urgent', label: 'Urgent - Critical business impact' }
]

const contactMethods = [
  {
    title: 'Email Support',
    description: 'Get help via email',
    icon: Mail,
    details: 'support@theplug.com',
    responseTime: '24-48 hours',
    available: true
  },
  {
    title: 'Live Chat',
    description: 'Chat with our team',
    icon: MessageCircle,
    details: 'Available Mon-Fri',
    responseTime: '< 5 minutes',
    available: true
  },
  {
    title: 'Schedule a Call',
    description: 'Book a support call',
    icon: Phone,
    details: 'For Pro & Enterprise',
    responseTime: 'Next business day',
    available: true
  },
  {
    title: 'Video Support',
    description: 'Screen share session',
    icon: Video,
    details: 'Enterprise only',
    responseTime: 'By appointment',
    available: false
  }
]

const socialChannels = [
  {
    name: 'Twitter',
    handle: '@theplug',
    icon: Twitter,
    url: 'https://twitter.com/theplug'
  },
  {
    name: 'Status Page',
    handle: 'status.theplug.com',
    icon: Globe,
    url: 'https://status.theplug.com'
  }
]

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    name: 'Demo User',
    email: 'demo@example.com',
    reason: '',
    priority: 'medium',
    subject: '',
    message: '',
    attachments: [] as File[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLiveChat, setShowLiveChat] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }))
    }
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.reason || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success('Support ticket created!', {
      description: 'Ticket #12345 - We\'ll respond within 24 hours'
    })
    
    // Reset form
    setFormData({
      name: 'Demo User',
      email: 'demo@example.com',
      reason: '',
      priority: 'medium',
      subject: '',
      message: '',
      attachments: []
    })
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/help">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">Contact Support</h1>
          <p className="text-xl text-muted-foreground">
            We're here to help. Choose how you'd like to reach us.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {contactMethods.map((method) => (
            <Card 
              key={method.title}
              className={`${!method.available && 'opacity-60'}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <method.icon className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-medium">{method.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{method.details}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{method.responseTime}</span>
                  </div>
                  {method.title === 'Live Chat' && (
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setShowLiveChat(true)}
                    >
                      Start Chat
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Business Hours Alert */}
        <Alert className="mb-8">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Support Hours:</strong> Monday - Friday, 9 AM - 6 PM PST. 
            We respond to urgent issues 24/7. Current response time: ~2 hours.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Request</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reason">Reason for Contact *</Label>
                      <Select 
                        value={formData.reason}
                        onValueChange={(value) => handleInputChange('reason', value)}
                      >
                        <SelectTrigger id="reason">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactReasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              <div className="flex items-center gap-2">
                                <reason.icon className="h-4 w-4" />
                                {reason.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={formData.priority}
                        onValueChange={(value) => handleInputChange('priority', value)}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Include any error messages, song IDs, or platform names
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="attachments">Attachments</Label>
                    <div className="mt-2">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                          <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, PDF up to 10MB
                          </p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          multiple
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                      
                      {formData.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {formData.attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted rounded p-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Support Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Before You Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Many issues can be resolved quickly:
                </p>
                <div className="space-y-3">
                  <Link href="/help/troubleshooting" className="block">
                    <div className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Check Troubleshooting Guide
                    </div>
                  </Link>
                  <Link href="/help/platforms" className="block">
                    <div className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Review Platform Guides
                    </div>
                  </Link>
                  <Link href="/status" className="block">
                    <div className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Check System Status
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Priority Support */}
            <Card className="border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Pro & Enterprise</Badge>
                <CardTitle className="text-lg">Priority Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get faster response times and dedicated support
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    1-hour response time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Phone & video support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Dedicated account manager
                  </li>
                </ul>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full mt-4">
                    Upgrade Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Social Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Other Ways to Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {socialChannels.map((channel) => (
                    <a
                      key={channel.name}
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <channel.icon className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-xs text-muted-foreground">{channel.handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Chat Modal */}
        {showLiveChat && (
          <div className="fixed bottom-4 right-4 w-96 bg-background border rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Live Chat</h3>
                <Badge variant="default" className="text-xs">Online</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLiveChat(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-96 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-muted rounded p-3">
                  <p className="text-sm font-medium mb-1">Support Agent</p>
                  <p className="text-sm">Hi! I'm here to help. What can I assist you with today?</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input placeholder="Type your message..." />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}