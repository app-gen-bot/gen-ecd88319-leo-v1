"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Layout from '@/components/layout'
import VideoPlayer from '@/components/video-player'

const problemCards = [
  {
    title: "Current Tools Create Toy Apps",
    description: "Most no-code platforms produce applications that look professional but lack the robustness and scalability needed for real business use.",
    icon: "🧸",
    expandedContent: "Traditional no-code tools are great for prototypes, but when it comes to handling real user loads, complex business logic, or enterprise security requirements, they fall short. You end up with beautiful interfaces that break under pressure."
  },
  {
    title: "Developers Are Expensive",
    description: "Hiring skilled developers for custom applications is costly and time-consuming, especially for businesses that need multiple tools.",
    icon: "💸",
    expandedContent: "Senior developers command $150K+ salaries, and building a full-stack team can cost $500K+ annually. For small to medium businesses, this makes custom software development financially prohibitive."
  },
  {
    title: "Time to Market Is Too Slow",
    description: "Traditional development cycles take months or years, causing businesses to miss opportunities in fast-moving markets.",
    icon: "🐌",
    expandedContent: "By the time traditional development is complete, market conditions have changed. Competitors have moved ahead, and the original requirements are outdated. Speed to market is crucial in today's business environment."
  }
]

const solutionPoints = [
  "Production-ready code from day one",
  "Enterprise-grade security and scalability",
  "10x faster than traditional development"
]

const processStages = [
  {
    number: 1,
    title: "Describe Your App",
    description: "Tell us what you want to build in natural language",
    icon: "💬",
    example: "I want to build a project management tool that helps teams track tasks, deadlines, and collaborate in real-time.",
    details: "Our natural language processing understands context, requirements, and user stories. You can describe complex business logic in simple terms."
  },
  {
    number: 2,
    title: "AI Agents Design",
    description: "Multiple specialized AI agents collaborate to architect your solution",
    icon: "🤖",
    example: "Frontend Agent, Backend Agent, Database Agent, and Security Agent work together",
    details: "Each agent specializes in different aspects: UI/UX design, API architecture, database schema, security protocols, and testing strategies."
  },
  {
    number: 3,
    title: "Review & Refine",
    description: "Iterate on the generated solution until it's perfect",
    icon: "🔍",
    example: "Make the dashboard more intuitive, add role-based permissions, integrate with Slack",
    details: "Review generated wireframes, database schemas, and API specifications. Request changes in natural language and see immediate updates."
  },
  {
    number: 4,
    title: "Deploy Instantly",
    description: "Launch your application to production with one click",
    icon: "🚀",
    example: "Deploy to AWS, Azure, or Google Cloud with automatic scaling and monitoring",
    details: "Automated CI/CD pipeline, containerized deployment, SSL certificates, monitoring, and backup systems included out of the box."
  }
]

const differentiators = [
  {
    title: "Learning System",
    description: "Gets smarter with every project, improving code quality over time",
    icon: "🧠",
    link: "/why-different#learning"
  },
  {
    title: "Type-Safe Code",
    description: "Generates fully typed code that prevents runtime errors",
    icon: "🛡️",
    modal: "type-safety"
  },
  {
    title: "Explainable AI",
    description: "See exactly why every architectural decision was made",
    icon: "🔍",
    modal: "explainable"
  },
  {
    title: "Enterprise Ready",
    description: "SOC2, GDPR compliant with enterprise security features",
    icon: "🏢",
    link: "/for-enterprises"
  },
  {
    title: "Hierarchical Memory",
    description: "Remembers patterns across projects for consistent best practices",
    icon: "🌳",
    modal: "memory"
  },
  {
    title: "Production Grade",
    description: "99.9% uptime SLA with automatic scaling and monitoring",
    icon: "⚙️",
    modal: "production"
  }
]

const testimonials = [
  {
    quote: "Happy Llama transformed our startup. We went from idea to MVP in 2 days, not 2 months. The code quality is better than what our previous dev team produced.",
    name: "Sarah Chen",
    title: "CEO",
    company: "TechFlow",
    avatar: "SC",
    caseStudy: "/resources/case-studies/techflow"
  },
  {
    quote: "As a non-technical founder, I was skeptical about AI-generated code. But Happy Llama produced a production-ready SaaS app that handles 10k+ users seamlessly.",
    name: "Marcus Rodriguez",
    title: "Founder",
    company: "GrowthMetrics",
    avatar: "MR",
    caseStudy: "/resources/case-studies/growthmetrics"
  },
  {
    quote: "The explainable AI feature is a game-changer. I can understand every architectural decision and modify the system intelligently. It's like having a senior architect on demand.",
    name: "Dr. Amanda Foster",
    title: "CTO",
    company: "MedTech Solutions",
    avatar: "AF",
    caseStudy: "/resources/case-studies/medtech"
  }
]

const metrics = [
  { label: "Beta Signups", value: 5000, suffix: "+" },
  { label: "Enterprise Pilots", value: 50, suffix: "+" },
  { label: "Early User Rating", value: 4.9, suffix: "/5" }
]

export default function HomePage() {
  const [expandedProblem, setExpandedProblem] = useState<number | null>(null)
  const [selectedStage, setSelectedStage] = useState(0)
  const [selectedModal, setSelectedModal] = useState<string | null>(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [animatedMetrics, setAnimatedMetrics] = useState(metrics.map(m => ({ ...m, animated: 0 })))

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Animate metrics on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            metrics.forEach((metric, index) => {
              let start = 0
              const end = metric.value
              const duration = 2000
              const increment = end / (duration / 16)

              const animate = () => {
                start += increment
                setAnimatedMetrics(prev => 
                  prev.map((m, i) => 
                    i === index ? { ...m, animated: Math.min(start, end) } : m
                  )
                )
                if (start < end) {
                  requestAnimationFrame(animate)
                }
              }
              animate()
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )

    const metricsElement = document.getElementById('metrics-section')
    if (metricsElement) {
      observer.observe(metricsElement)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToNextSection = () => {
    const nextSection = document.getElementById('problem-section')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Transform Your Ideas Into{' '}
              <span className="gradient-text">Production-Ready Apps</span>{' '}
              with AI
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed">
              Happy Llama&apos;s multi-agent AI AppFactory delivers enterprise-grade applications from simple descriptions. No coding required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button asChild size="lg" className="px-12 py-6 text-lg">
                <Link href="/beta-signup">Start Building Now</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg"
                onClick={() => setVideoModalOpen(true)}
              >
                <span className="mr-2">▶️</span>
                Watch Demo
              </Button>
            </div>

            {/* Scroll Indicator */}
            <button
              onClick={scrollToNextSection}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
              aria-label="Scroll to next section"
            >
              <ChevronDownIcon className="h-8 w-8 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>

      </section>

      {/* Problem-Solution Section */}
      <section id="problem-section" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Problem with Current Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional development approaches leave businesses stuck between expensive custom solutions and limited no-code tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {problemCards.map((problem, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2">{problem.icon}</div>
                  <CardTitle className="text-xl">{problem.title}</CardTitle>
                  <CardDescription>{problem.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="ghost" 
                    onClick={() => setExpandedProblem(expandedProblem === index ? null : index)}
                    className="text-blue-600"
                  >
                    {expandedProblem === index ? 'Show Less' : 'Learn More'}
                  </Button>
                  {expandedProblem === index && (
                    <p className="mt-4 text-gray-600 text-sm animate-fade-in">
                      {problem.expandedContent}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Solution Presentation */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
              Happy Llama Solves This
            </h3>
            <div className="space-y-4">
              {solutionPoints.map((point, index) => (
                <div key={index} className="flex items-center justify-center space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-lg text-gray-700">{point}</span>
                </div>
              ))}
            </div>
            <Button asChild className="mt-8" size="lg">
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Process Visualization */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works: 4 Simple Stages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From idea to deployed application in hours, not months. Our AI agents handle the complexity while you focus on your vision.
            </p>
          </div>

          {/* Stage Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-4 bg-white rounded-full p-2 shadow-sm">
              {processStages.map((stage, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedStage(index)}
                  className={`px-6 py-2 rounded-full transition-all ${
                    selectedStage === index
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {stage.number}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Stage Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">{processStages[selectedStage].icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {processStages[selectedStage].title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {processStages[selectedStage].description}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700 italic">
                    <strong>Example:</strong> {processStages[selectedStage].example}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {processStages[selectedStage].details}
                </p>
                <Button 
                  className="mt-6"
                  onClick={() => setSelectedModal(`stage-${selectedStage}`)}
                >
                  See Details
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Makes Happy Llama Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI capabilities that go beyond simple code generation to deliver truly intelligent development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {differentiators.map((item, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                <CardHeader>
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {item.link ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={item.link}>Learn More</Link>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedModal(item.modal!)}
                    >
                      See Example
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="metrics-section" className="section-padding bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto container-padding">
          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {animatedMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-blue-400 mb-2">
                  {metric.animated === 4.9 
                    ? metric.animated.toFixed(1) + metric.suffix
                    : Math.floor(metric.animated).toLocaleString() + metric.suffix
                  }
                </div>
                <div className="text-gray-300">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial Carousel */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">
              Trusted by Builders Worldwide
            </h3>
            <div className="relative">
              <Card className="bg-gray-800 border-gray-700 p-8">
                <blockquote className="text-lg text-gray-300 mb-6">
                  &quot;{testimonials[currentTestimonial].quote}&quot;
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-400">
                      {testimonials[currentTestimonial].title}, {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Navigation dots */}
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Your App?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of builders who are already transforming their ideas into reality with Happy Llama.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/beta-signup">Join Beta Now</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => setSelectedModal('contact')}
            >
              Talk to Founders
            </Button>
            <Button 
              size="lg" 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => setSelectedModal('coming-soon')}
            >
              See Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-w-none p-0">
          <VideoPlayer
            title="Happy Llama Demo: From Idea to App in Minutes"
            description="Watch as we transform a simple app idea into a fully functional, production-ready application using Happy Llama's AI agent system."
            duration="12:34"
            onClose={() => setVideoModalOpen(false)}
            className="rounded-lg overflow-hidden"
          />
        </DialogContent>
      </Dialog>

      {/* Stage Detail Modals */}
      {selectedModal?.startsWith('stage-') && (
        <Dialog open={true} onOpenChange={() => setSelectedModal(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                Stage {processStages[parseInt(selectedModal.split('-')[1])].number}: {processStages[parseInt(selectedModal.split('-')[1])].title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>{processStages[parseInt(selectedModal.split('-')[1])].details}</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Example:</h4>
                <p className="text-sm text-gray-600">
                  {processStages[parseInt(selectedModal.split('-')[1])].example}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Differentiator Modals */}
      <Dialog open={!!selectedModal && !selectedModal.startsWith('stage-')} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedModal === 'type-safety' && 'Type-Safe Code Generation'}
              {selectedModal === 'explainable' && 'Explainable AI Decisions'}
              {selectedModal === 'memory' && 'Hierarchical Memory System'}
              {selectedModal === 'production' && 'Production-Grade Infrastructure'}
              {selectedModal === 'coming-soon' && 'Coming Soon!'}
              {selectedModal === 'contact' && 'Contact Our Founders'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedModal === 'type-safety' && (
              <div>
                <p className="mb-4">Our AI generates fully-typed code with comprehensive type checking:</p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

// TypeScript catches errors at compile time
function getUser(id: string): Promise<User> {
  return api.users.get(id); // ✓ Type safe
}`}
                </pre>
                <Button className="mt-4 w-full" onClick={() => navigator.clipboard.writeText('Code copied!')}>
                  Copy Code
                </Button>
              </div>
            )}
            {selectedModal === 'explainable' && (
              <div>
                <p>Every architectural decision is explained with clear reasoning:</p>
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <h4 className="font-semibold">Decision: Database Choice</h4>
                  <p className="text-sm mt-2">
                    <strong>Choice:</strong> PostgreSQL with Redis caching<br />
                    <strong>Reasoning:</strong> Complex relationships require ACID compliance, high read volume benefits from caching layer<br />
                    <strong>Alternatives considered:</strong> MongoDB (rejected due to complex joins), DynamoDB (rejected due to cost at scale)
                  </p>
                </div>
              </div>
            )}
            {selectedModal === 'memory' && (
              <div>
                <p>Our memory system learns patterns across all projects:</p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Session Memory: Current conversation context</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Project Memory: Architecture patterns for this project</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Global Knowledge: Best practices learned from all projects</span>
                  </div>
                </div>
              </div>
            )}
            {selectedModal === 'production' && (
              <div>
                <p>Enterprise-grade infrastructure included out of the box:</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">99.9% Uptime</div>
                    <div className="text-sm text-green-600">SLA guaranteed</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Auto Scaling</div>
                    <div className="text-sm text-blue-600">Handle traffic spikes</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Monitoring</div>
                    <div className="text-sm text-purple-600">Real-time alerts</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="font-semibold text-orange-800">Backups</div>
                    <div className="text-sm text-orange-600">Automated daily</div>
                  </div>
                </div>
              </div>
            )}
            {selectedModal === 'coming-soon' && (
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <p>We&apos;re working on our pricing plans! Join the beta to get early access and special pricing.</p>
                <Button asChild className="mt-4">
                  <Link href="/beta-signup">Join Beta</Link>
                </Button>
              </div>
            )}
            {selectedModal === 'contact' && (
              <div>
                <p className="mb-4">Get in touch with our founders directly:</p>
                <div className="space-y-4">
                  <Button asChild className="w-full">
                    <Link href="/contact">Send Message</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/demo-request">Schedule Demo</Link>
                  </Button>
                  <div className="text-center text-sm text-gray-500">
                    Response time: Within 24 hours
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}