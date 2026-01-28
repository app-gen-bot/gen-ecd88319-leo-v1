"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Plus,
  MoreVertical,
  Play,
  Pause,
  StopCircle,
  Trophy,
  TrendingUp,
  TrendingDown,
  Users,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock A/B test data
const activeTests = [
  {
    id: "test-1",
    name: "Document Verification Speed Test",
    status: "running",
    startDate: "2024-06-15",
    variants: [
      { name: "Control", traffic: 50, conversions: 1234, conversionRate: 87.2 },
      { name: "Fast Track", traffic: 50, conversions: 1456, conversionRate: 91.8 },
    ],
    winner: null,
    confidence: 89,
    uplift: 5.3,
    totalSessions: 2890,
  },
  {
    id: "test-2",
    name: "Biometric Threshold Optimization",
    status: "running",
    startDate: "2024-06-20",
    variants: [
      { name: "Control (95%)", traffic: 33, conversions: 782, conversionRate: 85.4 },
      { name: "Variant A (93%)", traffic: 33, conversions: 824, conversionRate: 88.2 },
      { name: "Variant B (97%)", traffic: 34, conversions: 756, conversionRate: 83.1 },
    ],
    winner: "Variant A (93%)",
    confidence: 95,
    uplift: 3.3,
    totalSessions: 2362,
  },
  {
    id: "test-3",
    name: "Risk Score Algorithm Test",
    status: "completed",
    startDate: "2024-05-01",
    endDate: "2024-06-01",
    variants: [
      { name: "Legacy Algorithm", traffic: 50, conversions: 4521, conversionRate: 82.1 },
      { name: "ML-Based Algorithm", traffic: 50, conversions: 5234, conversionRate: 89.7 },
    ],
    winner: "ML-Based Algorithm",
    confidence: 99.8,
    uplift: 9.3,
    totalSessions: 11234,
  },
];

const conversionTrend = [
  { date: "Jun 15", control: 85, variant: 87 },
  { date: "Jun 18", control: 86, variant: 89 },
  { date: "Jun 21", control: 87, variant: 90 },
  { date: "Jun 24", control: 87, variant: 91 },
  { date: "Jun 27", control: 87, variant: 92 },
  { date: "Jun 30", control: 87, variant: 92 },
];

export default function ABTestingPage() {
  const [selectedTab, setSelectedTab] = useState("active");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-green-100 text-green-800">Running</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600";
    if (confidence >= 90) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Workflow A/B Testing</h1>
          <p className="text-muted-foreground mt-1">
            Test and optimize your verification workflows with data-driven experiments
          </p>
        </div>
        <Button asChild>
          <Link href="/workflows/ab-testing/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative h-48">
          <Image
            src="/images/stock/dall-e-3_Modern_identity_verification_d_3274bcc9_20250724_013517.png"
            alt="A/B Testing Dashboard"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute inset-0 flex items-center p-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Data-Driven Optimization</h2>
              <p className="text-muted-foreground max-w-lg">
                Test different workflow configurations to find the optimal balance between
                security and user experience. Make decisions based on real user data.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Uplift</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+6.3%</div>
            <p className="text-xs text-muted-foreground">
              Across all tests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests This Month</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              3 completed, 2 active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80%</div>
            <p className="text-xs text-muted-foreground">
              Tests with positive results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="active">Active Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="active" className="space-y-4">
          {activeTests
            .filter(test => test.status === "running")
            .map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle>{test.name}</CardTitle>
                      {getStatusBadge(test.status)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/workflows/ab-testing/${test.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause Test
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <StopCircle className="mr-2 h-4 w-4" />
                          End Test
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>
                    Started {test.startDate} • {test.totalSessions.toLocaleString()} sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Variants Performance */}
                  <div className="space-y-3">
                    {test.variants.map((variant, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{variant.name}</span>
                            <Badge variant="outline">{variant.traffic}% traffic</Badge>
                            {test.winner === variant.name && (
                              <Badge className="bg-green-100 text-green-800">
                                <Trophy className="mr-1 h-3 w-3" />
                                Leading
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {variant.conversions.toLocaleString()} conversions
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress
                            value={variant.conversionRate}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12">
                            {variant.conversionRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Test Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className={`text-lg font-semibold ${getConfidenceColor(test.confidence)}`}>
                        {test.confidence}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Uplift</p>
                      <p className="text-lg font-semibold text-green-600">
                        +{test.uplift}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Est. Completion</p>
                      <p className="text-lg font-semibold">
                        {test.confidence >= 95 ? "Ready" : "3 days"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {test.confidence >= 95 && (
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Declare Winner
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Continue Testing
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>Risk Score Algorithm Test</CardTitle>
                  {getStatusBadge("completed")}
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Trophy className="mr-1 h-3 w-3" />
                  Winner: ML-Based Algorithm
                </Badge>
              </div>
              <CardDescription>
                May 1 - June 1, 2024 • 11,234 sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Results Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-2xl font-bold text-green-600">99.8%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Uplift</p>
                    <p className="text-2xl font-bold text-green-600">+9.3%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Impact</p>
                    <p className="text-2xl font-bold">+713 conversions</p>
                  </div>
                </div>

                {/* Performance Chart */}
                <div>
                  <h4 className="font-semibold mb-3">Conversion Rate Over Time</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={conversionTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="control"
                        stroke="#f59e0b"
                        name="Legacy Algorithm"
                      />
                      <Line
                        type="monotone"
                        dataKey="variant"
                        stroke="#10b981"
                        name="ML-Based Algorithm"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Implementation Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Implemented to Production</p>
                      <p className="text-sm text-muted-foreground">
                        Rolled out to 100% of traffic on June 5, 2024
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Success Factors</CardTitle>
                <CardDescription>
                  Common patterns in successful tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tests with {'>'}5% uplift</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average test duration</span>
                    <span className="font-medium">14 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tests reaching 95% confidence</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Multi-variant tests</span>
                    <span className="font-medium">35%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
                <CardDescription>
                  Suggested areas for testing based on data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Mobile Conversion</p>
                        <p className="text-xs text-muted-foreground">
                          15% lower than desktop - test mobile-optimized flow
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Document Retry Flow</p>
                        <p className="text-xs text-muted-foreground">
                          High drop-off on retry - test simplified process
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test History Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Test Performance History</CardTitle>
              <CardDescription>
                Uplift achieved by tests over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { month: "Jan", tests: 3, avgUplift: 4.2 },
                    { month: "Feb", tests: 4, avgUplift: 5.8 },
                    { month: "Mar", tests: 2, avgUplift: 3.1 },
                    { month: "Apr", tests: 5, avgUplift: 7.2 },
                    { month: "May", tests: 4, avgUplift: 6.5 },
                    { month: "Jun", tests: 3, avgUplift: 6.3 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="tests" fill="#3b82f6" name="Tests Run" />
                  <Bar yAxisId="right" dataKey="avgUplift" fill="#10b981" name="Avg Uplift %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}