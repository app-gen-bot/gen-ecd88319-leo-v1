"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { 
  CreditCard, 
  Download, 
  AlertCircle,
  CheckCircle,
  Calendar,
  RefreshCw
} from "lucide-react"

export default function BillingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = () => {
    router.push('/upgrade')
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to Pro features at the end of your billing period.")) {
      return
    }

    setIsLoading(true)
    try {
      // In a real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Subscription cancelled",
        description: "You'll retain access until the end of your billing period",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mock subscription data
  const subscription = {
    plan: 'pro',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    amount: 19.00,
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  }

  const invoices = [
    {
      id: 'inv-1',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      amount: 19.00,
      status: 'paid',
    },
    {
      id: 'inv-2',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      amount: 19.00,
      status: 'paid',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing & Subscription</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>
      <Separator />

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">Pro Plan</p>
              <p className="text-sm text-muted-foreground">
                ${subscription.amount}/month
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Next billing date</span>
              <span className="font-medium">
                {subscription.nextBillingDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment method</span>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">•••• 4242</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" size="sm">
            Update Payment Method
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCancelSubscription}
            disabled={isLoading}
          >
            Cancel Subscription
          </Button>
        </CardFooter>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Features</CardTitle>
          <CardDescription>
            You have access to all Pro features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Unlimited AI Legal Advisor questions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Document analysis and review</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Unlimited properties and disputes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Certified mail service</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Priority support</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {invoice.date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${invoice.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Need help with billing? Contact our support team at billing@tenantrightsadvisor.com
        </AlertDescription>
      </Alert>
    </div>
  )
}