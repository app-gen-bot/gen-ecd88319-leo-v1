"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

const technologyUseCases = [
  {
    id: "saas-dashboard",
    title: "SaaS Admin Dashboard",
    description: "Multi-tenant SaaS platform with user management, billing, and analytics.",
    buildTime: "7 hours",
    complexity: "Complex",
    features: ["Multi-Tenancy", "User Management", "Billing Integration", "Analytics"],
    image: "/stock_photos/saas-dashboard.jpg"
  },
  {
    id: "api-gateway",
    title: "API Management Platform",
    description: "Comprehensive API gateway with rate limiting, authentication, and monitoring.",
    buildTime: "5 hours",
    complexity: "Medium",
    features: ["API Gateway", "Rate Limiting", "Authentication", "Monitoring"],
    image: "/stock_photos/api-gateway.jpg"
  },
  {
    id: "devops-dashboard",
    title: "DevOps Monitoring Dashboard",
    description: "Real-time infrastructure monitoring with alerts and automated remediation.",
    buildTime: "4 hours",
    complexity: "Medium",
    features: ["Infrastructure Monitoring", "Alert Management", "Log Aggregation", "Metrics"],
    image: "/stock_photos/devops.jpg"
  },
  {
    id: "code-review-tool",
    title: "Code Review Platform",
    description: "Collaborative code review tool with inline comments and CI/CD integration.",
    buildTime: "6 hours",
    complexity: "Complex",
    features: ["Code Review", "Inline Comments", "CI/CD Integration", "Metrics"],
    image: "/stock_photos/code-review.jpg"
  },
  {
    id: "data-pipeline",
    title: "Data Pipeline Manager",
    description: "ETL pipeline management system with visual workflow builder and monitoring.",
    buildTime: "5 hours",
    complexity: "Medium",
    features: ["Pipeline Builder", "Data Transformation", "Scheduling", "Monitoring"],
    image: "/stock_photos/data-pipeline.jpg"
  },
  {
    id: "bug-tracker",
    title: "Issue Tracking System",
    description: "Simple yet powerful bug tracking and project management tool.",
    buildTime: "3 hours",
    complexity: "Simple",
    features: ["Issue Tracking", "Project Management", "Team Collaboration", "Reports"],
    image: "/stock_photos/bug-tracker.jpg"
  }
]

export default function TechnologyUseCasesPage() {
  const [filter, setFilter] = useState<"all" | "Simple" | "Medium" | "Complex">("all")

  const filteredCases = filter === "all" 
    ? technologyUseCases 
    : technologyUseCases.filter(uc => uc.complexity === filter)

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/use-cases" className="hover:text-foreground">Use Cases</Link>
          <span>/</span>
          <span>Technology</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Technology Use Cases</h1>
        <p className="text-lg text-muted-foreground">
          Build developer tools and technology platforms with enterprise-grade architecture
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "Simple" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("Simple")}
        >
          Simple
        </Button>
        <Button
          variant={filter === "Medium" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("Medium")}
        >
          Medium
        </Button>
        <Button
          variant={filter === "Complex" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("Complex")}
        >
          Complex
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCases.map((useCase) => (
          <Card key={useCase.id} className="overflow-hidden transition-all hover:shadow-lg">
            <div className="aspect-video bg-gradient-to-br from-indigo-100 to-indigo-200" />
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline">{useCase.complexity}</Badge>
                <span className="text-sm text-muted-foreground">{useCase.buildTime}</span>
              </div>
              <CardTitle className="text-xl">{useCase.title}</CardTitle>
              <CardDescription>{useCase.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-1">
                {useCase.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {useCase.features.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{useCase.features.length - 3} more
                  </Badge>
                )}
              </div>
              <Link href={`/use-cases/${useCase.id}`}>
                <Button className="w-full" variant="outline">
                  View Details
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/beta-signup">
          <Button size="lg" variant="gradient">
            Build Your Tech Solution
          </Button>
        </Link>
      </div>
    </div>
  )
}