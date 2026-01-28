'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/layout';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'whitepaper' | 'case-study' | 'technical-guide' | 'research-paper' | 'template';
  fileSize: string;
  pageCount?: number;
  format: 'PDF' | 'DOCX' | 'ZIP';
  requiresCompany: boolean;
  category: string;
  publishDate: string;
  downloadCount: number;
}

const resources: Record<string, Resource> = {
  'ai-development-whitepaper': {
    id: 'ai-development-whitepaper',
    title: 'The Future of AI-Driven Software Development',
    description: 'Comprehensive analysis of how AI is transforming software development, including market trends, technology deep-dives, and future predictions.',
    type: 'whitepaper',
    fileSize: '2.8 MB',
    pageCount: 32,
    format: 'PDF',
    requiresCompany: true,
    category: 'Strategy',
    publishDate: '2024-01-15',
    downloadCount: 15420
  },
  'enterprise-security-guide': {
    id: 'enterprise-security-guide',
    title: 'Enterprise Security Implementation Guide',
    description: 'Best practices for implementing enterprise-grade security in AI-generated applications.',
    type: 'technical-guide',
    fileSize: '1.9 MB',
    pageCount: 24,
    format: 'PDF',
    requiresCompany: true,
    category: 'Security',
    publishDate: '2024-01-20',
    downloadCount: 8930
  },
  'roi-calculator-template': {
    id: 'roi-calculator-template',
    title: 'AI Development ROI Calculator',
    description: 'Excel template to calculate return on investment for AI-driven development initiatives.',
    type: 'template',
    fileSize: '450 KB',
    format: 'ZIP',
    requiresCompany: false,
    category: 'Business Tools',
    publishDate: '2024-01-25',
    downloadCount: 12680
  },
  'architecture-patterns-paper': {
    id: 'architecture-patterns-paper',
    title: 'Multi-Agent Architecture Patterns Research',
    description: 'Academic research paper on scalable multi-agent systems for software generation.',
    type: 'research-paper',
    fileSize: '3.2 MB',
    pageCount: 48,
    format: 'PDF',
    requiresCompany: false,
    category: 'Research',
    publishDate: '2024-02-01',
    downloadCount: 5240
  },
  'fintech-case-study': {
    id: 'fintech-case-study',
    title: 'FinTech Startup Success Story',
    description: 'How a fintech startup reduced development time by 80% using Happy Llama.',
    type: 'case-study',
    fileSize: '1.2 MB',
    pageCount: 16,
    format: 'PDF',
    requiresCompany: false,
    category: 'Case Studies',
    publishDate: '2024-02-05',
    downloadCount: 7820
  }
};

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  consent: boolean;
  updates: boolean;
}

const initialFormData: FormData = {
  email: '',
  firstName: '',
  lastName: '',
  company: '',
  jobTitle: '',
  consent: false,
  updates: true
};

export default function DownloadPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.resourceId as string;
  const resource = resources[resourceId];
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadState, setDownloadState] = useState<'form' | 'downloading' | 'success' | 'error'>('form');

  // Redirect if resource not found
  useEffect(() => {
    if (!resource) {
      router.push('/404');
    }
  }, [resource, router]);

  if (!resource) {
    return null;
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (resource.requiresCompany && !formData.company) {
      newErrors.company = 'Company name is required for this resource';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must agree to the terms to download';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setDownloadState('downloading');

    try {
      // Mock API call to process download request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock download process
      console.log('Processing download request:', {
        resource: resource.id,
        user: formData
      });

      // Simulate file download
      const blob = new Blob([`Mock ${resource.title} content`], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${resource.title.replace(/[^a-zA-Z0-9]/g, '-')}.${resource.format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadState('success');
    } catch (error) {
      console.error('Download error:', error);
      setDownloadState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'whitepaper':
        return DocumentIcon;
      case 'case-study':
        return DocumentArrowDownIcon;
      case 'technical-guide':
        return DocumentIcon;
      case 'research-paper':
        return DocumentIcon;
      case 'template':
        return DocumentArrowDownIcon;
      default:
        return DocumentIcon;
    }
  };

  const ResourceIcon = getResourceIcon(resource.type);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            
            {downloadState === 'form' && (
              <>
                {/* Resource Information */}
                <Card className="mb-8">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ResourceIcon className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {resource.title}
                        </h1>
                        <p className="text-gray-600 mb-4">
                          {resource.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                            {resource.format} • {resource.fileSize}
                          </div>
                          {resource.pageCount && (
                            <div>
                              {resource.pageCount} pages
                            </div>
                          )}
                          <div>
                            {resource.downloadCount.toLocaleString()} downloads
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Download Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Download {resource.title}</CardTitle>
                    <CardDescription>
                      Please provide your information to access this resource. We'll also send you a copy via email.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => updateFormData('firstName', e.target.value)}
                            className={errors.firstName ? 'border-red-500' : ''}
                            placeholder="John"
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => updateFormData('lastName', e.target.value)}
                            className={errors.lastName ? 'border-red-500' : ''}
                            placeholder="Smith"
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          className={errors.email ? 'border-red-500' : ''}
                          placeholder="john@company.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="company">
                          Company {resource.requiresCompany ? '*' : '(optional)'}
                        </Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => updateFormData('company', e.target.value)}
                          className={errors.company ? 'border-red-500' : ''}
                          placeholder="Acme Corp"
                        />
                        {errors.company && (
                          <p className="text-red-500 text-sm mt-1">{errors.company}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="jobTitle">Job Title (optional)</Label>
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) => updateFormData('jobTitle', e.target.value)}
                          placeholder="Software Engineer"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="consent"
                            checked={formData.consent}
                            onCheckedChange={(checked) => updateFormData('consent', checked)}
                          />
                          <div className="text-sm">
                            <Label htmlFor="consent" className="font-medium">
                              I agree to the Terms of Service and Privacy Policy *
                            </Label>
                            {errors.consent && (
                              <p className="text-red-500 mt-1">{errors.consent}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="updates"
                            checked={formData.updates}
                            onCheckedChange={(checked) => updateFormData('updates', checked)}
                          />
                          <Label htmlFor="updates" className="text-sm">
                            Send me updates about new resources and Happy Llama news
                          </Label>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                            Processing Download...
                          </>
                        ) : (
                          <>
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Download {resource.format}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}

            {downloadState === 'downloading' && (
              <Card>
                <CardContent className="p-12 text-center">
                  <ClockIcon className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Preparing Your Download
                  </h2>
                  <p className="text-gray-600">
                    Please wait while we prepare your file...
                  </p>
                </CardContent>
              </Card>
            )}

            {downloadState === 'success' && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Download Complete!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your download should start automatically. We've also sent a copy to your email address.
                  </p>
                  
                  <div className="space-y-3">
                    <Button onClick={() => window.location.reload()} className="w-full">
                      Download Again
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/resources')} className="w-full">
                      Browse More Resources
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {downloadState === 'error' && (
              <Card>
                <CardContent className="p-12 text-center">
                  <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Download Failed
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Sorry, there was an error processing your download. Please try again.
                  </p>
                  
                  <div className="space-y-3">
                    <Button onClick={() => setDownloadState('form')} className="w-full">
                      Try Again
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/contact/support')} className="w-full">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}