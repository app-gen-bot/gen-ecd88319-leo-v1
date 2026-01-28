'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft,
  Edit,
  FileText,
  Music,
  Calendar,
  Clock,
  User,
  Building,
  Hash,
  Globe,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

// Mock song data
const mockSong = {
  id: '1',
  title: 'Electric Dreams',
  artist: 'Demo Artist',
  album: 'Future Sounds',
  releaseDate: '2024-01-15',
  genre: 'Electronic',
  duration: '3:45',
  fileSize: '8.2 MB',
  format: 'MP3',
  bitrate: '320 kbps',
  isrc: 'USRC17607839',
  writers: ['Demo Artist', 'Jane Producer'],
  publishers: ['Demo Music Publishing'],
  uploadDate: '2024-01-10',
  albumArt: '/placeholder-album.jpg',
  registrationStatus: {
    overall: 'partial',
    platforms: {
      mlc: { status: 'completed', date: '2024-01-11' },
      soundexchange: { status: 'completed', date: '2024-01-11' },
      ascap: { status: 'pending', date: null },
      bmi: { status: 'failed', date: '2024-01-12', error: 'Invalid writer information' },
      distributors: { status: 'not_started', date: null }
    }
  },
  revenue: {
    totalProjected: 1250.00,
    lastMonth: 85.50,
    thisMonth: 120.00
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'pending':
      return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />
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

export default function SongDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    // Simulate deletion
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Song deleted successfully')
    router.push('/music')
  }

  const handleDownload = () => {
    toast.success('Download started')
  }

  const completedPlatforms = Object.values(mockSong.registrationStatus.platforms)
    .filter(p => p.status === 'completed').length
  const totalPlatforms = Object.keys(mockSong.registrationStatus.platforms).length
  const completionPercentage = (completedPlatforms / totalPlatforms) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/music">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{mockSong.title}</h1>
              <p className="text-muted-foreground">{mockSong.artist} • {mockSong.album}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/music/${params.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/music/${params.id}/registrations`}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Registrations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Song'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Song Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Album Art and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <Music className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{mockSong.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Format</p>
                        <p className="font-medium">{mockSong.format} • {mockSong.bitrate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">File Size</p>
                        <p className="font-medium">{mockSong.fileSize}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Genre</p>
                        <p className="font-medium">{mockSong.genre}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Release Date</p>
                        <p className="font-medium">{new Date(mockSong.releaseDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ISRC</p>
                        <p className="font-medium font-mono text-sm">{mockSong.isrc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Tabs defaultValue="metadata" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="registrations">Registrations</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>
              
              <TabsContent value="metadata" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credits & Rights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Writers</p>
                      <div className="flex flex-wrap gap-2">
                        {mockSong.writers.map((writer) => (
                          <Badge key={writer} variant="secondary">
                            <User className="h-3 w-3 mr-1" />
                            {writer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Publishers</p>
                      <div className="flex flex-wrap gap-2">
                        {mockSong.publishers.map((publisher) => (
                          <Badge key={publisher} variant="secondary">
                            <Building className="h-3 w-3 mr-1" />
                            {publisher}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">File Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Upload Date</dt>
                        <dd className="font-medium">{new Date(mockSong.uploadDate).toLocaleDateString()}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Audio Format</dt>
                        <dd className="font-medium">{mockSong.format}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Bitrate</dt>
                        <dd className="font-medium">{mockSong.bitrate}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">File Size</dt>
                        <dd className="font-medium">{mockSong.fileSize}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="registrations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Registration Status</CardTitle>
                    <CardDescription>
                      {completedPlatforms} of {totalPlatforms} platforms completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={completionPercentage} className="h-2" />
                    
                    <div className="space-y-3">
                      {Object.entries(mockSong.registrationStatus.platforms).map(([platform, status]) => (
                        <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(status.status)}
                            <div>
                              <p className="font-medium capitalize">{platform}</p>
                              {status.date && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(status.date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status.status)}
                            {status.status === 'failed' && (
                              <Button size="sm" variant="outline">
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">${mockSong.revenue.totalProjected.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total Projected</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${mockSong.revenue.lastMonth.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Last Month</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${mockSong.revenue.thisMonth.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">This Month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/music/${params.id}/registrations`} className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View All Registrations
                  </Button>
                </Link>
                <Link href={`/music/${params.id}/edit`} className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Metadata
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <span className="font-medium text-green-500">{completedPlatforms}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending</span>
                    <span className="font-medium text-yellow-500">
                      {Object.values(mockSong.registrationStatus.platforms).filter(p => p.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed</span>
                    <span className="font-medium text-red-500">
                      {Object.values(mockSong.registrationStatus.platforms).filter(p => p.status === 'failed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}