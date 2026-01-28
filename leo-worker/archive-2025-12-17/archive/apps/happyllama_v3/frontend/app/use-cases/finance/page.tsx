"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

const financeUseCases = [
  {
    id: "banking-dashboard",
    title: "Digital Banking Dashboard",
    description: "Modern online banking platform with account management, transactions, and financial insights.",
    buildTime: "5 hours",
    complexity: "Complex",
    features: ["Account Management", "Transaction History", "Bill Payments", "Analytics"],
    image: "/stock_photos/banking-dashboard.jpg"
  },
  {
    id: "expense-tracker",
    title: "Corporate Expense Tracker",
    description: "Streamlined expense management system for businesses with approval workflows and reporting.",
    buildTime: "3 hours",
    complexity: "Medium",
    features: ["Expense Submission", "Approval Workflow", "Receipt Scanning", "Reports"],
    image: "/stock_photos/expense-tracker.jpg"
  },
  {
    id: "investment-platform",
    title: "Investment Portfolio Manager",
    description: "Comprehensive investment tracking and analysis platform with real-time market data.",
    buildTime: "6 hours",
    complexity: "Complex",
    features: ["Portfolio Tracking", "Market Analysis", "Risk Assessment", "Trading"],
    image: "/stock_photos/investment-platform.jpg"
  },
  {
    id: "payment-gateway",
    title: "Payment Processing System",
    description: "Secure payment gateway with multi-currency support and fraud detection.",
    buildTime: "4 hours",
    complexity: "Medium",
    features: ["Payment Processing", "Fraud Detection", "Multi-Currency", "Reporting"],
    image: "/stock_photos/payment-gateway.jpg"
  },
  {
    id: "loan-management",
    title: "Loan Management System",
    description: "End-to-end loan origination and servicing platform for financial institutions.",
    buildTime: "7 hours",
    complexity: "Complex",
    features: ["Application Processing", "Credit Scoring", "Document Management", "Collections"],
    image: "/stock_photos/loan-system.jpg"
  },
  {
    id: "budget-planner",
    title: "Personal Budget Planner",
    description: "Simple yet powerful budgeting app for personal finance management.",
    buildTime: "2 hours",
    complexity: "Simple",
    features: ["Budget Creation", "Expense Tracking", "Savings Goals", "Reports"],
    image: "/stock_photos/budget-app.jpg"
  }
]

export default function FinanceUseCasesPage() {
  const [filter, setFilter] = useState<"all" | "Simple" | "Medium" | "Complex">("all")

  const filteredCases = filter === "all" 
    ? financeUseCases 
    : financeUseCases.filter(uc => uc.complexity === filter)

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/use-cases" className="hover:text-foreground">Use Cases</Link>
          <span>/</span>
          <span>Finance</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Finance Use Cases</h1>
        <p className="text-lg text-muted-foreground">
          Build secure, compliant financial applications with enterprise-grade quality
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
            <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200" />
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
            Build Your Finance Solution
          </Button>
        </Link>
      </div>
    </div>
  )
}