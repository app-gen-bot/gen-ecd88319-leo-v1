"use client"

import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/layout'

const resourceCategories = [
  {
    title: "Documentation",
    description: "Complete guides and API references",
    icon: "📚",
    href: "/resources/documentation",
    items: [
      { name: "Getting Started Guide", type: "Guide" },
      { name: "API Reference", type: "Reference" },
      { name: "Best Practices", type: "Guide" },
      { name: "Troubleshooting", type: "Support" }
    ]
  },
  {
    title: "Whitepapers",
    description: "In-depth research and technical insights",
    icon: "📄",
    href: "/resources/whitepapers",
    items: [
      { name: "AI in Software Development", type: "Research" },
      { name: "Security Architecture", type: "Technical" },
      { name: "Performance Benchmarks", type: "Analysis" },
      { name: "Future of No-Code", type: "Insight" }
    ]
  },
  {
    title: "Case Studies",
    description: "Real customer success stories",
    icon: "📊",
    href: "/resources/case-studies",
    items: [
      { name: "TechFlow: 80% Faster Development", type: "Success Story" },
      { name: "MedTech: HIPAA Compliance", type: "Compliance" },
      { name: "GrowthMetrics: Cost Savings", type: "ROI" }
    ]
  },
  {
    title: "Video Library",
    description: "Tutorials and demonstrations",
    icon: "🎥",
    href: "/resources/videos",
    items: [
      { name: "Platform Overview", type: "Demo" },
      { name: "Advanced Features", type: "Tutorial" },
      { name: "Customer Stories", type: "Interview" }
    ]
  },
  {
    title: "Webinars",
    description: "Live sessions and recorded events",
    icon: "🎤",
    href: "/resources/webinars",
    items: [
      { name: "Monthly Product Updates", type: "Live" },
      { name: "Building Better Apps", type: "Educational" },
      { name: "Q&A with Founders", type: "Community" }
    ]
  },
  {
    title: "Blog",
    description: "Latest insights and updates",
    icon: "✍️", 
    href: "/blog",
    comingSoon: true,
    items: [
      { name: "Product Updates", type: "News" },
      { name: "Technical Deep Dives", type: "Technical" },
      { name: "Industry Insights", type: "Analysis" }
    ]
  }
]

export default function ResourcesPage() {
  return (
    <Layout>
      <div className="bg-gray-50 py-16">
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Resources</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Resources
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to succeed with Happy Llama. From getting started guides to advanced technical documentation.
            </p>
          </div>

          {/* Resource Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resourceCategories.map((category, index) => (
              <Card 
                key={index}
                className={`cursor-pointer hover:shadow-lg transition-all hover:scale-105 ${
                  category.comingSoon ? 'opacity-75' : ''
                }`}
                onClick={() => {
                  if (category.comingSoon) {
                    alert('Coming Soon! We\'re working on this resource.')
                  } else {
                    window.location.href = category.href
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{category.icon}</div>
                    {category.comingSoon && (
                      <Badge variant="secondary">Coming Soon</Badge>
                    )}
                  </div>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant={category.comingSoon ? "outline" : "default"}
                  >
                    {category.comingSoon ? 'Notify Me' : 'Explore'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Access */}
          <div className="mt-16 bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-8">
              Quick Access
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
                <Link href="/resources/documentation">
                  <div className="text-2xl mb-2">🚀</div>
                  <div>Quick Start</div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
                <Link href="/contact/support">
                  <div className="text-2xl mb-2">💬</div>
                  <div>Get Help</div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
                <Link href="/beta-signup">
                  <div className="text-2xl mb-2">🎯</div>
                  <div>Join Beta</div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
                <Link href="/contact">
                  <div className="text-2xl mb-2">📞</div>
                  <div>Contact Us</div>
                </Link>
              </Button>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="mb-6 opacity-90">
              Get the latest resources, tutorials, and product updates delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto flex space-x-4">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900"
              />
              <Button variant="secondary">
                Subscribe
              </Button>
            </div>
            <p className="text-sm mt-2 opacity-75">
              No spam, unsubscribe anytime
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}