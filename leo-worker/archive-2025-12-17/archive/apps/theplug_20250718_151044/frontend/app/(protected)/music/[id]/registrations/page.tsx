'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Download,
  Clock,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

// Mock registration data
const mockRegistrations = {
  songTitle: 'Electric Dreams',
  songArtist: 'Demo Artist',
  platforms: {
    mlc: {
      name: 'MLC (Mechanical Licensing Collective)',
      status: 'completed',
      registrationId: 'MLC-2024-0000123',
      submittedDate: '2024-01-11T10:30:00Z',
      completedDate: '2024-01-11T14:45:00Z',
      lastChecked: '2024-01-18T09:00:00Z',
      timeline: [
        { status: 'submitted', date: '2024-01-11T10:30:00Z', message: 'Registration submitted' },
        { status: 'processing', date: '2024-01-11T10:35:00Z', message: 'Processing metadata' },
        { status: 'verified', date: '2024-01-11T12:00:00Z', message: 'Metadata verified' },
        { status: 'completed', date: '2024-01-11T14:45:00Z', message: 'Registration complete' }
      ],
      details: {
        'Work ID': 'W-123456789',
        'Share': '100%',
        'Territory': 'United States',
        'Status': 'Active'
      }
    },
    soundexchange: {
      name: 'SoundExchange',
      status: 'completed',
      registrationId: 'SX-2024-98765',
      submittedDate: '2024-01-11T10:45:00Z',
      completedDate: '2024-01-11T16:20:00Z',
      lastChecked: '2024-01-18T09:00:00Z',
      timeline: [
        { status: 'submitted', date: '2024-01-11T10:45:00Z', message: 'Registration submitted' },
        { status: 'processing', date: '2024-01-11T11:00:00Z', message: 'Validating recording' },
        { status: 'completed', date: '2024-01-11T16:20:00Z', message: 'Registration active' }
      ],
      details: {
        'Recording ID': 'REC-987654321',
        'ISRC': 'USRC17607839',
        'Rights Owner': 'Demo Artist',
        'Status': 'Active'
      }
    },
    ascap: {
      name: 'ASCAP',
      status: 'pending',
      registrationId: 'ASCAP-PENDING-456',
      submittedDate: '2024-01-12T09:00:00Z',
      completedDate: null,
      lastChecked: '2024-01-18T09:00:00Z',
      estimatedCompletion: '2024-01-19T17:00:00Z',
      timeline: [
        { status: 'submitted', date: '2024-01-12T09:00:00Z', message: 'Registration submitted' },
        { status: 'processing', date: '2024-01-12T09:15:00Z', message: 'In review queue' },
        { status: 'pending', date: '2024-01-12T14:00:00Z', message: 'Awaiting manual review' }
      ],
      details: {
        'Queue Position': '45',
        'Estimated Time': '1-2 business days',
        'Reviewer': 'Not assigned'
      }
    },
    bmi: {
      name: 'BMI',
      status: 'failed',
      registrationId: 'BMI-FAILED-789',
      submittedDate: '2024-01-12T10:00:00Z',
      completedDate: '2024-01-12T10:30:00Z',
      lastChecked: '2024-01-18T09:00:00Z',
      error: 'Invalid writer information: Writer "Jane Producer" not found in BMI database',
      timeline: [
        { status: 'submitted', date: '2024-01-12T10:00:00Z', message: 'Registration submitted' },
        { status: 'processing', date: '2024-01-12T10:05:00Z', message: 'Validating writers' },
        { status: 'failed', date: '2024-01-12T10:30:00Z', message: 'Writer validation failed' }
      ],
      details: {
        'Error Code': 'WRITER_NOT_FOUND',
        'Failed Field': 'writers[1]',
        'Resolution': 'Add writer to BMI first'
      }
    },
    distributors: {
      name: 'Distribution Partners',
      status: 'not_started',
      registrationId: null,
      submittedDate: null,
      completedDate: null,
      lastChecked: null,
      timeline: [],
      details: {}
    }
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'pending':
      return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-400" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>
    case 'pending':
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pending</Badge>
    case 'failed':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Failed</Badge>
    default:
      return <Badge variant="secondary">Not Started</Badge>
  }
}

const getTimelineIcon = (status: string) => {
  switch (status) {
    case 'completed':
    case 'verified':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'processing':
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-blue-500" />
  }
}

export default function SongRegistrationsPage({ params }: { params: { id: string } }) {
  const [retryingPlatform, setRetryingPlatform] = useState<string | null>(null)

  const handleRetry = async (platform: string) => {
    setRetryingPlatform(platform)
    // Simulate retry
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success(`Retrying registration with ${platform}`)
    setRetryingPlatform(null)
  }

  const handleRefreshStatus = async () => {
    toast.success('Registration status refreshed')
  }

  const handleDownloadReport = () => {
    toast.success('Registration report downloaded')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/music/${params.id}`}>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Registration Status</h1>
              <p className="text-muted-foreground">
                {mockRegistrations.songTitle} • {mockRegistrations.songArtist}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefreshStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(mockRegistrations.platforms).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(mockRegistrations.platforms).filter(p => p.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(mockRegistrations.platforms).filter(p => p.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {Object.values(mockRegistrations.platforms).filter(p => p.status === 'failed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Tabs */}
        <Tabs defaultValue="mlc" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {Object.entries(mockRegistrations.platforms).map(([key, platform]) => (
              <TabsTrigger key={key} value={key} className="relative">
                <span className="flex items-center gap-2">
                  {key.toUpperCase()}
                  {getStatusIcon(platform.status)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(mockRegistrations.platforms).map(([key, platform]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              {/* Platform Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{platform.name}</CardTitle>
                      <CardDescription>
                        {platform.registrationId ? `Registration ID: ${platform.registrationId}` : 'Not yet registered'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(platform.status)}
                      {platform.status === 'failed' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRetry(key)}
                          disabled={retryingPlatform === key}
                        >
                          {retryingPlatform === key ? 'Retrying...' : 'Retry'}
                        </Button>
                      )}
                      {platform.status === 'completed' && (
                        <Button size="sm" variant="outline" asChild>
                          <a href="#" target="_blank" rel="noopener noreferrer">
                            View on Platform
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Error Alert */}
                  {platform.status === 'failed' && 'error' in platform && platform.error && (
                    <Alert className="mb-6" variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Registration Failed</AlertTitle>
                      <AlertDescription>{platform.error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Platform Details */}
                  {platform.status !== 'not_started' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Timeline */}
                      <div>
                        <h3 className="font-semibold mb-4">Registration Timeline</h3>
                        <div className="space-y-4">
                          {platform.timeline.map((event, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                {getTimelineIcon(event.status)}
                                {index < platform.timeline.length - 1 && (
                                  <div className="w-0.5 h-full bg-border mt-1" />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <p className="font-medium capitalize">{event.status}</p>
                                <p className="text-sm text-muted-foreground">{event.message}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(event.date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          {platform.status === 'pending' && 'estimatedCompletion' in platform && platform.estimatedCompletion && (
                            <div className="flex gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Estimated completion: {new Date(platform.estimatedCompletion).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div>
                        <h3 className="font-semibold mb-4">Registration Details</h3>
                        <dl className="space-y-3">
                          {platform.submittedDate && (
                            <>
                              <div>
                                <dt className="text-sm text-muted-foreground">Submitted</dt>
                                <dd className="font-medium">
                                  {new Date(platform.submittedDate).toLocaleString()}
                                </dd>
                              </div>
                              {platform.completedDate && (
                                <div>
                                  <dt className="text-sm text-muted-foreground">Completed</dt>
                                  <dd className="font-medium">
                                    {new Date(platform.completedDate).toLocaleString()}
                                  </dd>
                                </div>
                              )}
                              {platform.lastChecked && (
                                <div>
                                  <dt className="text-sm text-muted-foreground">Last Checked</dt>
                                  <dd className="font-medium">
                                    {new Date(platform.lastChecked).toLocaleString()}
                                  </dd>
                                </div>
                              )}
                            </>
                          )}
                          {Object.entries(platform.details).map(([key, value]) => (
                            <div key={key}>
                              <dt className="text-sm text-muted-foreground">{key}</dt>
                              <dd className="font-medium">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  )}

                  {/* Not Started State */}
                  {platform.status === 'not_started' && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        This song has not been registered with {platform.name} yet.
                      </p>
                      <Button>Start Registration</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Support Panel */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you're experiencing issues with any registration, our support team is here to help.
            </p>
            <Button variant="outline" asChild>
              <Link href="/help/contact">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}