import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
  DocumentTextIcon,
  CubeTransparentIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  UsersIcon,
  CodeBracketSquareIcon
} from "@heroicons/react/24/outline"

const features = [
  {
    icon: SparklesIcon,
    title: "AI-Powered Development",
    description: "Multi-agent system that writes, tests, and deploys code automatically",
    capabilities: [
      "Intelligent code generation",
      "Automated testing",
      "Self-healing systems",
      "Performance optimization"
    ]
  },
  {
    icon: ShieldCheckIcon,
    title: "Enterprise Security",
    description: "Bank-grade security and compliance built into every application",
    capabilities: [
      "End-to-end encryption",
      "HIPAA/GDPR compliance",
      "SOC 2 certification",
      "Audit logging"
    ]
  },
  {
    icon: BoltIcon,
    title: "Lightning Fast",
    description: "Build in hours what traditionally takes months",
    capabilities: [
      "10x faster development",
      "Instant deployment",
      "Real-time collaboration",
      "Parallel processing"
    ]
  },
  {
    icon: DocumentTextIcon,
    title: "Complete Documentation",
    description: "Every line of code comes with comprehensive documentation",
    capabilities: [
      "API documentation",
      "User guides",
      "Technical specs",
      "Test reports"
    ]
  },
  {
    icon: CubeTransparentIcon,
    title: "Modular Architecture",
    description: "Scalable, maintainable architecture patterns",
    capabilities: [
      "Microservices ready",
      "Event-driven design",
      "API-first approach",
      "Cloud-native"
    ]
  },
  {
    icon: CloudArrowUpIcon,
    title: "One-Click Deployment",
    description: "Deploy to any cloud provider instantly",
    capabilities: [
      "AWS integration",
      "Azure support",
      "Google Cloud ready",
      "On-premise options"
    ]
  },
  {
    icon: ChartBarIcon,
    title: "Built-in Analytics",
    description: "Monitor and optimize your applications",
    capabilities: [
      "Real-time dashboards",
      "Performance metrics",
      "User analytics",
      "Cost tracking"
    ]
  },
  {
    icon: UsersIcon,
    title: "Team Collaboration",
    description: "Work together seamlessly",
    capabilities: [
      "Real-time updates",
      "Version control",
      "Role-based access",
      "Change tracking"
    ]
  },
  {
    icon: CodeBracketSquareIcon,
    title: "Full Stack Coverage",
    description: "Frontend, backend, database, and infrastructure",
    capabilities: [
      "Modern frameworks",
      "Database design",
      "API development",
      "DevOps automation"
    ]
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container">
        <div
          className="text-center mb-12"
        >
          <Badge variant="purple" className="mb-4">Platform Features</Badge>
          <h1 className="text-4xl font-bold mb-4 sm:text-5xl md:text-6xl">
            Everything You Need to Build
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Happy Llama provides a complete development platform with enterprise-grade features, 
            so you can focus on your business instead of technical complexities.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.capabilities.map((capability) => (
                      <li key={capability} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-sm text-muted-foreground">{capability}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our beta program and experience the future of application development.
          </p>
          <Link href="/beta-signup">
            <Button size="lg" variant="gradient">
              Get Early Access
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}