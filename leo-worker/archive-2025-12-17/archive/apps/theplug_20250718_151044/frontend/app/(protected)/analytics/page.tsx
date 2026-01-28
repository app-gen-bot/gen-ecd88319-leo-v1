"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Music,
  Users,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  FileText,
  Building,
  Zap,
  Globe,
  AlertCircle
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

// Mock data
const revenueData = [
  { month: 'Jan', mlc: 1200, soundexchange: 800, pro: 400, distribution: 600, total: 3000 },
  { month: 'Feb', mlc: 1400, soundexchange: 900, pro: 500, distribution: 700, total: 3500 },
  { month: 'Mar', mlc: 1600, soundexchange: 1000, pro: 600, distribution: 800, total: 4000 },
  { month: 'Apr', mlc: 1500, soundexchange: 1100, pro: 550, distribution: 750, total: 3900 },
  { month: 'May', mlc: 1800, soundexchange: 1200, pro: 700, distribution: 900, total: 4600 },
  { month: 'Jun', mlc: 2000, soundexchange: 1300, pro: 800, distribution: 1000, total: 5100 },
]

const platformBreakdown = [
  { name: 'MLC', value: 2000, percentage: 39.2, color: '#3b82f6' },
  { name: 'SoundExchange', value: 1300, percentage: 25.5, color: '#10b981' },
  { name: 'Distribution', value: 1000, percentage: 19.6, color: '#f59e0b' },
  { name: 'PROs', value: 800, percentage: 15.7, color: '#8b5cf6' },
]

const topSongs = [
  { title: 'Summer Vibes', artist: 'Demo Artist', revenue: 1250, streams: 125000, change: 12.5 },
  { title: 'Night Drive', artist: 'Demo Artist', revenue: 980, streams: 98000, change: -5.2 },
  { title: 'Electric Dreams', artist: 'Demo Artist', revenue: 875, streams: 87500, change: 8.7 },
  { title: 'Morning Coffee', artist: 'Demo Artist', revenue: 650, streams: 65000, change: 15.3 },
  { title: 'Sunset Boulevard', artist: 'Demo Artist', revenue: 545, streams: 54500, change: -2.1 },
]

const projections = [
  { month: 'Jul', projected: 5400, optimistic: 5800, conservative: 5000 },
  { month: 'Aug', projected: 5700, optimistic: 6200, conservative: 5200 },
  { month: 'Sep', projected: 6000, optimistic: 6600, conservative: 5400 },
  { month: 'Oct', projected: 6300, optimistic: 7000, conservative: 5600 },
  { month: 'Nov', projected: 6600, optimistic: 7400, conservative: 5800 },
  { month: 'Dec', projected: 7000, optimistic: 7800, conservative: 6200 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('last-6-months')
  const [platform, setPlatform] = useState('all')

  const totalRevenue = revenueData[revenueData.length - 1].total
  const previousRevenue = revenueData[revenueData.length - 2].total
  const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)

  const totalStreams = topSongs.reduce((acc, song) => acc + song.streams, 0)
  const avgRevenuePerStream = (totalRevenue / totalStreams * 1000).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Revenue tracking and projections across all platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {parseFloat(revenueGrowth) > 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{revenueGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{revenueGrowth}%</span>
                </>
              )}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Songs</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Generating revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalStreams / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/1K Streams</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgRevenuePerStream}</div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue breakdown by platform</CardDescription>
            </div>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="mlc">MLC</SelectItem>
                <SelectItem value="soundexchange">SoundExchange</SelectItem>
                <SelectItem value="pro">PROs</SelectItem>
                <SelectItem value="distribution">Distribution</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorMlc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSoundexchange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDistribution" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              {platform === 'all' ? (
                <>
                  <Area type="monotone" dataKey="mlc" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMlc)" />
                  <Area type="monotone" dataKey="soundexchange" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorSoundexchange)" />
                  <Area type="monotone" dataKey="pro" stackId="1" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPro)" />
                  <Area type="monotone" dataKey="distribution" stackId="1" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDistribution)" />
                </>
              ) : (
                <Area 
                  type="monotone" 
                  dataKey={platform} 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorMlc)" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
            <CardDescription>Revenue distribution across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {platformBreakdown.map((platform) => (
                <div key={platform.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${platform.value.toLocaleString()} ({platform.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Songs */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Songs</CardTitle>
            <CardDescription>By revenue this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSongs.map((song, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-md flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground">{song.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${song.revenue}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {song.change > 0 ? (
                        <>
                          <ArrowUpRight className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">+{song.change}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-3 w-3 text-red-500" />
                          <span className="text-red-500">{song.change}%</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Projections */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Projections</CardTitle>
          <CardDescription>Next 6 months forecast based on current trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Projected"
              />
              <Line 
                type="monotone" 
                dataKey="optimistic" 
                stroke="#10b981" 
                strokeDasharray="5 5"
                name="Optimistic"
              />
              <Line 
                type="monotone" 
                dataKey="conservative" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                name="Conservative"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Key Insights
          </CardTitle>
          <CardDescription>AI-generated insights based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertTitle>Strong Growth Trend</AlertTitle>
              <AlertDescription>
                Your revenue has grown {revenueGrowth}% this month. MLC royalties are your strongest 
                revenue source, contributing 39.2% of total income.
              </AlertDescription>
            </Alert>
            <Alert>
              <Music className="h-4 w-4" />
              <AlertTitle>Top Performer</AlertTitle>
              <AlertDescription>
                &quot;Summer Vibes&quot; is your best performing track, generating ${topSongs[0].revenue} this month with a {topSongs[0].change}% increase from last month.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registration Opportunity</AlertTitle>
              <AlertDescription>
                3 of your songs are not registered with SoundExchange. Completing these registrations 
                could increase your monthly revenue by an estimated 15-20%.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}