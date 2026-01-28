"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Cpu, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

const processSteps = [
  {
    id: 1,
    title: 'Describe',
    description: 'Tell us your app idea in plain English',
    extendedDescription: 'Our AI understands natural language. Simply describe what you want to build, who it\'s for, and what problems it solves. No technical knowledge required.',
    icon: MessageSquare,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 2,
    title: 'Generate',
    description: 'AI creates your complete application',
    extendedDescription: 'Our multi-agent system designs, codes, and tests your application. Watch as your idea transforms into a fully functional app in minutes.',
    icon: Cpu,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 3,
    title: 'Deploy',
    description: 'Launch instantly to production',
    extendedDescription: 'One click deploys your app to our global infrastructure. Automatic scaling, security, and monitoring included from day one.',
    icon: Rocket,
    color: 'from-pink-500 to-pink-600',
  },
]

export function ProcessSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  return (
    <section id="process" className="py-24 relative">
      <div className="container-max section-padding">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your idea into reality
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {processSteps.map((step, index) => {
            const Icon = step.icon
            const isExpanded = expandedCard === step.id

            return (
              <div
                key={step.id}
                className="animate-on-scroll"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 cursor-pointer card-hover",
                    isExpanded && "ring-2 ring-primary"
                  )}
                  onClick={() => setExpandedCard(isExpanded ? null : step.id)}
                >
                  {/* Gradient background */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-10 bg-gradient-to-br",
                      step.color
                    )}
                  />

                  <CardHeader className="relative">
                    <div className="mb-4">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white",
                          step.color
                        )}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                    <CardDescription className="text-base">
                      {step.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative">
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300",
                        isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <p className="text-sm text-muted-foreground pt-4">
                        {step.extendedDescription}
                      </p>
                    </div>
                  </CardContent>

                  {/* Connection line (visible on desktop) */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-muted to-transparent" />
                  )}
                </Card>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <a
            href="#showcase"
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            See It In Action
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}