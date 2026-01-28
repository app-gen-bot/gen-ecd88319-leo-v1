"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

const retailUseCases = [
  {
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    description: "Full-featured online store with product catalog, shopping cart, and payment processing.",
    buildTime: "6 hours",
    complexity: "Complex",
    features: ["Product Catalog", "Shopping Cart", "Payment Processing", "Order Management"],
    image: "/stock_photos/ecommerce.jpg"
  },
  {
    id: "inventory-management",
    title: "Inventory Management System",
    description: "Real-time inventory tracking with automated reordering and supplier management.",
    buildTime: "4 hours",
    complexity: "Medium",
    features: ["Stock Tracking", "Reorder Alerts", "Supplier Management", "Barcode Scanning"],
    image: "/stock_photos/inventory.jpg"
  },
  {
    id: "pos-system",
    title: "Point of Sale System",
    description: "Modern POS system for retail stores with integrated payment and inventory.",
    buildTime: "5 hours",
    complexity: "Medium",
    features: ["Sales Processing", "Inventory Integration", "Customer Management", "Reports"],
    image: "/stock_photos/pos-system.jpg"
  },
  {
    id: "loyalty-program",
    title: "Customer Loyalty App",
    description: "Mobile-first loyalty program with rewards, points tracking, and personalized offers.",
    buildTime: "3 hours",
    complexity: "Simple",
    features: ["Points Tracking", "Rewards Catalog", "Personalized Offers", "Push Notifications"],
    image: "/stock_photos/loyalty-app.jpg"
  },
  {
    id: "marketplace-platform",
    title: "Multi-Vendor Marketplace",
    description: "Complete marketplace solution with vendor management and commission tracking.",
    buildTime: "8 hours",
    complexity: "Complex",
    features: ["Vendor Management", "Commission System", "Product Reviews", "Analytics"],
    image: "/stock_photos/marketplace.jpg"
  },
  {
    id: "retail-analytics",
    title: "Retail Analytics Dashboard",
    description: "Business intelligence platform for retail operations with predictive analytics.",
    buildTime: "4 hours",
    complexity: "Medium",
    features: ["Sales Analytics", "Customer Insights", "Trend Analysis", "Forecasting"],
    image: "/stock_photos/retail-analytics.jpg"
  }
]

export default function RetailUseCasesPage() {
  const [filter, setFilter] = useState<"all" | "Simple" | "Medium" | "Complex">("all")

  const filteredCases = filter === "all" 
    ? retailUseCases 
    : retailUseCases.filter(uc => uc.complexity === filter)

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/use-cases" className="hover:text-foreground">Use Cases</Link>
          <span>/</span>
          <span>Retail</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Retail Use Cases</h1>
        <p className="text-lg text-muted-foreground">
          Transform retail operations with AI-powered applications built in hours, not months
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
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200" />
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
            Build Your Retail Solution
          </Button>
        </Link>
      </div>
    </div>
  )
}