"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon, PlayIcon, CalendarIcon, ClockIcon, UsersIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Layout from '@/components/layout'

interface Webinar {
  id: string
  title: string
  description: string
  speaker: {
    name: string
    title: string
    company: string
    avatar: string
  }
  date: string
  time: string
  duration: string
  attendees: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  status: 'upcoming' | 'live' | 'recorded'
  registrationUrl?: string
  recordingUrl?: string
  thumbnail: string
  topics: string[]
  featured: boolean
}

const upcomingWebinars: Webinar[] = [
  {
    id: 'ai-development-future',
    title: 'The Future of AI-Powered Development: Trends for 2025',
    description: 'Join our CEO as she explores the latest trends in AI development, including multi-agent systems, autonomous code generation, and the evolution of developer tools.',
    speaker: {
      name: 'Sarah Mitchell',
      title: 'CEO & Co-Founder',
      company: 'Happy Llama',
      avatar: 'SM'
    },
    date: '2025-02-15',
    time: '2:00 PM PST',
    duration: '60 minutes',
    attendees: 847,
    level: 'Intermediate',
    category: 'Industry Trends',
    status: 'upcoming',
    registrationUrl: '/webinar-registration/ai-development-future',
    thumbnail: '/images/webinars/ai-future.jpg',
    topics: ['AI Development', 'Multi-agent Systems', 'Code Generation', 'Industry Trends'],
    featured: true
  },
  {
    id: 'getting-started-happy-llama',
    title: 'Getting Started with Happy Llama: From Idea to Deployment',
    description: 'A hands-on workshop showing how to transform your app ideas into production-ready applications using Happy Llama\'s AI-powered development platform.',
    speaker: {
      name: 'Marcus Chen',
      title: 'Developer Relations',
      company: 'Happy Llama',
      avatar: 'MC'
    },
    date: '2025-02-22',
    time: '11:00 AM PST',
    duration: '90 minutes',
    attendees: 1243,
    level: 'Beginner',
    category: 'Getting Started',
    status: 'upcoming',
    registrationUrl: '/webinar-registration/getting-started',
    thumbnail: '/images/webinars/getting-started.jpg',
    topics: ['Happy Llama Basics', 'App Development', 'Deployment', 'Hands-on Workshop'],
    featured: true
  },
  {
    id: 'enterprise-architecture',
    title: 'Enterprise Architecture Patterns with AI Agents',
    description: 'Deep dive into how AI agents make architectural decisions for enterprise applications, including scalability, security, and maintainability patterns.',
    speaker: {
      name: 'Dr. James Liu',
      title: 'Principal Architect',
      company: 'Happy Llama',
      avatar: 'JL'
    },
    date: '2025-03-01',
    time: '1:00 PM PST',
    duration: '75 minutes',
    attendees: 623,
    level: 'Advanced',
    category: 'Architecture',
    status: 'upcoming',
    registrationUrl: '/webinar-registration/enterprise-architecture',
    thumbnail: '/images/webinars/enterprise-arch.jpg',
    topics: ['Enterprise Architecture', 'Scalability', 'Security Patterns', 'AI Decision Making'],
    featured: false
  }
]

const recordedWebinars: Webinar[] = [
  {
    id: 'no-code-vs-ai-code',
    title: 'No-Code vs AI-Generated Code: Making the Right Choice',
    description: 'Compare traditional no-code platforms with AI-generated code solutions. Learn when to use each approach and how Happy Llama bridges the gap.',
    speaker: {
      name: 'Rachel Torres',
      title: 'Product Strategy',
      company: 'Happy Llama',
      avatar: 'RT'
    },
    date: '2025-01-18',
    time: 'Recorded',
    duration: '55 minutes',
    attendees: 2156,
    level: 'Intermediate',
    category: 'Product Education',
    status: 'recorded',
    recordingUrl: '/webinar-recording/no-code-vs-ai',
    thumbnail: '/images/webinars/no-code-vs-ai.jpg',
    topics: ['No-Code Platforms', 'AI Code Generation', 'Platform Comparison', 'Decision Framework'],
    featured: true
  },
  {
    id: 'type-safety-ai',
    title: 'How AI Ensures Type Safety in Generated Code',
    description: 'Technical deep dive into how Happy Llama\'s AI agents generate type-safe code and prevent runtime errors through advanced static analysis.',
    speaker: {
      name: 'Alex Rodriguez',
      title: 'Lead Engineer',
      company: 'Happy Llama',
      avatar: 'AR'
    },
    date: '2025-01-11',
    time: 'Recorded',
    duration: '68 minutes',
    attendees: 1789,
    level: 'Advanced',
    category: 'Technical Deep Dive',
    status: 'recorded',
    recordingUrl: '/webinar-recording/type-safety',
    thumbnail: '/images/webinars/type-safety.jpg',
    topics: ['Type Safety', 'Static Analysis', 'Code Quality', 'AI Engineering'],
    featured: false
  },
  {
    id: 'scaling-with-ai',
    title: 'Scaling Your Startup with AI Development',
    description: 'Success stories from founders who used Happy Llama to build and scale their startups. Learn practical tips for rapid development and deployment.',
    speaker: {
      name: 'Jennifer Kim',
      title: 'Customer Success',
      company: 'Happy Llama',
      avatar: 'JK'
    },
    date: '2024-12-20',
    time: 'Recorded',
    duration: '62 minutes',
    attendees: 3421,
    level: 'Beginner',
    category: 'Success Stories',
    status: 'recorded',
    recordingUrl: '/webinar-recording/scaling-startup',
    thumbnail: '/images/webinars/scaling-startup.jpg',
    topics: ['Startup Scaling', 'Success Stories', 'Rapid Development', 'Customer Stories'],
    featured: true
  },
  {
    id: 'security-compliance',
    title: 'Security and Compliance in AI-Generated Applications',
    description: 'Learn how Happy Llama ensures enterprise-grade security and compliance in generated applications, including SOC 2, GDPR, and industry-specific requirements.',
    speaker: {
      name: 'David Park',
      title: 'Security Engineer',
      company: 'Happy Llama',
      avatar: 'DP'
    },
    date: '2024-12-13',
    time: 'Recorded',
    duration: '71 minutes',
    attendees: 1634,
    level: 'Intermediate',
    category: 'Security',
    status: 'recorded',
    recordingUrl: '/webinar-recording/security-compliance',
    thumbnail: '/images/webinars/security.jpg',
    topics: ['Security', 'Compliance', 'SOC 2', 'GDPR', 'Enterprise Features'],
    featured: false
  }
]

const categories = ['All Categories', 'Getting Started', 'Industry Trends', 'Architecture', 'Product Education', 'Technical Deep Dive', 'Success Stories', 'Security']
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export default function WebinarsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null)
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
    interests: ''
  })
  const [registrationStep, setRegistrationStep] = useState<'form' | 'success'>('form')

  const filterWebinars = (webinars: Webinar[]) => {
    return webinars.filter(webinar => {
      const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           webinar.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'All Categories' || webinar.category === selectedCategory
      const matchesLevel = selectedLevel === 'All Levels' || webinar.level === selectedLevel
      return matchesSearch && matchesCategory && matchesLevel
    })
  }

  const filteredUpcoming = filterWebinars(upcomingWebinars)
  const filteredRecorded = filterWebinars(recordedWebinars)

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRegistrationStep('success')
  }

  const WebinarCard = ({ webinar, isUpcoming = false }: { webinar: Webinar; isUpcoming?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative bg-gray-100 flex items-center justify-center">
        <div className="text-6xl text-gray-400">
          {isUpcoming ? '🎥' : '▶️'}
        </div>
        {webinar.featured && (
          <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
            Featured
          </Badge>
        )}
        {webinar.status === 'live' && (
          <Badge className="absolute top-4 right-4 bg-red-600 text-white animate-pulse">
            LIVE
          </Badge>
        )}
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{webinar.category}</Badge>
          <Badge variant={webinar.level === 'Beginner' ? 'secondary' : webinar.level === 'Advanced' ? 'default' : 'outline'}>
            {webinar.level}
          </Badge>
        </div>
        <CardTitle className="text-lg line-clamp-2 hover:text-blue-600 transition-colors">
          {webinar.title}
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-3">{webinar.description}</p>
      </CardHeader>
      <CardContent>
        {/* Speaker Info */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
            {webinar.speaker.avatar}
          </div>
          <div>
            <div className="font-medium text-sm">{webinar.speaker.name}</div>
            <div className="text-xs text-gray-600">{webinar.speaker.title}</div>
          </div>
        </div>

        {/* Webinar Details */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {isUpcoming ? new Date(webinar.date).toLocaleDateString() : 'On-Demand'}
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-2" />
            {isUpcoming ? `${webinar.time} | ${webinar.duration}` : webinar.duration}
          </div>
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2" />
            {webinar.attendees.toLocaleString()} {isUpcoming ? 'registered' : 'attendees'}
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1 mb-4">
          {webinar.topics.slice(0, 3).map((topic, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
          {webinar.topics.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{webinar.topics.length - 3} more
            </Badge>
          )}
        </div>

        {/* Action Button */}
        {isUpcoming ? (
          <Button
            className="w-full"
            onClick={() => setSelectedWebinar(webinar)}
          >
            Register Free
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSelectedWebinar(webinar)}
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Watch Recording
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link href="/resources" className="hover:text-gray-700">Resources</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-900">Webinars</span>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Educational Webinars
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Learn from our experts and industry leaders about AI-powered development, best practices, and the future of software creation.
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <div className="flex-1 max-w-md">
                  <Input
                    type="search"
                    placeholder="Search webinars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="upcoming" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="upcoming">Upcoming Webinars</TabsTrigger>
              <TabsTrigger value="recorded">On-Demand Library</TabsTrigger>
            </TabsList>

            {/* Upcoming Webinars */}
            <TabsContent value="upcoming" className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Live Webinars</h2>
                <p className="text-gray-600">Join us live for interactive sessions with Q&A</p>
              </div>

              {filteredUpcoming.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming webinars found</h3>
                  <p className="text-gray-600">Check back soon or explore our recorded webinars.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUpcoming.map((webinar) => (
                    <WebinarCard key={webinar.id} webinar={webinar} isUpcoming={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Recorded Webinars */}
            <TabsContent value="recorded" className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">On-Demand Webinar Library</h2>
                <p className="text-gray-600">Access our complete collection of recorded sessions</p>
              </div>

              {filteredRecorded.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No recorded webinars found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecorded.map((webinar) => (
                    <WebinarCard key={webinar.id} webinar={webinar} isUpcoming={false} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Newsletter Signup */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated on New Webinars</h2>
            <p className="text-lg mb-6 opacity-90">
              Get notified about upcoming webinars, exclusive content, and early access to recordings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white text-gray-900"
              />
              <Button variant="secondary" className="whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Webinar Registration/Viewing Modal */}
      <Dialog open={!!selectedWebinar} onOpenChange={() => {
        setSelectedWebinar(null)
        setRegistrationStep('form')
        setRegistrationData({ name: '', email: '', company: '', title: '', interests: '' })
      }}>
        <DialogContent className="max-w-2xl">
          {selectedWebinar && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl mb-2">{selectedWebinar.title}</DialogTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {selectedWebinar.status === 'upcoming' 
                      ? new Date(selectedWebinar.date).toLocaleDateString()
                      : 'On-Demand'
                    }
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {selectedWebinar.duration}
                  </div>
                </div>
              </DialogHeader>

              {selectedWebinar.status === 'upcoming' ? (
                // Registration Form
                registrationStep === 'form' ? (
                  <form onSubmit={handleRegistration} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          value={registrationData.name}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={registrationData.email}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={registrationData.company}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, company: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={registrationData.title}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="interests">What interests you most about this topic?</Label>
                      <Input
                        id="interests"
                        value={registrationData.interests}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, interests: e.target.value }))}
                        placeholder="Optional - helps us tailor the content"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Register for Free
                    </Button>
                  </form>
                ) : (
                  // Registration Success
                  <div className="text-center py-6">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Registration Confirmed!</h3>
                    <p className="text-gray-600 mb-4">
                      You'll receive a confirmation email with the webinar link and calendar invite.
                    </p>
                    <Button asChild className="mr-2">
                      <Link href="/calendar-invite">Add to Calendar</Link>
                    </Button>
                    <Button variant="outline">
                      Close
                    </Button>
                  </div>
                )
              ) : (
                // Video Player for Recorded Webinars
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <PlayIcon className="h-16 w-16 mx-auto mb-4" />
                      <p>Video player would be embedded here</p>
                      <Button className="mt-4" variant="secondary">
                        Play Recording
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">What you'll learn:</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {selectedWebinar.topics.map((topic, index) => (
                        <li key={index}>• {topic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}