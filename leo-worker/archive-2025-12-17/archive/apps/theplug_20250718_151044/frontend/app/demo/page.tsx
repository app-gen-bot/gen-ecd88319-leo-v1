"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Play, 
  User, 
  Lock,
  CheckCircle,
  ArrowRight,
  Music,
  FileCheck,
  BarChart3,
  Link2
} from 'lucide-react'
import { toast } from 'sonner'

const demoFeatures = [
  {
    icon: Music,
    title: 'Pre-loaded Music Library',
    description: '10 sample tracks ready for registration'
  },
  {
    icon: FileCheck,
    title: 'Active Registrations',
    description: 'See registrations in various states'
  },
  {
    icon: Link2,
    title: 'Platform Connections',
    description: 'MLC and Distribution pre-connected'
  },
  {
    icon: BarChart3,
    title: 'Sample Analytics',
    description: '6 months of revenue data'
  }
]

export default function DemoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = async () => {
    setIsLoading(true)
    
    // Show message and redirect to sign-in
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.info('Please use the demo credentials to sign in', {
      description: 'Email: demo@example.com | Password: demo123'
    })
    
    // Redirect to sign-in page
    router.push('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Try The Plug Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            Experience the full platform with sample data. No signup required!
          </p>
        </div>

        {/* Demo Info */}
        <Alert>
          <Play className="h-4 w-4" />
          <AlertTitle>Full Access Demo</AlertTitle>
          <AlertDescription>
            This demo provides complete access to all features with realistic sample data. 
            Feel free to explore every aspect of the platform. No changes will affect real data.
          </AlertDescription>
        </Alert>

        {/* Demo Features */}
        <div className="grid gap-6 md:grid-cols-2">
          {demoFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <feature.icon className="h-5 w-5 text-primary" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Credentials */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-mono bg-muted px-3 py-2 rounded">demo@example.com</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Password</p>
                <p className="font-mono bg-muted px-3 py-2 rounded">demo123</p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  'Starting Demo...'
                ) : (
                  <>
                    Start Demo Experience
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* What You Can Do */}
        <Card>
          <CardHeader>
            <CardTitle>What You Can Do in the Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'Upload new music files and see metadata extraction',
                'Start registrations across multiple platforms',
                'Track registration progress in real-time',
                'View revenue analytics and projections',
                'Connect and disconnect platform integrations',
                'Manage API credentials and webhooks',
                'Test the human-in-the-loop system',
                'Export reports and data'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4 pt-8">
          <p className="text-muted-foreground">
            Ready to use The Plug with your own music?
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <a href="/pricing">View Pricing</a>
            </Button>
            <Button asChild>
              <a href="/sign-up">Sign Up Free</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}