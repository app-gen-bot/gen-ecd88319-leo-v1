"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Palette, Code, Database, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const agents = [
  {
    id: 'hermes',
    name: 'Hermes',
    role: 'UI/UX Designer',
    description: 'Creates beautiful, intuitive interfaces',
    capabilities: [
      'Responsive design generation',
      'Component library creation',
      'Accessibility optimization',
      'Design system implementation',
    ],
    icon: Palette,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'athena',
    name: 'Athena',
    role: 'Backend Architect',
    description: 'Designs scalable system architectures',
    capabilities: [
      'API design and implementation',
      'Database schema optimization',
      'Microservices architecture',
      'Performance optimization',
    ],
    icon: Database,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'minerva',
    name: 'Minerva',
    role: 'Full-Stack Developer',
    description: 'Writes clean, efficient code',
    capabilities: [
      'Multi-language code generation',
      'Test-driven development',
      'Code refactoring and optimization',
      'Documentation generation',
    ],
    icon: Code,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'apollo',
    name: 'Apollo',
    role: 'DevOps Engineer',
    description: 'Handles deployment and scaling',
    capabilities: [
      'CI/CD pipeline setup',
      'Infrastructure as code',
      'Monitoring and alerting',
      'Auto-scaling configuration',
    ],
    icon: Zap,
    color: 'from-orange-500 to-red-500',
  },
]

export function AgentShowcaseSection() {
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null)

  return (
    <section className="py-24 relative">
      <div className="container-max section-padding">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Meet Your AI Development Team
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Specialized agents working together to build your perfect application
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {agents.map((agent, index) => {
            const Icon = agent.icon
            return (
              <Card
                key={agent.id}
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-300",
                  "hover:shadow-xl hover:-translate-y-2",
                  "animate-on-scroll floating"
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '3s',
                }}
                onClick={() => setSelectedAgent(agent)}
              >
                {/* Gradient background */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-10 bg-gradient-to-br",
                    agent.color
                  )}
                />

                <CardHeader className="relative">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-white bg-gradient-to-br",
                      agent.color
                    )}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{agent.name}</CardTitle>
                  <CardDescription className="font-medium">
                    {agent.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-muted-foreground">
                    {agent.description}
                  </p>
                </CardContent>

                {/* Connection lines (visual effect) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="50%"
                    y1="0"
                    x2="50%"
                    y2="100%"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                    className="animate-pulse"
                  />
                </svg>
              </Card>
            )
          })}
        </div>

        {/* Connection visualization */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Agents collaborate in real-time to deliver exceptional results
          </p>
        </div>
      </div>

      {/* Agent Details Modal */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAgent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br",
                      selectedAgent.color
                    )}
                  >
                    <selectedAgent.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle>{selectedAgent.name}</DialogTitle>
                    <DialogDescription>{selectedAgent.role}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Core Capabilities</h4>
                  <ul className="space-y-2">
                    {selectedAgent.capabilities.map((capability, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary mt-0.5">•</span>
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAgent(null)}
                    className="flex-1"
                  >
                    Back to Agents
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      // In a real app, this would play a demo video
                      console.log('Playing demo for', selectedAgent.name)
                    }}
                    className="flex-1"
                  >
                    See in Action
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}