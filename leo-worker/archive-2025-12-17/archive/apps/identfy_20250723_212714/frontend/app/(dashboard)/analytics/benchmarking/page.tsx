"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Users,
  Clock,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import Image from "next/image";

// Mock benchmark data
const industryComparison = [
  { metric: "Verification Pass Rate", yourScore: 89, industryAvg: 82, topPerformer: 95 },
  { metric: "Average Risk Score", yourScore: 42, industryAvg: 48, topPerformer: 35 },
  { metric: "Manual Review Rate", yourScore: 12, industryAvg: 18, topPerformer: 8 },
  { metric: "Fraud Detection Rate", yourScore: 94, industryAvg: 87, topPerformer: 98 },
  { metric: "False Positive Rate", yourScore: 6, industryAvg: 11, topPerformer: 3 },
];

const performanceRadar = [
  { metric: "Speed", you: 85, industry: 75, best: 95 },
  { metric: "Accuracy", you: 92, industry: 85, best: 98 },
  { metric: "User Experience", you: 78, industry: 80, best: 92 },
  { metric: "Cost Efficiency", you: 82, industry: 70, best: 88 },
  { metric: "Compliance", you: 95, industry: 90, best: 99 },
  { metric: "Innovation", you: 70, industry: 65, best: 85 },
];

const trendComparison = [
  { month: "Jan", you: 85, industry: 80 },
  { month: "Feb", you: 87, industry: 81 },
  { month: "Mar", you: 86, industry: 82 },
  { month: "Apr", you: 89, industry: 82 },
  { month: "May", you: 91, industry: 83 },
  { month: "Jun", you: 89, industry: 82 },
];

const industryBreakdown = [
  { industry: "E-commerce", passRate: 84, avgRiskScore: 45, volume: "2.3M" },
  { industry: "Financial Services", passRate: 78, avgRiskScore: 52, volume: "1.8M" },
  { industry: "Travel & Hospitality", passRate: 86, avgRiskScore: 41, volume: "1.2M" },
  { industry: "Gaming", passRate: 72, avgRiskScore: 58, volume: "3.1M" },
  { industry: "Marketplaces", passRate: 80, avgRiskScore: 48, volume: "2.5M" },
];

// Conversion funnel data
const conversionFunnelData = [
  { stage: "Landing Page", users: 10000, percentage: 100, color: "#3b82f6" },
  { stage: "Started Verification", users: 8500, percentage: 85, color: "#6366f1" },
  { stage: "Document Upload", users: 7200, percentage: 72, color: "#8b5cf6" },
  { stage: "Biometric Capture", users: 6100, percentage: 61, color: "#a855f7" },
  { stage: "Review & Submit", users: 5800, percentage: 58, color: "#c026d3" },
  { stage: "Completed", users: 5200, percentage: 52, color: "#10b981" },
];

const improvementAreas = [
  {
    area: "Biometric Verification Speed",
    gap: -12,
    impact: "high",
    recommendation: "Consider upgrading to faster liveness detection providers",
  },
  {
    area: "Document Processing Accuracy",
    gap: -8,
    impact: "medium",
    recommendation: "Implement additional OCR validation layers",
  },
  {
    area: "Mobile Conversion Rate",
    gap: -15,
    impact: "high",
    recommendation: "Optimize mobile UI/UX for better user experience",
  },
  {
    area: "Fraud Detection Precision",
    gap: -5,
    impact: "low",
    recommendation: "Fine-tune risk scoring algorithms",
  },
];

export default function BenchmarkingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("e-commerce");
  const [comparisonPeriod, setComparisonPeriod] = useState("quarter");
  const [selectedTab, setSelectedTab] = useState("overview");

  const getPercentileRank = (score: number, avg: number, best: number) => {
    const range = best - avg;
    const position = score - avg;
    return Math.max(0, Math.min(100, (position / range) * 100));
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Industry Benchmarking</h1>
          <p className="text-muted-foreground mt-1">
            Compare your performance against industry standards and top performers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="e-commerce">E-commerce</SelectItem>
              <SelectItem value="financial">Financial Services</SelectItem>
              <SelectItem value="travel">Travel & Hospitality</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="marketplace">Marketplaces</SelectItem>
            </SelectContent>
          </Select>
          <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="quarter">Quarterly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Hero Section with Stock Photo */}
      <Card className="overflow-hidden">
        <div className="relative h-64">
          <Image
            src="/images/stock/dall-e-3_Team_of_professionals_collabor_09876ec4_20250724_013552.png"
            alt="Team analyzing benchmarking data"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute inset-0 flex items-center p-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Performance Excellence</h2>
              <p className="text-muted-foreground max-w-lg">
                Understanding how you compare to industry leaders helps identify opportunities 
                for improvement and competitive advantages.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Overall Performance Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry Percentile</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78th</div>
            <p className="text-xs text-muted-foreground">
              Better than 78% of companies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance vs Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+8.5%</div>
            <p className="text-xs text-muted-foreground">
              Above industry average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer Gap</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-6.2%</div>
            <p className="text-xs text-muted-foreground">
              Behind best-in-class
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement Areas</CardTitle>
            <Info className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Key areas to focus on
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
                <CardDescription>
                  Your performance vs industry average and best-in-class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="You"
                      dataKey="you"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Industry Avg"
                      dataKey="industry"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Best-in-Class"
                      dataKey="best"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics Comparison</CardTitle>
                <CardDescription>
                  How you stack up against the competition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {industryComparison.map((metric) => (
                    <div key={metric.metric} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.metric}</span>
                        <span className="font-medium">{metric.yourScore}%</span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={getPercentileRank(metric.yourScore, metric.industryAvg, metric.topPerformer)} 
                          className="h-2"
                        />
                        <div 
                          className="absolute top-0 h-2 w-0.5 bg-yellow-600"
                          style={{ left: `${(metric.industryAvg / metric.topPerformer) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Industry: {metric.industryAvg}%</span>
                        <span>Best: {metric.topPerformer}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Industry Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Industry</CardTitle>
              <CardDescription>
                Compare metrics across different industry verticals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium">Industry</th>
                      <th className="pb-2 font-medium text-center">Pass Rate</th>
                      <th className="pb-2 font-medium text-center">Avg Risk Score</th>
                      <th className="pb-2 font-medium text-center">Monthly Volume</th>
                      <th className="pb-2 font-medium text-center">Your Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryBreakdown.map((row) => (
                      <tr key={row.industry} className="border-b">
                        <td className="py-3">{row.industry}</td>
                        <td className="py-3 text-center">{row.passRate}%</td>
                        <td className="py-3 text-center">{row.avgRiskScore}</td>
                        <td className="py-3 text-center">{row.volume}</td>
                        <td className="py-3 text-center">
                          <Badge variant={row.industry === "E-commerce" ? "default" : "secondary"}>
                            {row.industry === "E-commerce" ? "Above Avg" : "N/A"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
              <CardDescription>
                User drop-off rates at each verification stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnelData.map((stage, index) => {
                  const prevStage = index > 0 ? conversionFunnelData[index - 1] : null;
                  const dropOffRate = prevStage ? 
                    ((prevStage.users - stage.users) / prevStage.users * 100).toFixed(1) : 
                    0;
                  
                  return (
                    <div key={stage.stage} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          {index > 0 && dropOffRate > 0 && (
                            <Badge variant="outline" className="text-xs">
                              -{dropOffRate}% drop-off
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{stage.users.toLocaleString()} users</span>
                          <span className="text-xs text-muted-foreground ml-2">({stage.percentage}%)</span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gray-200 rounded" />
                        <div 
                          className="relative h-8 rounded transition-all duration-500 flex items-center justify-center text-white text-xs font-medium"
                          style={{ 
                            width: `${stage.percentage}%`,
                            backgroundColor: stage.color 
                          }}
                        >
                          {stage.percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">52%</p>
                      <p className="text-xs text-muted-foreground">Overall Conversion</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">48%</p>
                      <p className="text-xs text-muted-foreground">Total Drop-off</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">15%</p>
                      <p className="text-xs text-muted-foreground">Biggest Drop (Document)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>
                Comprehensive breakdown of all tracked metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={industryComparison} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="metric" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yourScore" fill="#3b82f6" name="Your Score" />
                  <Bar dataKey="industryAvg" fill="#f59e0b" name="Industry Average" />
                  <Bar dataKey="topPerformer" fill="#10b981" name="Top Performer" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Verification Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">You</span>
                    <span className="font-medium">2.3s</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm">Industry</span>
                    <span className="text-sm">3.1s</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm">Best</span>
                    <span className="text-sm">1.8s</span>
                  </div>
                  <Progress value={75} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">You</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm">Industry</span>
                    <span className="text-sm">72%</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm">Best</span>
                    <span className="text-sm">85%</span>
                  </div>
                  <Progress value={65} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cost per Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">You</span>
                    <span className="font-medium">$0.82</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm">Industry</span>
                    <span className="text-sm">$0.95</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm">Best</span>
                    <span className="text-sm">$0.68</span>
                  </div>
                  <Progress value={70} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Your performance vs industry average over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="you"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Your Performance"
                  />
                  <Area
                    type="monotone"
                    dataKey="industry"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                    name="Industry Average"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Improvement Velocity</CardTitle>
                <CardDescription>Rate of improvement compared to industry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Your Improvement Rate</span>
                      <span className="font-medium text-green-600">+12% YoY</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Industry Improvement Rate</span>
                      <span className="font-medium">+7% YoY</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      You're improving 71% faster than the industry average
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Rankings</CardTitle>
                <CardDescription>Your position in industry rankings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q1 2024</span>
                    <div className="flex items-center gap-2">
                      <Badge>15th</Badge>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q4 2023</span>
                    <div className="flex items-center gap-2">
                      <Badge>18th</Badge>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q3 2023</span>
                    <div className="flex items-center gap-2">
                      <Badge>22nd</Badge>
                      <Minus className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q2 2023</span>
                    <div className="flex items-center gap-2">
                      <Badge>21st</Badge>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Improvement Recommendations</CardTitle>
              <CardDescription>
                Priority areas to close the gap with top performers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {improvementAreas.map((area, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{area.area}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {area.recommendation}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          area.impact === "high" ? "destructive" : 
                          area.impact === "medium" ? "secondary" : 
                          "outline"
                        }
                      >
                        {area.impact} impact
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Performance Gap:</span>
                        <span className="font-medium text-red-600">{area.gap}%</span>
                      </div>
                      <Button variant="link" size="sm">
                        View action plan →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Wins</CardTitle>
                <CardDescription>
                  Improvements that can be implemented immediately
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Enable parallel document processing</p>
                      <p className="text-xs text-muted-foreground">
                        Expected improvement: +15% speed
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Implement smart retry logic</p>
                      <p className="text-xs text-muted-foreground">
                        Expected improvement: +8% pass rate
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Add progressive image loading</p>
                      <p className="text-xs text-muted-foreground">
                        Expected improvement: +12% mobile conversion
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategic Initiatives</CardTitle>
                <CardDescription>
                  Long-term improvements for competitive advantage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Implement ML-based risk scoring</p>
                      <p className="text-xs text-muted-foreground">
                        Timeline: 3-4 months • Impact: High
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Build custom biometric solution</p>
                      <p className="text-xs text-muted-foreground">
                        Timeline: 6 months • Impact: Very High
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Develop predictive fraud models</p>
                      <p className="text-xs text-muted-foreground">
                        Timeline: 4-5 months • Impact: High
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}