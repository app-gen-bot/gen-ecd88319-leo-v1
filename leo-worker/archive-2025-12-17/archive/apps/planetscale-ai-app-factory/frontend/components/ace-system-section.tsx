"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, Shield, Infinity, Brain, Lock, BarChart3, Puzzle } from 'lucide-react'
import { BetaAccessModal } from '@/components/beta-access-modal'

const features = [
  {
    icon: Zap,
    title: 'Zero-iteration',
    description: 'Get it right the first time',
    tooltip: 'Our AI generates production-ready code without requiring multiple iterations or manual fixes.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade protection built-in',
    tooltip: 'SOC 2 compliant infrastructure with end-to-end encryption and automated security scanning.',
  },
  {
    icon: Infinity,
    title: 'Infinite Scale',
    description: 'From MVP to millions of users',
    tooltip: 'Automatically scales based on demand with no code changes required.',
  },
]

export function ACESystemSection() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  const [nodes, setNodes] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    // Generate neural network nodes
    const newNodes = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 20 + (i % 4) * 20 + Math.random() * 10,
      y: 20 + Math.floor(i / 4) * 30 + Math.random() * 10,
    }))
    setNodes(newNodes)
  }, [])

  return (
    <section id="technology" className="py-24 relative bg-muted/30">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Diagram */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto">
              {/* Neural network visualization */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))' }}
              >
                <defs>
                  <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>

                {/* Draw connections */}
                {nodes.map((node, i) => 
                  nodes.slice(i + 1).map((targetNode, j) => (
                    <line
                      key={`${i}-${j}`}
                      x1={node.x}
                      y1={node.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      className="neural-line"
                      strokeDasharray={Math.random() > 0.7 ? "2 2" : "none"}
                    />
                  ))
                )}

                {/* Draw nodes */}
                {nodes.map((node) => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="3"
                      fill="url(#neural-gradient)"
                      className="animate-pulse"
                      style={{ animationDelay: `${node.id * 0.1}s` }}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="6"
                      fill="none"
                      stroke="url(#neural-gradient)"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  </g>
                ))}

                {/* Center brain icon */}
                <g transform="translate(50, 50)">
                  <Brain className="w-8 h-8 -translate-x-4 -translate-y-4 text-primary" />
                </g>
              </svg>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Adaptive Code Evolution
                <span className="text-primary"> (ACE)</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                The revolutionary AI system that understands, generates, and evolves applications autonomously
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    title={feature.tooltip}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>

            {/* Action button */}
            <div className="pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsDetailsOpen(true)}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>ACE System Technology</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="architecture" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="architecture" className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Multi-Agent Architecture
              </h3>
              <p className="text-sm text-muted-foreground">
                ACE employs specialized AI agents working in harmony: Designer agents for UI/UX, 
                Architect agents for system design, Developer agents for code generation, and 
                QA agents for testing and optimization.
              </p>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Enterprise-Grade Security
              </h3>
              <p className="text-sm text-muted-foreground">
                Built with security-first principles: automated vulnerability scanning, 
                end-to-end encryption, SOC 2 compliance, and continuous security monitoring.
              </p>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Benchmark Results
              </h3>
              <p className="text-sm text-muted-foreground">
                ACE generates applications 100x faster than traditional development. 
                Average time from prompt to deployed app: under 5 minutes. 
                Performance optimized with automatic caching and CDN distribution.
              </p>
            </TabsContent>
            
            <TabsContent value="integration" className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Puzzle className="w-5 h-5" />
                Seamless Integration
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect with your existing tools: GitHub, AWS, Google Cloud, Slack, and more. 
                RESTful APIs and webhooks for custom integrations. 
                Export generated code anytime.
              </p>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <Button
              variant="gradient"
              className="w-full"
              onClick={() => {
                setIsDetailsOpen(false)
                setIsBetaModalOpen(true)
              }}
            >
              Request Documentation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Beta Access Modal */}
      <BetaAccessModal
        isOpen={isBetaModalOpen}
        onClose={() => setIsBetaModalOpen(false)}
      />
    </section>
  )
}