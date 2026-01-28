"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ChevronLeft, GitBranch, Copy, FileText } from "lucide-react";
import Link from "next/link";

const workflowTemplates = [
  {
    id: "blank",
    name: "Blank Workflow",
    description: "Start from scratch with an empty canvas",
    icon: FileText,
    signals: [],
  },
  {
    id: "basic-kyc",
    name: "Basic KYC",
    description: "Simple identity verification with document and selfie check",
    icon: GitBranch,
    signals: ["document", "biometric"],
  },
  {
    id: "enhanced-kyc",
    name: "Enhanced KYC",
    description: "Comprehensive verification including AML screening",
    icon: GitBranch,
    signals: ["document", "biometric", "phone", "watchlist"],
  },
  {
    id: "quick-check",
    name: "Quick Check",
    description: "Fast verification for low-risk scenarios",
    icon: GitBranch,
    signals: ["email", "phone"],
  },
  {
    id: "business-verification",
    name: "Business Verification",
    description: "B2B customer verification with company checks",
    icon: GitBranch,
    signals: ["document", "watchlist", "device"],
  },
];

export default function NewWorkflowPage() {
  const router = useRouter();
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!workflowName.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would return the new workflow ID
    const newWorkflowId = "new-" + Date.now();
    
    toast.success("Workflow created successfully");
    router.push(`/workflows/${newWorkflowId}/edit`);
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/workflows">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Workflow</h1>
          <p className="text-muted-foreground mt-1">
            Choose a template or start from scratch
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Give your workflow a name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                placeholder="e.g., Customer Onboarding"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this workflow does..."
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose a Template</CardTitle>
            <CardDescription>
              Select a starting point for your workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              className="grid gap-4"
            >
              {workflowTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    className="relative flex items-start space-x-3"
                  >
                    <RadioGroupItem
                      value={template.id}
                      id={template.id}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={template.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          {template.signals.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {template.signals.map((signal) => (
                                <Badge
                                  key={signal}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {signal}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Start with a template to save time, you can customize it later
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  You can add, remove, and configure signals in the workflow editor
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Test your workflow with sample data before publishing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Published workflows can be updated without downtime
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/workflows">Cancel</Link>
        </Button>
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Workflow"}
        </Button>
      </div>
    </div>
  );
}

// Add missing Badge component import
import { Badge } from "@/components/ui/badge";