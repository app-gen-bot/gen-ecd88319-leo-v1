"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Music, 
  FileCheck, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Upload,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

// Mock data
const mockStats = {
  totalSongs: 24,
  activeRegistrations: 12,
  pendingRegistrations: 5,
  failedRegistrations: 2,
}

const mockMissingRegistrations = 3

const mockRevenueData = [
  { date: 'Jan', amount: 1200 },
  { date: 'Feb', amount: 1800 },
  { date: 'Mar', amount: 2400 },
  { date: 'Apr', amount: 2100 },
  { date: 'May', amount: 2800 },
  { date: 'Jun', amount: 3200 },
]

const mockRecentActivity = [
  {
    id: 1,
    type: 'success',
    song: 'Summer Vibes',
    platform: 'MLC',
    time: '5 minutes ago',
    status: 'completed',
  },
  {
    id: 2,
    type: 'pending',
    song: 'Night Drive',
    platform: 'SoundExchange',
    time: '1 hour ago',
    status: 'pending',
  },
  {
    id: 3,
    type: 'failed',
    song: 'Electric Dreams',
    platform: 'ASCAP',
    time: '2 hours ago',
    status: 'failed',
  },
  {
    id: 4,
    type: 'success',
    song: 'Morning Coffee',
    platform: 'BMI',
    time: '3 hours ago',
    status: 'completed',
  },
]

const mockPlatforms = [
  { 
    name: 'MLC', 
    code: 'mlc',
    status: 'connected', 
    health: 'healthy',
    lastSync: '2 minutes ago' 
  },
  { 
    name: 'SoundExchange', 
    code: 'soundexchange',
    status: 'disconnected', 
    health: 'disconnected',
    lastSync: 'Never' 
  },
  { 
    name: 'Distribution', 
    code: 'distribution',
    status: 'connected', 
    health: 'healthy',
    lastSync: '1 hour ago' 
  },
  { 
    name: 'PROs', 
    code: 'pro',
    status: 'error', 
    health: 'error',
    lastSync: '3 days ago' 
  },
  { 
    name: 'Copyright', 
    code: 'copyright',
    status: 'not_configured', 
    health: 'not_configured',
    lastSync: 'Phase 2' 
  },
]

export default function DashboardPage() {
  const { user } = useUser()
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)
  const [showMissingAlert, setShowMissingAlert] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPlatformStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'disconnected':
      case 'not_configured':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <Alert className="relative">
          <AlertTitle>Welcome, {user?.firstName || 'Artist'}!</AlertTitle>
          <AlertDescription>
            Let&apos;s get your first song registered. Start by uploading your music or connecting your platforms.
          </AlertDescription>
          <div className="mt-4 flex gap-2">
            <Link href="/music/upload">
              <Button size="sm">Upload First Song</Button>
            </Link>
            <Button size="sm" variant="outline">Take a Tour</Button>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setShowWelcomeBanner(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Registration Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/music">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalSongs}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/registrations/active">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Registrations</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.activeRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/registrations/pending">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Registrations</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.pendingRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                Processing now
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/registrations/failed">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Registrations</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{mockStats.failedRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                Needs attention
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Missing Registrations Alert */}
      {showMissingAlert && mockMissingRegistrations > 0 && (
        <Alert variant="destructive" className="relative">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Registrations</AlertTitle>
          <AlertDescription>
            {mockMissingRegistrations} songs are missing important registrations. 
            Review and fix to ensure you don&apos;t miss out on royalties.
          </AlertDescription>
          <div className="mt-4 flex gap-2">
            <Link href="/registrations?filter=missing">
              <Button size="sm" variant="outline">Review and Fix</Button>
            </Link>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowMissingAlert(false)}
            >
              Dismiss for Today
            </Button>
          </div>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Projection Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Projections</CardTitle>
              <Tabs value={timeRange} onValueChange={setTimeRange}>
                <TabsList className="h-8">
                  <TabsTrigger value="30" className="text-xs">30 days</TabsTrigger>
                  <TabsTrigger value="90" className="text-xs">90 days</TabsTrigger>
                  <TabsTrigger value="365" className="text-xs">1 year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projected Revenue</p>
                <p className="text-2xl font-bold">$3,200</p>
              </div>
              <Link href="/analytics/projections">
                <Button variant="outline" size="sm">
                  View Details
                  <BarChart3 className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link href="/registrations">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.song}</span> registered with{' '}
                      <span className="font-medium">{activity.platform}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Link href={`/registrations/${activity.id}`}>
                    <Button variant="ghost" size="sm">
                      {activity.status === 'failed' ? 'Retry' : 'View'}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <Link href="/registrations" className="block mt-4">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Connections</CardTitle>
          <CardDescription>
            Connect and manage your music platform integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {mockPlatforms.map((platform) => (
              <Card key={platform.code} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{platform.name}</CardTitle>
                    <div className={`h-2 w-2 rounded-full ${getPlatformStatusColor(platform.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    {platform.lastSync}
                  </p>
                  {platform.status === 'connected' && (
                    <Link href={`/integrations/${platform.code}/settings`}>
                      <Button size="sm" variant="outline" className="w-full">
                        Manage
                      </Button>
                    </Link>
                  )}
                  {platform.status === 'error' && (
                    <Link href={`/integrations/${platform.code}/settings`}>
                      <Button size="sm" variant="destructive" className="w-full">
                        Fix
                      </Button>
                    </Link>
                  )}
                  {platform.status === 'disconnected' && (
                    <Link href={`/integrations/${platform.code}/connect`}>
                      <Button size="sm" variant="default" className="w-full">
                        Connect
                      </Button>
                    </Link>
                  )}
                  {platform.status === 'not_configured' && (
                    <Button size="sm" variant="secondary" className="w-full" disabled>
                      {platform.lastSync}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/music/upload">
          <Button className="w-full h-24 text-lg" variant="outline">
            <Upload className="mr-2 h-6 w-6" />
            Upload New Song
          </Button>
        </Link>
        <Link href="/registrations">
          <Button className="w-full h-24 text-lg" variant="outline">
            <CheckCircle className="mr-2 h-6 w-6" />
            Check All Registrations
          </Button>
        </Link>
        <Link href="/analytics">
          <Button className="w-full h-24 text-lg" variant="outline">
            <TrendingUp className="mr-2 h-6 w-6" />
            View Analytics
          </Button>
        </Link>
      </div>
    </div>
  )
}