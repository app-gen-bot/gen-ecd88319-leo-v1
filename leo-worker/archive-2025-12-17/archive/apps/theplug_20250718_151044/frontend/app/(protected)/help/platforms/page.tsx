'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  Key,
  Shield,
  Globe,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Settings,
  ChevronRight,
  Info
} from 'lucide-react'

const platforms = [
  {
    id: 'mlc',
    name: 'MLC (Mechanical Licensing Collective)',
    description: 'US mechanical royalty collection',
    logo: '🎵',
    status: 'connected',
    authType: 'OAuth',
    category: 'Collection Society',
    registrationTime: '24-48 hours',
    articles: [
      {
        title: 'MLC Complete Setup Guide',
        description: 'Step-by-step instructions for MLC integration',
        readTime: '8 min',
        featured: true
      },
      {
        title: 'Understanding MLC Registration',
        description: 'What happens when you register with MLC',
        readTime: '5 min'
      },
      {
        title: 'MLC Revenue Reports',
        description: 'How to read your MLC statements',
        readTime: '6 min'
      },
      {
        title: 'Troubleshooting MLC Issues',
        description: 'Common problems and solutions',
        readTime: '4 min'
      }
    ]
  },
  {
    id: 'bmi',
    name: 'BMI',
    description: 'Performance rights organization',
    logo: '🎼',
    status: 'not_connected',
    authType: 'API Key',
    category: 'PRO',
    registrationTime: '3-5 business days',
    articles: [
      {
        title: 'BMI Integration Guide',
        description: 'Connect your BMI account to The Plug',
        readTime: '6 min'
      },
      {
        title: 'BMI API Key Setup',
        description: 'How to generate and configure your API key',
        readTime: '4 min'
      },
      {
        title: 'BMI Live Performance Registration',
        description: 'Registering live performances through The Plug',
        readTime: '5 min'
      }
    ]
  },
  {
    id: 'ascap',
    name: 'ASCAP',
    description: 'Performance rights organization',
    logo: '🎹',
    status: 'not_connected',
    authType: 'Credentials',
    category: 'PRO',
    registrationTime: '3-5 business days',
    articles: [
      {
        title: 'ASCAP Setup Walkthrough',
        description: 'Complete guide to ASCAP integration',
        readTime: '7 min'
      },
      {
        title: 'ASCAP Title Registration',
        description: 'How automatic registration works',
        readTime: '4 min'
      },
      {
        title: 'ASCAP Payment Schedule',
        description: 'Understanding distribution cycles',
        readTime: '3 min'
      }
    ]
  },
  {
    id: 'soundexchange',
    name: 'SoundExchange',
    description: 'Digital performance royalties',
    logo: '📻',
    status: 'connected',
    authType: 'OAuth',
    category: 'Digital Performance',
    registrationTime: '1-2 business days',
    articles: [
      {
        title: 'SoundExchange Integration',
        description: 'Setting up digital performance tracking',
        readTime: '5 min'
      },
      {
        title: 'Understanding SoundExchange Royalties',
        description: 'What royalties SoundExchange collects',
        readTime: '6 min'
      }
    ]
  },
  {
    id: 'hfa',
    name: 'Harry Fox Agency',
    description: 'Mechanical licensing',
    logo: '📄',
    status: 'not_connected',
    authType: 'API Key',
    category: 'Mechanical Rights',
    registrationTime: '2-3 business days',
    articles: [
      {
        title: 'HFA Quick Start',
        description: 'Get started with Harry Fox Agency',
        readTime: '4 min'
      },
      {
        title: 'HFA vs MLC',
        description: 'Understanding the differences',
        readTime: '5 min'
      }
    ]
  }
]

const platformCategories = [
  { name: 'All Platforms', value: 'all', count: platforms.length },
  { name: 'Collection Society', value: 'Collection Society', count: 1 },
  { name: 'PRO', value: 'PRO', count: 2 },
  { name: 'Digital Performance', value: 'Digital Performance', count: 1 },
  { name: 'Mechanical Rights', value: 'Mechanical Rights', count: 1 }
]

export default function PlatformGuidesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Debug logging removed for production
  }

  const filteredPlatforms = platforms.filter(platform => {
    const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         platform.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || platform.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const activePlatform = platforms.find(p => p.id === selectedPlatform)

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
          
          <h1 className="text-4xl font-bold mb-4">Platform Guides</h1>
          <p className="text-xl text-muted-foreground">
            Learn how to connect and manage your music industry platform integrations
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search platforms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {platformCategories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Alert */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            The Plug automatically registers your music with connected platforms. 
            Learn how to connect each platform and understand their registration processes.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Platform List */}
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {filteredPlatforms.map((platform) => (
                <Card 
                  key={platform.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlatform === platform.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPlatform(platform.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{platform.logo}</div>
                        <div>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                          <CardDescription>{platform.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {platform.status === 'connected' ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Not Connected
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {platform.authType}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {platform.registrationTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {platform.articles.length} guides
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPlatforms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No platforms found matching your search.</p>
              </div>
            )}
          </div>

          {/* Platform Details Sidebar */}
          <div className="space-y-6">
            {activePlatform ? (
              <>
                {/* Platform Articles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{activePlatform.logo}</span>
                      {activePlatform.name} Guides
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activePlatform.articles.map((article, index) => (
                        <Link key={index} href="#">
                          <div className="group cursor-pointer p-3 -mx-3 rounded-lg hover:bg-muted transition-colors">
                            <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {article.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
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
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activePlatform.status === 'connected' ? (
                      <>
                        <Link href={`/integrations/${activePlatform.id}/settings`}>
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Platform Settings
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/integrations">
                          <Button className="w-full justify-start">
                            <Zap className="h-4 w-4 mr-2" />
                            Connect {activePlatform.name}
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit {activePlatform.name} Website
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Auth Type Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Authentication Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activePlatform.authType === 'OAuth' && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span>Secure OAuth Connection</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You'll be redirected to {activePlatform.name} to authorize The Plug. 
                            We never see your password.
                          </p>
                        </>
                      )}
                      {activePlatform.authType === 'API Key' && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Key className="h-4 w-4 text-blue-500" />
                            <span>API Key Required</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You'll need to generate an API key from your {activePlatform.name} account 
                            and enter it in The Plug.
                          </p>
                        </>
                      )}
                      {activePlatform.authType === 'Credentials' && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-yellow-500" />
                            <span>Username & Password</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enter your {activePlatform.name} credentials. They're encrypted and stored securely.
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a platform to view guides and details
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Need Help */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Platform issues?</h3>
                <p className="text-sm mb-4 opacity-90">
                  Our team can help with platform connections
                </p>
                <Link href="/help/contact">
                  <Button size="sm" variant="secondary">
                    Get Help
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}