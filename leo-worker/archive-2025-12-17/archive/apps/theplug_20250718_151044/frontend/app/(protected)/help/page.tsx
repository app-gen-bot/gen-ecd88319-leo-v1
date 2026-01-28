'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  BookOpen,
  Zap,
  MessageSquare,
  Video,
  FileText,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Clock,
  TrendingUp
} from 'lucide-react'

const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using The Plug',
    icon: BookOpen,
    articles: 12,
    href: '/help/getting-started'
  },
  {
    id: 'platforms',
    title: 'Platform Guides',
    description: 'Connect and manage platform integrations',
    icon: Zap,
    articles: 8,
    href: '/help/platforms'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Solve common issues and errors',
    icon: HelpCircle,
    articles: 15,
    href: '/help/troubleshooting'
  },
  {
    id: 'api',
    title: 'API Documentation',
    description: 'Integrate The Plug with your tools',
    icon: FileText,
    articles: 20,
    href: '/api-docs'
  }
]

const popularArticles = [
  {
    title: 'How to upload your first song',
    category: 'Getting Started',
    readTime: '3 min',
    href: '/help/getting-started/first-upload'
  },
  {
    title: 'Connecting to MLC',
    category: 'Platform Guides',
    readTime: '5 min',
    href: '/help/platforms/mlc-setup'
  },
  {
    title: 'Understanding registration status',
    category: 'Getting Started',
    readTime: '4 min',
    href: '/help/getting-started/registration-status'
  },
  {
    title: 'Fixing failed registrations',
    category: 'Troubleshooting',
    readTime: '6 min',
    href: '/help/troubleshooting/failed-registrations'
  },
  {
    title: 'Setting up webhooks',
    category: 'API Documentation',
    readTime: '8 min',
    href: '/help/api/webhooks'
  }
]

const videoTutorials = [
  {
    title: 'Getting Started with The Plug',
    duration: '10:34',
    thumbnail: '/tutorials/getting-started.jpg',
    href: '#'
  },
  {
    title: 'Platform Integration Walkthrough',
    duration: '15:22',
    thumbnail: '/tutorials/integrations.jpg',
    href: '#'
  },
  {
    title: 'Understanding Your Analytics',
    duration: '8:45',
    thumbnail: '/tutorials/analytics.jpg',
    href: '#'
  }
]

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search
    // Debug logging removed for production
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers and learn how to make the most of The Plug
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for articles, guides, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Link href="/help/contact">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </Link>
          <Link href="/status">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              System Status
            </Button>
          </Link>
          <Link href="/changelog">
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              What's New
            </Button>
          </Link>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <category.icon className="h-8 w-8 text-primary mb-3" />
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {category.articles} articles
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <Link key={index} href={article.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium mb-1 hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="secondary">{article.category}</Badge>
                            <span>{article.readTime} read</span>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Video Tutorials */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Video Tutorials</h2>
            <div className="space-y-4">
              {videoTutorials.map((video, index) => (
                <Link key={index} href={video.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-32 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1 hover:text-primary transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Duration: {video.duration}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
            <p className="mb-6 opacity-90">
              Our support team is here to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/help/contact">
                <Button size="lg" variant="secondary">
                  Contact Support
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Video className="h-4 w-4 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}