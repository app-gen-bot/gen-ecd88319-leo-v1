'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  LifebuoyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function SupportPage() {
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    priority: '',
    category: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support request submitted:', supportForm);
    alert('Thank you! Your support request has been submitted. We\'ll get back to you within 24 hours.');
    setSupportForm({ name: '', email: '', subject: '', priority: '', category: '', message: '' });
  };

  const supportCategories = [
    {
      title: 'Technical Issues',
      description: 'Application errors, deployment problems, API issues',
      icon: <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />,
      response: '< 2 hours'
    },
    {
      title: 'Account & Billing',
      description: 'Subscription questions, payment issues, account access',
      icon: <DocumentTextIcon className="h-6 w-6 text-blue-600" />,
      response: '< 4 hours'
    },
    {
      title: 'Feature Requests',
      description: 'New feature suggestions, platform improvements',
      icon: <QuestionMarkCircleIcon className="h-6 w-6 text-purple-600" />,
      response: '< 24 hours'
    },
    {
      title: 'General Questions',
      description: 'Platform usage, documentation questions, guidance',
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />,
      response: '< 12 hours'
    }
  ];

  const commonIssues = [
    {
      title: 'Application won\'t deploy',
      description: 'Check your build logs and ensure all dependencies are properly installed',
      status: 'Updated 2 days ago'
    },
    {
      title: 'API authentication errors',
      description: 'Verify your API key is valid and has the correct permissions',
      status: 'Updated 1 week ago'
    },
    {
      title: 'Slow generation times',
      description: 'Large applications may take 5-10 minutes to generate completely',
      status: 'Updated 3 days ago'
    },
    {
      title: 'Database connection issues',
      description: 'Ensure your database credentials are correct in the environment settings',
      status: 'Updated 5 days ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <LifebuoyIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Support Center
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get help from our team or find answers in our knowledge base
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="default" className="px-3 py-1">24/7 Support Available</Badge>
              <Badge variant="secondary" className="px-3 py-1">Average Response: 2 hours</Badge>
              <Badge variant="outline" className="px-3 py-1">95% Customer Satisfaction</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Support Categories */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Can We Help?
            </h2>
            <p className="text-xl text-gray-600">
              Choose the category that best describes your issue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {supportCategories.map((category, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{category.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    {category.response}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Support Form */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit a Support Request</CardTitle>
                    <CardDescription>
                      Provide details about your issue and we&apos;ll get back to you quickly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Name *</label>
                          <Input
                            required
                            value={supportForm.name}
                            onChange={(e) => setSupportForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Your full name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Email *</label>
                          <Input
                            type="email"
                            required
                            value={supportForm.email}
                            onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Subject *</label>
                        <Input
                          required
                          value={supportForm.subject}
                          onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Brief description of your issue"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Category *</label>
                          <Select value={supportForm.category} onValueChange={(value) => setSupportForm(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical Issues</SelectItem>
                              <SelectItem value="billing">Account & Billing</SelectItem>
                              <SelectItem value="feature">Feature Requests</SelectItem>
                              <SelectItem value="general">General Questions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Priority *</label>
                          <Select value={supportForm.priority} onValueChange={(value) => setSupportForm(prev => ({ ...prev, priority: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low - General inquiry</SelectItem>
                              <SelectItem value="medium">Medium - Affects my work</SelectItem>
                              <SelectItem value="high">High - Blocks my progress</SelectItem>
                              <SelectItem value="critical">Critical - System down</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Message *</label>
                        <Textarea
                          required
                          value={supportForm.message}
                          onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                          rows={6}
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        Submit Support Request
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">Email Support</h4>
                      <p className="text-sm text-gray-600">support@happyllama.ai</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Live Chat</h4>
                      <p className="text-sm text-gray-600 mb-2">Available 9 AM - 6 PM PST</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Start Chat
                      </Button>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Phone Support</h4>
                      <p className="text-sm text-gray-600">Enterprise customers only</p>
                      <p className="text-sm text-gray-600">1-800-LLAMA-AI</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">All Systems Operational</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>API</span>
                        <Badge variant="secondary" className="text-xs">99.9%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform</span>
                        <Badge variant="secondary" className="text-xs">100%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Deployments</span>
                        <Badge variant="secondary" className="text-xs">99.8%</Badge>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Status Page
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Common Issues & Solutions
            </h2>
            
            <div className="space-y-4">
              {commonIssues.map((issue, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{issue.title}</h3>
                        <p className="text-gray-600 mb-2">{issue.description}</p>
                        <p className="text-sm text-gray-500">{issue.status}</p>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline">
                Browse All Articles
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}