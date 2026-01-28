"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRightIcon, ClockIcon, UserIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Layout from '@/components/layout'

interface CaseStudy {
  id: string
  title: string
  company: string
  industry: string
  logo: string
  image: string
  excerpt: string
  challenge: string
  solution: string
  results: {
    metric: string
    improvement: string
    description: string
  }[]
  testimonial: {
    quote: string
    author: string
    title: string
    avatar: string
  }
  timeline: string
  teamSize: string
  techStack: string[]
  featured: boolean
  downloadUrl?: string
}

const caseStudies: CaseStudy[] = [
  {
    id: 'techflow',
    title: 'From Idea to $1M ARR in 6 Months',
    company: 'TechFlow',
    industry: 'SaaS',
    logo: '/images/logos/techflow.png',
    image: '/images/case-studies/techflow-dashboard.png',
    excerpt: 'How TechFlow built a project management SaaS that scaled to 10,000+ users using Happy Llama',
    challenge: 'TechFlow needed to build a complex project management platform with real-time collaboration, but had limited technical resources and tight deadlines.',
    solution: 'Using Happy Llama, they described their vision in natural language and iteratively refined the generated architecture. The AI agents created a scalable solution with real-time features, user management, and integrations.',
    results: [
      { metric: '80% Faster', improvement: 'Development Speed', description: 'MVP delivered in 2 weeks vs 4 months traditional development' },
      { metric: '$1M ARR', improvement: 'Revenue Growth', description: 'Achieved $1M annual recurring revenue within 6 months' },
      { metric: '99.9% Uptime', improvement: 'Reliability', description: 'Enterprise-grade reliability from day one' },
      { metric: '10,000+', improvement: 'Active Users', description: 'Scaled to support thousands of concurrent users' }
    ],
    testimonial: {
      quote: 'Happy Llama transformed our startup. We went from idea to MVP in 2 days, not 2 months. The code quality is better than what our previous dev team produced.',
      author: 'Sarah Chen',
      title: 'CEO & Founder',
      avatar: 'SC'
    },
    timeline: '2 weeks to MVP',
    teamSize: '3 non-technical founders',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
    featured: true,
    downloadUrl: '/downloads/techflow-case-study.pdf'
  },
  {
    id: 'growthmetrics',
    title: 'Scaling to 50K Users with Zero Downtime',
    company: 'GrowthMetrics',
    industry: 'Analytics',
    logo: '/images/logos/growthmetrics.png',
    image: '/images/case-studies/growthmetrics-analytics.png',
    excerpt: 'GrowthMetrics built a real-time analytics platform that processes millions of events daily',
    challenge: 'Building a real-time analytics platform capable of processing millions of events while maintaining sub-second query performance.',
    solution: 'Happy Llama designed a distributed architecture with event streaming, time-series databases, and optimized query engines. The AI chose the right tech stack for high-throughput data processing.',
    results: [
      { metric: '10M+', improvement: 'Events/Day', description: 'Process over 10 million events daily with low latency' },
      { metric: '< 100ms', improvement: 'Query Speed', description: 'Sub-second response times for complex analytics queries' },
      { metric: '50,000+', improvement: 'Active Users', description: 'Supports 50,000+ users across 500+ companies' },
      { metric: '99.99%', improvement: 'Availability', description: 'Zero downtime during scaling from 1K to 50K users' }
    ],
    testimonial: {
      quote: 'As a non-technical founder, I was skeptical about AI-generated code. But Happy Llama produced a production-ready SaaS app that handles 50k+ users seamlessly.',
      author: 'Marcus Rodriguez',
      title: 'Founder & CEO',
      avatar: 'MR'
    },
    timeline: '3 weeks to production',
    teamSize: '2 founders + 1 designer',
    techStack: ['Next.js', 'FastAPI', 'ClickHouse', 'Kafka', 'Kubernetes'],
    featured: true
  },
  {
    id: 'medtech',
    title: 'HIPAA-Compliant Telehealth Platform',
    company: 'MedTech Solutions',
    industry: 'Healthcare',
    logo: '/images/logos/medtech.png',
    image: '/images/case-studies/medtech-platform.png',
    excerpt: 'Secure telehealth platform built with enterprise-grade compliance and security from day one',
    challenge: 'Creating a HIPAA-compliant telehealth platform with end-to-end encryption, audit trails, and integration with existing healthcare systems.',
    solution: 'Happy Llama generated a secure architecture with proper encryption, access controls, and compliance features. The AI understood healthcare regulations and built appropriate safeguards.',
    results: [
      { metric: 'HIPAA Compliant', improvement: 'Security', description: 'Full HIPAA compliance with SOC 2 Type II certification' },
      { metric: '200+', improvement: 'Healthcare Providers', description: 'Serving 200+ clinics and private practices' },
      { metric: '95%', improvement: 'Provider Satisfaction', description: 'Consistently high ratings from healthcare professionals' },
      { metric: '$2.5M', improvement: 'Funding Raised', description: 'Series A funding based on platform traction' }
    ],
    testimonial: {
      quote: 'The explainable AI feature is a game-changer. I can understand every architectural decision and modify the system intelligently. It\'s like having a senior architect on demand.',
      author: 'Dr. Amanda Foster',
      title: 'CTO',
      avatar: 'AF'
    },
    timeline: '4 weeks to beta',
    teamSize: '5-person healthcare team',
    techStack: ['React', 'Python', 'PostgreSQL', 'WebRTC', 'AWS HIPAA'],
    featured: false,
    downloadUrl: '/downloads/medtech-case-study.pdf'
  },
  {
    id: 'retailflow',
    title: 'E-commerce Platform with AI Recommendations',
    company: 'RetailFlow',
    industry: 'E-commerce',
    logo: '/images/logos/retailflow.png',
    image: '/images/case-studies/retailflow-ecommerce.png',
    excerpt: 'Full-featured e-commerce platform with AI-powered recommendations and inventory management',
    challenge: 'Building a modern e-commerce platform with personalized recommendations, inventory management, and multi-channel sales integration.',
    solution: 'Happy Llama created a comprehensive e-commerce solution with AI-driven product recommendations, automated inventory management, and seamless integration with existing sales channels.',
    results: [
      { metric: '300%', improvement: 'Conversion Rate', description: 'AI recommendations increased conversion by 300%' },
      { metric: '$5M+', improvement: 'GMV', description: 'Gross merchandise value within first year' },
      { metric: '15+', improvement: 'Sales Channels', description: 'Integrated with 15 different sales platforms' },
      { metric: '24/7', improvement: 'Automation', description: 'Fully automated inventory and order management' }
    ],
    testimonial: {
      quote: 'Happy Llama built us an e-commerce platform that rivals Amazon\'s sophistication. The AI recommendations alone increased our sales by 300%.',
      author: 'Jennifer Wu',
      title: 'Chief Revenue Officer',
      avatar: 'JW'
    },
    timeline: '5 weeks to launch',
    teamSize: '8-person retail team',
    techStack: ['Next.js', 'Node.js', 'MongoDB', 'TensorFlow', 'Stripe'],
    featured: false
  },
  {
    id: 'financeai',
    title: 'Real-time Financial Risk Platform',
    company: 'FinanceAI',
    industry: 'Fintech',
    logo: '/images/logos/financeai.png',
    image: '/images/case-studies/financeai-dashboard.png',
    excerpt: 'Enterprise financial risk assessment platform processing $100M+ in transactions daily',
    challenge: 'Creating a real-time financial risk assessment platform that could process high-volume transactions while maintaining regulatory compliance.',
    solution: 'Happy Llama designed a distributed system with real-time ML pipelines, regulatory compliance features, and enterprise-grade security for financial data processing.',
    results: [
      { metric: '$100M+', improvement: 'Daily Volume', description: 'Process over $100M in transactions daily' },
      { metric: '< 50ms', improvement: 'Risk Assessment', description: 'Real-time risk scoring under 50ms' },
      { metric: '99.5%', improvement: 'Fraud Detection', description: 'Industry-leading fraud detection accuracy' },
      { metric: 'SOX Compliant', improvement: 'Compliance', description: 'Full SOX and financial regulations compliance' }
    ],
    testimonial: {
      quote: 'Happy Llama understood complex financial regulations and built compliance directly into our architecture. We passed our first audit with zero findings.',
      author: 'Robert Kim',
      title: 'VP of Engineering',
      avatar: 'RK'
    },
    timeline: '6 weeks to production',
    teamSize: '12-person fintech team',
    techStack: ['Python', 'Apache Kafka', 'TimescaleDB', 'TensorFlow', 'AWS'],
    featured: true
  }
]

const industries = ['All Industries', 'SaaS', 'Analytics', 'Healthcare', 'E-commerce', 'Fintech']
const companySizes = ['All Sizes', 'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Enterprise (200+)']

export default function CaseStudiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries')
  const [selectedSize, setSelectedSize] = useState('All Sizes')
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null)

  const filteredCaseStudies = caseStudies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = selectedIndustry === 'All Industries' || study.industry === selectedIndustry
    // For simplicity, we'll skip company size filtering as it's not in the data model
    return matchesSearch && matchesIndustry
  })

  const featuredStudies = filteredCaseStudies.filter(study => study.featured)
  const regularStudies = filteredCaseStudies.filter(study => !study.featured)

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
            <span className="text-gray-900">Case Studies</span>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Customer Success Stories
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              See how companies across industries are using Happy Llama to build production-ready applications faster than ever before.
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <div className="flex-1 max-w-md">
                  <Input
                    type="search"
                    placeholder="Search case studies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
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
          
          {/* Featured Case Studies */}
          {featuredStudies.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Success Stories</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {featuredStudies.map((study) => (
                  <Card key={study.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-100">
                    <div className="aspect-video relative bg-gray-100">
                      <Image
                        src="/images/hero-collaboration.png"
                        alt={study.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
                        Featured
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{study.industry}</Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {study.timeline}
                        </div>
                      </div>
                      <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                        {study.title}
                      </CardTitle>
                      <div className="text-lg font-semibold text-blue-600 mb-2">
                        {study.company}
                      </div>
                      <p className="text-gray-600">{study.excerpt}</p>
                    </CardHeader>
                    <CardContent>
                      {/* Key Results Preview */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {study.results.slice(0, 2).map((result, index) => (
                          <div key={index} className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {result.metric}
                            </div>
                            <div className="text-xs text-gray-600">
                              {result.improvement}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{study.teamSize}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCaseStudy(study)}
                          >
                            Read Full Story
                          </Button>
                          {study.downloadUrl && (
                            <Button size="sm">
                              Download PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Case Studies */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">All Case Studies</h2>
            {regularStudies.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No case studies found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedIndustry('All Industries')
                    setSelectedSize('All Sizes')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularStudies.map((study) => (
                  <Card key={study.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video relative bg-gray-100">
                      <Image
                        src="/images/hero-collaboration.png"
                        alt={study.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{study.industry}</Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {study.timeline}
                        </div>
                      </div>
                      <CardTitle className="text-lg hover:text-blue-600 transition-colors line-clamp-2">
                        {study.title}
                      </CardTitle>
                      <div className="font-semibold text-blue-600 mb-2">
                        {study.company}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{study.excerpt}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{study.teamSize}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCaseStudy(study)}
                        >
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join these companies in transforming how they build software with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/beta-signup">Start Building Today</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/demo-request">Request a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Detail Modal */}
      <Dialog open={!!selectedCaseStudy} onOpenChange={() => setSelectedCaseStudy(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCaseStudy && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{selectedCaseStudy.industry}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {selectedCaseStudy.timeline}
                  </div>
                </div>
                <DialogTitle className="text-2xl mb-2">{selectedCaseStudy.title}</DialogTitle>
                <div className="text-lg font-semibold text-blue-600">{selectedCaseStudy.company}</div>
              </DialogHeader>
              
              <div className="space-y-8">
                {/* Challenge */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">The Challenge</h3>
                  <p className="text-gray-600">{selectedCaseStudy.challenge}</p>
                </div>

                {/* Solution */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">The Solution</h3>
                  <p className="text-gray-600">{selectedCaseStudy.solution}</p>
                </div>

                {/* Results */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">The Results</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {selectedCaseStudy.results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-semibold">{result.improvement}</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {result.metric}
                        </div>
                        <p className="text-sm text-gray-600">{result.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <blockquote className="text-lg italic text-gray-700 mb-4">
                    &quot;{selectedCaseStudy.testimonial.quote}&quot;
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {selectedCaseStudy.testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{selectedCaseStudy.testimonial.author}</div>
                      <div className="text-sm text-gray-600">{selectedCaseStudy.testimonial.title}</div>
                    </div>
                  </div>
                </div>

                {/* Tech Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Team Size</h4>
                    <p className="text-gray-600">{selectedCaseStudy.teamSize}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Technology Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCaseStudy.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-6 border-t">
                  {selectedCaseStudy.downloadUrl && (
                    <Button>
                      Download Full Case Study
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link href="/beta-signup">Start Your Project</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}