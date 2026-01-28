"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TrendingUp, Users, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

const applications = [
  {
    id: 1,
    name: 'CloudCart Pro',
    category: 'E-commerce',
    description: 'Multi-vendor marketplace with AI-powered recommendations',
    metrics: {
      revenue: '+312% MoM',
      users: '50K+',
      timeToMarket: '3 days',
    },
    image: '/api/placeholder/400/300',
    tags: ['React', 'Node.js', 'DynamoDB'],
  },
  {
    id: 2,
    name: 'HealthSync',
    category: 'Healthcare',
    description: 'Patient management system with telemedicine capabilities',
    metrics: {
      revenue: '+185% MoM',
      users: '10K+',
      timeToMarket: '5 days',
    },
    image: '/api/placeholder/400/300',
    tags: ['Next.js', 'FastAPI', 'PostgreSQL'],
  },
  {
    id: 3,
    name: 'TaskFlow AI',
    category: 'SaaS',
    description: 'Project management tool with AI task prioritization',
    metrics: {
      revenue: '+428% MoM',
      users: '25K+',
      timeToMarket: '4 days',
    },
    image: '/api/placeholder/400/300',
    tags: ['Vue.js', 'Django', 'Redis'],
  },
  {
    id: 4,
    name: 'FinanceHub',
    category: 'Finance',
    description: 'Personal finance tracker with investment insights',
    metrics: {
      revenue: '+267% MoM',
      users: '15K+',
      timeToMarket: '6 days',
    },
    image: '/api/placeholder/400/300',
    tags: ['React', 'Flask', 'MongoDB'],
  },
  {
    id: 5,
    name: 'EduLearn Pro',
    category: 'SaaS',
    description: 'Online learning platform with AI-generated courses',
    metrics: {
      revenue: '+523% MoM',
      users: '30K+',
      timeToMarket: '7 days',
    },
    image: '/api/placeholder/400/300',
    tags: ['Angular', 'NestJS', 'Elasticsearch'],
  },
  {
    id: 6,
    name: 'RestaurantOS',
    category: 'E-commerce',
    description: 'Complete restaurant management and ordering system',
    metrics: {
      revenue: '+195% MoM',
      users: '5K+',
      timeToMarket: '4 days',
    },
    image: '/api/placeholder/400/300',
    tags: ['Next.js', 'Express', 'DynamoDB'],
  },
]

const categories = ['All', 'E-commerce', 'SaaS', 'Healthcare', 'Finance']

export function ApplicationGridSection() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedApp, setSelectedApp] = useState<typeof applications[0] | null>(null)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredApplications = selectedCategory === 'All'
    ? applications
    : applications.filter(app => app.category === selectedCategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Success!",
        description: "Your application has been submitted for showcase.",
      })
      
      setIsSubmitModalOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="showcase" className="py-24 relative bg-muted/30">
      <div className="container-max section-padding">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real applications built with PlanetScale AI, delivering real results
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Applications grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredApplications.map((app, index) => (
            <Card
              key={app.id}
              className={cn(
                "overflow-hidden cursor-pointer transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-2",
                "animate-on-scroll"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedApp(app)}
            >
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20" />
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{app.name}</CardTitle>
                    <CardDescription>{app.category}</CardDescription>
                  </div>
                  <Badge variant="secondary">{app.category}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {app.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <div className="font-medium">{app.metrics.revenue}</div>
                    <div className="text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    <div className="font-medium">{app.metrics.users}</div>
                    <div className="text-muted-foreground">Users</div>
                  </div>
                  <div className="text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                    <div className="font-medium">{app.metrics.timeToMarket}</div>
                    <div className="text-muted-foreground">Built in</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {app.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load more / Submit */}
        <div className="mt-12 text-center space-y-4">
          <Button variant="outline" size="lg">
            Load More
          </Button>
          <div>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="text-sm text-primary hover:underline"
            >
              Submit Your App
            </button>
          </div>
        </div>
      </div>

      {/* Case Study Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  {selectedApp.name}
                  <Badge>{selectedApp.category}</Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedApp.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg" />

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <div className="font-bold text-lg">{selectedApp.metrics.revenue}</div>
                    <div className="text-sm text-muted-foreground">Revenue Growth</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="font-bold text-lg">{selectedApp.metrics.users}</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <div className="font-bold text-lg">{selectedApp.metrics.timeToMarket}</div>
                    <div className="text-sm text-muted-foreground">Time to Market</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Technology Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" variant="gradient">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live Demo
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit App Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Your App</DialogTitle>
            <DialogDescription>
              Built something amazing with PlanetScale AI? Share it with the community!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">App Name</Label>
              <Input
                id="app-name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-url">App URL</Label>
              <Input
                id="app-url"
                type="url"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-description">Description</Label>
              <Textarea
                id="app-description"
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit App'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}