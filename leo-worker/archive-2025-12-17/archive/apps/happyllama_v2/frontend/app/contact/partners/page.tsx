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
  BriefcaseIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CubeIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function PartnersPage() {
  const [partnerForm, setPartnerForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    partnerType: '',
    companySize: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Partnership inquiry submitted:', partnerForm);
    alert('Thank you! Our partnerships team will review your application and get back to you within 48 hours.');
    setPartnerForm({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      website: '',
      partnerType: '',
      companySize: '',
      description: ''
    });
  };

  const partnerTypes = [
    {
      title: 'Technology Partners',
      description: 'Integrate your tools and services with Happy Llama',
      icon: <CubeIcon className="h-8 w-8 text-blue-600" />,
      benefits: ['API access', 'Technical support', 'Co-marketing opportunities'],
      examples: 'DevOps tools, databases, cloud providers'
    },
    {
      title: 'Reseller Partners',
      description: 'Sell Happy Llama to your customers and earn commissions',
      icon: <BuildingOfficeIcon className="h-8 w-8 text-green-600" />,
      benefits: ['Competitive margins', 'Sales enablement', 'Marketing resources'],
      examples: 'System integrators, consultants, agencies'
    },
    {
      title: 'Channel Partners',
      description: 'Reach new markets and customer segments together',
      icon: <GlobeAltIcon className="h-8 w-8 text-purple-600" />,
      benefits: ['Global reach', 'Local support', 'Joint go-to-market'],
      examples: 'Regional distributors, industry specialists'
    },
    {
      title: 'Solution Partners',
      description: 'Build comprehensive solutions using our platform',
      icon: <UserGroupIcon className="h-8 w-8 text-orange-600" />,
      benefits: ['Training programs', 'Certification', 'Priority support'],
      examples: 'Implementation partners, training providers'
    }
  ];

  const existingPartners = [
    { name: 'AWS', category: 'Cloud Provider', logo: '/placeholder-logo.png' },
    { name: 'Microsoft Azure', category: 'Cloud Provider', logo: '/placeholder-logo.png' },
    { name: 'Stripe', category: 'Payments', logo: '/placeholder-logo.png' },
    { name: 'Auth0', category: 'Authentication', logo: '/placeholder-logo.png' },
    { name: 'Twilio', category: 'Communications', logo: '/placeholder-logo.png' },
    { name: 'SendGrid', category: 'Email', logo: '/placeholder-logo.png' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <BriefcaseIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Partner with Happy Llama
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join our ecosystem of technology, channel, and solution partners to grow together
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="default" className="px-3 py-1">50+ Active Partners</Badge>
              <Badge variant="secondary" className="px-3 py-1">Global Reach</Badge>
              <Badge variant="outline" className="px-3 py-1">Mutual Success</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Partnership Types */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Partnership Opportunities
            </h2>
            <p className="text-xl text-gray-600">
              Multiple ways to collaborate and grow your business with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {partnerTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {type.icon}
                    <div>
                      <CardTitle className="text-xl">{type.title}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Benefits:</h4>
                    <ul className="space-y-1">
                      {type.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Examples:</h4>
                    <p className="text-sm text-gray-600">{type.examples}</p>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Application Form */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Apply to Become a Partner
              </h2>
              <p className="text-xl text-gray-600">
                Tell us about your organization and how we can work together
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Partnership Application</CardTitle>
                <CardDescription>
                  Complete this form to start the partnership process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name *</label>
                      <Input
                        required
                        value={partnerForm.companyName}
                        onChange={(e) => setPartnerForm(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Your company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Name *</label>
                      <Input
                        required
                        value={partnerForm.contactName}
                        onChange={(e) => setPartnerForm(prev => ({ ...prev, contactName: e.target.value }))}
                        placeholder="Primary contact person"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        required
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@yourcompany.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input
                        value={partnerForm.phone}
                        onChange={(e) => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input
                      value={partnerForm.website}
                      onChange={(e) => setPartnerForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Partnership Type *</label>
                      <Select value={partnerForm.partnerType} onValueChange={(value) => setPartnerForm(prev => ({ ...prev, partnerType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select partnership type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology Partner</SelectItem>
                          <SelectItem value="reseller">Reseller Partner</SelectItem>
                          <SelectItem value="channel">Channel Partner</SelectItem>
                          <SelectItem value="solution">Solution Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Company Size</label>
                      <Select value={partnerForm.companySize} onValueChange={(value) => setPartnerForm(prev => ({ ...prev, companySize: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                          <SelectItem value="small">Small (11-50 employees)</SelectItem>
                          <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                          <SelectItem value="large">Large (201-1000 employees)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Partnership Description *</label>
                    <Textarea
                      required
                      value={partnerForm.description}
                      onChange={(e) => setPartnerForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your company, your target customers, and how you envision working with Happy Llama. Include any relevant experience or existing partnerships."
                      rows={6}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Submit Partnership Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Current Partners */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Current Partners
              </h2>
              <p className="text-xl text-gray-600">
                Trusted companies we work with to deliver exceptional solutions
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {existingPartners.map((partner, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900">{partner.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{partner.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ChartBarIcon className="h-16 w-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to Partner with Us?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join our growing ecosystem and unlock new opportunities for your business
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8">
                Schedule Partnership Call
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Download Partner Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}