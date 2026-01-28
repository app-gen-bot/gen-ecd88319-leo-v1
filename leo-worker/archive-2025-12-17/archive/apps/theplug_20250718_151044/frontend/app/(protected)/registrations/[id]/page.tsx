"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Music, 
  ExternalLink, 
  Download,
  RefreshCw,
  Share2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronLeft,
  Copy,
  FileText,
  User,
  Building,
  Calendar,
  Hash
} from 'lucide-react'
import { toast } from 'sonner'

// Mock data for a single registration
const mockRegistration = {
  id: '1',
  song: {
    id: 'song-1',
    title: 'Summer Vibes',
    artist: 'Demo Artist',
    album: 'Sunset Collection',
    albumArt: '/api/placeholder/200/200',
    isrc: 'US-ABC-24-00001',
    duration: '3:24',
  },
  overallStatus: 'active',
  platforms: [
    {
      code: 'mlc',
      name: 'MLC',
      status: 'completed',
      timeline: [
        { timestamp: '2024-06-01T10:00:00Z', event: 'Connection Verified', status: 'completed' },
        { timestamp: '2024-06-01T10:05:00Z', event: 'Data Submitted', status: 'completed' },
        { timestamp: '2024-06-01T10:10:00Z', event: 'Processing', status: 'completed' },
        { timestamp: '2024-06-01T11:00:00Z', event: 'Registration Complete', status: 'completed' },
      ],
      registrationId: 'MLC-2024-001',
      submittedAt: '2024-06-01T10:00:00Z',
      completedAt: '2024-06-01T11:00:00Z',
      lastUpdated: '2024-06-01T11:00:00Z',
      estimatedCompletion: null,
      platformUrl: 'https://portal.themlc.com/registrations/MLC-2024-001',
    },
    {
      code: 'soundexchange',
      name: 'SoundExchange',
      status: 'pending',
      timeline: [
        { timestamp: '2024-06-01T10:00:00Z', event: 'Connection Verified', status: 'completed' },
        { timestamp: '2024-06-01T10:05:00Z', event: 'Data Submitted', status: 'completed' },
        { timestamp: '2024-06-01T10:10:00Z', event: 'Processing...', status: 'pending' },
        { timestamp: null, event: 'Registration Complete', status: 'not_started' },
      ],
      registrationId: null,
      submittedAt: '2024-06-01T10:00:00Z',
      completedAt: null,
      lastUpdated: '2024-06-02T09:00:00Z',
      estimatedCompletion: '2024-06-03T10:00:00Z',
      platformUrl: null,
    },
    {
      code: 'ascap',
      name: 'ASCAP',
      status: 'failed',
      timeline: [
        { timestamp: '2024-06-01T10:00:00Z', event: 'Connection Verified', status: 'completed' },
        { timestamp: '2024-06-01T10:05:00Z', event: 'Data Submitted', status: 'completed' },
        { timestamp: '2024-06-01T10:10:00Z', event: 'Processing Failed', status: 'failed' },
      ],
      registrationId: null,
      submittedAt: '2024-06-01T10:00:00Z',
      completedAt: null,
      lastUpdated: '2024-06-01T10:10:00Z',
      estimatedCompletion: null,
      platformUrl: null,
      error: 'Invalid publisher information. Publisher must be registered with ASCAP.',
    },
  ],
  activityLog: [
    { id: '1', timestamp: '2024-06-02T09:00:00Z', platform: 'SoundExchange', action: 'Status Update', message: 'Registration processing continues', status: 'info' },
    { id: '2', timestamp: '2024-06-01T11:00:00Z', platform: 'MLC', action: 'Registration Complete', message: 'Successfully registered with ID: MLC-2024-001', status: 'success' },
    { id: '3', timestamp: '2024-06-01T10:10:00Z', platform: 'ASCAP', action: 'Registration Failed', message: 'Invalid publisher information', status: 'error' },
    { id: '4', timestamp: '2024-06-01T10:05:00Z', platform: 'All', action: 'Data Submitted', message: 'Registration data submitted to all selected platforms', status: 'info' },
    { id: '5', timestamp: '2024-06-01T10:00:00Z', platform: 'All', action: 'Registration Started', message: 'Started registration process for "Summer Vibes"', status: 'info' },
  ],
  humanInterventionRequired: false,
}

export default function RegistrationDetailsPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('mlc')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
    }
  }

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-400" />
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const shareStatus = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success('Status link copied to clipboard')
  }

  const downloadReport = () => {
    toast.success('Downloading registration report...')
    // TODO: Implement PDF download
  }

  return (
    <div className="space-y-6">
      {/* Back Button and Header */}
      <div className="flex items-center gap-4">
        <Link href="/registrations">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Registration Details</h1>
          <p className="text-muted-foreground mt-1">
            Track the progress of your registration across all platforms
          </p>
        </div>
      </div>

      {/* Song Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center">
              <Music className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{mockRegistration.song.title}</CardTitle>
              <CardDescription className="text-base mt-1">
                {mockRegistration.song.artist} • {mockRegistration.song.album}
              </CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  ISRC: {mockRegistration.song.isrc}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {mockRegistration.song.duration}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/music/${mockRegistration.song.id}`}>
                <Button variant="outline" size="sm">
                  View Song
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="h-4 w-4 mr-1" />
                Download Report
              </Button>
              <Button variant="outline" size="sm" onClick={shareStatus}>
                <Share2 className="h-4 w-4 mr-1" />
                Share Status
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Status */}
      <div className="grid gap-4 md:grid-cols-3">
        {mockRegistration.platforms.map((platform) => (
          <Card key={platform.code} className={platform.status === 'failed' ? 'border-destructive' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{platform.name}</CardTitle>
                {getStatusIcon(platform.status)}
              </div>
            </CardHeader>
            <CardContent>
              {platform.registrationId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {platform.registrationId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(platform.registrationId!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {platform.estimatedCompletion && (
                <p className="text-sm text-muted-foreground mt-1">
                  Est. completion: {formatDate(platform.estimatedCompletion)}
                </p>
              )}
              {platform.error && (
                <p className="text-sm text-destructive mt-1">{platform.error}</p>
              )}
              <div className="flex gap-2 mt-3">
                {platform.platformUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={platform.platformUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View on Platform
                    </a>
                  </Button>
                )}
                {platform.status === 'failed' && (
                  <Button variant="outline" size="sm" className="text-orange-500">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Details Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {mockRegistration.platforms.map((platform) => (
                <TabsTrigger key={platform.code} value={platform.code} className="flex items-center gap-2">
                  {platform.name}
                  {platform.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
                  {platform.status === 'pending' && <Clock className="h-3 w-3 text-yellow-500" />}
                  {platform.status === 'failed' && <XCircle className="h-3 w-3 text-red-500" />}
                </TabsTrigger>
              ))}
            </TabsList>
            {mockRegistration.platforms.map((platform) => (
              <TabsContent key={platform.code} value={platform.code} className="space-y-4">
                {/* Status Timeline */}
                <div>
                  <h3 className="font-medium mb-3">Registration Timeline</h3>
                  <div className="space-y-3">
                    {platform.timeline.map((event, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          {getTimelineIcon(event.status)}
                          {index < platform.timeline.length - 1 && (
                            <div className="w-0.5 h-12 bg-muted mt-1" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.event}</p>
                          {event.timestamp && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(event.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Platform Details */}
                <div>
                  <h3 className="font-medium mb-3">Registration Details</h3>
                  <dl className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Platform:</dt>
                      <dd className="font-medium">{platform.name}</dd>
                    </div>
                    {platform.registrationId && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Registration ID:</dt>
                        <dd className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {platform.registrationId}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Submitted:</dt>
                      <dd>{formatDate(platform.submittedAt)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Last Updated:</dt>
                      <dd>{formatDate(platform.lastUpdated)}</dd>
                    </div>
                    {platform.completedAt && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Completed:</dt>
                        <dd>{formatDate(platform.completedAt)}</dd>
                      </div>
                    )}
                    {platform.estimatedCompletion && !platform.completedAt && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Est. Completion:</dt>
                        <dd>{formatDate(platform.estimatedCompletion)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  {platform.platformUrl && (
                    <Button variant="outline" asChild>
                      <a href={platform.platformUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on {platform.name}
                      </a>
                    </Button>
                  )}
                  {platform.status === 'failed' && (
                    <>
                      <Button variant="default">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Registration
                      </Button>
                      <Button variant="outline">
                        Update Info
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            All platform interactions and status updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRegistration.activityLog.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5">
                  {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {activity.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                  {activity.status === 'info' && <AlertCircle className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.platform}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{activity.action}</span>
                    <span className="text-muted-foreground ml-auto">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">{activity.message}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Show More
          </Button>
        </CardContent>
      </Card>

      {/* Human Intervention Panel (if needed) */}
      {mockRegistration.humanInterventionRequired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Manual Review Required</AlertTitle>
          <AlertDescription>
            This registration requires manual review by our support team. We&apos;ll notify you once it&apos;s resolved.
          </AlertDescription>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </Alert>
      )}
    </div>
  )
}