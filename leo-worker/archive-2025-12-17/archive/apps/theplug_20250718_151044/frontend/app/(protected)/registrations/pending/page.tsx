'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search,
  Filter,
  Clock,
  AlertCircle,
  Music,
  ArrowLeft,
  Play,
  Pause,
  ExternalLink
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// Mock data for pending registrations
const mockPendingRegistrations = [
  {
    id: 'reg_6',
    songId: 'song_6',
    songTitle: 'Midnight Echo',
    artist: 'Demo Artist',
    platform: 'MLC',
    queuePosition: 12,
    estimatedStartTime: '2024-01-18T15:30:00Z',
    submittedAt: '2024-01-18T09:00:00Z',
    priority: 'normal',
    reason: 'Waiting in platform queue'
  },
  {
    id: 'reg_7',
    songId: 'song_7',
    songTitle: 'Crystal Waters',
    artist: 'Demo Artist',
    platform: 'ASCAP',
    queuePosition: 45,
    estimatedStartTime: '2024-01-19T10:00:00Z',
    submittedAt: '2024-01-17T14:00:00Z',
    priority: 'normal',
    reason: 'Manual review required'
  },
  {
    id: 'reg_8',
    songId: 'song_8',
    songTitle: 'Solar Flare',
    artist: 'Demo Artist',
    platform: 'BMI',
    queuePosition: 3,
    estimatedStartTime: '2024-01-18T14:00:00Z',
    submittedAt: '2024-01-18T11:00:00Z',
    priority: 'high',
    reason: 'Priority queue - Pro account'
  },
  {
    id: 'reg_9',
    songId: 'song_9',
    songTitle: 'Ocean Drive',
    artist: 'Demo Artist',
    platform: 'Distribution',
    queuePosition: 156,
    estimatedStartTime: '2024-01-20T08:00:00Z',
    submittedAt: '2024-01-16T10:00:00Z',
    priority: 'normal',
    reason: 'High volume period'
  },
  {
    id: 'reg_10',
    songId: 'song_10',
    songTitle: 'Neon Dreams',
    artist: 'Demo Artist',
    platform: 'SoundExchange',
    queuePosition: 28,
    estimatedStartTime: '2024-01-18T18:00:00Z',
    submittedAt: '2024-01-18T08:30:00Z',
    priority: 'normal',
    reason: 'Standard processing queue'
  }
]

const platformColors: Record<string, string> = {
  'MLC': 'bg-blue-500',
  'ASCAP': 'bg-purple-500',
  'BMI': 'bg-green-500',
  'SoundExchange': 'bg-orange-500',
  'Distribution': 'bg-pink-500'
}

const priorityColors: Record<string, string> = {
  'high': 'bg-red-500',
  'normal': 'bg-gray-500',
  'low': 'bg-blue-500'
}

export default function PendingRegistrationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [sortBy, setSortBy] = useState('queue')

  // Filter and sort registrations
  let filteredRegistrations = mockPendingRegistrations.filter(reg => {
    const matchesSearch = reg.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = platformFilter === 'all' || reg.platform === platformFilter
    return matchesSearch && matchesPlatform
  })

  // Sort registrations
  filteredRegistrations = [...filteredRegistrations].sort((a, b) => {
    switch (sortBy) {
      case 'queue':
        return a.queuePosition - b.queuePosition
      case 'submitted':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      case 'start':
        return new Date(a.estimatedStartTime).getTime() - new Date(b.estimatedStartTime).getTime()
      case 'priority':
        const priorityOrder = { high: 0, normal: 1, low: 2 }
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
      default:
        return 0
    }
  })

  const handleStartNow = async (registrationId: string) => {
    toast.success('Registration prioritized and starting...')
  }

  const handlePause = async (registrationId: string) => {
    toast.success('Registration paused')
  }

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
              <h1 className="text-3xl font-bold">Pending Registrations</h1>
              <p className="text-muted-foreground">
                {filteredRegistrations.length} registrations waiting to start
              </p>
            </div>
          </div>
        </div>

        {/* Alert */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Registrations are processed in order based on platform queues and account priority. 
            Pro accounts get faster processing times.
          </AlertDescription>
        </Alert>

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
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="queue">Queue Position</SelectItem>
                  <SelectItem value="submitted">Submitted Time</SelectItem>
                  <SelectItem value="start">Est. Start Time</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pending Registrations List */}
        <div className="space-y-4">
          {filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending registrations found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Queue Position */}
                    <div className="flex items-center justify-center lg:justify-start">
                      <div className="text-center">
                        <p className="text-3xl font-bold">#{registration.queuePosition}</p>
                        <p className="text-sm text-muted-foreground">in queue</p>
                      </div>
                    </div>

                    {/* Song Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{registration.songTitle}</h3>
                          <p className="text-muted-foreground">{registration.artist}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${platformColors[registration.platform]} text-white`}>
                            {registration.platform}
                          </Badge>
                          <Badge variant="outline" className={`${priorityColors[registration.priority]} bg-opacity-10`}>
                            {registration.priority} priority
                          </Badge>
                        </div>
                      </div>

                      {/* Status Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Submitted:</span>
                          <span>{new Date(registration.submittedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Est. Start:</span>
                          <span className="font-medium">{new Date(registration.estimatedStartTime).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Reason:</span>
                          <span>{registration.reason}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center gap-2">
                      <Link href={`/registrations/${registration.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      {registration.priority === 'high' ? (
                        <Button 
                          variant="ghost" 
                          className="w-full"
                          onClick={() => handlePause(registration.id)}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          className="w-full"
                          onClick={() => handleStartNow(registration.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Queue Stats */}
        {filteredRegistrations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Queue Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{filteredRegistrations.length}</p>
                  <p className="text-sm text-muted-foreground">Total Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(filteredRegistrations.reduce((acc, reg) => acc + reg.queuePosition, 0) / filteredRegistrations.length)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Queue Position</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredRegistrations.filter(reg => reg.priority === 'high').length}
                  </p>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredRegistrations.filter(reg => reg.reason.includes('manual')).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Need Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}