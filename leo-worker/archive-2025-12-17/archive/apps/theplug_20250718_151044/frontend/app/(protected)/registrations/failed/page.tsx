'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Search,
  Filter,
  XCircle,
  AlertTriangle,
  Music,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  FileText
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// Mock data for failed registrations
const mockFailedRegistrations = [
  {
    id: 'reg_11',
    songId: 'song_11',
    songTitle: 'Broken Beat',
    artist: 'Demo Artist',
    platform: 'BMI',
    failedAt: '2024-01-17T14:30:00Z',
    errorType: 'validation',
    errorCode: 'WRITER_NOT_FOUND',
    errorMessage: 'Writer "Jane Producer" not found in BMI database. Writer must be registered with BMI before song registration.',
    attempts: 3,
    lastAttempt: '2024-01-17T14:30:00Z',
    canRetry: true,
    resolution: 'Register writer with BMI first'
  },
  {
    id: 'reg_12',
    songId: 'song_12',
    songTitle: 'Lost Signal',
    artist: 'Demo Artist',
    platform: 'ASCAP',
    failedAt: '2024-01-16T10:15:00Z',
    errorType: 'duplicate',
    errorCode: 'DUPLICATE_WORK',
    errorMessage: 'This work appears to be already registered under work ID W-987654321.',
    attempts: 1,
    lastAttempt: '2024-01-16T10:15:00Z',
    canRetry: false,
    resolution: 'Verify existing registration or contact support'
  },
  {
    id: 'reg_13',
    songId: 'song_13',
    songTitle: 'Error 404',
    artist: 'Demo Artist',
    platform: 'MLC',
    failedAt: '2024-01-15T16:45:00Z',
    errorType: 'api',
    errorCode: 'API_TIMEOUT',
    errorMessage: 'Connection to MLC API timed out after 30 seconds.',
    attempts: 5,
    lastAttempt: '2024-01-17T09:00:00Z',
    canRetry: true,
    resolution: 'Automatic retry scheduled'
  },
  {
    id: 'reg_14',
    songId: 'song_14',
    songTitle: 'Invalid Data',
    artist: 'Demo Artist',
    platform: 'SoundExchange',
    failedAt: '2024-01-14T11:20:00Z',
    errorType: 'validation',
    errorCode: 'INVALID_ISRC',
    errorMessage: 'ISRC code format is invalid. Expected format: CC-XXX-YY-NNNNN',
    attempts: 2,
    lastAttempt: '2024-01-14T13:00:00Z',
    canRetry: true,
    resolution: 'Fix ISRC format and retry'
  },
  {
    id: 'reg_15',
    songId: 'song_15',
    songTitle: 'Access Denied',
    artist: 'Demo Artist',
    platform: 'Distribution',
    failedAt: '2024-01-13T08:30:00Z',
    errorType: 'auth',
    errorCode: 'AUTH_EXPIRED',
    errorMessage: 'Distribution platform credentials have expired.',
    attempts: 1,
    lastAttempt: '2024-01-13T08:30:00Z',
    canRetry: true,
    resolution: 'Update platform credentials'
  }
]

const errorTypeColors: Record<string, string> = {
  'validation': 'bg-yellow-500',
  'duplicate': 'bg-purple-500',
  'api': 'bg-red-500',
  'auth': 'bg-orange-500'
}

const platformColors: Record<string, string> = {
  'MLC': 'bg-blue-500',
  'ASCAP': 'bg-purple-500',
  'BMI': 'bg-green-500',
  'SoundExchange': 'bg-orange-500',
  'Distribution': 'bg-pink-500'
}

export default function FailedRegistrationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [errorTypeFilter, setErrorTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [retryingIds, setRetryingIds] = useState<string[]>([])

  // Filter and sort registrations
  let filteredRegistrations = mockFailedRegistrations.filter(reg => {
    const matchesSearch = reg.songTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = platformFilter === 'all' || reg.platform === platformFilter
    const matchesErrorType = errorTypeFilter === 'all' || reg.errorType === errorTypeFilter
    return matchesSearch && matchesPlatform && matchesErrorType
  })

  // Sort registrations
  filteredRegistrations = [...filteredRegistrations].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime()
      case 'attempts':
        return b.attempts - a.attempts
      case 'platform':
        return a.platform.localeCompare(b.platform)
      default:
        return 0
    }
  })

  const handleRetry = async (registrationId: string) => {
    setRetryingIds([...retryingIds, registrationId])
    // Simulate retry
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRetryingIds(retryingIds.filter(id => id !== registrationId))
    toast.success('Registration retry started')
  }

  const handleRetryAll = async () => {
    const retryableRegs = filteredRegistrations.filter(reg => reg.canRetry)
    toast.success(`Retrying ${retryableRegs.length} registrations`)
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
              <h1 className="text-3xl font-bold">Failed Registrations</h1>
              <p className="text-muted-foreground">
                {filteredRegistrations.length} registrations need attention
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRetryAll}
            disabled={filteredRegistrations.filter(reg => reg.canRetry).length === 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry All
          </Button>
        </div>

        {/* Alert */}
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            These registrations failed and require your attention. Some can be retried automatically, 
            while others need manual intervention.
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
              <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Error Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Error Types</SelectItem>
                  <SelectItem value="validation">Validation Errors</SelectItem>
                  <SelectItem value="duplicate">Duplicates</SelectItem>
                  <SelectItem value="api">API Errors</SelectItem>
                  <SelectItem value="auth">Auth Errors</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="attempts">Retry Attempts</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Failed Registrations List */}
        <div className="space-y-4">
          {filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No failed registrations found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-lg transition-shadow border-red-200">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{registration.songTitle}</h3>
                        <p className="text-muted-foreground">{registration.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${platformColors[registration.platform]} text-white`}>
                          {registration.platform}
                        </Badge>
                        <Badge variant="outline" className={`${errorTypeColors[registration.errorType]} bg-opacity-10`}>
                          {registration.errorType}
                        </Badge>
                      </div>
                    </div>

                    {/* Error Details */}
                    <Alert variant="destructive" className="bg-red-50 border-red-200">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Error: {registration.errorCode}</AlertTitle>
                      <AlertDescription>{registration.errorMessage}</AlertDescription>
                    </Alert>

                    {/* Resolution */}
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Recommended Resolution:</p>
                      <p className="text-sm text-muted-foreground">{registration.resolution}</p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Failed At</p>
                        <p className="font-medium">{new Date(registration.failedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Attempts</p>
                        <p className="font-medium">{registration.attempts}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Attempt</p>
                        <p className="font-medium">{new Date(registration.lastAttempt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Can Retry</p>
                        <p className="font-medium">{registration.canRetry ? 'Yes' : 'No'}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/registrations/${registration.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      {registration.canRetry && (
                        <Button 
                          className="flex-1"
                          onClick={() => handleRetry(registration.id)}
                          disabled={retryingIds.includes(registration.id)}
                        >
                          {retryingIds.includes(registration.id) ? (
                            <>Retrying...</>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry Registration
                            </>
                          )}
                        </Button>
                      )}
                      <Link href="/help/contact" className="flex-1">
                        <Button variant="ghost" className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact Support
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Error Summary */}
        {filteredRegistrations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Error Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-red-600">{filteredRegistrations.length}</p>
                  <p className="text-sm text-muted-foreground">Total Failed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredRegistrations.filter(reg => reg.canRetry).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Can Retry</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredRegistrations.filter(reg => reg.errorType === 'validation').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Validation Errors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredRegistrations.filter(reg => reg.errorType === 'duplicate').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Duplicates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}