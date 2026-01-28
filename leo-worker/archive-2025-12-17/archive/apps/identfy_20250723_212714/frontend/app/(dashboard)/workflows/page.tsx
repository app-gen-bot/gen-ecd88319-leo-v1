"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Trash,
  Archive,
  Play,
  BarChart3
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Mock workflow data
const mockWorkflows = [
  {
    id: "1",
    name: "Customer Onboarding",
    description: "Standard KYC workflow for new customers",
    status: "active",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
    signalsCount: 5,
    version: "v2.1",
    successRate: 94.5,
  },
  {
    id: "2",
    name: "High-Risk Verification",
    description: "Enhanced due diligence for high-risk profiles",
    status: "active",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
    signalsCount: 8,
    version: "v1.3",
    successRate: 87.2,
  },
  {
    id: "3",
    name: "Quick Check",
    description: "Minimal verification for low-risk transactions",
    status: "draft",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48),
    signalsCount: 3,
    version: "v1.0",
    successRate: 0,
  },
  {
    id: "4",
    name: "Business Verification",
    description: "B2B customer verification workflow",
    status: "archived",
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72),
    signalsCount: 6,
    version: "v2.0",
    successRate: 91.8,
  },
];

const mockABTests = [
  {
    id: "1",
    name: "Onboarding Optimization",
    baseWorkflow: "Customer Onboarding",
    variantWorkflow: "Customer Onboarding v3",
    status: "running",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    trafficSplit: { control: 50, variant: 50 },
    metrics: {
      control: { conversions: 1250, rate: 94.5 },
      variant: { conversions: 1320, rate: 96.2 },
    },
    winner: null,
  },
  {
    id: "2",
    name: "Risk Threshold Test",
    baseWorkflow: "High-Risk Verification",
    variantWorkflow: "High-Risk Verification Alt",
    status: "completed",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    trafficSplit: { control: 50, variant: 50 },
    metrics: {
      control: { conversions: 850, rate: 87.2 },
      variant: { conversions: 920, rate: 89.8 },
    },
    winner: "variant",
  },
];

export default function WorkflowsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();

  const filteredWorkflows = mockWorkflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = (workflowId: string) => {
    // TODO: Implement workflow duplication
    toast.success("Workflow duplicated successfully");
  };

  const handleArchive = (workflowId: string) => {
    // TODO: Implement workflow archiving
    toast.success("Workflow archived successfully");
  };

  const handleDelete = (workflowId: string) => {
    // TODO: Implement workflow deletion
    toast.success("Workflow deleted successfully");
  };

  const handleTest = (workflowId: string) => {
    // TODO: Implement workflow testing
    router.push(`/workflows/${workflowId}/test`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your verification workflows
          </p>
        </div>
        <Button asChild>
          <Link href="/workflows/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Workflow
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Workflows Grid/List */}
          <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                viewMode={viewMode}
                onEdit={() => router.push(`/workflows/${workflow.id}/edit`)}
                onDuplicate={() => handleDuplicate(workflow.id)}
                onArchive={() => handleArchive(workflow.id)}
                onDelete={() => handleDelete(workflow.id)}
                onTest={() => handleTest(workflow.id)}
              />
            ))}
          </div>

          {filteredWorkflows.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-1">No workflows found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first workflow to get started"}
                </p>
                {searchQuery === "" && statusFilter === "all" && (
                  <Button asChild>
                    <Link href="/workflows/new">Create Workflow</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              Test different workflow variations to optimize performance
            </p>
            <Button asChild>
              <Link href="/workflows/ab-testing/new">
                <Plus className="mr-2 h-4 w-4" />
                Create A/B Test
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {mockABTests.map((test) => (
              <ABTestCard key={test.id} test={test} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface WorkflowCardProps {
  workflow: typeof mockWorkflows[0];
  viewMode: "grid" | "list";
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onTest: () => void;
}

function WorkflowCard({ workflow, viewMode, onEdit, onDuplicate, onArchive, onDelete, onTest }: WorkflowCardProps) {
  const statusColors: Record<string, "success" | "secondary" | "outline"> = {
    active: "success",
    draft: "secondary",
    archived: "outline",
  };

  const statusIcons: Record<string, LucideIcon> = {
    active: CheckCircle,
    draft: Clock,
    archived: Archive,
  };

  const StatusIcon = statusIcons[workflow.status] || CheckCircle;

  if (viewMode === "list") {
    return (
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <StatusIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">{workflow.name}</h3>
              <p className="text-sm text-muted-foreground">{workflow.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{workflow.signalsCount} signals</p>
              <p className="text-xs text-muted-foreground">
                Modified {formatDateTime(workflow.lastModified)}
              </p>
            </div>
            <Badge variant={statusColors[workflow.status] || "secondary"}>
              {workflow.status}
            </Badge>
            <WorkflowActions
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onArchive={onArchive}
              onDelete={onDelete}
              onTest={onTest}
              status={workflow.status}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{workflow.name}</CardTitle>
            <CardDescription>{workflow.description}</CardDescription>
          </div>
          <WorkflowActions
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            onDelete={onDelete}
            onTest={onTest}
            status={workflow.status}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={statusColors[workflow.status] || "secondary"} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {workflow.status}
          </Badge>
          <span className="text-sm text-muted-foreground">{workflow.version}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Signals</p>
            <p className="font-medium">{workflow.signalsCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Success Rate</p>
            <p className="font-medium">
              {workflow.successRate > 0 ? `${workflow.successRate}%` : "-"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4">
        <p className="text-xs text-muted-foreground">
          Modified {formatDateTime(workflow.lastModified)}
        </p>
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}

interface WorkflowActionsProps {
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onTest: () => void;
  status: string;
}

function WorkflowActions({ onEdit, onDuplicate, onArchive, onDelete, onTest, status }: WorkflowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEdit}>
          <GitBranch className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTest}>
          <Play className="mr-2 h-4 w-4" />
          Test
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/workflows/ab-testing/new">
            <BarChart3 className="mr-2 h-4 w-4" />
            Create A/B Test
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {status !== "archived" && (
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ABTestCardProps {
  test: typeof mockABTests[0];
}

function ABTestCard({ test }: ABTestCardProps) {
  const isVariantWinning = test.metrics.variant.rate > test.metrics.control.rate;
  const improvement = ((test.metrics.variant.rate - test.metrics.control.rate) / test.metrics.control.rate * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{test.name}</CardTitle>
            <CardDescription>
              {test.baseWorkflow} vs {test.variantWorkflow}
            </CardDescription>
          </div>
          <Badge variant={test.status === "running" ? "default" : "secondary"}>
            {test.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Control</span>
                <span className="text-sm text-muted-foreground">{test.trafficSplit.control}%</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{test.metrics.control.rate}%</p>
                <p className="text-xs text-muted-foreground">
                  {test.metrics.control.conversions.toLocaleString()} conversions
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Variant</span>
                <span className="text-sm text-muted-foreground">{test.trafficSplit.variant}%</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{test.metrics.variant.rate}%</p>
                <p className="text-xs text-muted-foreground">
                  {test.metrics.variant.conversions.toLocaleString()} conversions
                </p>
              </div>
            </div>
          </div>
          
          {test.winner && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Winner: {test.winner === "variant" ? test.variantWorkflow : test.baseWorkflow}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {isVariantWinning ? `+${improvement}%` : `${improvement}%`} improvement
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/workflows/ab-testing/${test.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}