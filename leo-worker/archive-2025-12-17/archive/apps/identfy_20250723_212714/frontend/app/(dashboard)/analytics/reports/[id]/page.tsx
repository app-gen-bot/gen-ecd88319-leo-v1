"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChevronLeft,
  Download,
  Send,
  Edit,
  Calendar,
  Clock,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock report data
const reportData = {
  id: "1",
  name: "Monthly Executive Summary",
  type: "executive",
  generatedAt: "2024-06-01 09:00 AM",
  schedule: "Monthly",
  nextRun: "2024-07-01",
  recipients: ["ceo@identfy.com", "cto@identfy.com"],
  status: "delivered",
  filters: {
    dateRange: "May 1 - May 31, 2024",
    regions: "All regions",
    riskLevels: "All levels",
  },
};

// Mock data for charts
const verificationTrend = [
  { date: "May 1", total: 1200, passed: 1080, failed: 120 },
  { date: "May 8", total: 1350, passed: 1215, failed: 135 },
  { date: "May 15", total: 1450, passed: 1305, failed: 145 },
  { date: "May 22", total: 1600, passed: 1440, failed: 160 },
  { date: "May 29", total: 1500, passed: 1350, failed: 150 },
];

const riskDistribution = [
  { name: "Low Risk", value: 65, color: "#10b981" },
  { name: "Medium Risk", value: 25, color: "#f59e0b" },
  { name: "High Risk", value: 10, color: "#ef4444" },
];

const topIssues = [
  { issue: "Document Quality", count: 342, trend: "up" },
  { issue: "Liveness Check Failed", count: 256, trend: "down" },
  { issue: "Network Risk", count: 189, trend: "up" },
  { issue: "Data Mismatch", count: 156, trend: "stable" },
  { issue: "Velocity Checks", count: 98, trend: "down" },
];

const performanceMetrics = [
  { metric: "Verification Pass Rate", value: "89%", change: "+2.3%", positive: true },
  { metric: "Average Risk Score", value: "42", change: "-5.1%", positive: true },
  { metric: "Manual Review Rate", value: "12%", change: "-1.8%", positive: true },
  { metric: "Average Processing Time", value: "2.3s", change: "-0.4s", positive: true },
];

export default function ReportDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/analytics/reports">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{reportData.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Generated: {reportData.generatedAt}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Schedule: {reportData.schedule}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {reportData.recipients.length} recipients
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Send Again
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button asChild>
            <Link href={`/analytics/reports/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Report Filters Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Date Range</p>
              <p className="font-medium">{reportData.filters.dateRange}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regions</p>
              <p className="font-medium">{reportData.filters.regions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Levels</p>
              <p className="font-medium">{reportData.filters.riskLevels}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="space-y-6">
        {/* Executive Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>
              Key insights and performance highlights for May 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>
                During May 2024, the identity verification system processed{" "}
                <strong>7,100 verifications</strong> with an overall pass rate of{" "}
                <strong>89%</strong>, representing a 2.3% improvement from the previous month.
              </p>
              <p>
                Key achievements include:
              </p>
              <ul>
                <li>Reduced average processing time by 15% to 2.3 seconds</li>
                <li>Decreased manual review rate from 13.8% to 12%</li>
                <li>Improved fraud detection accuracy to 94%</li>
                <li>Maintained 99.9% system uptime</li>
              </ul>
              <p>
                The most significant challenge was an increase in document quality issues,
                particularly from mobile uploads, which accounted for 342 failed verifications.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {performanceMetrics.map((metric) => (
            <Card key={metric.metric}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                {metric.positive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${metric.positive ? "text-green-600" : "text-red-600"}`}>
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Volume</CardTitle>
                  <CardDescription>Daily verification attempts in May</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={verificationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="passed"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        name="Passed"
                      />
                      <Area
                        type="monotone"
                        dataKey="failed"
                        stackId="1"
                        stroke="#ef4444"
                        fill="#ef4444"
                        name="Failed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Breakdown by risk level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Verification Issues</CardTitle>
                <CardDescription>Most common reasons for verification failures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topIssues.map((issue) => (
                    <div key={issue.issue} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          issue.trend === "up" ? "bg-red-600" :
                          issue.trend === "down" ? "bg-green-600" :
                          "bg-gray-400"
                        }`} />
                        <span className="font-medium">{issue.issue}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{issue.count} cases</span>
                        {issue.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        ) : issue.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend Analysis</CardTitle>
                <CardDescription>
                  Key metrics performance over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={[
                      { month: "Jan", passRate: 85, riskScore: 48, reviewRate: 15 },
                      { month: "Feb", passRate: 86, riskScore: 46, reviewRate: 14 },
                      { month: "Mar", passRate: 87, riskScore: 45, reviewRate: 14 },
                      { month: "Apr", passRate: 87, riskScore: 44, reviewRate: 13 },
                      { month: "May", passRate: 89, riskScore: 42, reviewRate: 12 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="passRate"
                      stroke="#10b981"
                      name="Pass Rate %"
                    />
                    <Line
                      type="monotone"
                      dataKey="riskScore"
                      stroke="#f59e0b"
                      name="Avg Risk Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="reviewRate"
                      stroke="#3b82f6"
                      name="Review Rate %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/images/stock/dall-e-3_Closeup_of_secure_biometric_f_df9c1a30_20250724_013617.png"
                  alt="Risk analysis visualization"
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
                <div className="absolute inset-0 flex items-center p-8">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Risk Pattern Insights</h3>
                    <p className="text-muted-foreground">
                      Advanced AI analysis has identified emerging patterns that require attention
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Emerging Threat: Synthetic Identity</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          12% increase in synthetic identity attempts detected, primarily from
                          Southeast Asia region. Recommend implementing additional biometric checks.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Device Fingerprint Evasion</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          New evasion techniques detected in 156 cases. Pattern suggests coordinated
                          attempts using similar methodologies.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Action items based on this month's performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Improve Mobile Document Capture</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Implement enhanced image preprocessing for mobile uploads to reduce the
                        342 document quality failures. Expected improvement: 15% reduction in failures.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Update Risk Scoring Algorithm</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Fine-tune the risk scoring model to better detect synthetic identity patterns.
                        This could prevent an estimated 200+ fraudulent attempts monthly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Enhance Liveness Detection</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upgrade to the latest liveness detection technology to combat the 256
                        liveness check failures. Consider adding depth sensing capabilities.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Implement Velocity Monitoring</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Deploy real-time velocity checks to identify rapid verification attempts
                        from similar sources. This addresses the 98 velocity-related issues.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}