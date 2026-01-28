'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CubeIcon,
  PlayIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const docCategories = [
    {
      title: 'Getting Started',
      description: 'Essential guides to get up and running',
      icon: <PlayIcon className="h-6 w-6 text-blue-600" />,
      docs: [
        { title: 'Quick Start Guide', type: 'Guide', time: '5 min read' },
        { title: 'Your First Application', type: 'Tutorial', time: '15 min' },
        { title: 'Platform Overview', type: 'Guide', time: '8 min read' }
      ]
    },
    {
      title: 'Core Concepts',
      description: 'Understanding Happy Llama fundamentals',
      icon: <BookOpenIcon className="h-6 w-6 text-green-600" />,
      docs: [
        { title: 'AI-Driven Development', type: 'Concept', time: '10 min read' },
        { title: 'Project Structure', type: 'Guide', time: '12 min read' },
        { title: 'Deployment Pipeline', type: 'Guide', time: '8 min read' }
      ]
    },
    {
      title: 'API Reference',
      description: 'Complete API documentation',
      icon: <CodeBracketIcon className="h-6 w-6 text-purple-600" />,
      docs: [
        { title: 'REST API Overview', type: 'Reference', time: 'Reference' },
        { title: 'Authentication', type: 'Reference', time: 'Reference' },
        { title: 'Webhooks', type: 'Reference', time: 'Reference' }
      ]
    },
    {
      title: 'CLI Tools',
      description: 'Command line interface documentation',
      icon: <CommandLineIcon className="h-6 w-6 text-orange-600" />,
      docs: [
        { title: 'CLI Installation', type: 'Guide', time: '3 min read' },
        { title: 'Command Reference', type: 'Reference', time: 'Reference' },
        { title: 'Advanced Usage', type: 'Guide', time: '15 min read' }
      ]
    },
    {
      title: 'Integrations',
      description: 'Third-party integrations and plugins',
      icon: <CubeIcon className="h-6 w-6 text-red-600" />,
      docs: [
        { title: 'GitHub Integration', type: 'Guide', time: '10 min read' },
        { title: 'CI/CD Workflows', type: 'Tutorial', time: '20 min' },
        { title: 'Database Connections', type: 'Guide', time: '12 min read' }
      ]
    }
  ];

  const popularDocs = [
    { title: 'Quick Start Guide', views: '12.5k', category: 'Getting Started' },
    { title: 'API Authentication', views: '8.2k', category: 'API Reference' },
    { title: 'Deployment Guide', views: '7.9k', category: 'Core Concepts' },
    { title: 'GitHub Integration', views: '6.1k', category: 'Integrations' },
    { title: 'CLI Commands', views: '5.8k', category: 'CLI Tools' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <DocumentTextIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Documentation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to build amazing applications with Happy Llama
            </p>
            
            <div className="relative max-w-2xl mx-auto">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                className="pl-10 pr-4 py-3 text-lg"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Categories */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse Documentation
            </h2>
            <p className="text-xl text-gray-600">
              Organized by topic and experience level
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {docCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {category.icon}
                    <div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.docs.map((doc, docIndex) => (
                      <div key={docIndex} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                            <span className="text-sm text-gray-500">{doc.time}</span>
                          </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      View All {category.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Documentation */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Most Popular Guides
            </h2>
            
            <div className="space-y-4">
              {popularDocs.map((doc, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{doc.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline">{doc.category}</Badge>
                          <span className="text-sm text-gray-500">{doc.views} views</span>
                        </div>
                      </div>
                      <ChevronRightIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Need Help?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <DocumentTextIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Support Center</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Browse our knowledge base and support articles
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/contact/support">Visit Support</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <CommandLineIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Community Forum</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Connect with other developers and get help
                  </p>
                  <Button variant="outline" size="sm">
                    Join Forum
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <CubeIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">API Reference</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete API documentation and examples
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/resources/api-reference">View API Docs</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}