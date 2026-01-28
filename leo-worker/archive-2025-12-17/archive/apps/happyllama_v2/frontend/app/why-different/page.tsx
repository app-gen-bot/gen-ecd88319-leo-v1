"use client"

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/layout'

const competitors = [
  { name: 'Happy Llama', highlight: true },
  { name: 'Bubble', highlight: false },
  { name: 'OutSystems', highlight: false },
  { name: 'Mendix', highlight: false },
  { name: 'Retool', highlight: false },
  { name: 'Webflow', highlight: false }
]

const comparisonFeatures = [
  {
    feature: 'Learning System',
    happyLlama: true,
    bubble: false,
    outSystems: false,
    mendix: false,
    retool: false,
    webflow: false,
    description: 'Improves with every project'
  },
  {
    feature: 'Type-Safe Code',
    happyLlama: true,
    bubble: false,
    outSystems: false,
    mendix: false,
    retool: false,
    webflow: false,
    description: 'Full TypeScript support'
  },
  {
    feature: 'Production Ready',
    happyLlama: true,
    bubble: false,
    outSystems: true,
    mendix: true,
    retool: false,
    webflow: false,
    description: 'Enterprise-grade from day one'
  },
  {
    feature: 'Custom Code',
    happyLlama: true,
    bubble: false,
    outSystems: true,
    mendix: true,
    retool: true,
    webflow: false,
    description: 'Full code access and modification'
  },
  {
    feature: 'Multi-Agent AI',
    happyLlama: true,
    bubble: false,
    outSystems: false,
    mendix: false,
    retool: false,
    webflow: false,
    description: 'Specialized AI agents for each domain'
  },
  {
    feature: 'Explainable AI',
    happyLlama: true,
    bubble: false,
    outSystems: false,
    mendix: false,
    retool: false,
    webflow: false,
    description: 'Understand every decision'
  },
  {
    feature: 'Cloud Agnostic',
    happyLlama: true,
    bubble: false,
    outSystems: false,
    mendix: false,
    retool: false,
    webflow: false,
    description: 'Deploy anywhere'
  },
  {
    feature: 'Real-time Collaboration',
    happyLlama: true,
    bubble: true,
    outSystems: true,
    mendix: true,
    retool: true,
    webflow: true,
    description: 'Team development features'
  }
]

const benchmarkCategories = [
  {
    name: 'Speed',
    happyLlama: 95,
    traditional: 20,
    lowCode: 60,
    metric: 'Development Velocity',
    details: 'Time from idea to production deployment'
  },
  {
    name: 'Accuracy',
    happyLlama: 92,
    traditional: 85,
    lowCode: 45,
    metric: 'Requirement Matching',
    details: 'How well the final product matches requirements'
  },
  {
    name: 'Scalability',
    happyLlama: 98,
    traditional: 90,
    lowCode: 30,
    metric: 'Performance Under Load',
    details: 'Ability to handle enterprise-scale traffic'
  },
  {
    name: 'Maintainability',
    happyLlama: 94,
    traditional: 70,
    lowCode: 25,
    metric: 'Code Quality Score',
    details: 'Long-term maintenance and extensibility'
  }
]

const caseStudies = [
  {
    company: 'TechFlow',
    logo: 'TF',
    challenge: 'Needed a complex inventory management system with real-time updates',
    result: '80% faster delivery',
    industry: 'SaaS',
    size: 'Startup',
    timeline: '3 days',
    savings: '$150K'
  },
  {
    company: 'GrowthMetrics',
    logo: 'GM',
    challenge: 'Analytics dashboard with custom reporting and data visualization',
    result: '95% cost reduction',
    industry: 'Analytics',
    size: 'SMB',
    timeline: '1 week',
    savings: '$300K'
  },
  {
    company: 'MedTech Solutions',
    logo: 'MS',
    challenge: 'HIPAA-compliant patient management system with integrations',
    result: '10x faster deployment',
    industry: 'Healthcare',
    size: 'Enterprise',
    timeline: '2 weeks',
    savings: '$500K'
  }
]

const researchPapers = [
  {
    title: 'Multi-Agent Systems in Software Development: A Production Study',
    authors: 'Chen, L., Rodriguez, M., Foster, A.',
    abstract: 'This paper presents findings from a 12-month study of multi-agent AI systems in production software development...',
    downloadUrl: '/papers/multi-agent-study.pdf',
    citation: 'Chen, L., Rodriguez, M., & Foster, A. (2024). Multi-Agent Systems in Software Development. Journal of AI Engineering, 15(3), 245-267.'
  },
  {
    title: 'Hierarchical Memory Architecture for Code Generation',
    authors: 'Foster, A., Kim, J., Martinez, S.',
    abstract: 'We introduce a novel hierarchical memory system that enables AI agents to learn and retain patterns across multiple software projects...',
    downloadUrl: '/papers/hierarchical-memory.pdf',
    citation: 'Foster, A., Kim, J., & Martinez, S. (2024). Hierarchical Memory Architecture for Code Generation. Proceedings of ICSE 2024, 123-145.'
  },
  {
    title: 'Explainable AI in Automated Software Architecture',
    authors: 'Rodriguez, M., Chen, L.',
    abstract: 'This work demonstrates how explainable AI techniques can provide transparency in automated software architecture decisions...',
    downloadUrl: '/papers/explainable-architecture.pdf',
    citation: 'Rodriguez, M., & Chen, L. (2024). Explainable AI in Automated Software Architecture. ACM Transactions on Software Engineering, 42(1), 15-32.'
  }
]

export default function WhyDifferentPage() {
  const [selectedTab, setSelectedTab] = useState('learning')
  const [sliderPosition, setSliderPosition] = useState(50)
  const [selectedMetric, setSelectedMetric] = useState(0)
  const [_selectedCaseStudy, setSelectedCaseStudy] = useState<string | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleSliderMove = (e: React.MouseEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect()
      const position = ((e.clientX - rect.left) / rect.width) * 100
      setSliderPosition(Math.max(0, Math.min(100, position)))
    }
  }

  const downloadComparison = () => {
    // Mock PDF download
    alert('Comparison PDF would be generated and downloaded')
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Code copied to clipboard!')
  }

  const copyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation)
    alert('Citation copied to clipboard!')
  }

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-gray-50 to-blue-50 py-16">
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Why It&apos;s Different</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Differentiator Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Not Just Another AI Tool
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              While others focus on simple code generation, Happy Llama delivers intelligent, learning systems that improve with every project.
            </p>
            
            {/* Comparison Slider */}
            <div className="max-w-2xl mx-auto">
              <div
                ref={sliderRef}
                className="relative bg-gray-200 rounded-lg overflow-hidden h-64 cursor-pointer"
                onClick={handleSliderMove}
              >
                <div className="absolute inset-0 flex">
                  <div 
                    className="bg-gray-400 flex items-center justify-center text-white font-semibold"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <div className="text-center">
                      <div className="text-lg">Other Tools</div>
                      <div className="text-sm opacity-80">Limited functionality</div>
                    </div>
                  </div>
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold"
                    style={{ width: `${100 - sliderPosition}%` }}
                  >
                    <div className="text-center">
                      <div className="text-lg">Happy Llama</div>
                      <div className="text-sm opacity-80">Production-ready intelligence</div>
                    </div>
                  </div>
                </div>
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-300"></div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Drag the slider to compare approaches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Differentiators */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-600">
              Four key innovations that set Happy Llama apart from traditional development tools
            </p>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12">
              <TabsTrigger value="learning">Learning System</TabsTrigger>
              <TabsTrigger value="type-safety">Type Safety</TabsTrigger>
              <TabsTrigger value="explainability">Explainability</TabsTrigger>
              <TabsTrigger value="memory">Memory Architecture</TabsTrigger>
            </TabsList>

            {/* Learning System Tab */}
            <TabsContent value="learning" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Continuous Learning System</h3>
                  <p className="text-gray-600 mb-6">
                    Unlike static tools, Happy Llama learns from every project, continuously improving code quality, 
                    architecture decisions, and development patterns. Our AI agents build knowledge that benefits all users.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Pattern Recognition</h4>
                        <p className="text-sm text-gray-600">Identifies successful patterns across millions of projects</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Error Prevention</h4>
                        <p className="text-sm text-gray-600">Learns from common mistakes to prevent future issues</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Best Practice Evolution</h4>
                        <p className="text-sm text-gray-600">Adapts to new technologies and evolving standards</p>
                      </div>
                    </div>
                  </div>

                  <Button className="mt-6" onClick={() => alert('See Improvement demonstration')}>
                    See Improvement Over Time
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-8">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">Month 1</div>
                        <div className="text-sm text-gray-600">Code Quality Score</div>
                        <div className="text-2xl font-semibold">75%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">Month 12</div>
                        <div className="text-sm text-gray-600">Code Quality Score</div>
                        <div className="text-2xl font-semibold">94%</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-sm font-semibold mb-2">Improvement Areas:</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Error Handling</span>
                          <span className="text-green-600">+25%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Performance</span>
                          <span className="text-green-600">+18%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Security</span>
                          <span className="text-green-600">+22%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Maintainability</span>
                          <span className="text-green-600">+15%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Type Safety Tab */}
            <TabsContent value="type-safety" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Complete Type Safety</h3>
                  <p className="text-gray-600 mb-6">
                    Every line of generated code includes comprehensive TypeScript definitions, 
                    preventing runtime errors and enabling better development experience.
                  </p>
                  
                  <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6 text-sm font-mono">
                    <pre className="overflow-x-auto">
{`interface UserResponse {
  id: string;
  email: string;
  profile: {
    name: string;
    avatar?: string;
    lastSeen: Date;
  };
  permissions: Permission[];
}

async function getUser(id: string): Promise<UserResponse> {
  const response = await api.get<UserResponse>(\`/users/\${id}\`);
  return response.data; // ✓ Fully typed
}`}
                    </pre>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button onClick={() => copyCode('// TypeScript example code')}>
                      Copy Code
                    </Button>
                    <Button variant="outline">
                      View Full Example
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4">Benefits of Type Safety</h4>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-semibold">Catch Errors Early</h5>
                          <p className="text-sm text-gray-600">Find bugs at compile time, not runtime</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-semibold">Better IDE Support</h5>
                          <p className="text-sm text-gray-600">Autocompletion, refactoring, navigation</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h5 className="font-semibold">Self-Documenting Code</h5>
                          <p className="text-sm text-gray-600">Types serve as inline documentation</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h5 className="font-semibold">Confident Refactoring</h5>
                          <p className="text-sm text-gray-600">Make changes without breaking things</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Explainability Tab */}
            <TabsContent value="explainability" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Complete Decision Transparency</h3>
                  <p className="text-gray-600 mb-6">
                    Every architectural decision, technology choice, and design pattern is explained with clear reasoning. 
                    Understand not just what was built, but why it was built that way.
                  </p>
                  
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">?</span>
                      Decision: Database Choice
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Choice:</span> PostgreSQL with Redis caching layer
                      </div>
                      <div>
                        <span className="font-medium">Reasoning:</span> Complex relational data requires ACID compliance. 
                        High read volume (80% reads) benefits from Redis caching. Expected growth to 1M+ users.
                      </div>
                      <div>
                        <span className="font-medium">Alternatives Considered:</span>
                        <ul className="mt-1 space-y-1 ml-4">
                          <li>• MongoDB - Rejected due to complex join requirements</li>
                          <li>• DynamoDB - Rejected due to cost at projected scale</li>
                          <li>• MySQL - Rejected due to JSON handling limitations</li>
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium">Trade-offs:</span> Increased infrastructure complexity for better performance and reliability
                      </div>
                    </div>
                  </div>
                  
                  <Button>Export Decision Log</Button>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4">Decision Tree Visualization</h4>
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6 min-h-[400px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                          User Requirements
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <div className="w-px h-8 bg-gray-300"></div>
                      </div>
                      
                      <div className="flex justify-center space-x-8">
                        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm">
                          Data Structure Analysis
                        </div>
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm">
                          Performance Requirements
                        </div>
                        <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-sm">
                          Scale Projections
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <div className="w-px h-8 bg-gray-300"></div>
                      </div>
                      
                      <div className="flex justify-center">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                          PostgreSQL + Redis
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button size="sm" variant="outline">
                        Explore Interactive Tree
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Memory Architecture Tab */}
            <TabsContent value="memory" className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Hierarchical Memory System</h3>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Our memory architecture stores and retrieves knowledge at multiple levels, 
                  ensuring consistent patterns and continuous learning across all projects.
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-blue-800">Session Memory</h4>
                        <p className="text-sm text-gray-600">Current conversation context and immediate decisions</p>
                        <div className="text-xs text-gray-500 mt-1">Scope: Current project session</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-4 h-4 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-green-800">Project Memory</h4>
                        <p className="text-sm text-gray-600">Architecture patterns and decisions for this specific project</p>
                        <div className="text-xs text-gray-500 mt-1">Scope: Individual project lifecycle</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-4 h-4 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-purple-800">Domain Memory</h4>
                        <p className="text-sm text-gray-600">Industry-specific patterns and best practices</p>
                        <div className="text-xs text-gray-500 mt-1">Scope: Industry/domain expertise</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-4 h-4 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-orange-800">Global Knowledge</h4>
                        <p className="text-sm text-gray-600">Universal best practices learned from all projects</p>
                        <div className="text-xs text-gray-500 mt-1">Scope: Cross-project intelligence</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Memory Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">10TB+</div>
                        <div className="text-sm text-gray-600">Knowledge Base</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">&lt;50ms</div>
                        <div className="text-sm text-gray-600">Retrieval Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">99.8%</div>
                        <div className="text-sm text-gray-600">Pattern Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">1M+</div>
                        <div className="text-sm text-gray-600">Code Patterns</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
                    <h4 className="text-lg font-semibold mb-4 text-center">3D Memory Visualization</h4>
                    <div className="bg-white rounded-lg p-6 mb-4 min-h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 animate-pulse"></div>
                        <p className="text-sm text-gray-600">Interactive 3D memory hierarchy would be rendered here</p>
                        <p className="text-xs text-gray-500 mt-2">(WebGL visualization with rotation and zoom)</p>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button size="sm">Rotate</Button>
                      <Button size="sm" variant="outline">Zoom</Button>
                      <Button size="sm" variant="outline">Reset View</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Feature Comparison
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              See how Happy Llama compares to other development platforms
            </p>
            <Button onClick={downloadComparison}>
              Download Complete Comparison
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Feature</th>
                    {competitors.map((competitor, index) => (
                      <th 
                        key={index} 
                        className={`px-6 py-4 text-center text-sm font-medium ${
                          competitor.highlight ? 'text-blue-600 bg-blue-50' : 'text-gray-900'
                        }`}
                      >
                        {competitor.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{feature.feature}</div>
                          <div className="text-sm text-gray-500">{feature.description}</div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-center bg-blue-50`}>
                        <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.bubble ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.outSystems ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.mendix ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.retool ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.webflow ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-6 py-4">
              <p className="text-sm text-gray-500">
                * Comparison data based on publicly available information and feature documentation. 
                <button className="text-blue-600 hover:underline ml-1">View methodology</button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Proof */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Benchmark Results
            </h2>
            <p className="text-xl text-gray-600">
              Independent testing shows superior performance across all key metrics
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-8">
                {benchmarkCategories.map((category, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer transition-all ${
                      selectedMetric === index ? 'transform scale-105' : ''
                    }`}
                    onClick={() => setSelectedMetric(index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      <span className="text-sm text-gray-500">{category.metric}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 text-sm">Happy Llama</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                            style={{ width: `${category.happyLlama}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-end pr-2 text-xs text-white font-medium">
                            {category.happyLlama}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-20 text-sm">Traditional</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className="bg-gray-400 h-4 rounded-full"
                            style={{ width: `${category.traditional}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-end pr-2 text-xs text-white font-medium">
                            {category.traditional}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-20 text-sm">Low-code</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className="bg-yellow-500 h-4 rounded-full"
                            style={{ width: `${category.lowCode}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-end pr-2 text-xs text-white font-medium">
                            {category.lowCode}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedMetric === index && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg animate-fade-in">
                        <p className="text-sm text-gray-700">{category.details}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Button>View Methodology</Button>
                <Button variant="outline" className="ml-4">
                  Run Your Own Test
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Code Quality Comparison</h3>
              <Tabs defaultValue="before" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="before">Before Happy Llama</TabsTrigger>
                  <TabsTrigger value="after">With Happy Llama</TabsTrigger>
                </TabsList>
                <TabsContent value="before">
                  <div className="bg-gray-900 text-red-400 rounded-lg p-4 text-sm font-mono">
                    <pre className="overflow-x-auto">
{`// Typical no-code generated output
function getUserData(id) {
  var user = database.query("SELECT * FROM users WHERE id = " + id);
  if (user) {
    return {
      name: user.name,
      email: user.email
    };
  }
}`}
                    </pre>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Badge variant="destructive">SQL Injection Risk</Badge>
                    <Badge variant="destructive">No Type Safety</Badge>
                    <Badge variant="destructive">Poor Error Handling</Badge>
                  </div>
                </TabsContent>
                <TabsContent value="after">
                  <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm font-mono">
                    <pre className="overflow-x-auto">
{`// Happy Llama generated code
async function getUserData(id: string): Promise<User | null> {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { name: true, email: true }
    });
    
    return user;
  } catch (error) {
    logger.error('Failed to fetch user:', error);
    throw new DatabaseError('Unable to retrieve user data');
  }
}`}
                    </pre>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Badge>SQL Injection Safe</Badge>
                    <Badge>Full Type Safety</Badge>
                    <Badge>Comprehensive Error Handling</Badge>
                    <Badge>Proper Logging</Badge>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex space-x-4 mt-6">
                <Button size="sm" onClick={() => copyCode('// Happy Llama code')}>
                  Copy Code
                </Button>
                <Button size="sm" variant="outline">
                  View Diff
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Section */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Real-World Evidence
            </h2>
            <p className="text-xl text-gray-600">
              Case studies and research backing our approach
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Case Studies */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Customer Success Stories</h3>
              <div className="space-y-4">
                {caseStudies.map((study, index) => (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedCaseStudy(study.company)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                          {study.logo}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{study.company}</h4>
                            <Badge>{study.industry}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{study.challenge}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600 font-semibold">{study.result}</span>
                            <span className="text-gray-500">{study.timeline}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button className="mt-6" asChild>
                <Link href="/resources/case-studies">See All Case Studies</Link>
              </Button>
            </div>

            {/* Research Papers */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Research Publications</h3>
              <div className="space-y-4">
                {researchPapers.map((paper, index) => (
                  <Card key={index} className="p-6">
                    <h4 className="font-semibold mb-2">{paper.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{paper.authors}</p>
                    <p className="text-xs text-gray-500 mb-4">{paper.abstract}</p>
                    <div className="flex space-x-4">
                      <Button size="sm">Download PDF</Button>
                      <Button size="sm" variant="outline" onClick={() => copyCitation(paper.citation)}>
                        Cite This
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl font-bold mb-6">
            Experience the Difference Yourself
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Don&apos;t just take our word for it. Try Happy Llama and see the difference intelligent development makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/beta-signup">Start Your Free Trial</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/contact/architecture-review">Request Architecture Review</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}