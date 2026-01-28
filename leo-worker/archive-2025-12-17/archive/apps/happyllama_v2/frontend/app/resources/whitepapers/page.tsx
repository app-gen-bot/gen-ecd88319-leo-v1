"use client"

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DocumentTextIcon,
  ArrowDownIcon,
  ClockIcon,
  EyeIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function WhitepapersPage() {
  const whitepapers = [
    {
      id: 'ai-development-whitepaper',
      title: 'The Future of AI-Powered Development',
      description: 'A comprehensive analysis of how artificial intelligence is transforming software development practices and what it means for developers.',
      category: 'Industry Analysis',
      pages: 24,
      publishDate: 'January 2025',
      downloads: '2.3k',
      featured: true
    },
    {
      id: 'comparative-study-whitepaper',
      title: 'No-Code vs Low-Code vs AI-Code: A Comparative Study',
      description: 'Examining the strengths and limitations of different development approaches in modern software creation.',
      category: 'Research',
      pages: 18,
      publishDate: 'December 2024',
      downloads: '1.8k',
      featured: true
    },
    {
      id: 'enterprise-security-guide',
      title: 'Enterprise AI Development: Security and Governance',
      description: 'Best practices for implementing AI-powered development tools in enterprise environments while maintaining security and compliance.',
      category: 'Enterprise',
      pages: 32,
      publishDate: 'November 2024',
      downloads: '1.2k',
      featured: false
    },
    {
      id: 'roi-calculator-template',
      title: 'ROI Analysis: AI Development Platforms',
      description: 'Quantifying the return on investment when adopting AI-powered development platforms in organizations of different sizes.',
      category: 'Business',
      pages: 16,
      publishDate: 'October 2024',
      downloads: '956',
      featured: false
    },
    {
      id: 'architecture-patterns-paper',
      title: 'Technical Deep Dive: Code Generation at Scale',
      description: 'An in-depth look at the technical architecture and algorithms behind large-scale AI code generation systems.',
      category: 'Technical',
      pages: 28,
      publishDate: 'September 2024',
      downloads: '743',
      featured: false
    },
    {
      id: 'developer-experience-whitepaper',
      title: 'Developer Productivity Metrics in the AI Era',
      description: 'How traditional productivity metrics are evolving with the introduction of AI-powered development tools.',
      category: 'Research',
      pages: 20,
      publishDate: 'August 2024',
      downloads: '892',
      featured: false
    }
  ];

  const categories = ['All', 'Industry Analysis', 'Research', 'Enterprise', 'Business', 'Technical'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <DocumentTextIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Whitepapers & Research
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              In-depth analysis and insights on the future of AI-powered development
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="default" className="px-3 py-1">6 Research Papers</Badge>
              <Badge variant="secondary" className="px-3 py-1">8.1k Total Downloads</Badge>
              <Badge variant="outline" className="px-3 py-1">Industry Leading Research</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'All' ? 'default' : 'outline'}
                size="sm"
                className="mb-2"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Whitepapers */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Research
              </h2>
              <p className="text-xl text-gray-600">
                Our latest and most impactful research papers
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {whitepapers.filter(paper => paper.featured).map((paper, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="default" className="mb-2">{paper.category}</Badge>
                      <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <CardTitle className="text-xl leading-tight">{paper.title}</CardTitle>
                    <CardDescription className="text-base">{paper.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <DocumentTextIcon className="h-4 w-4" />
                          {paper.pages} pages
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {paper.publishDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowDownIcon className="h-4 w-4" />
                          {paper.downloads}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button className="flex-1" asChild>
                        <Link href={`/download/${paper.id}`}>
                          <ArrowDownIcon className="mr-2 h-4 w-4" />
                          Download PDF
                        </Link>
                      </Button>
                      <Button variant="outline">
                        <EyeIcon className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* All Whitepapers */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                All Research Papers
              </h2>
              <p className="text-xl text-gray-600">
                Complete collection of our research and analysis
              </p>
            </div>

            <div className="space-y-6">
              {whitepapers.map((paper, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">{paper.category}</Badge>
                          {paper.featured && <Badge variant="default">Featured</Badge>}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{paper.title}</h3>
                        <p className="text-gray-600 mb-4">{paper.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <DocumentTextIcon className="h-4 w-4" />
                            {paper.pages} pages
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {paper.publishDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <ArrowDownIcon className="h-4 w-4" />
                            {paper.downloads} downloads
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button asChild>
                            <Link href={`/download/${paper.id}`}>
                              <ArrowDownIcon className="mr-2 h-4 w-4" />
                              Download PDF
                            </Link>
                          </Button>
                          <Button variant="outline">
                            <EyeIcon className="mr-2 h-4 w-4" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ChartBarIcon className="h-16 w-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl font-bold mb-4">
              Stay Updated with Our Research
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get notified when we publish new whitepapers and research insights
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button size="lg" variant="secondary" className="px-8">
                <UserGroupIcon className="mr-2 h-4 w-4" />
                Subscribe to Research Updates
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}