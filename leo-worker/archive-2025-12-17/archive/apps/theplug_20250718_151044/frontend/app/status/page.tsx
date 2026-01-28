"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Activity,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'outage'
  uptime: number
  responseTime: number
  lastChecked: string
}

const mockServices: ServiceStatus[] = [
  {
    name: 'Web Application',
    status: 'operational',
    uptime: 99.99,
    responseTime: 142,
    lastChecked: '1 minute ago',
  },
  {
    name: 'API Service',
    status: 'operational',
    uptime: 99.98,
    responseTime: 89,
    lastChecked: '1 minute ago',
  },
  {
    name: 'MLC Integration',
    status: 'operational',
    uptime: 99.95,
    responseTime: 523,
    lastChecked: '2 minutes ago',
  },
  {
    name: 'SoundExchange Integration',
    status: 'degraded',
    uptime: 98.5,
    responseTime: 1823,
    lastChecked: '1 minute ago',
  },
  {
    name: 'Distribution Partners',
    status: 'operational',
    uptime: 99.97,
    responseTime: 234,
    lastChecked: '3 minutes ago',
  },
  {
    name: 'PRO Integrations',
    status: 'operational',
    uptime: 99.92,
    responseTime: 445,
    lastChecked: '2 minutes ago',
  },
  {
    name: 'File Processing',
    status: 'operational',
    uptime: 99.99,
    responseTime: 67,
    lastChecked: '1 minute ago',
  },
  {
    name: 'Database',
    status: 'operational',
    uptime: 100,
    responseTime: 12,
    lastChecked: '1 minute ago',
  },
]

const mockIncidents = [
  {
    id: 1,
    title: 'SoundExchange API Slowdown',
    status: 'investigating',
    severity: 'minor',
    startTime: '2024-01-15 14:30 UTC',
    updates: [
      {
        time: '14:45 UTC',
        message: 'We are investigating reports of slow response times from SoundExchange API.',
      },
      {
        time: '14:30 UTC',
        message: 'Some users may experience delays when registering with SoundExchange.',
      },
    ],
  },
]

export default function StatusPage() {
  const [services, setServices] = useState(mockServices)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500'
      case 'degraded':
        return 'bg-yellow-500'
      case 'outage':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getOverallStatus = () => {
    const hasOutage = services.some(s => s.status === 'outage')
    const hasDegraded = services.some(s => s.status === 'degraded')
    
    if (hasOutage) return { text: 'Major Outage', color: 'destructive' }
    if (hasDegraded) return { text: 'Partial Outage', color: 'warning' }
    return { text: 'All Systems Operational', color: 'success' }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastRefresh(new Date())
      // In a real app, this would fetch fresh data
    }, 1000)
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">System Status</h1>
            <p className="text-muted-foreground">
              Real-time status of The Plug services and integrations
            </p>
          </div>

          {/* Overall Status */}
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <Badge 
                  variant={overallStatus.color as any}
                  className="text-lg px-4 py-2"
                >
                  {overallStatus.text}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Incidents */}
          {mockIncidents.length > 0 && (
            <Card className="border-yellow-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Active Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mockIncidents.map((incident) => (
                  <div key={incident.id} className="space-y-4">
                    <div>
                      <h3 className="font-medium">{incident.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {incident.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Started: {incident.startTime}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 pl-4 border-l-2">
                      {incident.updates.map((update, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-muted-foreground">
                            {update.time}
                          </p>
                          <p>{update.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Service Status Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                Individual service health and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Last checked: {service.lastChecked}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm font-medium">{service.uptime}%</p>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{service.responseTime}ms</p>
                        <p className="text-xs text-muted-foreground">Response</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Uptime Statistics */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.97%</div>
                <Progress value={99.97} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Last 90 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  267ms
                  <TrendingDown className="h-4 w-4 text-green-500" />
                </div>
                <Progress value={73} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">15% faster than last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <Progress value={10} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Subscribe to Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Stay Updated</CardTitle>
              <CardDescription>
                Get notified about system status changes and planned maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline">
                  Subscribe to Updates
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  View Maintenance Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 The Plug. All rights reserved. Powered by PlanetScale.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}