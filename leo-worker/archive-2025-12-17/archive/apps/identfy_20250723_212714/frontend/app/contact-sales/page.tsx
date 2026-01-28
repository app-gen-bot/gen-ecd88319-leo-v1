"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Globe, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
  BarChart,
  HeadphonesIcon,
  MessageSquare,
  Clock,
  DollarSign,
  Award,
  TrendingUp
} from "lucide-react";

// Mock pricing tiers for reference
const pricingTiers = [
  {
    name: "Starter",
    price: "$299",
    verifications: "Up to 1,000",
    features: ["Basic verification", "Email support", "Standard API access"],
  },
  {
    name: "Professional",
    price: "$999",
    verifications: "Up to 10,000",
    features: ["Advanced verification", "Priority support", "Full API access", "Custom workflows"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    verifications: "Unlimited",
    features: ["All features", "Dedicated support", "SLA guarantee", "Custom integration"],
  },
];

const industries = [
  "E-commerce",
  "Financial Services",
  "Healthcare",
  "Gaming & Entertainment",
  "Travel & Hospitality",
  "Real Estate",
  "Education",
  "Government",
  "Other",
];

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees",
];

const verificationVolumes = [
  "Less than 1,000/month",
  "1,000 - 10,000/month",
  "10,000 - 100,000/month",
  "100,000 - 1M/month",
  "More than 1M/month",
];

export default function ContactSalesPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    industry: "",
    companySize: "",
    verificationVolume: "",
    currentSolution: "",
    message: "",
    newsletter: false,
    demo: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSubmitting(false);
    setSubmitted(true);
    toast.success("Thank you for your interest! Our sales team will contact you within 24 hours.");
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              Your request has been received. Our sales team will contact you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Expected response time: 1 business day
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">
                I
              </div>
              <span className="font-bold text-xl">Identfy</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/sign-in">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Contact Sales</h1>
              <p className="text-muted-foreground mt-2">
                Let's discuss how Identfy can help your business prevent fraud and verify identities at scale.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tell us about your needs</CardTitle>
                <CardDescription>
                  Fill out the form below and our sales team will reach out within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Personal Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) => handleChange("firstName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) => handleChange("lastName", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Work Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Company Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name *</Label>
                        <Input
                          id="company"
                          required
                          value={formData.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title *</Label>
                        <Input
                          id="jobTitle"
                          required
                          value={formData.jobTitle}
                          onChange={(e) => handleChange("jobTitle", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry *</Label>
                        <Select 
                          value={formData.industry} 
                          onValueChange={(value) => handleChange("industry", value)}
                        >
                          <SelectTrigger id="industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size *</Label>
                        <Select 
                          value={formData.companySize} 
                          onValueChange={(value) => handleChange("companySize", value)}
                        >
                          <SelectTrigger id="companySize">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Verification Needs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Verification Needs</h3>
                    <div className="space-y-2">
                      <Label htmlFor="verificationVolume">Expected Monthly Volume *</Label>
                      <Select 
                        value={formData.verificationVolume} 
                        onValueChange={(value) => handleChange("verificationVolume", value)}
                      >
                        <SelectTrigger id="verificationVolume">
                          <SelectValue placeholder="Select volume" />
                        </SelectTrigger>
                        <SelectContent>
                          {verificationVolumes.map((volume) => (
                            <SelectItem key={volume} value={volume}>
                              {volume}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentSolution">Current Solution (if any)</Label>
                      <Input
                        id="currentSolution"
                        placeholder="e.g., Manual verification, Competitor X"
                        value={formData.currentSolution}
                        onChange={(e) => handleChange("currentSolution", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Information</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your verification needs, challenges, or specific requirements..."
                        rows={4}
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="demo"
                        checked={formData.demo}
                        onCheckedChange={(checked) => handleChange("demo", checked)}
                      />
                      <Label htmlFor="demo" className="text-sm font-normal cursor-pointer">
                        I'd like to schedule a product demo
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) => handleChange("newsletter", checked)}
                      />
                      <Label htmlFor="newsletter" className="text-sm font-normal cursor-pointer">
                        Subscribe to our newsletter for product updates
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our{" "}
                    <Link href="/terms" className="underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline">Privacy Policy</Link>.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Why Identfy */}
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Identfy?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">99.9% Accuracy</p>
                    <p className="text-sm text-muted-foreground">
                      Industry-leading verification accuracy
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">2-Second Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Fast, seamless user experience
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Global Coverage</p>
                    <p className="text-sm text-muted-foreground">
                      Support for 190+ countries
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Advanced Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Real-time insights and reporting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Options */}
            <Card>
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Call Sales</p>
                    <p className="text-sm text-muted-foreground">1-800-IDENTFY</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">sales@identfy.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our sales team typically responds within 24 hours during business days.
                  For immediate assistance, use our live chat feature.
                </p>
              </CardContent>
            </Card>

            {/* Pricing Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Plans</CardTitle>
                <CardDescription>
                  Flexible plans for businesses of all sizes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pricingTiers.map((tier) => (
                  <div key={tier.name} className="pb-3 border-b last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{tier.name}</span>
                      <span className="font-bold">{tier.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{tier.verifications}</p>
                    <div className="flex flex-wrap gap-1">
                      {tier.features.slice(0, 2).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}