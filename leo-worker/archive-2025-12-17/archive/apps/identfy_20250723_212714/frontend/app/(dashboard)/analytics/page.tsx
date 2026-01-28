"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  ComposedChart,
  RadialBarChart,
  RadialBar
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Activity,
  Globe,
  Users
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Mock data for charts
const verificationVolumeData = [
  { date: "Jan 1", total: 1200, passed: 1100, failed: 50, flagged: 50 },
  { date: "Jan 2", total: 1350, passed: 1250, failed: 60, flagged: 40 },
  { date: "Jan 3", total: 1100, passed: 1000, failed: 70, flagged: 30 },
  { date: "Jan 4", total: 1450, passed: 1350, failed: 55, flagged: 45 },
  { date: "Jan 5", total: 1600, passed: 1480, failed: 70, flagged: 50 },
  { date: "Jan 6", total: 1300, passed: 1200, failed: 65, flagged: 35 },
  { date: "Jan 7", total: 1247, passed: 1150, failed: 52, flagged: 45 },
];

const riskScoreDistribution = [
  { range: "0-20", count: 450, percentage: 36 },
  { range: "21-40", count: 350, percentage: 28 },
  { range: "41-60", count: 225, percentage: 18 },
  { range: "61-80", count: 150, percentage: 12 },
  { range: "81-100", count: 75, percentage: 6 },
];

const geoData = [
  { country: "United States", count: 4500, percentage: 45 },
  { country: "United Kingdom", count: 2000, percentage: 20 },
  { country: "European Union", count: 1500, percentage: 15 },
  { country: "Canada", count: 1000, percentage: 10 },
  { country: "Australia", count: 500, percentage: 5 },
  { country: "Other", count: 500, percentage: 5 },
];

const failureReasons = [
  { reason: "Document Quality", count: 245, percentage: 35 },
  { reason: "Biometric Mismatch", count: 175, percentage: 25 },
  { reason: "Expired Documents", count: 140, percentage: 20 },
  { reason: "Watchlist Hit", count: 70, percentage: 10 },
  { reason: "Data Mismatch", count: 70, percentage: 10 },
];

const workflowPerformance = [
  { name: "Customer Onboarding", passRate: 94.5, avgTime: 2.3, volume: 4500 },
  { name: "High-Risk Verification", passRate: 87.2, avgTime: 5.7, volume: 1200 },
  { name: "Quick Check", passRate: 98.2, avgTime: 0.8, volume: 3200 },
  { name: "Business Verification", passRate: 91.8, avgTime: 4.2, volume: 800 },
];

const conversionFunnel = [
  { stage: "Started", count: 10000, percentage: 100 },
  { stage: "Document Uploaded", count: 8500, percentage: 85 },
  { stage: "Selfie Taken", count: 7200, percentage: 72 },
  { stage: "Verification Complete", count: 6800, percentage: 68 },
  { stage: "Approved", count: 6500, percentage: 65 },
];

const timeSeriesComparison = [
  { date: "Mon", current: 1200, previous: 1000 },
  { date: "Tue", current: 1350, previous: 1100 },
  { date: "Wed", current: 1100, previous: 1150 },
  { date: "Thu", current: 1450, previous: 1200 },
  { date: "Fri", current: 1600, previous: 1300 },
  { date: "Sat", current: 1300, previous: 1250 },
  { date: "Sun", current: 1247, previous: 1180 },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7days");
  const [compareMode, setCompareMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const metrics = {
    totalVerifications: 9747,
    passRate: 94.7,
    avgRiskScore: 32.5,
    manualReviewRate: 5.3,
    trends: {
      verifications: { value: 12.5, positive: true },
      passRate: { value: 1.2, positive: true },
      riskScore: { value: 3.2, positive: false },
      manualReview: { value: 0.8, positive: false },
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 stack-mobile">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your verification performance and trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm">Compare to previous period</span>
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="rounded"
            />
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Verifications"
          value={metrics.totalVerifications.toLocaleString()}
          trend={metrics.trends.verifications}
          icon={Activity}
        />
        <MetricCard
          title="Pass Rate"
          value={`${metrics.passRate}%`}
          trend={metrics.trends.passRate}
          icon={CheckCircle}
        />
        <MetricCard
          title="Avg Risk Score"
          value={metrics.avgRiskScore.toFixed(1)}
          trend={metrics.trends.riskScore}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Manual Review Rate"
          value={`${metrics.manualReviewRate}%`}
          trend={metrics.trends.manualReview}
          icon={Users}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk-patterns">Risk Patterns</TabsTrigger>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Verification Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Volume</CardTitle>
              <CardDescription>
                Daily verification counts by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] md:h-[350px] chart-container-mobile">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={verificationVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="passed" stackId="1" stroke="#10B981" fill="#10B981" />
                    <Area type="monotone" dataKey="flagged" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                    <Area type="monotone" dataKey="failed" stackId="1" stroke="#EF4444" fill="#EF4444" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Risk Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Distribution</CardTitle>
                <CardDescription>
                  Cases by risk score range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] md:h-[300px] chart-container-mobile">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskScoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Geographical Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographical Distribution</CardTitle>
                <CardDescription>
                  Verifications by country
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] md:h-[300px] chart-container-mobile">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={geoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {geoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Failure Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Top Failure Reasons</CardTitle>
              <CardDescription>
                Most common reasons for verification failures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {failureReasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium w-40">{reason.reason}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${reason.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm font-medium">{reason.count}</span>
                      <span className="text-sm text-muted-foreground">({reason.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
              <CardDescription>
                Performance metrics by workflow type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Workflow</th>
                      <th className="text-right py-3 px-4">Pass Rate</th>
                      <th className="text-right py-3 px-4">Avg Time (min)</th>
                      <th className="text-right py-3 px-4">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowPerformance.map((workflow, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 font-medium">{workflow.name}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant={workflow.passRate >= 95 ? "success" : workflow.passRate >= 90 ? "warning" : "destructive"}>
                            {workflow.passRate}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">{workflow.avgTime}</td>
                        <td className="py-3 px-4 text-right">{workflow.volume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-patterns" className="space-y-6">
          {/* Risk Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Score Trends</CardTitle>
              <CardDescription>
                Average risk scores over time with pattern detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] md:h-[350px] chart-container-mobile">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={verificationVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="flagged" fill="#F59E0B" />
                    <Line yAxisId="right" type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors Correlation */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Factor Correlation</CardTitle>
              <CardDescription>
                How different signals contribute to overall risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] md:h-[300px] chart-container-mobile">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={[
                    { name: "Document", value: 85, fill: "#3B82F6" },
                    { name: "Biometric", value: 92, fill: "#10B981" },
                    { name: "Watchlist", value: 78, fill: "#F59E0B" },
                    { name: "Device", value: 88, fill: "#8B5CF6" },
                  ]}>
                    <RadialBar dataKey="value" />
                    <Legend />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Detection */}
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>
                Unusual patterns detected in recent verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Spike in High-Risk Cases</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        23% increase in cases with risk score &gt;80 in the last 24 hours
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Detected 2 hours ago • Affecting US region
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Unusual Device Pattern</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Multiple verifications from same device fingerprint
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Detected 5 hours ago • 15 cases flagged
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-6">
          {/* Industry Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarks</CardTitle>
              <CardDescription>
                How your metrics compare to industry standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pass Rate</span>
                    <span className="text-sm text-muted-foreground">94.7% vs 91.2% industry avg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "94.7%" }} />
                    </div>
                    <Badge variant="success">+3.5%</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Verification Time</span>
                    <span className="text-sm text-muted-foreground">2.3 min vs 3.1 min industry avg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "74%" }} />
                    </div>
                    <Badge variant="success">-26%</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">False Positive Rate</span>
                    <span className="text-sm text-muted-foreground">2.1% vs 3.8% industry avg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "55%" }} />
                    </div>
                    <Badge variant="success">-45%</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Customer Drop-off Rate</span>
                    <span className="text-sm text-muted-foreground">12.3% vs 15.7% industry avg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }} />
                    </div>
                    <Badge variant="success">-22%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>
                User journey through verification process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] md:h-[350px] chart-container-mobile">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionFunnel} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6">
                      {conversionFunnel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Period Comparison */}
          {compareMode && (
            <Card>
              <CardHeader>
                <CardTitle>Period Comparison</CardTitle>
                <CardDescription>
                  Current week vs previous week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] md:h-[350px] chart-container-mobile">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="current" stroke="#3B82F6" strokeWidth={2} name="Current Period" />
                      <Line type="monotone" dataKey="previous" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" name="Previous Period" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>
                Create and manage custom analytics reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No custom reports yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create custom reports to track specific metrics and KPIs
                </p>
                <Button>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Create Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  trend: { value: number; positive: boolean };
  icon: React.ElementType;
}

function MetricCard({ title, value, trend, icon: Icon }: MetricCardProps) {
  const TrendIcon = trend.positive ? TrendingUp : TrendingDown;
  const trendColor = trend.positive ? "text-green-600" : "text-red-600";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${trendColor} mt-1`}>
          <TrendIcon className="h-3 w-3 mr-1" />
          {Math.abs(trend.value)}% vs last period
        </div>
      </CardContent>
    </Card>
  );
}