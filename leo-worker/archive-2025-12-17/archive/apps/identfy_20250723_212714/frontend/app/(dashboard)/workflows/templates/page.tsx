"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  FileText,
  Copy,
  Download,
  Eye,
  Plus,
  Building2,
  CreditCard,
  UserCheck,
  Globe,
  ShoppingCart,
  Heart,
  Briefcase,
  GraduationCap,
  Star,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock workflow templates
const templates = [
  {
    id: "kyc-standard",
    name: "Standard KYC Verification",
    description: "Complete identity verification with document and biometric checks",
    category: "compliance",
    icon: UserCheck,
    popularity: 95,
    avgCompletionTime: "3-5 minutes",
    verificationSteps: ["Document Upload", "Selfie Capture", "Data Validation", "Risk Assessment"],
    industries: ["Financial Services", "Crypto", "Trading"],
    features: ["AML Screening", "PEP Check", "Sanctions List", "Fraud Detection"],
    successRate: 94,
    monthlyUsage: "125K",
  },
  {
    id: "kyb-business",
    name: "Business Verification (KYB)",
    description: "Verify business entities with registration and ownership checks",
    category: "compliance",
    icon: Building2,
    popularity: 78,
    avgCompletionTime: "10-15 minutes",
    verificationSteps: ["Business Registration", "Director Verification", "Document Review", "Risk Analysis"],
    industries: ["B2B Platforms", "Financial Services", "Marketplaces"],
    features: ["Company Registry Check", "Director KYC", "UBO Verification", "Business Risk Score"],
    successRate: 89,
    monthlyUsage: "45K",
  },
  {
    id: "age-verification",
    name: "Age Verification",
    description: "Quick age verification for age-restricted services",
    category: "specialized",
    icon: UserCheck,
    popularity: 82,
    avgCompletionTime: "1-2 minutes",
    verificationSteps: ["Document Upload", "Age Extraction", "Validation"],
    industries: ["Gaming", "Alcohol & Tobacco", "Adult Content"],
    features: ["Quick Verification", "Multiple Document Types", "Real-time Results"],
    successRate: 97,
    monthlyUsage: "89K",
  },
  {
    id: "ecommerce-onboarding",
    name: "E-commerce Seller Onboarding",
    description: "Streamlined verification for marketplace sellers",
    category: "industry",
    icon: ShoppingCart,
    popularity: 71,
    avgCompletionTime: "5-7 minutes",
    verificationSteps: ["Identity Check", "Address Verification", "Bank Account", "Tax ID"],
    industries: ["E-commerce", "Marketplaces", "Retail"],
    features: ["Seller Verification", "Bank Validation", "Tax Compliance", "Fraud Prevention"],
    successRate: 91,
    monthlyUsage: "67K",
  },
  {
    id: "healthcare-patient",
    name: "Healthcare Patient Verification",
    description: "HIPAA-compliant patient identity verification",
    category: "industry",
    icon: Heart,
    popularity: 65,
    avgCompletionTime: "3-4 minutes",
    verificationSteps: ["ID Verification", "Insurance Check", "Patient Matching"],
    industries: ["Healthcare", "Telemedicine", "Pharmacy"],
    features: ["HIPAA Compliant", "Insurance Verification", "Patient Matching", "Secure Storage"],
    successRate: 96,
    monthlyUsage: "34K",
  },
  {
    id: "travel-checkin",
    name: "Travel & Hospitality Check-in",
    description: "Contactless verification for hotels and travel",
    category: "industry",
    icon: Globe,
    popularity: 73,
    avgCompletionTime: "2-3 minutes",
    verificationSteps: ["Passport Scan", "Booking Validation", "Guest Registration"],
    industries: ["Hotels", "Airlines", "Car Rental"],
    features: ["Passport Reader", "Booking Integration", "Contactless Check-in", "Multi-language"],
    successRate: 93,
    monthlyUsage: "78K",
  },
  {
    id: "education-enrollment",
    name: "Education Enrollment",
    description: "Student verification for online education platforms",
    category: "industry",
    icon: GraduationCap,
    popularity: 58,
    avgCompletionTime: "4-5 minutes",
    verificationSteps: ["Student ID", "Age Verification", "Guardian Consent", "Enrollment"],
    industries: ["EdTech", "Online Learning", "Universities"],
    features: ["Student Verification", "Age Check", "Guardian Approval", "Document Storage"],
    successRate: 92,
    monthlyUsage: "23K",
  },
  {
    id: "gig-economy",
    name: "Gig Economy Worker",
    description: "Fast verification for gig economy platforms",
    category: "specialized",
    icon: Briefcase,
    popularity: 88,
    avgCompletionTime: "3-4 minutes",
    verificationSteps: ["ID Check", "Background Screen", "License Verification", "Insurance"],
    industries: ["Ride-sharing", "Delivery", "Freelance Platforms"],
    features: ["Quick Onboarding", "License Check", "Background Screening", "Insurance Verification"],
    successRate: 90,
    monthlyUsage: "156K",
  },
  {
    id: "crypto-exchange",
    name: "Crypto Exchange KYC",
    description: "Regulatory-compliant verification for crypto platforms",
    category: "compliance",
    icon: CreditCard,
    popularity: 91,
    avgCompletionTime: "5-8 minutes",
    verificationSteps: ["Enhanced KYC", "Source of Funds", "Wallet Verification", "Risk Scoring"],
    industries: ["Cryptocurrency", "DeFi", "Web3"],
    features: ["Enhanced Due Diligence", "Wallet Analytics", "Transaction Monitoring", "Regulatory Compliance"],
    successRate: 88,
    monthlyUsage: "203K",
  },
];

const categories = [
  { id: "all", name: "All Templates", count: templates.length },
  { id: "compliance", name: "Compliance", count: templates.filter(t => t.category === "compliance").length },
  { id: "industry", name: "Industry Specific", count: templates.filter(t => t.category === "industry").length },
  { id: "specialized", name: "Specialized", count: templates.filter(t => t.category === "specialized").length },
];

export default function WorkflowTemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.industries.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.popularity - a.popularity;
        case "usage":
          return parseInt(b.monthlyUsage) - parseInt(a.monthlyUsage);
        case "success":
          return b.successRate - a.successRate;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleUseTemplate = (templateId: string) => {
    toast.success("Template copied to your workflows");
    router.push(`/workflows/new?template=${templateId}`);
  };

  const handlePreviewTemplate = (templateId: string) => {
    // In a real app, this would open a preview modal or page
    toast.info("Preview feature coming soon");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Workflow Templates</h1>
          <p className="text-muted-foreground mt-1">
            Pre-built verification workflows for common use cases
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, industry, or feature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="usage">Most Used</SelectItem>
              <SelectItem value="success">Highest Success Rate</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/workflows/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Custom
            </Link>
          </Button>
        </div>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Templates Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{template.popularity}%</span>
                      </div>
                    </div>
                    <CardTitle className="mt-4">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{template.successRate}%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{template.monthlyUsage}</p>
                        <p className="text-xs text-muted-foreground">Monthly Uses</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{template.verificationSteps.length}</p>
                        <p className="text-xs text-muted-foreground">Steps</p>
                      </div>
                    </div>

                    {/* Completion Time */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Avg. completion: {template.avgCompletionTime}</span>
                    </div>

                    {/* Industries */}
                    <div>
                      <p className="text-xs font-medium mb-2">Best for:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.industries.slice(0, 3).map((industry) => (
                          <Badge key={industry} variant="secondary" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                        {template.industries.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.industries.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <p className="text-xs font-medium mb-2">Key Features:</p>
                      <ul className="space-y-1">
                        {template.features.slice(0, 3).map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handlePreviewTemplate(template.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleUseTemplate(template.id)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <Card className="p-8">
              <div className="text-center space-y-3">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="font-semibold">No templates found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}>
                  Clear filters
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Need a Custom Workflow?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Can't find a template that fits your needs? Our team can help you create a custom workflow tailored to your specific requirements.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/workflows/new">
                <Plus className="mr-2 h-4 w-4" />
                Build Your Own
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact-sales">
                <Users className="mr-2 h-4 w-4" />
                Talk to Sales
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}