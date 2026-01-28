"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

const educationUseCases = [
  {
    id: "lms-platform",
    title: "Learning Management System",
    description: "Complete LMS with course creation, student tracking, and assessment tools.",
    buildTime: "7 hours",
    complexity: "Complex",
    features: ["Course Management", "Student Tracking", "Assessments", "Certificates"],
    image: "/stock_photos/lms.jpg"
  },
  {
    id: "virtual-classroom",
    title: "Virtual Classroom Platform",
    description: "Interactive online classroom with video conferencing and collaboration tools.",
    buildTime: "5 hours",
    complexity: "Medium",
    features: ["Video Classes", "Screen Sharing", "Whiteboard", "Breakout Rooms"],
    image: "/stock_photos/virtual-classroom.jpg"
  },
  {
    id: "student-portal",
    title: "Student Information System",
    description: "Comprehensive student portal with grades, attendance, and communication features.",
    buildTime: "4 hours",
    complexity: "Medium",
    features: ["Grade Management", "Attendance", "Parent Portal", "Communications"],
    image: "/stock_photos/student-portal.jpg"
  },
  {
    id: "exam-platform",
    title: "Online Examination System",
    description: "Secure online testing platform with automated grading and analytics.",
    buildTime: "5 hours",
    complexity: "Medium",
    features: ["Test Creation", "Proctoring", "Auto-Grading", "Analytics"],
    image: "/stock_photos/exam-system.jpg"
  },
  {
    id: "course-marketplace",
    title: "Course Marketplace",
    description: "E-learning marketplace for selling and buying online courses.",
    buildTime: "6 hours",
    complexity: "Complex",
    features: ["Course Listing", "Payment Processing", "Reviews", "Instructor Dashboard"],
    image: "/stock_photos/course-marketplace.jpg"
  },
  {
    id: "flashcard-app",
    title: "Study Flashcard App",
    description: "Simple flashcard application for memorization and spaced repetition learning.",
    buildTime: "2 hours",
    complexity: "Simple",
    features: ["Card Creation", "Spaced Repetition", "Progress Tracking", "Sharing"],
    image: "/stock_photos/flashcards.jpg"
  }
]

export default function EducationUseCasesPage() {
  const [filter, setFilter] = useState<"all" | "Simple" | "Medium" | "Complex">("all")

  const filteredCases = filter === "all" 
    ? educationUseCases 
    : educationUseCases.filter(uc => uc.complexity === filter)

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/use-cases" className="hover:text-foreground">Use Cases</Link>
          <span>/</span>
          <span>Education</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Education Use Cases</h1>
        <p className="text-lg text-muted-foreground">
          Transform education with AI-powered learning platforms and management systems
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
            <div className="aspect-video bg-gradient-to-br from-amber-100 to-amber-200" />
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
            Build Your Education Solution
          </Button>
        </Link>
      </div>
    </div>
  )
}