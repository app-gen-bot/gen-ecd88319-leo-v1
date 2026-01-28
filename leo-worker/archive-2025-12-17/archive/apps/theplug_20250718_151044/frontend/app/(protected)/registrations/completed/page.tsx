'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Filter,
  CheckCircle,
  Music,
  ArrowLeft,
  Download,
  ExternalLink,
  Calendar,
  DollarSign
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// Mock data for completed registrations
const mockCompletedRegistrations = [
  {
    id: 'reg_16',
    songId: 'song_16',
    songTitle: 'Sunset Boulevard',
    artist: 'Demo Artist',
    platform: 'MLC',
    completedAt: '2024-01-17T16:30:00Z',
    registrationId: 'MLC-2024-0000456',
    revenue: {
      projected: 150.00,
      actual: 45.50
    },
    platformUrl: 'https://portal.themlc.com/work/123456'
  },
  {
    id: 'reg_17',
    songId: 'song_17',
    songTitle: 'Neon Lights',
    artist: 'Demo Artist',
    platform: 'ASCAP',
    completedAt: '2024-01-16T14:20:00Z',
    registrationId: 'ASCAP-W123456789',
    revenue: {
      projected: 200.00,
      actual: 0
    },
    platformUrl: 'https://www.ascap.com/repertory#/ace/work/123456789'
  },
  {
    id: 'reg_18',
    songId: 'song_18',
    songTitle: 'City Dreams',
    artist: 'Demo Artist',
    platform: 'BMI',
    completedAt: '2024-01-15T10:15:00Z',
    registrationId: 'BMI-987654321',
    revenue: {
      projected: 175.00,
      actual: 22.75
    },
    platformUrl: 'https://repertoire.bmi.com/DetailView.aspx?detail=123456'
  },
  {
    id: 'reg_19',
    songId: 'song_19',
    songTitle: 'Midnight Train',
    artist: 'Demo Artist',
    platform: 'SoundExchange',
    completedAt: '2024-01-14T18:45:00Z',
    registrationId: 'SX-2024-54321',
    revenue: {
      projected: 300.00,
      actual: 125.00
    },
    platformUrl: '#'
  },
  {
    id: 'reg_20',
    songId: 'song_20',
    songTitle: 'Ocean Wave',
    artist: 'Demo Artist',
    platform: 'Distribution',
    completedAt: '2024-01-13T12:00:00Z',
    registrationId: 'DIST-2024-98765',
    revenue: {
      projected: 500.00,
      actual: 250.00
    },
    platformUrl: '#'
  },
  {
    id: 'reg_21',
    songId: 'song_21',
    songTitle: 'Summer Breeze',
    artist: 'Demo Artist',
    platform: 'MLC',
    completedAt: '2024-01-12T09:30:00Z',
    registrationId: 'MLC-2024-0000789',
    revenue: {
      projected: 225.00,
      actual: 180.50
    },
    platformUrl: 'https://portal.themlc.com/work/456789'
  }
]

const platformColors: Record<string, string> = {
  'MLC': 'bg-blue-500',
  'ASCAP': 'bg-purple-500',
  'BMI': 'bg-green-500',
  'SoundExchange': 'bg-orange-500',
  'Distribution': 'bg-pink-500'
}

export default function CompletedRegistrationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Filter and sort registrations
  let filteredRegistrations = mockCompletedRegistrations.filter(reg => {
    const matchesSearch = reg.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = platformFilter === 'all' || reg.platform === platformFilter
    
    // Date filtering
    let matchesDate = true
    if (dateRange !== 'all') {
      const completedDate = new Date(reg.completedAt)
      const now = new Date()
      switch (dateRange) {
        case 'today':
          matchesDate = completedDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = completedDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = completedDate >= monthAgo
          break
      }
    }
    
    return matchesSearch && matchesPlatform && matchesDate
  })

  // Sort registrations
  filteredRegistrations = [...filteredRegistrations].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      case 'oldest':
        return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      case 'revenue':
        return (b.revenue.projected + b.revenue.actual) - (a.revenue.projected + a.revenue.actual)
      case 'platform':
        return a.platform.localeCompare(b.platform)
      default:
        return 0
    }
  })

  const handleDownloadReport = () => {
    toast.success('Registration report downloaded')
  }

  const handleDownloadAll = () => {
    toast.success('Downloading all registration certificates...')
  }

  // Calculate totals
  const totals = filteredRegistrations.reduce((acc, reg) => ({
    projected: acc.projected + reg.revenue.projected,
    actual: acc.actual + reg.revenue.actual
  }), { projected: 0, actual: 0 })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/registrations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Completed Registrations</h1>
              <p className="text-muted-foreground">
                {filteredRegistrations.length} registrations successfully completed
              </p>
            </div>
          </div>
          <Button onClick={handleDownloadAll} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{filteredRegistrations.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">${totals.projected.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Actual Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">${totals.actual.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by song or artist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="MLC">MLC</SelectItem>
                  <SelectItem value="ASCAP">ASCAP</SelectItem>
                  <SelectItem value="BMI">BMI</SelectItem>
                  <SelectItem value="SoundExchange">SoundExchange</SelectItem>
                  <SelectItem value="Distribution">Distribution</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Completed Registrations List */}
        <div className="space-y-4">
          {filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No completed registrations found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Success Icon */}
                    <div className="flex items-center justify-center lg:justify-start">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>

                    {/* Song Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{registration.songTitle}</h3>
                          <p className="text-muted-foreground">{registration.artist}</p>
                        </div>
                        <Badge className={`${platformColors[registration.platform]} text-white`}>
                          {registration.platform}
                        </Badge>
                      </div>

                      {/* Registration Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-medium">{new Date(registration.completedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Registration ID</p>
                          <p className="font-medium font-mono text-xs">{registration.registrationId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Projected</p>
                          <p className="font-medium">${registration.revenue.projected.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Actual</p>
                          <p className="font-medium text-green-600">${registration.revenue.actual.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center gap-2">
                      <Link href={`/registrations/${registration.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      {registration.platformUrl !== '#' ? (
                        <a 
                          href={registration.platformUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button variant="ghost" className="w-full">
                            View on Platform
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        </a>
                      ) : (
                        <Button variant="ghost" className="w-full" disabled>
                          Platform Link Unavailable
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => handleDownloadReport()}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Certificate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}