'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function SalesContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    companySize: '',
    useCase: '',
    timeline: '',
    budget: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sales contact form submitted:', formData);
    alert('Thank you! Our sales team will contact you within 24 hours.');
    setFormData({
      name: '',
      email: '',
      company: '',
      companySize: '',
      useCase: '',
      timeline: '',
      budget: '',
      message: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Contact Enterprise Sales
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Ready to transform your enterprise development workflow? Our sales team 
              will help you understand how Happy Llama can accelerate your projects.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">24-hour Response</p>
                <p className="text-sm text-gray-600">Quick follow-up guaranteed</p>
              </div>
              
              <div className="text-center">
                <UserGroupIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold">Expert Consultation</p>
                <p className="text-sm text-gray-600">Tailored solutions for your needs</p>
              </div>
              
              <div className="text-center">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold">Custom Pricing</p>
                <p className="text-sm text-gray-600">Enterprise-friendly terms</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Form */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise Sales Inquiry</CardTitle>
                    <CardDescription>
                      Tell us about your organization and requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Name *</label>
                          <Input
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Your full name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Email *</label>
                          <Input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="work@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Company *</label>
                          <Input
                            required
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            placeholder="Your company name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Company Size</label>
                          <Input
                            value={formData.companySize}
                            onChange={(e) => handleInputChange('companySize', e.target.value)}
                            placeholder="e.g., 50-200 employees"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Use Case</label>
                          <Input
                            value={formData.useCase}
                            onChange={(e) => handleInputChange('useCase', e.target.value)}
                            placeholder="What do you want to build?"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Timeline</label>
                          <Input
                            value={formData.timeline}
                            onChange={(e) => handleInputChange('timeline', e.target.value)}
                            placeholder="When do you need to deploy?"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Budget Range (Optional)</label>
                        <Input
                          value={formData.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          placeholder="Annual budget or per-project estimate"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Additional Details</label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Tell us more about your requirements, current challenges, or specific questions..."
                          rows={4}
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        Submit Sales Inquiry
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
                    <CardTitle>Direct Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">Sales Team</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <EnvelopeIcon className="h-4 w-4" />
                        sales@happyllama.ai
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4" />
                        1-800-LLAMA-SALES
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Schedule a Demo</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        See Happy Llama in action with your use case
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Book Demo Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Enterprise Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">SSO & Enterprise Auth</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">Advanced Security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-sm">Custom Deployments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span className="text-sm">Priority Support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span className="text-sm">SLA Guarantees</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Success Stories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Success</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">95%</div>
                        <div className="text-sm text-gray-600">Faster development cycles</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">$2M+</div>
                        <div className="text-sm text-gray-600">Average annual savings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">500+</div>
                        <div className="text-sm text-gray-600">Enterprise customers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">What is included in an enterprise plan?</h3>
                <p className="text-gray-600">
                  Enterprise plans include unlimited applications, priority support, SSO integration, 
                  custom deployment options, and dedicated customer success management.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">How quickly can we get started?</h3>
                <p className="text-gray-600">
                  Most enterprise customers are up and running within 2-4 weeks, including setup, 
                  training, and initial project deployment.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Do you offer custom integrations?</h3>
                <p className="text-gray-600">
                  Yes, we provide custom API integrations and can work with your existing tools 
                  and workflows. Our solutions team will assess your requirements.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">What security certifications do you have?</h3>
                <p className="text-gray-600">
                  We maintain SOC 2 Type II, ISO 27001, and GDPR compliance. HIPAA compliance 
                  is available for healthcare customers starting Q2 2025.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}