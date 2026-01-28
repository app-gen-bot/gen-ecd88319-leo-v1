'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Shield, 
  Activity,
  RefreshCw,
  Settings
} from 'lucide-react'
import Link from 'next/link'

const mockPlatformStatus = [
  {
    id: 'mlc',
    name: 'MLC',
    status: 'operational',
    health: 95,
    uptime: 99.99,
    lastIncident: 'None in last 30 days',
    activeConnections: 1247,
    requestsPerMinute: 89,
    maintenanceMode: false,
  },
  {
    id: 'soundexchange',
    name: 'SoundExchange',
    status: 'degraded',
    health: 78,
    uptime: 98.5,
    lastIncident: '2 hours ago - API timeout issues',
    activeConnections: 892,
    requestsPerMinute: 45,
    maintenanceMode: false,
  },
  {
    id: 'ascap',
    name: 'ASCAP',
    status: 'operational',
    health: 92,
    uptime: 99.95,
    lastIncident: '5 days ago - Scheduled maintenance',
    activeConnections: 567,
    requestsPerMinute: 34,
    maintenanceMode: false,
  },
]

export default function AdminPlatformsPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-500'
    if (health >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Admin Notice */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Admin Panel - Platform Status Management</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Status</h1>
            <p className="text-muted-foreground">
              Monitor and manage platform integrations
            </p>
          </div>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Health Check
          </Button>
        </div>

        {/* Overall Status */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">System Status</h3>
                  <p className="text-sm text-muted-foreground">
                    2 of 3 platforms fully operational
                  </p>
                </div>
              </div>
              <Badge variant="warning" className="text-lg px-4 py-2">
                Partial Degradation
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Platform Cards */}
        <div className="grid gap-6">
          {mockPlatformStatus.map((platform) => (
            <Card key={platform.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(platform.status)}
                    <CardTitle>{platform.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`maintenance-${platform.id}`}>Maintenance Mode</Label>
                      <Switch 
                        id={`maintenance-${platform.id}`}
                        checked={platform.maintenanceMode}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Health Score</span>
                        <span className={`text-sm font-bold ${getHealthColor(platform.health)}`}>
                          {platform.health}%
                        </span>
                      </div>
                      <Progress value={platform.health} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Uptime (30 days)</span>
                        <span className="text-sm font-bold">{platform.uptime}%</span>
                      </div>
                      <Progress value={platform.uptime} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Connections</span>
                      <span className="text-sm font-medium">{platform.activeConnections}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Requests/min</span>
                      <span className="text-sm font-medium">{platform.requestsPerMinute}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Incident</span>
                      <span className="text-sm font-medium">{platform.lastIncident}</span>
                    </div>
                  </div>
                </div>
                
                {platform.status === 'degraded' && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Platform experiencing degraded performance. Engineering team is investigating.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Navigation */}
        <div className="mt-8 flex gap-4">
          <Link href="/admin/users">
            <Button variant="outline">User Management</Button>
          </Link>
          <Link href="/admin/registrations">
            <Button variant="outline">Registration Queue</Button>
          </Link>
          <Link href="/admin/escalations">
            <Button variant="outline">Escalations</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}