"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

const healthcareUseCases = [
  {
    id: "patient-portal",
    title: "Patient Portal System",
    description: "Comprehensive patient management system with appointment scheduling, medical records, and telemedicine capabilities.",
    buildTime: "6 hours",
    complexity: "Complex",
    features: ["Appointment Booking", "Medical Records", "Telemedicine", "Prescription Management"],
    image: "/stock_photos/healthcare-portal.jpg"
  },
  {
    id: "clinic-management",
    title: "Clinic Management Dashboard",
    description: "All-in-one solution for small to medium clinics to manage operations, staff, and patient flow.",
    buildTime: "4 hours",
    complexity: "Medium",
    features: ["Staff Management", "Patient Queue", "Billing", "Inventory"],
    image: "/stock_photos/clinic-dashboard.jpg"
  },
  {
    id: "health-monitoring",
    title: "Health Monitoring App",
    description: "Mobile-first application for tracking vital signs, medications, and health trends.",
    buildTime: "3 hours",
    complexity: "Simple",
    features: ["Vital Tracking", "Medication Reminders", "Health Reports", "Doctor Sync"],
    image: "/stock_photos/health-app.jpg"
  },
  {
    id: "hospital-erp",
    title: "Hospital ERP System",
    description: "Enterprise resource planning system for large hospitals with multi-department coordination.",
    buildTime: "8 hours",
    complexity: "Complex",
    features: ["Department Management", "Resource Allocation", "Financial Management", "Compliance"],
    image: "/stock_photos/hospital-system.jpg"
  },
  {
    id: "telehealth-platform",
    title: "Telehealth Platform",
    description: "Video consultation platform with scheduling, payments, and prescription management.",
    buildTime: "5 hours",
    complexity: "Medium",
    features: ["Video Consultations", "Online Payments", "E-Prescriptions", "Patient History"],
    image: "/stock_photos/telehealth.jpg"
  },
  {
    id: "medical-research",
    title: "Medical Research Database",
    description: "Research data management system for clinical trials and medical studies.",
    buildTime: "7 hours",
    complexity: "Complex",
    features: ["Data Collection", "Analysis Tools", "Compliance Tracking", "Reporting"],
    image: "/stock_photos/research-db.jpg"
  }
]

export default function HealthcareUseCasesPage() {
  const [filter, setFilter] = useState<"all" | "Simple" | "Medium" | "Complex">("all")

  const filteredCases = filter === "all" 
    ? healthcareUseCases 
    : healthcareUseCases.filter(uc => uc.complexity === filter)

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/use-cases" className="hover:text-foreground">Use Cases</Link>
          <span>/</span>
          <span>Healthcare</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Healthcare Use Cases</h1>
        <p className="text-lg text-muted-foreground">
          Discover how Happy Llama transforms healthcare operations with AI-powered application development
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
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200" />
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
            Build Your Healthcare Solution
          </Button>
        </Link>
      </div>
    </div>
  )
}