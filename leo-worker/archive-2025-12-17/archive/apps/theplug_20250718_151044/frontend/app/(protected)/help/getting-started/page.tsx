'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Search,
  BookOpen,
  Upload,
  Music,
  Zap,
  BarChart3,
  Settings,
  PlayCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  FileAudio,
  Users,
  CreditCard
} from 'lucide-react'

const gettingStartedArticles = [
  {
    category: 'First Steps',
    articles: [
      {
        title: 'Welcome to The Plug',
        description: 'Overview of features and capabilities',
        readTime: '5 min',
        href: '#',
        icon: BookOpen
      },
      {
        title: 'Creating your account',
        description: 'Sign up and verify your email',
        readTime: '3 min',
        href: '#',
        icon: Users
      },
      {
        title: 'Choosing your plan',
        description: 'Compare Free, Pro, and Enterprise options',
        readTime: '4 min',
        href: '#',
        icon: CreditCard
      }
    ]
  },
  {
    category: 'Uploading Music',
    articles: [
      {
        title: 'How to upload your first song',
        description: 'Step-by-step guide to uploading music',
        readTime: '3 min',
        href: '#',
        icon: Upload,
        featured: true
      },
      {
        title: 'Supported file formats',
        description: 'WAV, MP3, FLAC, and more',
        readTime: '2 min',
        href: '#',
        icon: FileAudio
      },
      {
        title: 'Adding metadata',
        description: 'Title, artist, album, and ISRC information',
        readTime: '4 min',
        href: '#',
        icon: Music
      },
      {
        title: 'Bulk upload guide',
        description: 'Upload multiple songs at once',
        readTime: '5 min',
        href: '#',
        icon: Upload
      }
    ]
  },
  {
    category: 'Platform Connections',
    articles: [
      {
        title: 'Connecting your first platform',
        description: 'Link MLC, BMI, ASCAP, and more',
        readTime: '6 min',
        href: '#',
        icon: Zap
      },
      {
        title: 'Understanding platform requirements',
        description: 'What each platform needs from you',
        readTime: '8 min',
        href: '#',
        icon: Settings
      },
      {
        title: 'Platform authentication guide',
        description: 'OAuth, API keys, and credentials',
        readTime: '5 min',
        href: '#',
        icon: Settings
      }
    ]
  },
  {
    category: 'Registration Process',
    articles: [
      {
        title: 'Understanding registration status',
        description: 'What each status means for your music',
        readTime: '4 min',
        href: '#',
        icon: CheckCircle,
        featured: true
      },
      {
        title: 'How automatic registration works',
        description: 'Behind the scenes of The Plug',
        readTime: '6 min',
        href: '#',
        icon: Zap
      },
      {
        title: 'Registration timelines',
        description: 'How long each platform takes',
        readTime: '3 min',
        href: '#',
        icon: Clock
      }
    ]
  },
  {
    category: 'Analytics & Revenue',
    articles: [
      {
        title: 'Understanding your dashboard',
        description: 'Key metrics and what they mean',
        readTime: '5 min',
        href: '#',
        icon: BarChart3
      },
      {
        title: 'Revenue tracking basics',
        description: 'How to track your earnings',
        readTime: '4 min',
        href: '#',
        icon: CreditCard
      },
      {
        title: 'Exporting your data',
        description: 'Download reports and analytics',
        readTime: '3 min',
        href: '#',
        icon: BarChart3
      }
    ]
  }
]

const videoTutorials = [
  {
    title: 'Quick Start Guide',
    duration: '5:20',
    description: 'Everything you need to know in 5 minutes',
    featured: true
  },
  {
    title: 'Uploading Your First Song',
    duration: '3:45',
    description: 'Complete walkthrough of the upload process'
  },
  {
    title: 'Connecting to MLC',
    duration: '7:15',
    description: 'Step-by-step MLC integration guide'
  },
  {
    title: 'Understanding Your Dashboard',
    duration: '6:30',
    description: 'Tour of analytics and key features'
  }
]

export default function GettingStartedPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Debug logging removed for production
  }

  const filteredArticles = activeCategory === 'all' 
    ? gettingStartedArticles 
    : gettingStartedArticles.filter(cat => cat.category.toLowerCase().includes(activeCategory))

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
          
          <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know to start using The Plug
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search getting started articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Quick Start Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Music
              </CardTitle>
              <CardDescription>
                Start by uploading your first song
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/music/upload">
                <Button className="w-full">
                  Upload Now
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Connect Platforms
              </CardTitle>
              <CardDescription>
                Link your music industry accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/integrations">
                <Button variant="outline" className="w-full">
                  View Integrations
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Watch Tutorial
              </CardTitle>
              <CardDescription>
                5-minute quick start video guide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Play Video
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setActiveCategory('all')}>
              All Articles
            </TabsTrigger>
            <TabsTrigger value="upload" onClick={() => setActiveCategory('upload')}>
              Uploading
            </TabsTrigger>
            <TabsTrigger value="platform" onClick={() => setActiveCategory('platform')}>
              Platforms
            </TabsTrigger>
            <TabsTrigger value="registration" onClick={() => setActiveCategory('registration')}>
              Registration
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Articles Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Articles */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {filteredArticles.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
                  <div className="grid gap-4">
                    {category.articles.map((article, articleIndex) => (
                      <Link key={articleIndex} href={article.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <article.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h3 className="font-medium mb-1 hover:text-primary transition-colors">
                                      {article.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {article.description}
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-muted-foreground">
                                        {article.readTime} read
                                      </span>
                                      {article.featured && (
                                        <Badge variant="secondary" className="text-xs">
                                          Popular
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Tutorials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {videoTutorials.map((video, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                          <PlayCircle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {video.duration}
                          </p>
                        </div>
                      </div>
                      {video.featured && (
                        <Badge variant="secondary" className="text-xs mt-2">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Need More Help */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Still have questions?</h3>
                <p className="text-sm mb-4 opacity-90">
                  Our support team is here to help you get started
                </p>
                <Link href="/help/contact">
                  <Button size="sm" variant="secondary">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Setup Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Account created</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Email verified</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload first song</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Connect platform</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}