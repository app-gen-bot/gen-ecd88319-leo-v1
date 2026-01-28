"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  UserGroupIcon,
  ChartBarIcon,
  ServerStackIcon
} from "@heroicons/react/24/outline"

const differentiators = [
  {
    id: "universal",
    title: "For Everyone, With Enterprise Rigor",
    icon: UserGroupIcon,
    description: "Whether you're a citizen developer or Fortune 500, get the same enterprise-grade quality",
    features: [
      {
        type: "Citizen Developer",
        scenario: "Marketing manager needs a customer feedback portal",
        output: "Full-stack application with authentication, database, and analytics"
      },
      {
        type: "Startup",
        scenario: "Founder building an MVP for investor demo",
        output: "Production-ready SaaS with payment integration and user management"
      },
      {
        type: "Enterprise",
        scenario: "IT department modernizing legacy systems",
        output: "Microservices architecture with compliance and audit logging"
      }
    ],
    metrics: {
      "Code Quality": "99.8%",
      "Documentation": "100%",
      "Test Coverage": "95%+"
    }
  },
  {
    id: "learning",
    title: "Learning System",
    icon: ChartBarIcon,
    description: "AI that improves with every project using backpropagation-inspired learning",
    features: [
      "Pattern recognition across 10,000+ projects",
      "Continuous improvement through feedback loops",
      "Domain-specific optimizations"
    ],
    metrics: {
      "Patterns Learned": 10247,
      "Efficiency Gain": "47%",
      "Success Rate": "99.2%"
    },
    chartData: [
      { month: "Jan", efficiency: 65 },
      { month: "Feb", efficiency: 72 },
      { month: "Mar", efficiency: 78 },
      { month: "Apr", efficiency: 85 },
      { month: "May", efficiency: 89 },
      { month: "Jun", efficiency: 94 }
    ]
  },
  {
    id: "memory",
    title: "Hierarchical Memory",
    icon: ServerStackIcon,
    description: "Context-aware system that remembers everything relevant, forgets nothing important",
    features: [
      "Project-specific memory isolation",
      "Cross-project pattern sharing",
      "Intelligent context retrieval"
    ],
    metrics: {
      "Context Window": "Unlimited",
      "Retrieval Speed": "< 50ms",
      "Accuracy": "99.9%"
    },
    architecture: {
      levels: ["Global Patterns", "Domain Knowledge", "Project Context", "Current Task"],
      efficiency: "10x faster than traditional LLMs"
    }
  }
]

export function PlatformDifferentiators() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<any>(null)

  const openDetailsModal = (differentiator: typeof differentiators[0]) => {
    setModalContent(differentiator)
    setModalOpen(true)
  }

  return (
    <section className="py-24">
      <div className="container">
        <div
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 sm:text-4xl md:text-5xl">
            What Makes Us Different
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade AI development that actually delivers
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {differentiators.map((item, index) => (
            <div
              key={item.id}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics Display */}
                  <div className="space-y-2">
                    {Object.entries(item.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expandable Content */}
                  {expandedCard === item.id && (
                    <div
                      className="space-y-4 pt-4 border-t"
                    >
                      {item.features.map((feature, idx) => (
                        <div key={idx}>
                          {typeof feature === "string" ? (
                            <p className="text-sm text-muted-foreground">• {feature}</p>
                          ) : (
                            <div className="rounded-lg bg-muted p-3">
                              <Badge variant="outline" className="mb-2">
                                {feature.type}
                              </Badge>
                              <p className="text-sm font-medium mb-1">{feature.scenario}</p>
                              <p className="text-xs text-muted-foreground">{feature.output}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedCard(
                        expandedCard === item.id ? null : item.id
                      )}
                    >
                      {expandedCard === item.id ? "Show Less" : "See Examples"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDetailsModal(item)}
                    >
                      Learn More
                    </Button>
                  </div>

                  {/* Visual Elements */}
                  {item.id === "learning" && (
                    <div className="pt-4">
                      <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                        <ChartBarIcon className="h-16 w-16 text-primary/50" />
                      </div>
                    </div>
                  )}

                  {item.id === "memory" && (
                    <div className="pt-4">
                      <div className="space-y-2">
                        {item.architecture?.levels.map((level, idx) => (
                          <div
                            key={idx}
                            className="h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded flex items-center px-3 text-xs font-medium"
                            style={{ marginLeft: `${idx * 8}px` }}
                          >
                            {level}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div
          className="mt-12 text-center"
        >
          <Link href="/platform/features">
            <Button size="lg" variant="gradient">
              Explore Full Capabilities
            </Button>
          </Link>
        </div>

        {/* Details Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{modalContent?.title}</DialogTitle>
              <DialogDescription>
                {modalContent?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {modalContent?.metrics && Object.entries(modalContent.metrics).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground mb-1">{key}</p>
                    <p className="text-2xl font-bold">{value as string}</p>
                  </div>
                ))}
              </div>
              {modalContent?.features && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Key Features</h3>
                  {modalContent.features.map((feature: any, idx: number) => (
                    <div key={idx} className="text-sm text-muted-foreground">
                      {typeof feature === "string" ? (
                        <p>• {feature}</p>
                      ) : (
                        <div className="rounded-lg border p-3">
                          <p className="font-medium">{feature.type}: {feature.scenario}</p>
                          <p className="text-xs mt-1">{feature.output}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}