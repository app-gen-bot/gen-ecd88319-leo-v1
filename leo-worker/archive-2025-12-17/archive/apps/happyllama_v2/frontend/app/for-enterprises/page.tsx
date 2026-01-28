'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ServerIcon,
  CloudIcon,
  CogIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  PlayIcon,
  PuzzlePieceIcon,
  LinkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/layout';

interface Integration {
  id: string;
  name: string;
  category: 'CRM' | 'ERP' | 'DevOps' | 'Analytics' | 'Security' | 'Communication';
  logo: string;
  status: 'Connected' | 'Available' | 'Coming Soon';
  description: string;
  features: string[];
  setupTime: string;
}

const integrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    logo: '☁️',
    status: 'Connected',
    description: 'Sync customer data and automate lead management workflows',
    features: ['Lead sync', 'Opportunity tracking', 'Custom fields', 'Real-time updates'],
    setupTime: '5 minutes'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    logo: '🧡',
    status: 'Available',
    description: 'Marketing automation and customer relationship management',
    features: ['Contact sync', 'Email campaigns', 'Pipeline management', 'Reporting'],
    setupTime: '10 minutes'
  },
  {
    id: 'sap',
    name: 'SAP',
    category: 'ERP',
    logo: '🔷',
    status: 'Available',
    description: 'Enterprise resource planning integration',
    features: ['Financial data', 'Inventory sync', 'HR integration', 'Reporting'],
    setupTime: '2-4 hours'
  },
  {
    id: 'oracle',
    name: 'Oracle',
    category: 'ERP',
    logo: '🔴',
    status: 'Available',
    description: 'Database and enterprise application integration',
    features: ['Database access', 'Application APIs', 'Security', 'Performance'],
    setupTime: '1-2 hours'
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'DevOps',
    logo: '😸',
    status: 'Connected',
    description: 'Source code management and CI/CD integration',
    features: ['Repository sync', 'Issue tracking', 'Actions', 'Deployments'],
    setupTime: '2 minutes'
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    category: 'DevOps',
    logo: '👷',
    status: 'Available',
    description: 'Continuous integration and deployment automation',
    features: ['Build triggers', 'Pipeline integration', 'Notifications', 'Artifacts'],
    setupTime: '15 minutes'
  },
  {
    id: 'tableau',
    name: 'Tableau',
    category: 'Analytics',
    logo: '📊',
    status: 'Available',
    description: 'Business intelligence and data visualization',
    features: ['Data connectors', 'Dashboard embedding', 'Real-time data', 'Custom views'],
    setupTime: '20 minutes'
  },
  {
    id: 'powerbi',
    name: 'Power BI',
    category: 'Analytics',
    logo: '📈',
    status: 'Available',
    description: 'Microsoft business analytics platform',
    features: ['Data modeling', 'Report embedding', 'Real-time updates', 'Custom visuals'],
    setupTime: '25 minutes'
  },
  {
    id: 'okta',
    name: 'Okta',
    category: 'Security',
    logo: '🔐',
    status: 'Connected',
    description: 'Identity and access management platform',
    features: ['SSO', 'MFA', 'User provisioning', 'Audit logs'],
    setupTime: '30 minutes'
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    logo: '💬',
    status: 'Connected',
    description: 'Team collaboration and communication platform',
    features: ['Notifications', 'Bot integration', 'File sharing', 'Workflow automation'],
    setupTime: '3 minutes'
  }
];

const securityFeatures = [
  {
    icon: <LockClosedIcon className="h-8 w-8 text-blue-600" />,
    title: "AES-256 Encryption",
    description: "Data encrypted at rest and in transit with industry-standard encryption",
    details: "All data is encrypted using AES-256 encryption with secure key management through AWS KMS or Azure Key Vault."
  },
  {
    icon: <ShieldCheckIcon className="h-8 w-8 text-green-600" />,
    title: "SSO & MFA Support", 
    description: "Enterprise identity integration with SAML, OIDC, and multi-factor authentication",
    details: "Support for all major identity providers including Okta, Azure AD, Ping Identity, and Auth0."
  },
  {
    icon: <DocumentTextIcon className="h-8 w-8 text-purple-600" />,
    title: "Complete Audit Trail",
    description: "Comprehensive logging and monitoring for regulatory compliance",
    details: "Every action is logged with user, timestamp, and context for full audit compliance."
  },
  {
    icon: <GlobeAltIcon className="h-8 w-8 text-orange-600" />,
    title: "Data Residency Control",
    description: "Choose your data location with multi-region deployment options",
    details: "Deploy in your preferred region with guaranteed data sovereignty and compliance."
  }
];

const supportTiers = [
  {
    name: 'Standard',
    price: 'Included',
    features: [
      'Email support',
      '48-hour response',
      'Documentation access',
      'Community forums'
    ],
    highlight: false
  },
  {
    name: 'Professional',
    price: '$500/month',
    features: [
      'Priority support',
      '12-hour response',
      'Phone support',
      'Video calls',
      'Architecture guidance'
    ],
    highlight: false
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      '24/7 support',
      '4-hour response',
      'Dedicated success manager',
      'On-site training',
      'Custom SLA'
    ],
    highlight: true
  }
];

export default function ForEnterprisesPage() {
  const [selectedDeployment, setSelectedDeployment] = useState<'cloud' | 'onpremise' | 'hybrid'>('cloud');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [roiInputs, setRoiInputs] = useState({
    developers: 10,
    hourlyRate: 150,
    projectsPerYear: 12,
    averageProjectWeeks: 16
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(integrations.map(i => i.category)))];

  // ROI Calculations
  const _currentCost = roiInputs.developers * roiInputs.hourlyRate * 40 * 52; // Annual cost
  const projectCost = roiInputs.hourlyRate * 40 * roiInputs.averageProjectWeeks;
  const traditionalAnnualCost = roiInputs.projectsPerYear * projectCost;
  const happyLlamaAnnualCost = traditionalAnnualCost * 0.2; // 80% reduction
  const annualSavings = traditionalAnnualCost - happyLlamaAnnualCost;
  const roi = ((annualSavings / happyLlamaAnnualCost) * 100);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    setIsContactModalOpen(false);
    setContactForm({ name: '', email: '', company: '', message: '' });
    alert('Thank you! Our enterprise team will contact you within 24 hours.');
  };

  const handleIntegrationClick = (integration: Integration) => {
    if (integration.status === 'Coming Soon') {
      alert(`${integration.name} integration is coming soon! We'll notify you when it's available.`);
      return;
    }
    setSelectedIntegration(integration);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center gap-4 mb-8">
                <Badge variant="default" className="px-3 py-1">SOC 2 Type II</Badge>
                <Badge variant="default" className="px-3 py-1">ISO 27001</Badge>
                <Badge variant="default" className="px-3 py-1">GDPR</Badge>
                <Badge variant="secondary" className="px-3 py-1">HIPAA (Q2 2025)</Badge>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Enterprise-Grade AI Development
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Accelerate innovation with governance, security, and scale built for enterprise requirements. Deploy AI-powered development with the confidence your business demands.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8" onClick={() => setIsContactModalOpen(true)}>
                  Request Enterprise Demo
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact/architecture-review">
                    Schedule Architecture Review
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Security & Compliance First
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built with enterprise security requirements from day one, not bolted on afterwards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">{feature.icon}</div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                    <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {feature.details}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Integration Hub */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Enterprise Integration Hub
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Connect with your existing enterprise systems seamlessly. Over 50+ integrations available.
              </p>
            </div>

            {/* Integration Filters */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search integrations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="whitespace-nowrap"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredIntegrations.map((integration) => (
                <Card 
                  key={integration.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleIntegrationClick(integration)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{integration.logo}</div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <Badge 
                            variant={integration.status === 'Connected' ? 'default' : 
                                   integration.status === 'Available' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {integration.category}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{integration.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {integration.setupTime}
                      </span>
                      <span>{integration.features.length} features</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-12">
                <PuzzlePieceIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No integrations found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or browse all integrations.
                </p>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Calculate Your ROI
              </h2>
              <p className="text-xl text-gray-600">
                See the potential savings with Happy Llama
              </p>
            </div>

            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Current Setup</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Developers</label>
                        <Input
                          type="number"
                          value={roiInputs.developers}
                          onChange={(e) => setRoiInputs(prev => ({ ...prev, developers: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Average Hourly Rate ($)</label>
                        <Input
                          type="number"
                          value={roiInputs.hourlyRate}
                          onChange={(e) => setRoiInputs(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Projects per Year</label>
                        <Input
                          type="number"
                          value={roiInputs.projectsPerYear}
                          onChange={(e) => setRoiInputs(prev => ({ ...prev, projectsPerYear: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Average Project Duration (weeks)</label>
                        <Input
                          type="number"
                          value={roiInputs.averageProjectWeeks}
                          onChange={(e) => setRoiInputs(prev => ({ ...prev, averageProjectWeeks: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Projected Savings</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Traditional Development Cost</div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${traditionalAnnualCost.toLocaleString()}/year
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600">With Happy Llama</div>
                        <div className="text-2xl font-bold text-blue-700">
                          ${happyLlamaAnnualCost.toLocaleString()}/year
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600">Annual Savings</div>
                        <div className="text-2xl font-bold text-green-700">
                          ${annualSavings.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600">ROI</div>
                        <div className="text-2xl font-bold text-purple-700">
                          {roi.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" onClick={() => setIsContactModalOpen(true)}>
                      <ArrowDownIcon className="h-4 w-4 mr-2" />
                      Download Detailed ROI Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deployment Options */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Flexible Deployment Options
              </h2>
              <p className="text-xl text-gray-600">
                Deploy where your data needs to live
              </p>
            </div>

            <Tabs value={selectedDeployment} onValueChange={(value) => setSelectedDeployment(value as any)}>
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
                <TabsTrigger value="cloud">Cloud</TabsTrigger>
                <TabsTrigger value="onpremise">On-Premise</TabsTrigger>
                <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
              </TabsList>

              <TabsContent value="cloud">
                <Card className="max-w-4xl mx-auto">
                  <CardContent className="p-8 text-center">
                    <CloudIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Multi-Cloud Deployment</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Deploy on AWS, Azure, or GCP with auto-scaling, 99.9% uptime SLA, and global CDN for optimal performance.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">AWS</h4>
                        <p className="text-sm text-gray-600">Lambda, RDS, S3</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Azure</h4>
                        <p className="text-sm text-gray-600">Functions, SQL, Blob</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Google Cloud</h4>
                        <p className="text-sm text-gray-600">Functions, SQL, Storage</p>
                      </div>
                    </div>
                    <Button>View Cloud Architecture</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="onpremise">
                <Card className="max-w-4xl mx-auto">
                  <CardContent className="p-8 text-center">
                    <ServerIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">On-Premise Deployment</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Full control over your data with air-gapped deployment options. Perfect for highly regulated industries.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Requirements</h4>
                        <p className="text-sm text-gray-600">Kubernetes cluster, 32GB RAM, 500GB storage</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Setup Time</h4>
                        <p className="text-sm text-gray-600">2-4 days with support</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Support</h4>
                        <p className="text-sm text-gray-600">Dedicated installation team</p>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href="/contact/architecture-review">Request Installation Guide</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hybrid">
                <Card className="max-w-4xl mx-auto">
                  <CardContent className="p-8 text-center">
                    <CogIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">Hybrid Architecture</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Combine cloud flexibility with on-premise control. Keep sensitive data on-premise while leveraging cloud scalability.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">On-Premise</h4>
                        <ul className="text-sm text-gray-600 text-left">
                          <li>• Sensitive data storage</li>
                          <li>• Core business logic</li>
                          <li>• User authentication</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Cloud</h4>
                        <ul className="text-sm text-gray-600 text-left">
                          <li>• AI processing</li>
                          <li>• Code generation</li>
                          <li>• Global distribution</li>
                        </ul>
                      </div>
                    </div>
                    <Button onClick={() => setIsContactModalOpen(true)}>Discuss Hybrid Architecture</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Support Tiers */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Enterprise Support
              </h2>
              <p className="text-xl text-gray-600">
                Get the support your team needs to succeed
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {supportTiers.map((tier, index) => (
                <Card key={index} className={`${tier.highlight ? 'border-blue-500 shadow-lg' : ''} relative`}>
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="text-2xl font-bold text-blue-600">{tier.price}</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-6" 
                      variant={tier.highlight ? 'default' : 'outline'}
                      onClick={() => setIsContactModalOpen(true)}
                    >
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Enterprise?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join enterprise leaders who are accelerating innovation with Happy Llama. Get started with a personalized demo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8" onClick={() => setIsContactModalOpen(true)}>
                Request Enterprise Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/contact/architecture-review">
                  Schedule Architecture Review
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Integration Detail Modal */}
        {selectedIntegration && (
          <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">{selectedIntegration.logo}</div>
                  <div>
                    <DialogTitle className="text-xl">{selectedIntegration.name} Integration</DialogTitle>
                    <DialogDescription>
                      {selectedIntegration.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Setup Time</div>
                    <div className="font-semibold">{selectedIntegration.setupTime}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Category</div>
                    <div className="font-semibold">{selectedIntegration.category}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Features</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {selectedIntegration.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Quick Setup</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    This integration can be configured in {selectedIntegration.setupTime} with our setup wizard.
                  </p>
                  <div className="flex space-x-3">
                    {selectedIntegration.status === 'Connected' ? (
                      <Button variant="outline" size="sm">
                        <PlayIcon className="h-4 w-4 mr-2" />
                        View Integration
                      </Button>
                    ) : (
                      <Button size="sm">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Connect Now
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      Documentation
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Contact Modal */}
        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Contact Enterprise Sales</DialogTitle>
              <DialogDescription>
                Get in touch with our enterprise team for a personalized demo
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Company *</label>
                <Input
                  required
                  value={contactForm.company}
                  onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Acme Corp"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us about your requirements..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Send Message</Button>
                <Button type="button" variant="outline" onClick={() => setIsContactModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}