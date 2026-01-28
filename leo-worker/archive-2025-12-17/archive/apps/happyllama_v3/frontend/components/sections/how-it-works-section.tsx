"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  DocumentTextIcon,
  PaintBrushIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  RocketLaunchIcon
} from "@heroicons/react/24/outline"

const steps = [
  {
    id: "requirements",
    title: "Requirements Gathering",
    icon: DocumentTextIcon,
    description: "AI analyzes your ideas and generates comprehensive requirements documentation",
    automation: "95%",
    traditionalTime: "2 weeks",
    lllamaTime: "2 hours",
    details: "Our AI agents conduct thorough requirements analysis, creating detailed PRDs, user stories, and acceptance criteria. The system automatically identifies edge cases, compliance requirements, and technical constraints.",
    sampleOutput: {
      title: "Product Requirements Document",
      content: "Complete PRD with user personas, functional requirements, non-functional requirements, and success metrics..."
    }
  },
  {
    id: "design",
    title: "Design & Architecture",
    icon: PaintBrushIcon,
    description: "Automated creation of UI/UX designs and system architecture",
    automation: "90%",
    traditionalTime: "3 weeks",
    lllamaTime: "4 hours",
    details: "AI generates wireframes, mockups, and complete system architecture diagrams. Includes database schema design, API specifications, and infrastructure requirements.",
    sampleOutput: {
      title: "System Architecture",
      content: "Microservices architecture with API Gateway, service mesh, and event-driven communication patterns..."
    }
  },
  {
    id: "implementation",
    title: "Implementation",
    icon: CodeBracketIcon,
    description: "Multi-agent system writes production-ready code",
    automation: "100%",
    traditionalTime: "3 months",
    lllamaTime: "24 hours",
    details: "Our specialized AI agents collaborate to write clean, tested, documented code. Includes frontend, backend, database migrations, and infrastructure as code.",
    sampleOutput: {
      title: "Generated Codebase",
      content: "Complete Next.js frontend, FastAPI backend, DynamoDB schemas, and CDK infrastructure code..."
    }
  },
  {
    id: "verification",
    title: "Verification & Testing",
    icon: CheckCircleIcon,
    description: "Automated testing and quality assurance",
    automation: "85%",
    traditionalTime: "2 weeks",
    lllamaTime: "4 hours",
    details: "Comprehensive test suite generation including unit tests, integration tests, and end-to-end tests. Automated security scanning and performance testing.",
    sampleOutput: {
      title: "Test Suite",
      content: "95% code coverage with Jest, Cypress E2E tests, security audit reports, and performance benchmarks..."
    }
  },
  {
    id: "deployment",
    title: "Deployment",
    icon: RocketLaunchIcon,
    description: "One-click deployment to production",
    automation: "100%",
    traditionalTime: "1 week",
    lllamaTime: "30 minutes",
    details: "Fully automated CI/CD pipeline setup, infrastructure provisioning, and deployment. Includes monitoring, logging, and rollback capabilities.",
    sampleOutput: {
      title: "Deployment Pipeline",
      content: "GitHub Actions workflows, AWS CDK stacks, CloudWatch dashboards, and deployment documentation..."
    }
  }
]

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<any>(null)
  const [demoOpen, setDemoOpen] = useState(false)

  const openSampleModal = (step: typeof steps[0]) => {
    setModalContent(step)
    setModalOpen(true)
  }

  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <div className="container">
        {/* Timeline */}
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`relative flex items-center ${
                  index % 2 === 0 ? "md:justify-start" : "md:justify-end"
                }`}
              >
                {/* Step number */}
                <div className="absolute left-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground md:left-1/2 md:-translate-x-1/2">
                  <step.icon className="h-8 w-8" />
                </div>

                {/* Step content */}
                <Card
                  className={`ml-24 w-full cursor-pointer transition-all hover:shadow-lg md:ml-0 md:w-5/12 ${
                    index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                  } ${activeStep === step.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                      <Badge variant="purple">AI: {step.automation}</Badge>
                    </div>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  
                  {activeStep === step.id && (
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {step.details}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Traditional: </span>
                          <span className="font-semibold text-destructive">{step.traditionalTime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Happy Llama: </span>
                          <span className="font-semibold text-green-600">{step.lllamaTime}</span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          openSampleModal(step)
                        }}
                      >
                        View Sample Output
                      </Button>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Demo Button */}
        <div
          className="mt-16 text-center"
        >
          <Button size="lg" variant="gradient" onClick={() => setDemoOpen(true)}>
            Try Interactive Demo
          </Button>
        </div>

        {/* Sample Output Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{modalContent?.sampleOutput?.title}</DialogTitle>
              <DialogDescription>
                Sample output from the {modalContent?.title} phase
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
                <code>{modalContent?.sampleOutput?.content}</code>
              </pre>
            </div>
          </DialogContent>
        </Dialog>

        {/* Interactive Demo Modal */}
        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Interactive SDLC Demo</DialogTitle>
              <DialogDescription>
                Watch Happy Llama transform an idea into a production-ready application
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {step.automation} Automated
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {step.lllamaTime} vs {step.traditionalTime}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setDemoOpen(false)}>Close Demo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}