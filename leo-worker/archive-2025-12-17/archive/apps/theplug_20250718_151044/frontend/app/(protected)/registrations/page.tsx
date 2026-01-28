"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  FileCheck, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Music
} from 'lucide-react'

// Mock data
const mockRegistrations = [
  {
    id: '1',
    songTitle: 'Summer Vibes',
    songArtist: 'Demo Artist',
    platforms: [
      { code: 'mlc', name: 'MLC', status: 'completed', registrationId: 'MLC-2024-001' },
      { code: 'soundexchange', name: 'SoundExchange', status: 'completed', registrationId: 'SE-2024-001' },
      { code: 'ascap', name: 'ASCAP', status: 'completed', registrationId: 'ASCAP-2024-001' },
    ],
    overallStatus: 'completed',
    submittedAt: '2024-06-01T10:00:00Z',
    completedAt: '2024-06-02T15:30:00Z',
    lastUpdated: '2024-06-02T15:30:00Z',
  },
  {
    id: '2',
    songTitle: 'Night Drive',
    songArtist: 'Demo Artist',
    platforms: [
      { code: 'mlc', name: 'MLC', status: 'completed', registrationId: 'MLC-2024-002' },
      { code: 'soundexchange', name: 'SoundExchange', status: 'pending', registrationId: null },
      { code: 'ascap', name: 'ASCAP', status: 'not_started', registrationId: null },
    ],
    overallStatus: 'active',
    submittedAt: '2024-06-15T14:00:00Z',
    completedAt: null,
    lastUpdated: '2024-06-16T09:00:00Z',
  },
  {
    id: '3',
    songTitle: 'Electric Dreams',
    songArtist: 'Demo Artist',
    platforms: [
      { code: 'mlc', name: 'MLC', status: 'failed', registrationId: null, error: 'Invalid metadata' },
      { code: 'soundexchange', name: 'SoundExchange', status: 'not_started', registrationId: null },
      { code: 'ascap', name: 'ASCAP', status: 'not_started', registrationId: null },
    ],
    overallStatus: 'failed',
    submittedAt: '2024-06-10T11:00:00Z',
    completedAt: null,
    lastUpdated: '2024-06-10T11:30:00Z',
    requiresIntervention: true,
  },
  {
    id: '4',
    songTitle: 'Morning Coffee',
    songArtist: 'Demo Artist',
    platforms: [
      { code: 'mlc', name: 'MLC', status: 'pending', registrationId: null },
      { code: 'soundexchange', name: 'SoundExchange', status: 'pending', registrationId: null },
      { code: 'bmi', name: 'BMI', status: 'pending', registrationId: null },
    ],
    overallStatus: 'pending',
    submittedAt: '2024-06-17T08:00:00Z',
    completedAt: null,
    lastUpdated: '2024-06-17T08:00:00Z',
  },
]

export default function RegistrationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
      case 'active':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'requires_review':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <FileCheck className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'active':
        return <Badge variant="warning">Active</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'requires_review':
        return <Badge variant="warning">Requires Review</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getElapsedTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  }

  // Count registrations by status
  const statusCounts = {
    all: mockRegistrations.length,
    active: mockRegistrations.filter(r => r.overallStatus === 'active').length,
    pending: mockRegistrations.filter(r => r.overallStatus === 'pending').length,
    completed: mockRegistrations.filter(r => r.overallStatus === 'completed').length,
    failed: mockRegistrations.filter(r => r.overallStatus === 'failed').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage all your music registrations across platforms
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.all}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{statusCounts.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by song title, artist..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="mlc">MLC</SelectItem>
              <SelectItem value="soundexchange">SoundExchange</SelectItem>
              <SelectItem value="ascap">ASCAP</SelectItem>
              <SelectItem value="bmi">BMI</SelectItem>
              <SelectItem value="sesac">SESAC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Registrations Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Song</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRegistrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                      <Music className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{registration.songTitle}</p>
                      <p className="text-sm text-muted-foreground">{registration.songArtist}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(registration.overallStatus)}
                    {getStatusBadge(registration.overallStatus)}
                  </div>
                  {registration.requiresIntervention && (
                    <p className="text-xs text-orange-500 mt-1">Requires manual review</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {registration.platforms.map((platform) => (
                      <div
                        key={platform.code}
                        className="flex items-center gap-1"
                        title={`${platform.name}: ${platform.status}`}
                      >
                        <span className="text-xs font-medium">{platform.code.toUpperCase()}</span>
                        {platform.status === 'completed' && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                        {platform.status === 'pending' && (
                          <Clock className="h-3 w-3 text-yellow-500" />
                        )}
                        {platform.status === 'failed' && (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        {platform.status === 'not_started' && (
                          <div className="h-3 w-3 rounded-full border border-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getElapsedTime(registration.submittedAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getElapsedTime(registration.lastUpdated)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/registrations/${registration.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {registration.overallStatus === 'failed' && (
                      <Button variant="ghost" size="sm" className="text-orange-500">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}