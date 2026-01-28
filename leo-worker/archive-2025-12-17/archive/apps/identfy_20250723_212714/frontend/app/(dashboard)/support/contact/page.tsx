"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  HeadphonesIcon,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  AlertCircle,
  Zap,
  Upload,
  Paperclip,
  X,
  CheckCircle,
  Globe,
  Calendar,
  Users,
  FileText,
  Shield,
  CreditCard,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

const supportCategories = [
  { id: "technical", label: "Technical Issue", icon: AlertCircle },
  { id: "integration", label: "Integration Help", icon: Zap },
  { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  { id: "compliance", label: "Security & Compliance", icon: Shield },
  { id: "feature", label: "Feature Request", icon: HelpCircle },
  { id: "other", label: "Other", icon: MessageSquare },
];

const priorityLevels = [
  { 
    id: "low", 
    label: "Low", 
    description: "General questions or minor issues",
    responseTime: "2-3 business days"
  },
  { 
    id: "medium", 
    label: "Medium", 
    description: "Issues affecting daily operations",
    responseTime: "1 business day"
  },
  { 
    id: "high", 
    label: "High", 
    description: "Critical issues blocking verifications",
    responseTime: "4 hours"
  },
  { 
    id: "urgent", 
    label: "Urgent", 
    description: "Complete service outage",
    responseTime: "1 hour"
  },
];

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "medium",
    description: "",
    workflowId: "",
    errorCode: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Support ticket created successfully");
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (submitted) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle>Ticket Submitted Successfully</CardTitle>
            <CardDescription>
              Your ticket has been created and assigned to our support team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-lg font-semibold mb-1">Ticket #SUP-2024-1234</p>
              <p className="text-sm text-muted-foreground">
                Expected response time: {priorityLevels.find(p => p.id === formData.priority)?.responseTime}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/support/tickets">View My Tickets</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/support/docs">Browse Documentation</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Contact Support</h1>
        <p className="text-muted-foreground mt-1">
          Get help from our expert support team
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>
                Describe your issue and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {category.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-3">
                  <Label>Priority Level *</Label>
                  <RadioGroup 
                    value={formData.priority} 
                    onValueChange={(value) => handleChange("priority", value)}
                  >
                    {priorityLevels.map((level) => (
                      <div key={level.id} className="flex items-start space-x-3">
                        <RadioGroupItem value={level.id} id={level.id} className="mt-1" />
                        <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{level.label}</span>
                              <p className="text-sm text-muted-foreground">{level.description}</p>
                            </div>
                            <Badge variant="outline" className="ml-4">
                              {level.responseTime}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Include steps to reproduce, error messages, and expected behavior
                  </p>
                </div>

                {/* Additional Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="workflowId">Workflow ID (if applicable)</Label>
                    <Input
                      id="workflowId"
                      placeholder="e.g., wf_123456"
                      value={formData.workflowId}
                      onChange={(e) => handleChange("workflowId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="errorCode">Error Code (if any)</Label>
                    <Input
                      id="errorCode"
                      placeholder="e.g., ERR_INVALID_DOC"
                      value={formData.errorCode}
                      onChange={(e) => handleChange("errorCode", e.target.value)}
                    />
                  </div>
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.txt,.log"
                    />
                    <label
                      htmlFor="attachments"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Drop files here or click to upload
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Max 5 files, 10MB each
                      </span>
                    </label>
                  </div>
                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Ticket..." : "Submit Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Options */}
          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">1-800-IDENTFY</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@identfy.com</p>
                  <p className="text-xs text-muted-foreground">24-48 hour response</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available 24/7</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Start Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Support Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Standard Support</span>
                <Badge variant="outline">9AM-6PM EST</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Priority Support</span>
                <Badge variant="outline">24/7</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Live Chat</span>
                <Badge variant="success">Available Now</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Helpful Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Helpful Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/support/docs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <FileText className="h-4 w-4" />
                Documentation
              </Link>
              <Link href="/system-status" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Globe className="h-4 w-4" />
                System Status
              </Link>
              <Link href="/workflows/templates" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Zap className="h-4 w-4" />
                Workflow Templates
              </Link>
            </CardContent>
          </Card>

          {/* Priority Support */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Need faster support? Upgrade to our Priority Support plan for 24/7 assistance and 1-hour response times.
              <Link href="/settings/billing" className="block mt-2 text-sm font-medium text-primary">
                Learn more →
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}