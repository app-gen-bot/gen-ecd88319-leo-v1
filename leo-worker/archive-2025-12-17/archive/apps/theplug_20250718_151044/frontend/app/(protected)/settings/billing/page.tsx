"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  CreditCard, 
  Download, 
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

// Mock data
const currentPlan = {
  name: 'Pro',
  price: 29,
  status: 'active',
  currentPeriodEnd: '2024-07-15',
  features: [
    'Unlimited songs',
    'All platforms',
    'Priority support',
    'Revenue analytics',
  ],
}

const usage = {
  songs: { current: 24, limit: null },
  registrations: { current: 87, limit: null },
  apiCalls: { current: 1234, limit: 10000 },
}

const paymentMethod = {
  type: 'card',
  brand: 'Visa',
  last4: '4242',
  expiryMonth: 12,
  expiryYear: 2025,
}

const invoices = [
  { id: '1', date: '2024-06-01', amount: 29, status: 'paid' },
  { id: '2', date: '2024-05-01', amount: 29, status: 'paid' },
  { id: '3', date: '2024-04-01', amount: 29, status: 'paid' },
  { id: '4', date: '2024-03-01', amount: 29, status: 'paid' },
]

const plans = [
  {
    name: 'Free',
    price: 0,
    features: ['Up to 5 songs', 'Basic platforms', 'Email support'],
  },
  {
    name: 'Pro',
    price: 29,
    features: ['Unlimited songs', 'All platforms', 'Priority support', 'Revenue analytics'],
    current: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Custom integrations', 'Dedicated support', 'Team management', 'API access'],
  },
]

export default function BillingSettingsPage() {
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleUpdatePayment = async () => {
    setIsUpdatingPayment(true)
    // Simulate Stripe checkout
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Payment method updated successfully')
    setIsUpdatingPayment(false)
  }

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return
    }

    setIsCancelling(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Subscription cancelled. You have access until ' + currentPlan.currentPeriodEnd)
    setIsCancelling(false)
  }

  const downloadInvoice = (invoiceId: string) => {
    toast.success('Downloading invoice...')
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the {currentPlan.name} plan
              </CardDescription>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">${currentPlan.price}/month</p>
              <p className="text-sm text-muted-foreground">
                Next billing date: {new Date(currentPlan.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="outline">Change Plan</Button>
            </Link>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Included features:</h4>
            <ul className="space-y-1">
              {currentPlan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>
            Track your usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Songs</span>
              <span className="text-muted-foreground">
                {usage.songs.current} / {usage.songs.limit || 'Unlimited'}
              </span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Registrations</span>
              <span className="text-muted-foreground">
                {usage.registrations.current} / {usage.registrations.limit || 'Unlimited'}
              </span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>API Calls</span>
              <span className="text-muted-foreground">
                {usage.apiCalls.current.toLocaleString()} / {usage.apiCalls.limit.toLocaleString()}
              </span>
            </div>
            <Progress value={(usage.apiCalls.current / usage.apiCalls.limit) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Update your payment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {paymentMethod.brand} ending in {paymentMethod.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleUpdatePayment}
              disabled={isUpdatingPayment}
            >
              {isUpdatingPayment ? 'Updating...' : 'Update'}
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Secure Payment Processing</AlertTitle>
            <AlertDescription>
              All payment information is processed securely through Stripe. 
              We never store your card details on our servers.
            </AlertDescription>
          </Alert>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    {new Date(invoice.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant="success">Paid</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadInvoice(invoice.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cancel Subscription */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Cancel Subscription</CardTitle>
          <CardDescription>
            We&apos;d hate to see you go
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you cancel your subscription, you&apos;ll continue to have access to Pro features 
            until {new Date(currentPlan.currentPeriodEnd).toLocaleDateString()}. 
            After that, your account will be downgraded to the Free plan.
          </p>
          <Button
            variant="destructive"
            onClick={handleCancelSubscription}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}