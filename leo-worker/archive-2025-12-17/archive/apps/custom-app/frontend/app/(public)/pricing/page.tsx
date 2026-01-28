import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Essential tools for basic tenant needs",
    features: [
      { text: "AI Legal Advisor (5 questions/month)", included: true },
      { text: "Basic document templates", included: true },
      { text: "1 property documentation", included: true },
      { text: "Knowledge base access", included: true },
      { text: "Email support", included: true },
      { text: "Unlimited disputes", included: false },
      { text: "Priority AI responses", included: false },
      { text: "Document analysis", included: false },
      { text: "Certified mail service", included: false },
    ],
    cta: "Start Free",
    href: "/signup",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "Complete protection for serious renters",
    popular: true,
    features: [
      { text: "Unlimited AI Legal Advisor", included: true },
      { text: "All document templates", included: true },
      { text: "Unlimited properties", included: true },
      { text: "Document analysis & review", included: true },
      { text: "Unlimited disputes & letters", included: true },
      { text: "Priority support", included: true },
      { text: "Certified mail service", included: true },
      { text: "Legal form auto-fill", included: true },
      { text: "API access", included: false },
    ],
    cta: "Start Pro Trial",
    href: "/signup?plan=pro",
    variant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For property managers and organizations",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited team members", included: true },
      { text: "API access", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom AI training", included: true },
      { text: "White-label options", included: true },
      { text: "SLA guarantee", included: true },
      { text: "On-premise deployment", included: true },
    ],
    cta: "Contact Sales",
    href: "/contact?type=enterprise",
    variant: "outline" as const,
  },
]

export default function PricingPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-4xl text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that fits your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg scale-105" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                {plan.popular && (
                  <Badge variant="default">Most Popular</Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground/50 mt-0.5" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground/50"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.variant}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto text-left space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and we'll prorate any payments.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial for Pro?</h3>
            <p className="text-muted-foreground">
              Yes, Pro plans come with a 14-day free trial. No credit card required to start.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, debit cards, and ACH bank transfers for Enterprise plans.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is my data secure?</h3>
            <p className="text-muted-foreground">
              Absolutely. We use bank-level encryption and never share your personal information. 
              All documents are encrypted at rest and in transit.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Have questions? <Link href="/contact" className="text-primary hover:underline">Contact our team</Link>
        </p>
      </div>
    </div>
  )
}