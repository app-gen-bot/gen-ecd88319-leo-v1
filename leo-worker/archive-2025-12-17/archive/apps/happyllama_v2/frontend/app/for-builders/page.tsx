"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Layout from '@/components/layout'

const successStories = [
  {
    name: "Alex Chen",
    background: "Marketing Manager",
    avatar: "AC",
    builtApp: "Task Tracker Pro",
    challenge: "Needed a custom project management tool for remote team coordination",
    timeToBuilt: "2 days",
    result: "Increased team productivity by 40% and saved $12K/year on software licenses",
    demo: "/demos/task-tracker-pro",
    testimonial: "I never thought I could build something this professional. Happy Llama made the impossible possible."
  },
  {
    name: "Maria Rodriguez",
    background: "Small Business Owner",
    avatar: "MR",
    builtApp: "Inventory Master",
    challenge: "Manual inventory tracking was causing errors and delays",
    timeToBuilt: "4 hours",
    result: "Reduced inventory errors by 90% and streamlined operations",
    demo: "/demos/inventory-master",
    testimonial: "The AI understood exactly what I needed. It's like having a full development team at my fingertips."
  },
  {
    name: "David Kim",
    background: "Freelance Designer",
    avatar: "DK",
    builtApp: "Client Portal",
    challenge: "Needed a professional way to share designs and collect feedback",
    timeToBuilt: "1 day",
    result: "Doubled client satisfaction scores and reduced revision cycles by 50%",
    demo: "/demos/client-portal",
    testimonial: "My clients are amazed that I built this myself. Happy Llama gave me superpowers."
  }
]

const tutorialSteps = [
  {
    number: 1,
    title: "Describe Your Idea",
    description: "Start with a simple description of what you want to build",
    example: "I want to build a recipe sharing app where users can upload photos, rate recipes, and follow their favorite cooks.",
    tips: ["Be specific about your goals", "Include who will use it", "Mention key features you need"]
  },
  {
    number: 2,
    title: "Review AI Suggestions",
    description: "Our AI analyzes your idea and suggests improvements",
    example: "AI suggests: Add meal planning feature, social sharing, and dietary restriction filters",
    tips: ["Consider all suggestions carefully", "Ask questions about unclear items", "Add your own ideas"]
  },
  {
    number: 3,
    title: "Customize Design",
    description: "Choose colors, layouts, and styling that match your vision",
    example: "Select warm, food-friendly colors with card-based layout for easy recipe browsing",
    tips: ["Think about your users", "Keep it simple and clean", "Test on mobile first"]
  },
  {
    number: 4,
    title: "Test & Launch",
    description: "Preview your app, test all features, and deploy to production",
    example: "Test recipe upload, rating system, and user profiles before going live",
    tips: ["Test every major feature", "Get feedback from friends", "Start with a small user group"]
  }
]

const appExamples = [
  {
    name: "Recipe Sharing",
    category: "Social",
    thumbnail: "🍳",
    creator: "Anonymous",
    buildTime: "3 hours",
    techStack: ["React", "Node.js", "PostgreSQL"],
    features: ["User authentication", "Photo uploads", "Rating system", "Social following"],
    complexity: "Medium"
  },
  {
    name: "Task Manager",
    category: "Productivity",
    thumbnail: "📋",
    creator: "Anonymous",
    buildTime: "2 hours",
    techStack: ["Vue.js", "Express", "MongoDB"],
    features: ["Project organization", "Due dates", "Team collaboration", "Progress tracking"],
    complexity: "Simple"
  },
  {
    name: "E-commerce Store",
    category: "E-commerce",
    thumbnail: "🛒",
    creator: "Anonymous",
    buildTime: "6 hours",
    techStack: ["React", "FastAPI", "Stripe"],
    features: ["Product catalog", "Shopping cart", "Payment processing", "Order management"],
    complexity: "Complex"
  },
  {
    name: "Learning Platform",
    category: "Education",
    thumbnail: "🎓",
    creator: "Anonymous",
    buildTime: "8 hours",
    techStack: ["Angular", "Django", "Redis"],
    features: ["Course creation", "Video streaming", "Progress tracking", "Certificates"],
    complexity: "Complex"
  },
  {
    name: "Event Booking",
    category: "Business",
    thumbnail: "📅",
    creator: "Anonymous",
    buildTime: "4 hours",
    techStack: ["React", "Node.js", "Stripe"],
    features: ["Event listings", "Ticket booking", "Calendar integration", "Email notifications"],
    complexity: "Medium"
  },
  {
    name: "Portfolio Site",
    category: "Personal",
    thumbnail: "🎨",
    creator: "Anonymous",
    buildTime: "1 hour",
    techStack: ["Next.js", "Tailwind"],
    features: ["Project showcase", "Contact form", "Blog integration", "SEO optimization"],
    complexity: "Simple"
  }
]

const resources = [
  {
    type: "Video Tutorials",
    icon: "📺",
    items: [
      { title: "Getting Started with Happy Llama", duration: "5 min", views: 15240 },
      { title: "Building Your First App", duration: "12 min", views: 8930 },
      { title: "Advanced Features & Customization", duration: "18 min", views: 5670 },
      { title: "Deployment Best Practices", duration: "10 min", views: 4320 }
    ]
  },
  {
    type: "Templates Library",
    icon: "📋",
    items: [
      { title: "SaaS Dashboard Template", status: "Available" },
      { title: "E-commerce Store Template", status: "Available" },
      { title: "Blog Platform Template", status: "Available" },
      { title: "Mobile App Template", status: "Coming Soon" }
    ]
  },
  {
    type: "Community Forum",
    icon: "💬",
    items: [
      { title: "Show & Tell", posts: 342, activity: "Very Active" },
      { title: "Help & Support", posts: 156, activity: "Active" },
      { title: "Feature Requests", posts: 89, activity: "Moderate" },
      { title: "General Discussion", posts: 567, activity: "Very Active" }
    ]
  }
]

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "Do I need any coding experience?",
        a: "Not at all! Happy Llama is designed for non-technical users. You describe what you want in plain English, and our AI handles all the technical complexity."
      },
      {
        q: "How long does it take to build an app?",
        a: "Most apps are ready in 2-8 hours, depending on complexity. Simple apps like portfolios take 1-2 hours, while complex e-commerce platforms might take 6-8 hours."
      },
      {
        q: "Can I modify the generated code?",
        a: "Yes! You get full access to clean, well-documented code. You can modify it yourself or hire developers to make changes. You own everything completely."
      }
    ]
  },
  {
    category: "Features & Capabilities",
    questions: [
      {
        q: "What types of apps can I build?",
        a: "Almost anything! We support web apps, mobile apps, e-commerce stores, SaaS platforms, portfolios, blogs, and more. If you can describe it, we can probably build it."
      },
      {
        q: "Do you support user authentication?",
        a: "Yes! We automatically include secure user authentication, password reset, email verification, and role-based access control in apps that need them."
      },
      {
        q: "Can I integrate with other services?",
        a: "Absolutely. We support popular services like Stripe for payments, SendGrid for emails, Twilio for SMS, and many others. Just mention what you need."
      }
    ]
  },
  {
    category: "Pricing & Ownership",
    questions: [
      {
        q: "What does the beta include?",
        a: "Beta users get free app generation, hosting credits, priority support, and grandfathered pricing when we launch. You'll also help shape our roadmap with your feedback."
      },
      {
        q: "Do I own the generated code?",
        a: "100% yes. You own all the code, can modify it freely, and can even sell apps built with Happy Llama. No restrictions, no ongoing royalties."
      },
      {
        q: "What happens to my app if I stop using Happy Llama?",
        a: "Your app continues working! Since you own the code, you can host it anywhere and maintain it however you prefer. No vendor lock-in."
      }
    ]
  }
]

export default function ForBuildersPage() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [selectedStep, setSelectedStep] = useState(0)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filteredApps, setFilteredApps] = useState(appExamples)
  const [_selectedApp, setSelectedApp] = useState<string | null>(null)
  const [costCalculator, setCostCalculator] = useState({
    complexity: 'medium',
    features: [] as string[],
    estimate: 0
  })

  // Filter apps by category
  useEffect(() => {
    if (filterCategory === 'All') {
      setFilteredApps(appExamples)
    } else {
      setFilteredApps(appExamples.filter(app => app.category === filterCategory))
    }
  }, [filterCategory])

  // Auto-advance success stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % successStories.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Cost calculation
  const calculateCost = useCallback(() => {
    let baseCost = 0
    switch (costCalculator.complexity) {
      case 'simple': baseCost = 49; break
      case 'medium': baseCost = 149; break
      case 'complex': baseCost = 299; break
    }
    const featureCost = costCalculator.features.length * 25
    setCostCalculator(prev => ({ ...prev, estimate: baseCost + featureCost }))
  }, [costCalculator.complexity, costCalculator.features])

  useEffect(() => {
    calculateCost()
  }, [calculateCost])

  const toggleFeature = (feature: string) => {
    setCostCalculator(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const categories = ['All', ...Array.from(new Set(appExamples.map(app => app.category)))]

  return (
    <Layout>
      {/* Builder Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-16">
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">For Builders</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Build Without Barriers
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Turn your vision into reality without writing a single line of code. Join thousands of builders who are creating amazing applications with Happy Llama.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/beta-signup">Start Building Free</Link>
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Your Next App</h3>
                  <Badge>✨ AI-Powered</Badge>
                </div>
                <div className="space-y-3">
                  <div className="w-full h-2 bg-blue-200 rounded-full">
                    <div className="w-3/4 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Generating your custom SaaS dashboard...
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Authentication</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Database</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>API</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Deployment</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-full opacity-20 animate-float"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-500 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Carousel */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Real Builders, Real Success
            </h2>
            <p className="text-xl text-gray-600">
              See how people just like you are building amazing applications
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {successStories[currentStoryIndex].avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{successStories[currentStoryIndex].name}</h3>
                      <p className="text-gray-600">{successStories[currentStoryIndex].background}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Built: {successStories[currentStoryIndex].builtApp}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-500">Challenge</div>
                      <div className="text-sm">{successStories[currentStoryIndex].challenge}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Time to Build</div>
                      <div className="text-sm font-semibold text-blue-600">{successStories[currentStoryIndex].timeToBuilt}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Result</div>
                      <div className="text-sm font-semibold text-green-600">{successStories[currentStoryIndex].result}</div>
                    </div>
                  </div>
                  
                  <blockquote className="text-lg italic text-gray-700 mb-4">
                    &quot;{successStories[currentStoryIndex].testimonial}&quot;
                  </blockquote>
                  
                  <Button size="sm" variant="outline">
                    See the App
                  </Button>
                </div>
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-center mt-6 space-x-2">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStoryIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStoryIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Guide */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How to Get Started
            </h2>
            <p className="text-xl text-gray-600">
              From idea to deployed app in 4 simple steps
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Step Navigation */}
            <div className="space-y-4">
              {tutorialSteps.map((step, index) => (
                <div
                  key={index}
                  className={`cursor-pointer transition-all ${
                    selectedStep === index ? 'scale-105' : ''
                  }`}
                  onClick={() => setSelectedStep(index)}
                >
                  <Card className={`p-6 ${selectedStep === index ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        selectedStep === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Step Details */}
            <div className="lg:sticky lg:top-4">
              <Card className="p-8">
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {tutorialSteps[selectedStep].number}
                    </div>
                    <h3 className="text-2xl font-bold">{tutorialSteps[selectedStep].title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{tutorialSteps[selectedStep].description}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-2">Example:</h4>
                  <p className="text-sm text-gray-700">{tutorialSteps[selectedStep].example}</p>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Pro Tips:</h4>
                  <ul className="space-y-2">
                    {tutorialSteps[selectedStep].tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full">
                  {selectedStep === tutorialSteps.length - 1 ? 'Start Building' : 'Next Step'}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Would This Cost You?
            </h2>
            <p className="text-xl text-gray-600">
              See how much time and money Happy Llama saves compared to traditional development
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Calculator Inputs */}
            <div>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">App Complexity</h3>
                
                <div className="space-y-4 mb-8">
                  {[
                    { value: 'simple', label: 'Simple', desc: 'Basic CRUD, few pages, minimal integrations' },
                    { value: 'medium', label: 'Medium', desc: 'User auth, database, API integrations' },
                    { value: 'complex', label: 'Complex', desc: 'Advanced features, real-time, payments' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="complexity"
                        value={option.value}
                        checked={costCalculator.complexity === option.value}
                        onChange={(e) => setCostCalculator(prev => ({ ...prev, complexity: e.target.value }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <h3 className="text-lg font-semibold mb-4">Additional Features</h3>
                <div className="space-y-2">
                  {[
                    'User Authentication',
                    'Payment Processing',
                    'Email Notifications',
                    'File Uploads',
                    'Real-time Features',
                    'Mobile App',
                    'Admin Dashboard',
                    'Analytics Integration'
                  ].map((feature) => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={costCalculator.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            {/* Cost Comparison */}
            <div>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Cost Comparison</h3>
                
                <div className="space-y-6">
                  {/* Happy Llama */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Happy Llama</h4>
                      <div className="text-2xl font-bold text-green-600">
                        ${costCalculator.estimate}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>⏱️ 2-8 hours</div>
                      <div>🚀 Production ready</div>
                      <div>💻 Full code ownership</div>
                    </div>
                  </div>

                  {/* Traditional Development */}
                  <div className="border-l-4 border-red-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Traditional Development</h4>
                      <div className="text-2xl font-bold text-red-600">
                        ${(costCalculator.estimate * 100).toLocaleString()}+
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>⏱️ 3-6 months</div>
                      <div>👥 Full team required</div>
                      <div>🔄 Multiple revision cycles</div>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">You Save</div>
                      <div className="text-3xl font-bold text-green-600">
                        ${((costCalculator.estimate * 100) - costCalculator.estimate).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        That&apos;s {Math.round((1 - costCalculator.estimate / (costCalculator.estimate * 100)) * 100)}% savings!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex space-x-4">
                    <Input placeholder="your@email.com" className="flex-1" />
                    <Button>
                      Send Quote
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Get a detailed breakdown sent to your email
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Example Applications */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              App Gallery
            </h2>
            <p className="text-xl text-gray-600">
              Get inspired by applications built with Happy Llama
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filterCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* App Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredApps.map((app, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => setSelectedApp(app.name)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-4xl">{app.thumbnail}</div>
                    <Badge variant={app.complexity === 'Simple' ? 'default' : app.complexity === 'Medium' ? 'secondary' : 'destructive'}>
                      {app.complexity}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{app.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center justify-between text-sm">
                      <span>{app.category}</span>
                      <span className="text-blue-600">{app.buildTime}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-2">Key Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {app.features.slice(0, 2).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {app.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{app.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Tech Stack:</div>
                      <div className="flex flex-wrap gap-1">
                        {app.techStack.map((tech, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline">
              View All Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Builder Resources */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Resources for Builders
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to succeed with Happy Llama
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{resource.icon}</div>
                    <CardTitle>{resource.type}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resource.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{item.title}</span>
                        {'duration' in item && <span className="text-blue-600">{item.duration}</span>}
                        {'status' in item && (
                          <Badge variant={item.status === 'Available' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        )}
                        {'activity' in item && <span className="text-green-600">{item.activity}</span>}
                      </div>
                    ))}
                  </div>
                  {resource.type === 'Video Tutorials' && (
                    <Button className="w-full mt-4" variant="outline" asChild>
                      <Link href="/resources/videos">Watch Now</Link>
                    </Button>
                  )}
                  {resource.type === 'Templates Library' && (
                    <Button className="w-full mt-4" variant="outline" asChild>
                      <Link href="/templates">Browse Templates</Link>
                    </Button>
                  )}
                  {resource.type === 'Community Forum' && (
                    <Button className="w-full mt-4" variant="outline" asChild>
                      <a href="https://community.happyllama.ai" target="_blank" rel="noopener noreferrer">
                        Join Discussion
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ for Builders */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="relative max-w-md mx-auto">
              <Input placeholder="Search questions..." className="pr-10" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-xl font-semibold mb-4 text-blue-600">
                  {category.category}
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`} className="bg-white rounded-lg px-6">
                      <AccordionTrigger className="text-left font-medium">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        <p className="mb-4">{faq.a}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500">Was this helpful?</span>
                          <Button size="sm" variant="outline">👍 Yes</Button>
                          <Button size="sm" variant="outline">👎 No</Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Button>Join Our Community</Button>
          </div>
        </div>
      </section>

      {/* Builder CTA */}
      <section className="section-padding bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl font-bold mb-6">
            Your App Awaits
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of builders who are already bringing their ideas to life with Happy Llama
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/beta-signup">Start Building Free</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/demo-request">Schedule Walkthrough</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="ghost" 
              className="text-white hover:bg-white/10"
            >
              <Link href="/resources/community">Join Builder Community</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}