"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  CreditCard,
  Download,
  ArrowUpRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  Building
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

// Mock billing data
const currentPlan = {
  name: "Professional",
  price: 299,
  billing: "monthly",
  nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
  features: [
    "10,000 verifications/month",
    "Advanced fraud detection",
    "API access",
    "Custom workflows",
    "24/7 support",
  ],
};

const usage = {
  verifications: {
    used: 7234,
    limit: 10000,
    percentage: 72.34,
  },
  apiCalls: {
    used: 145234,
    limit: 1000000,
    percentage: 14.52,
  },
  storage: {
    used: 2.3,
    limit: 50,
    percentage: 4.6,
    unit: "GB",
  },
};

const plans = [
  {
    name: "Starter",
    price: 49,
    features: [
      "1,000 verifications/month",
      "Basic fraud detection",
      "Email support",
      "2 team members",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: 299,
    features: [
      "10,000 verifications/month",
      "Advanced fraud detection",
      "API access",
      "Custom workflows",
      "24/7 support",
      "10 team members",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited verifications",
      "AI-powered fraud detection",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Unlimited team members",
    ],
    popular: false,
  },
];

const invoices = [
  {
    id: "INV-001",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    amount: 299,
    status: "paid",
    downloadUrl: "#",
  },
  {
    id: "INV-002",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    amount: 299,
    status: "paid",
    downloadUrl: "#",
  },
  {
    id: "INV-003",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    amount: 299,
    status: "paid",
    downloadUrl: "#",
  },
];

const paymentMethod = {
  type: "card",
  brand: "Visa",
  last4: "4242",
  expiryMonth: 12,
  expiryYear: 2025,
};

export default function BillingSettingsPage() {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    setIsUpgrading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUpgrading(false);
    
    toast.success(`Successfully upgraded to ${selectedPlan.name} plan`);
    setUpgradeModalOpen(false);
  };

  const handleUpdatePayment = () => {
    toast.info("Payment method update coming soon");
  };

  const handleCancelSubscription = () => {
    toast.info("Please contact support to cancel your subscription");
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You're currently on the {currentPlan.name} plan
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-3 py-1">
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {formatCurrency(currentPlan.price)}
                  <span className="text-lg font-normal text-muted-foreground">/{currentPlan.billing}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Next billing date: {formatDate(currentPlan.nextBillingDate)}
                </p>
              </div>
              <Button onClick={() => setUpgradeModalOpen(true)}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Plan Features</p>
              <div className="grid grid-cols-2 gap-2">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
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
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">Verifications</p>
                <p className="text-xs text-muted-foreground">
                  {usage.verifications.used.toLocaleString()} / {usage.verifications.limit.toLocaleString()}
                </p>
              </div>
              <span className={`text-sm font-medium ${getUsageColor(usage.verifications.percentage)}`}>
                {usage.verifications.percentage}%
              </span>
            </div>
            <Progress value={usage.verifications.percentage} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">API Calls</p>
                <p className="text-xs text-muted-foreground">
                  {usage.apiCalls.used.toLocaleString()} / {usage.apiCalls.limit.toLocaleString()}
                </p>
              </div>
              <span className={`text-sm font-medium ${getUsageColor(usage.apiCalls.percentage)}`}>
                {usage.apiCalls.percentage}%
              </span>
            </div>
            <Progress value={usage.apiCalls.percentage} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">Storage</p>
                <p className="text-xs text-muted-foreground">
                  {usage.storage.used} {usage.storage.unit} / {usage.storage.limit} {usage.storage.unit}
                </p>
              </div>
              <span className={`text-sm font-medium ${getUsageColor(usage.storage.percentage)}`}>
                {usage.storage.percentage}%
              </span>
            </div>
            <Progress value={usage.storage.percentage} className="h-2" />
          </div>

          {usage.verifications.percentage >= 75 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Approaching verification limit
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  You've used {usage.verifications.percentage}% of your monthly verifications. 
                  Consider upgrading to avoid overage charges.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Manage your payment information
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleUpdatePayment}>
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">
                {paymentMethod.brand} ending in {paymentMethod.last4}
              </p>
              <p className="text-sm text-muted-foreground">
                Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="success">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Settings</CardTitle>
          <CardDescription>
            Manage your subscription preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Billing Email</p>
              <p className="text-sm text-muted-foreground">billing@acme.com</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Tax Information</p>
              <p className="text-sm text-muted-foreground">Acme Corporation • EIN: 12-3456789</p>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-destructive">Cancel Subscription</p>
              <p className="text-sm text-muted-foreground">
                Cancel your subscription at the end of the billing period
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancelSubscription}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Cancel Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose a Plan</DialogTitle>
            <DialogDescription>
              Select the plan that best fits your needs
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-6 py-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`cursor-pointer transition-all ${
                  selectedPlan?.name === plan.name ? "border-primary shadow-lg" : ""
                } ${plan.popular ? "border-primary/50" : ""}`}
                onClick={() => setSelectedPlan(plan)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.popular && (
                      <Badge variant="default">Popular</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    {typeof plan.price === "number" ? (
                      <p className="text-3xl font-bold">
                        {formatCurrency(plan.price)}
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      </p>
                    ) : (
                      <p className="text-3xl font-bold">{plan.price}</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.name === currentPlan.name ? "outline" : "default"}
                    disabled={plan.name === currentPlan.name}
                  >
                    {plan.name === currentPlan.name ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade} 
              disabled={!selectedPlan || selectedPlan.name === currentPlan.name || isUpgrading}
            >
              {isUpgrading ? "Upgrading..." : "Confirm Upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}