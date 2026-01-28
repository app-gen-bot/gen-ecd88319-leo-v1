'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MagnifyingGlassIcon, 
  CodeBracketIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/layout';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'SaaS' | 'E-commerce' | 'Content' | 'Mobile' | 'Analytics' | 'Other';
  status: 'Available' | 'Coming Soon' | 'Premium';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  buildTime: string;
  features: string[];
  techStack: string[];
  previewImage: string;
  demoUrl?: string;
  sourceUrl?: string;
  usageCount: number;
  rating: number;
}

const templates: Template[] = [
  {
    id: 'saas-dashboard',
    title: 'SaaS Dashboard Template',
    description: 'Complete dashboard with user management, analytics, billing, and team features. Perfect for SaaS applications.',
    category: 'SaaS',
    status: 'Available',
    difficulty: 'Intermediate',
    buildTime: '2-3 hours',
    features: ['User Authentication', 'Dashboard Analytics', 'Team Management', 'Billing Integration', 'Settings Panel'],
    techStack: ['React', 'TypeScript', 'NextJS', 'Tailwind', 'Prisma'],
    previewImage: '/images/template-saas.png',
    demoUrl: '/demo/saas-dashboard',
    usageCount: 1250,
    rating: 4.8
  },
  {
    id: 'ecommerce-store',
    title: 'E-commerce Store Template',
    description: 'Full-featured online store with product catalog, shopping cart, checkout, and order management.',
    category: 'E-commerce',
    status: 'Available', 
    difficulty: 'Advanced',
    buildTime: '4-6 hours',
    features: ['Product Catalog', 'Shopping Cart', 'Payment Processing', 'Order Management', 'Inventory Tracking'],
    techStack: ['React', 'NextJS', 'Stripe', 'MongoDB', 'Tailwind'],
    previewImage: '/images/template-ecommerce.png',
    demoUrl: '/demo/ecommerce-store',
    usageCount: 890,
    rating: 4.7
  },
  {
    id: 'blog-platform',
    title: 'Blog Platform Template',
    description: 'Modern blog platform with CMS features, SEO optimization, and social sharing capabilities.',
    category: 'Content',
    status: 'Available',
    difficulty: 'Beginner',
    buildTime: '1-2 hours',
    features: ['Content Management', 'SEO Optimization', 'Social Sharing', 'Comment System', 'Newsletter'],
    techStack: ['React', 'NextJS', 'MDX', 'Tailwind', 'Vercel'],
    previewImage: '/images/template-blog.png',
    demoUrl: '/demo/blog-platform',
    usageCount: 2100,
    rating: 4.9
  },
  {
    id: 'mobile-app',
    title: 'Mobile App Template',
    description: 'Cross-platform mobile app template with native-like performance and modern UI components.',
    category: 'Mobile',
    status: 'Coming Soon',
    difficulty: 'Advanced',
    buildTime: '6-8 hours',
    features: ['Cross-platform', 'Push Notifications', 'Offline Support', 'Native Performance', 'App Store Ready'],
    techStack: ['React Native', 'Expo', 'TypeScript', 'AsyncStorage'],
    previewImage: '/images/template-mobile.png',
    usageCount: 0,
    rating: 0
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Business intelligence dashboard with real-time charts, KPI tracking, and data visualization.',
    category: 'Analytics',
    status: 'Available',
    difficulty: 'Intermediate',
    buildTime: '3-4 hours',
    features: ['Real-time Charts', 'KPI Tracking', 'Data Export', 'Custom Reports', 'Team Sharing'],
    techStack: ['React', 'D3.js', 'TypeScript', 'PostgreSQL', 'Tailwind'],
    previewImage: '/images/template-analytics.png',
    demoUrl: '/demo/analytics-dashboard',
    usageCount: 640,
    rating: 4.6
  },
  {
    id: 'crm-system',
    title: 'CRM System Template',
    description: 'Customer relationship management system with contact management, sales pipeline, and reporting.',
    category: 'SaaS',
    status: 'Premium',
    difficulty: 'Advanced', 
    buildTime: '8-10 hours',
    features: ['Contact Management', 'Sales Pipeline', 'Task Management', 'Reporting', 'Email Integration'],
    techStack: ['React', 'NextJS', 'PostgreSQL', 'Prisma', 'Tailwind'],
    previewImage: '/images/template-crm.png',
    demoUrl: '/demo/crm-system',
    usageCount: 320,
    rating: 4.5
  }
];

const categoryIcons = {
  'SaaS': CogIcon,
  'E-commerce': ShoppingCartIcon,
  'Content': DocumentTextIcon,
  'Mobile': DevicePhoneMobileIcon,
  'Analytics': ChartBarIcon,
  'Other': CodeBracketIcon
};

const categoryColors = {
  'SaaS': 'bg-blue-100 text-blue-800',
  'E-commerce': 'bg-green-100 text-green-800',
  'Content': 'bg-purple-100 text-purple-800',
  'Mobile': 'bg-orange-100 text-orange-800',
  'Analytics': 'bg-red-100 text-red-800',
  'Other': 'bg-gray-100 text-gray-800'
};

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [showUseTemplateModal, setShowUseTemplateModal] = useState<Template | null>(null);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const handleUseTemplate = (template: Template) => {
    if (template.status === 'Coming Soon') {
      alert('This template is coming soon! Sign up for notifications to be the first to know when it\'s available.');
      return;
    }
    if (template.status === 'Premium') {
      alert('This is a premium template. Upgrade to Pro to access premium templates.');
      return;
    }
    setShowUseTemplateModal(template);
  };

  const confirmUseTemplate = (template: Template) => {
    // Mock template usage
    alert(`Starting new project with ${template.title}! 
    
📋 Next Steps:
1. Setting up project structure...
2. Installing dependencies...
3. Configuring database...
4. Creating initial pages...

You'll be redirected to the project builder in a moment.`);
    
    setShowUseTemplateModal(null);
    
    // In real app, would redirect to project builder with template
    // router.push(`/builder/new?template=${template.id}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Template Library
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Jump-start your next project with professionally designed templates. 
              Each template is production-ready and fully customizable.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
                <div className="text-gray-500">Templates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}
                </div>
                <div className="text-gray-500">Downloads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {(templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)}
                </div>
                <div className="text-gray-500">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const IconComponent = categoryIcons[template.category];
              
              return (
                <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {/* Preview Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                      <IconComponent className="h-16 w-16 text-gray-400" />
                      {template.status === 'Coming Soon' && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">Coming Soon</Badge>
                        </div>
                      )}
                      {template.status === 'Premium' && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500">Premium</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={categoryColors[template.category]}>
                            {template.category}
                          </Badge>
                          <Badge variant="outline">{template.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        ⭐ {template.rating > 0 ? template.rating.toFixed(1) : 'New'}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="mb-4">
                      {template.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Build Time: {template.buildTime}
                        </div>
                        <div className="text-sm text-gray-500">
                          {template.usageCount.toLocaleString()} developers used this
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Key Features:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                          {template.features.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{template.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        {template.demoUrl && template.status === 'Available' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleUseTemplate(template)}
                          disabled={template.status === 'Coming Soon'}
                        >
                          <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                          {template.status === 'Coming Soon' ? 'Coming Soon' : 'Use Template'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No templates found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or browse all templates.
              </p>
            </div>
          )}
        </div>

        {/* Use Template Confirmation Modal */}
        {showUseTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Use Template: {showUseTemplateModal.title}</CardTitle>
                <CardDescription>
                  This will create a new project based on this template
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">What's included:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {showUseTemplateModal.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tech Stack:</h4>
                    <div className="flex flex-wrap gap-2">
                      {showUseTemplateModal.techStack.map((tech, idx) => (
                        <Badge key={idx} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Estimated setup time:</strong> {showUseTemplateModal.buildTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowUseTemplateModal(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => confirmUseTemplate(showUseTemplateModal)}
                    className="flex-1"
                  >
                    Create Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}