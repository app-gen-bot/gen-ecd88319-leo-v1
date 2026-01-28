"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, Zap, Shield, Mail, FileSearch, Users, Sparkles } from "lucide-react"

const proFeatures = [
  {
    icon: Zap,
    title: "Unlimited AI Legal Advisor",
    description: "Ask unlimited questions and get instant legal guidance"
  },
  {
    icon: FileSearch,
    title: "Document Analysis",
    description: "Upload and analyze lease agreements for issues"
  },
  {
    icon: Mail,
    title: "Certified Mail Service",
    description: "Send legal notices via USPS Certified Mail"
  },
  {
    icon: Shield,
    title: "Priority Support",
    description: "Get help from our legal support team within 24 hours"
  },
  {
    icon: Users,
    title: "Multiple Properties",
    description: "Manage unlimited rental properties"
  },
  {
    icon: Sparkles,
    title: "Advanced Features",
    description: "Legal form auto-fill, API access, and more"
  }
]

export default function UpgradePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would integrate with a payment processor
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Upgrade successful!",
        description: "Welcome to Pro! You now have access to all features.",
      })
      
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "Please try again or contact support",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-4">
          LIMITED TIME OFFER
        </Badge>
        <h1 className="text-4xl font-bold mb-4">Upgrade to Pro</h1>
        <p className="text-xl text-muted-foreground">
          Get complete protection with unlimited access to all features
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl">Pro Plan</CardTitle>
          <div className="mt-4">
            <span className="text-5xl font-bold">$19</span>
            <span className="text-xl text-muted-foreground">/month</span>
          </div>
          <CardDescription className="mt-2">
            Billed monthly. Cancel anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {proFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="flex gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 h-fit">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <Alert className="mb-6">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Special Offer:</strong> Get your first month for just $9.99 (50% off)
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-semibold mb-2">What you get with Pro:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Ask unlimited questions to AI Legal Advisor
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Upload and analyze unlimited lease documents
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Generate and send unlimited letters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Track unlimited disputes and deposits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Priority customer support
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full text-lg py-6" 
            size="lg"
            onClick={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Upgrade Now - First Month $9.99"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By upgrading, you agree to our Terms of Service and Privacy Policy. 
            You can cancel anytime from your account settings.
          </p>
        </CardFooter>
      </Card>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Instant access</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Have questions? <a href="/contact" className="text-primary hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  )
}