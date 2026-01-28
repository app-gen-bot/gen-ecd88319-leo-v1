"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, ClockIcon } from "@heroicons/react/24/outline"

const useCases = [
  {
    id: "healthcare-portal",
    title: "Healthcare Patient Portal",
    industry: "Healthcare",
    complexity: "Complex",
    buildTime: "4 hours",
    description: "HIPAA-compliant patient management system with appointments, records, and billing",
    image: "/stock_photos/unsplash_healthcare_medical_dashboard_RPHfplVYsmA_20250824_170319.jpg",
    tags: ["HIPAA", "Real-time", "Multi-tenant"]
  },
  {
    id: "ecommerce-platform",
    title: "E-commerce Platform",
    industry: "Retail",
    complexity: "Medium",
    buildTime: "3 hours",
    description: "Full-featured online store with inventory, payments, and shipping integration",
    image: "/stock_photos/unsplash_ecommerce_dashboard_analytics_OU4yhezlNyk_20250824_170327.jpg",
    tags: ["Payment Gateway", "Inventory", "Analytics"]
  },
  {
    id: "saas-dashboard",
    title: "SaaS Analytics Dashboard",
    industry: "Technology",
    complexity: "Medium",
    buildTime: "2.5 hours",
    description: "Real-time analytics dashboard with custom visualizations and reporting",
    image: "/stock_photos/unsplash_ecommerce_dashboard_analytics_h_kuT-rHBHs_20250824_170327.jpg",
    tags: ["Real-time", "Webhooks", "API"]
  },
  {
    id: "hr-management",
    title: "HR Management System",
    industry: "Enterprise",
    complexity: "Complex",
    buildTime: "5 hours",
    description: "Complete HR solution with recruitment, onboarding, and performance management",
    image: "/stock_photos/unsplash_abstract_technology_gradient_EHGxNsar-C4_20250824_165908.jpg",
    tags: ["Workflow", "Compliance", "Integration"]
  },
  {
    id: "education-platform",
    title: "Online Learning Platform",
    industry: "Education",
    complexity: "Simple",
    buildTime: "2 hours",
    description: "Course management system with video streaming and progress tracking",
    image: "/stock_photos/unsplash_abstract_technology_gradient_7FKsGvJBPAE_20250824_165908.jpg",
    tags: ["Video", "LMS", "Gamification"]
  },
  {
    id: "finance-dashboard",
    title: "Financial Trading Dashboard",
    industry: "Finance",
    complexity: "Complex",
    buildTime: "6 hours",
    description: "Real-time trading platform with market data and portfolio management",
    image: "/stock_photos/unsplash_abstract_technology_gradient_-_cuKYAnoiE_20250824_165908.jpg",
    tags: ["Real-time", "WebSocket", "Security"]
  }
]

const industryColors: Record<string, string> = {
  Healthcare: "blue",
  Retail: "green",
  Technology: "purple",
  Enterprise: "yellow",
  Education: "pink",
  Finance: "orange"
}

const complexityColors: Record<string, string> = {
  Simple: "green",
  Medium: "yellow",
  Complex: "red"
}

export function UseCaseGalleryPreview() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 sm:text-4xl md:text-5xl">
            Built with Happy Llama
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real applications built in hours, not months
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.id}
            >
              <Link href={`/use-cases/${useCase.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                    {useCase.image.startsWith("/stock_photos/") ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary/30 mb-2">
                            {useCase.title.substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {useCase.industry}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={useCase.image}
                        alt={useCase.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    
                    {/* Overlay badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Badge variant={industryColors[useCase.industry] as any || "default"}>
                        {useCase.industry}
                      </Badge>
                      <Badge variant={complexityColors[useCase.complexity] as any || "default"}>
                        {useCase.complexity}
                      </Badge>
                    </div>

                    {/* View Details overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-semibold flex items-center gap-2">
                        View Details <ArrowRightIcon className="h-4 w-4" />
                      </p>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">{useCase.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Build time */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <ClockIcon className="h-4 w-4" />
                      <span>Built in {useCase.buildTime}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {useCase.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div
          className="mt-12 text-center"
        >
          <Link href="/use-cases">
            <Button size="lg" variant="outline" className="group">
              Explore All Use Cases
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}