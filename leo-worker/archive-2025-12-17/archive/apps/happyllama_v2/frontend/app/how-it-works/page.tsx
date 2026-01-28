"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Layout from '@/components/layout'
import VideoPlayer from '@/components/video-player'

const agents = [
  {
    name: "Product Manager Agent",
    specialization: "Requirements analysis and user story creation",
    description: "Translates business requirements into technical specifications"
  },
  {
    name: "UI/UX Agent",
    specialization: "User interface design and user experience optimization",
    description: "Creates wireframes, mockups, and interactive prototypes"
  },
  {
    name: "Frontend Agent",
    specialization: "React, Vue, Angular application development",
    description: "Generates responsive, accessible user interfaces"
  },
  {
    name: "Backend Agent",
    specialization: "API design and server-side logic",
    description: "Creates scalable backend architectures and APIs"
  },
  {
    name: "Database Agent",
    specialization: "Schema design and query optimization",
    description: "Designs efficient database structures and relationships"
  },
  {
    name: "DevOps Agent",
    specialization: "CI/CD pipelines and infrastructure",
    description: "Sets up deployment pipelines and monitoring"
  },
  {
    name: "Security Agent",
    specialization: "Authentication, authorization, and security audits",
    description: "Implements security best practices and compliance"
  },
  {
    name: "Testing Agent",
    specialization: "Unit, integration, and E2E testing",
    description: "Creates comprehensive test suites and quality assurance"
  },
  {
    name: "Performance Agent",
    specialization: "Optimization and monitoring",
    description: "Ensures applications meet performance requirements"
  },
  {
    name: "Documentation Agent",
    specialization: "Technical documentation and guides",
    description: "Creates user manuals and technical documentation"
  }
]

const refinements = [
  { title: "Add User Authentication", description: "Implement login, signup, and user management" },
  { title: "Improve UI/UX", description: "Make interfaces more intuitive and visually appealing" },
  { title: "Add Real-time Features", description: "Implement WebSocket connections for live updates" },
  { title: "Integrate Third-party APIs", description: "Connect with payment, email, or other services" },
  { title: "Enhanced Security", description: "Add two-factor authentication and audit logs" },
  { title: "Mobile Optimization", description: "Improve responsive design for mobile devices" },
  { title: "Performance Optimization", description: "Optimize loading times and database queries" },
  { title: "Add Analytics", description: "Implement user tracking and business intelligence" }
]

const deploymentTargets = [
  {
    name: "AWS",
    description: "Full AWS ecosystem with Lambda, RDS, S3",
    capabilities: ["Auto-scaling", "Global CDN", "Managed databases", "Serverless functions"],
    requirements: "AWS account required"
  },
  {
    name: "Azure",
    description: "Microsoft Azure cloud platform",
    capabilities: ["App Service", "Azure SQL", "Blob Storage", "Functions"],
    requirements: "Azure subscription required"
  },
  {
    name: "Google Cloud",
    description: "Google Cloud Platform services",
    capabilities: ["App Engine", "Cloud SQL", "Cloud Storage", "Cloud Functions"],
    requirements: "GCP account required"
  },
  {
    name: "Vercel",
    description: "Optimized for Next.js applications",
    capabilities: ["Edge functions", "Global deployment", "Preview branches", "Analytics"],
    requirements: "GitHub connection"
  },
  {
    name: "Docker",
    description: "Containerized deployment anywhere",
    capabilities: ["Portable", "Scalable", "Version controlled", "Multi-platform"],
    requirements: "Docker runtime environment"
  },
  {
    name: "Kubernetes",
    description: "Enterprise container orchestration",
    capabilities: ["Auto-scaling", "Load balancing", "Rolling updates", "Health checks"],
    requirements: "Kubernetes cluster"
  }
]

const architectureComponents = [
  {
    layer: "Input Layer",
    description: "Natural Language Processing",
    details: "Advanced NLP models understand context, intent, and technical requirements from natural language descriptions.",
    technologies: ["GPT-4", "Claude", "Custom models"]
  },
  {
    layer: "Agent Layer",
    description: "12 Specialized AI Agents",
    details: "Each agent specializes in specific aspects of development, collaborating to create comprehensive solutions.",
    technologies: ["Multi-agent systems", "RAG", "Fine-tuned models"]
  },
  {
    layer: "Memory Layer",
    description: "Hierarchical Knowledge Storage",
    details: "Stores patterns, best practices, and project-specific knowledge for consistent high-quality output.",
    technologies: ["Vector databases", "Graph databases", "Embeddings"]
  },
  {
    layer: "Output Layer",
    description: "Code Generation",
    details: "Produces production-ready, type-safe code with comprehensive testing and documentation.",
    technologies: ["AST manipulation", "Template engines", "Code analysis"]
  },
  {
    layer: "Deployment Layer",
    description: "Multi-platform Support",
    details: "Automated deployment to various cloud platforms with monitoring and scaling capabilities.",
    technologies: ["Docker", "Kubernetes", "Terraform", "CI/CD"]
  }
]

const faqs = [
  {
    question: "How is the generated code different from other AI tools?",
    answer: "Our code is production-ready with comprehensive type safety, testing, security measures, and follows enterprise best practices. Unlike simple code snippets from other tools, we generate complete, scalable applications."
  },
  {
    question: "Can I modify the generated code?",
    answer: "Absolutely! The generated code is clean, well-documented, and follows industry standards. You own the code completely and can modify it as needed. We also provide explanations for all architectural decisions."
  },
  {
    question: "What programming languages and frameworks are supported?",
    answer: "We support modern web technologies including React, Vue, Angular for frontend; Node.js, Python, Java for backend; PostgreSQL, MongoDB, Redis for databases; and deployment to AWS, Azure, GCP, and more."
  },
  {
    question: "How do you ensure security in generated applications?",
    answer: "Our Security Agent implements industry best practices including secure authentication, input validation, SQL injection prevention, XSS protection, and compliance with standards like OWASP Top 10."
  },
  {
    question: "What happens if I need help with the generated application?",
    answer: "We provide comprehensive documentation, video tutorials, and support. Enterprise customers get dedicated support with guaranteed response times and can schedule architecture reviews."
  },
  {
    question: "Can Happy Llama integrate with existing systems?",
    answer: "Yes! Our Integration Agent can connect with existing APIs, databases, and third-party services. We support common protocols like REST, GraphQL, WebSockets, and popular services like Stripe, Twilio, and more."
  }
]

export default function HowItWorksPage() {
  const [selectedView, setSelectedView] = useState<'overview' | 'technical' | 'timeline'>('overview')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null)
  const [expandedComponent, setExpandedComponent] = useState<number | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [selectedLanguage, setSelectedLanguage] = useState('typescript')
  const [videoModalOpen, setVideoModalOpen] = useState(false)

  const codeExamples = {
    typescript: `// Generated TypeScript with full type safety
interface User {
  id: string;
  email: string;
  profile: UserProfile;
  createdAt: Date;
}

class UserService {
  async createUser(data: CreateUserRequest): Promise<User> {
    const user = await this.repository.create({
      ...data,
      id: generateId(),
      createdAt: new Date(),
    });
    
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}`,
    python: `# Generated Python with proper error handling
from dataclasses import dataclass
from typing import Optional
import asyncio

@dataclass
class User:
    id: str
    email: str
    profile: UserProfile
    created_at: datetime

class UserService:
    async def create_user(self, data: CreateUserRequest) -> User:
        try:
            user = await self.repository.create(
                id=generate_id(),
                email=data.email,
                created_at=datetime.now()
            )
            await self.email_service.send_welcome(user.email)
            return user
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            raise`,
    sql: `-- Generated SQL with optimized queries and indexes
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    profile JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Optimized query for user lookup
SELECT u.*, 
       COUNT(p.id) as project_count
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
WHERE u.email = $1
GROUP BY u.id;`
  }

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto container-padding">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">How It Works</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              How Happy Llama Works
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From idea to deployed app in 4 intelligent stages. See exactly how our AI agents collaborate to build production-ready applications.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Process Explorer */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          {/* View Toggle */}
          <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* Overview View */}
            <TabsContent value="overview" className="space-y-16">
              {/* Stage 1: Describe Your Vision */}
              <Card className="p-8">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                      1
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Describe Your Vision</CardTitle>
                      <CardDescription>Tell us what you want to build in natural language</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="text-sm text-gray-600 mb-2">Example input:</div>
                    <div className="font-mono text-sm bg-white p-4 rounded border typing-animation">
                      &quot;I want to build a project management tool that helps teams track tasks, assign deadlines, and collaborate in real-time. Users should be able to create projects, invite team members, set priorities, and receive notifications when deadlines are approaching...&quot;
                    </div>
                  </div>
                  <Button onClick={() => setSelectedAgent('input-example')}>
                    Try It
                  </Button>
                </CardContent>
              </Card>

              {/* Stage 2: AI Agents Collaborate */}
              <Card className="p-8">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                      2
                    </div>
                    <div>
                      <CardTitle className="text-2xl">AI Agents Collaborate</CardTitle>
                      <CardDescription>Multiple specialized agents work together to architect your solution</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {agents.slice(0, 6).map((agent, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-purple-50"
                        onClick={() => setSelectedAgent(agent.name)}
                      >
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-2">
                          🤖
                        </div>
                        <h4 className="font-semibold text-sm">{agent.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{agent.specialization}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setSelectedAgent('all-agents')}>
                    See All {agents.length} Agents
                  </Button>
                </CardContent>
              </Card>

              {/* Stage 3: Review & Iterate */}
              <Card className="p-8">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                      3
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Review & Iterate</CardTitle>
                      <CardDescription>Refine the generated solution until it&apos;s perfect</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-4">Common Refinements:</h4>
                      <div className="space-y-2">
                        {refinements.slice(0, 4).map((refinement, index) => (
                          <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <div className="font-medium text-sm">{refinement.title}</div>
                              <div className="text-xs text-gray-600">{refinement.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔄</div>
                        <div className="font-semibold">Interactive Review</div>
                        <div className="text-sm text-gray-600">Make changes in real-time</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stage 4: Deploy Everywhere */}
              <Card className="p-8">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                      4
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Deploy Instantly</CardTitle>
                      <CardDescription>Launch your application to production with one click</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deploymentTargets.slice(0, 6).map((target, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all hover:scale-105"
                        onClick={() => setSelectedDeployment(target.name)}
                      >
                        <div className="font-semibold mb-2">{target.name}</div>
                        <div className="text-sm text-gray-600 mb-3">{target.description}</div>
                        <div className="text-xs text-gray-500">{target.requirements}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical View */}
            <TabsContent value="technical" className="space-y-12">
              {/* Architecture Diagram */}
              <Card className="p-8">
                <CardHeader>
                  <CardTitle>System Architecture</CardTitle>
                  <CardDescription>Interactive view of Happy Llama&apos;s technical architecture</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={zoomLevel > 100 ? "default" : "outline"}
                        onClick={() => setZoomLevel(Math.min(zoomLevel + 25, 200))}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant={zoomLevel < 100 ? "default" : "outline"}
                        onClick={() => setZoomLevel(Math.max(zoomLevel - 25, 50))}
                      >
                        -
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setZoomLevel(100)}>
                        Reset
                      </Button>
                    </div>
                    <span className="text-sm text-gray-600">Zoom: {zoomLevel}%</span>
                  </div>
                  
                  <div className="overflow-auto" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}>
                    <div className="space-y-4 min-w-[600px]">
                      {architectureComponents.map((component, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            expandedComponent === index
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => setExpandedComponent(expandedComponent === index ? null : index)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{component.layer}</h3>
                              <p className="text-sm text-gray-600">{component.description}</p>
                            </div>
                            <ChevronRightIcon className={`w-5 h-5 transition-transform ${expandedComponent === index ? 'rotate-90' : ''}`} />
                          </div>
                          
                          {expandedComponent === index && (
                            <div className="mt-4 pt-4 border-t animate-fade-in">
                              <p className="text-sm text-gray-700 mb-3">{component.details}</p>
                              <div className="flex flex-wrap gap-2">
                                {component.technologies.map((tech, techIndex) => (
                                  <span key={techIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Code Generation Example */}
              <Card className="p-8">
                <CardHeader>
                  <CardTitle>Code Generation Example</CardTitle>
                  <CardDescription>See the quality of generated code across different languages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <TabsList>
                        <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="sql">SQL</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
                      <code>{codeExamples[selectedLanguage as keyof typeof codeExamples]}</code>
                    </pre>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(codeExamples[selectedLanguage as keyof typeof codeExamples])}
                    >
                      Copy Code
                    </Button>
                    <Button size="sm" variant="outline">
                      View Full Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline View */}
            <TabsContent value="timeline" className="space-y-8">
              <Card className="p-8">
                <CardHeader>
                  <CardTitle>Speed Comparison</CardTitle>
                  <CardDescription>See how Happy Llama compares to traditional development approaches</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-32 text-sm font-medium">Traditional</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                        <div className="bg-red-500 h-8 rounded-full" style={{ width: '100%' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                          3-6 months
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 text-sm font-medium">Low-code</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                        <div className="bg-yellow-500 h-8 rounded-full" style={{ width: '40%' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                          2-4 weeks
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 text-sm font-medium">Happy Llama</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                        <div className="bg-green-500 h-8 rounded-full animate-pulse-glow" style={{ width: '8%' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                          2-4 hours
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Technical Deep Dive</h2>
            <p className="text-xl text-gray-600">
              Understand the advanced technology behind Happy Llama&apos;s AI development platform
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="nlp" className="bg-white rounded-lg px-6">
              <AccordionTrigger className="text-left">
                <div>
                  <h3 className="text-lg font-semibold">Natural Language Processing</h3>
                  <p className="text-sm text-gray-600">Advanced NLP for requirement understanding</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <div className="space-y-4">
                  <p>
                    Our NLP system goes beyond simple keyword extraction to understand context, user intent, and technical requirements. 
                    We use a combination of large language models fine-tuned on software development patterns and custom models 
                    trained on millions of successful software projects.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Key Capabilities:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Context-aware requirement analysis</li>
                      <li>• Technical constraint identification</li>
                      <li>• User story generation from descriptions</li>
                      <li>• Edge case prediction</li>
                    </ul>
                  </div>
                  <Button size="sm">Read Technical Paper</Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="multi-agent" className="bg-white rounded-lg px-6">
              <AccordionTrigger className="text-left">
                <div>
                  <h3 className="text-lg font-semibold">Multi-Agent Architecture</h3>
                  <p className="text-sm text-gray-600">Specialized agents working in harmony</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <div className="space-y-4">
                  <p>
                    Each agent specializes in specific aspects of software development, from UI design to database optimization. 
                    They communicate through a structured protocol, sharing context and making collaborative decisions.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Agent Communication</h4>
                      <p className="text-sm">Structured message passing with decision validation and conflict resolution</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Quality Assurance</h4>
                      <p className="text-sm">Cross-validation between agents ensures consistency and best practices</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="learning" className="bg-white rounded-lg px-6">
              <AccordionTrigger className="text-left">
                <div>
                  <h3 className="text-lg font-semibold">Learning & Improvement</h3>
                  <p className="text-sm text-gray-600">Continuous learning from every project</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <div className="space-y-4">
                  <p>
                    Happy Llama learns from every project, building a knowledge base of successful patterns, 
                    common pitfalls, and optimization strategies. This learning is applied to improve future projects.
                  </p>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg">
                    <h4 className="font-semibold mb-4">Learning Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">95%</div>
                        <div className="text-sm">Pattern Recognition Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">2.3x</div>
                        <div className="text-sm">Code Quality Improvement</div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="type-safety" className="bg-white rounded-lg px-6">
              <AccordionTrigger className="text-left">
                <div>
                  <h3 className="text-lg font-semibold">Type Safety & Testing</h3>
                  <p className="text-sm text-gray-600">Production-ready code with comprehensive testing</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <div className="space-y-4">
                  <p>
                    All generated code includes comprehensive type definitions, automated testing suites, 
                    and follows industry best practices for maintainable, scalable applications.
                  </p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                    <div>{/* Example: Auto-generated test suite */}</div>
                    <div>describe(&apos;UserService&apos;, () =&gt; &#123;</div>
                    <div>&nbsp;&nbsp;it(&apos;should create user with valid data&apos;, async () =&gt; &#123;</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;// Test implementation...</div>
                    <div>&nbsp;&nbsp;&#125;);</div>
                    <div>&#125;);</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Video Demonstration */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            See Happy Llama in Action
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Watch how we transform a simple idea into a production-ready application in real-time
          </p>
          
          <div className="aspect-video bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center cursor-pointer" onClick={() => setVideoModalOpen(true)}>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-blue-700 transition-colors">
                <span className="text-white text-2xl">▶️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Demo</h3>
              <p className="text-gray-600 mb-4">15-minute walkthrough of the complete development process</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={(e) => { e.stopPropagation(); setVideoModalOpen(true); }}>Play Video</Button>
                <Button variant="outline" onClick={(e) => { e.stopPropagation(); setVideoModalOpen(true); }}>View Chapters</Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center space-x-4">
            <Button size="sm" variant="outline" onClick={() => setVideoModalOpen(true)}>Watch Full Demo</Button>
            <Button size="sm" variant="outline">Share Video</Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="bg-white rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  <p>{faq.answer}</p>
                  <div className="flex items-center space-x-4 mt-4 text-sm">
                    <span className="text-gray-500">Was this helpful?</span>
                    <Button size="sm" variant="outline">Yes</Button>
                    <Button size="sm" variant="outline">No</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Can&apos;t find what you&apos;re looking for?</p>
            <Button asChild>
              <Link href="/contact/support">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Experience the Future of Development?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers and businesses who are already building with Happy Llama
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/beta-signup">See It In Action</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/resources/documentation">Technical Documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedAgent && (
        <Dialog open={true} onOpenChange={() => setSelectedAgent(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedAgent === 'all-agents' ? 'All AI Agents' : 
                 selectedAgent === 'input-example' ? 'Try Our Input System' :
                 selectedAgent}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedAgent === 'all-agents' && (
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {agents.map((agent, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{agent.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{agent.specialization}</p>
                      <p className="text-xs text-gray-500">{agent.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedAgent === 'input-example' && (
                <div>
                  <p className="mb-4">Try describing your app idea:</p>
                  <textarea
                    className="w-full h-32 p-3 border rounded-lg"
                    placeholder="I want to build an app that..."
                  />
                  <Button className="mt-4 w-full">Generate Preview</Button>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">AI Analysis Preview:</h4>
                    <p className="text-sm text-gray-600">
                      Based on your description, I detect the following requirements:
                      User authentication, real-time collaboration, task management, notification system...
                    </p>
                  </div>
                </div>
              )}
              {!['all-agents', 'input-example'].includes(selectedAgent) && (
                <div>
                  <p>Details about {selectedAgent} would be shown here.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedDeployment && (
        <Dialog open={true} onOpenChange={() => setSelectedDeployment(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedDeployment} Deployment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {deploymentTargets.find(t => t.name === selectedDeployment) && (
                <>
                  <p>{deploymentTargets.find(t => t.name === selectedDeployment)?.description}</p>
                  <div>
                    <h4 className="font-semibold mb-2">Capabilities:</h4>
                    <ul className="space-y-1">
                      {deploymentTargets.find(t => t.name === selectedDeployment)?.capabilities.map((cap, index) => (
                        <li key={index} className="text-sm flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-1">Requirements:</h4>
                    <p className="text-sm">{deploymentTargets.find(t => t.name === selectedDeployment)?.requirements}</p>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-w-none p-0">
          <VideoPlayer
            title="How Happy Llama Works: Complete Technical Walkthrough"
            description="Deep dive into our 4-stage AI development process, from natural language input to production deployment."
            duration="15:42"
            onClose={() => setVideoModalOpen(false)}
            className="rounded-lg overflow-hidden"
          />
        </DialogContent>
      </Dialog>
    </Layout>
  )
}