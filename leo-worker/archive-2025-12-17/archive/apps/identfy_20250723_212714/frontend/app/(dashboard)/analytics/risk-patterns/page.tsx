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
  RadarChart,
  RadarGrid,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Globe,
  Calendar,
  Filter,
  Info,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data for risk patterns
const riskTrendData = [
  { month: "Jan", lowRisk: 4000, mediumRisk: 2400, highRisk: 800 },
  { month: "Feb", lowRisk: 3800, mediumRisk: 2600, highRisk: 900 },
  { month: "Mar", lowRisk: 3600, mediumRisk: 2800, highRisk: 1100 },
  { month: "Apr", lowRisk: 3900, mediumRisk: 2700, highRisk: 1000 },
  { month: "May", lowRisk: 4200, mediumRisk: 2500, highRisk: 850 },
  { month: "Jun", lowRisk: 4100, mediumRisk: 2600, highRisk: 950 },
];

const riskByRegion = [
  { region: "North America", riskScore: 42, cases: 2400 },
  { region: "Europe", riskScore: 38, cases: 1800 },
  { region: "Asia Pacific", riskScore: 55, cases: 3200 },
  { region: "Latin America", riskScore: 62, cases: 1200 },
  { region: "Middle East", riskScore: 48, cases: 800 },
  { region: "Africa", riskScore: 71, cases: 600 },
];

const fraudTypeDistribution = [
  { name: "Identity Theft", value: 35, color: "#ef4444" },
  { name: "Document Forgery", value: 25, color: "#f59e0b" },
  { name: "Account Takeover", value: 20, color: "#eab308" },
  { name: "Synthetic Identity", value: 12, color: "#3b82f6" },
  { name: "Other", value: 8, color: "#8b5cf6" },
];

const riskFactorRadar = [
  { factor: "Device Risk", A: 80, B: 65, fullMark: 100 },
  { factor: "Behavioral", A: 70, B: 75, fullMark: 100 },
  { factor: "Document", A: 85, B: 90, fullMark: 100 },
  { factor: "Biometric", A: 60, B: 85, fullMark: 100 },
  { factor: "Network", A: 75, B: 70, fullMark: 100 },
  { factor: "Velocity", A: 90, B: 60, fullMark: 100 },
];

const commonPatterns = [
  {
    id: 1,
    name: "Multiple Failed Verifications",
    occurrences: 342,
    trend: "increasing",
    riskLevel: "high",
    description: "Users attempting verification multiple times with different documents",
  },
  {
    id: 2,
    name: "VPN/Proxy Usage",
    occurrences: 256,
    trend: "stable",
    riskLevel: "medium",
    description: "Verification attempts from known VPN or proxy services",
  },
  {
    id: 3,
    name: "Velocity Abuse",
    occurrences: 189,
    trend: "decreasing",
    riskLevel: "high",
    description: "Rapid verification attempts from similar device fingerprints",
  },
  {
    id: 4,
    name: "Document Mismatch",
    occurrences: 167,
    trend: "increasing",
    riskLevel: "medium",
    description: "Discrepancies between provided documents and extracted data",
  },
];

export default function RiskPatternsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Risk Pattern Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Identify and analyze fraud patterns across your verification processes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      <Card className="overflow-hidden">
        <div className="relative h-64">
          <Image
            src="/images/stock/dall-e-3_Abstract_representation_of_sec_d0f6a57f_20250724_013713.png"
            alt="Risk Pattern Analysis Visualization"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute inset-0 flex items-center p-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Advanced Risk Detection</h2>
              <p className="text-muted-foreground max-w-lg">
                Our AI-powered system continuously analyzes verification patterns to identify potential fraud
                and emerging risk trends before they impact your business.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-12.5%</div>
            <p className="text-xs text-muted-foreground">
              Improvement from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +23 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pattern Detection</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              Accuracy rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Patterns</CardTitle>
            <Info className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Discovered this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Common Patterns</TabsTrigger>
          <TabsTrigger value="geographic">Geographic Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Risk Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution Over Time</CardTitle>
              <CardDescription>
                Track how risk levels change across your user base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="lowRisk"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Low Risk"
                  />
                  <Area
                    type="monotone"
                    dataKey="mediumRisk"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    name="Medium Risk"
                  />
                  <Area
                    type="monotone"
                    dataKey="highRisk"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="High Risk"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Fraud Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Fraud Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown of detected fraud attempts by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={fraudTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fraudTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Factor Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Factor Analysis</CardTitle>
                <CardDescription>
                  Comparison of risk factors: Current vs Previous Period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={riskFactorRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Current"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Previous"
                      dataKey="B"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Risk Patterns</CardTitle>
              <CardDescription>
                Most frequently detected patterns in the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commonPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{pattern.name}</h4>
                        <Badge
                          variant={pattern.riskLevel === "high" ? "destructive" : "secondary"}
                        >
                          {pattern.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{pattern.occurrences}</p>
                        <p className="text-xs text-muted-foreground">occurrences</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {pattern.trend === "increasing" ? (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        ) : pattern.trend === "decreasing" ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pattern Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pattern Evolution</CardTitle>
                <CardDescription>How patterns change over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="highRisk"
                      stroke="#ef4444"
                      name="High Risk Patterns"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detection Effectiveness</CardTitle>
                <CardDescription>Pattern detection success rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Identity Theft Detection</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Document Forgery Detection</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: "87%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Behavioral Anomaly Detection</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600" style={{ width: "78%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk by Geographic Region</CardTitle>
              <CardDescription>
                Average risk scores and case volumes by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={riskByRegion} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="region" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="riskScore" fill="#ef4444" name="Risk Score" />
                  <Bar dataKey="cases" fill="#3b82f6" name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Highest Risk Region</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Africa</span>
                </div>
                <p className="text-2xl font-bold mt-2">71</p>
                <p className="text-xs text-muted-foreground">Average risk score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Most Active Region</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Asia Pacific</span>
                </div>
                <p className="text-2xl font-bold mt-2">3,200</p>
                <p className="text-xs text-muted-foreground">Total cases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Emerging Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="font-semibold">Latin America</span>
                </div>
                <p className="text-2xl font-bold mt-2">+15%</p>
                <p className="text-xs text-muted-foreground">Risk increase this month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Predictions</CardTitle>
              <CardDescription>
                AI-powered predictions for the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">High Risk Alert</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Expected 23% increase in synthetic identity fraud attempts from Southeast Asia
                        region in the next 2 weeks based on current patterns.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-2">
                        View detailed analysis →
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Emerging Pattern</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        New device fingerprinting evasion technique detected. 156 cases identified
                        using similar methods. Recommend updating device risk algorithms.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-2">
                        Review cases →
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Predicted Risk Trends</h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Document Fraud</p>
                      <p className="text-lg font-semibold">↑ 12%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Takeover</p>
                      <p className="text-lg font-semibold">↓ 8%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Identity Theft</p>
                      <p className="text-lg font-semibold">→ 0%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}