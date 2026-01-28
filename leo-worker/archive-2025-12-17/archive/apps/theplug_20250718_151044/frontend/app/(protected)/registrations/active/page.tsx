'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle,
  Music,
  ArrowLeft
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock data for active registrations
const mockActiveRegistrations = [
  {
    id: 'reg_1',
    songId: 'song_1',
    songTitle: 'Electric Dreams',
    artist: 'Demo Artist',
    platform: 'MLC',
    status: 'processing',
    progress: 65,
    startedAt: '2024-01-18T10:00:00Z',
    estimatedCompletion: '2024-01-18T16:00:00Z',
    currentStep: 'Validating metadata',
    stepsCompleted: 3,
    totalSteps: 5
  },
  {
    id: 'reg_2',
    songId: 'song_2',
    songTitle: 'Neon Nights',
    artist: 'Demo Artist',
    platform: 'ASCAP',
    status: 'processing',
    progress: 30,
    startedAt: '2024-01-18T11:30:00Z',
    estimatedCompletion: '2024-01-19T09:00:00Z',
    currentStep: 'Submitting to platform',
    stepsCompleted: 2,
    totalSteps: 6
  },
  {
    id: 'reg_3',
    songId: 'song_3',
    songTitle: 'Future Bass',
    artist: 'Demo Artist',
    platform: 'SoundExchange',
    status: 'processing',
    progress: 90,
    startedAt: '2024-01-18T08:00:00Z',
    estimatedCompletion: '2024-01-18T14:00:00Z',
    currentStep: 'Finalizing registration',
    stepsCompleted: 4,
    totalSteps: 4
  },
  {
    id: 'reg_4',
    songId: 'song_4',
    songTitle: 'Synthwave Symphony',
    artist: 'Demo Artist',
    platform: 'BMI',
    status: 'processing',
    progress: 45,
    startedAt: '2024-01-18T09:15:00Z',
    estimatedCompletion: '2024-01-18T18:00:00Z',
    currentStep: 'Processing writer information',
    stepsCompleted: 2,
    totalSteps: 5
  },
  {
    id: 'reg_5',
    songId: 'song_5',
    songTitle: 'Digital Love',
    artist: 'Demo Artist',
    platform: 'Distribution',
    status: 'processing',
    progress: 20,
    startedAt: '2024-01-18T12:00:00Z',
    estimatedCompletion: '2024-01-20T12:00:00Z',
    currentStep: 'Preparing for distribution',
    stepsCompleted: 1,
    totalSteps: 8
  }
]

const platformColors: Record<string, string> = {
  'MLC': 'bg-blue-500',
  'ASCAP': 'bg-purple-500',
  'BMI': 'bg-green-500',
  'SoundExchange': 'bg-orange-500',
  'Distribution': 'bg-pink-500'
}

export default function ActiveRegistrationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Filter and sort registrations
  let filteredRegistrations = mockActiveRegistrations.filter(reg => {
    const matchesSearch = reg.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = platformFilter === 'all' || reg.platform === platformFilter
    return matchesSearch && matchesPlatform
  })

  // Sort registrations
  filteredRegistrations = [...filteredRegistrations].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      case 'progress':
        return b.progress - a.progress
      case 'completion':
        return new Date(a.estimatedCompletion).getTime() - new Date(b.estimatedCompletion).getTime()
      default:
        return 0
    }
  })

  const handleRefresh = () => {
    // Simulate refresh
    // In production, this would refetch data from the API
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
              <h1 className="text-3xl font-bold">Active Registrations</h1>
              <p className="text-muted-foreground">
                {filteredRegistrations.length} registrations currently in progress
              </p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="completion">Completion Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Active Registrations List */}
        <div className="space-y-4">
          {filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active registrations found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
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

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Step {registration.stepsCompleted} of {registration.totalSteps}
                          </span>
                          <span className="font-medium">{registration.progress}%</span>
                        </div>
                        <Progress value={registration.progress} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          {registration.currentStep}
                        </p>
                      </div>

                      {/* Timing Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Started</p>
                          <p className="font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(registration.startedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Est. Completion</p>
                          <p className="font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {new Date(registration.estimatedCompletion).toLocaleTimeString()}
                          </p>
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
                      <Link href={`/music/${registration.songId}`}>
                        <Button variant="ghost" className="w-full">
                          View Song
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {filteredRegistrations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{filteredRegistrations.length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(filteredRegistrations.reduce((acc, reg) => acc + reg.progress, 0) / filteredRegistrations.length)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredRegistrations.filter(reg => reg.progress >= 80).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Near Complete</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Date(Math.min(...filteredRegistrations.map(reg => new Date(reg.estimatedCompletion).getTime()))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-muted-foreground">Next Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}