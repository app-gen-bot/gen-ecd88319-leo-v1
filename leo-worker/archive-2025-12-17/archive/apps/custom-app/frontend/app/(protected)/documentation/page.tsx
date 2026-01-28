'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Camera, 
  Plus, 
  FileText, 
  Clock, 
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Download,
  Share2,
  Calendar,
  Image,
  Video,
  FileAudio,
  MapPin,
  Tag
} from 'lucide-react'
import { format } from 'date-fns'
import { DocumentationSession } from '@/lib/types'

export default function DocumentationPage() {
  const router = useRouter()
  const { user, currentProperty } = useAuth()
  const [sessions, setSessions] = useState<DocumentationSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.documentation.getSessions()
      setSessions(data)
    } catch (err) {
      console.error('Failed to load documentation sessions:', err)
      setError('Failed to load documentation sessions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this documentation session?')) {
      return
    }

    try {
      await apiClient.documentation.deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (err) {
      console.error('Failed to delete session:', err)
      alert('Failed to delete session. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary'
      case 'complete':
        return 'success'
      case 'in_review':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <FileAudio className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Document property conditions and issues with AI-powered analysis
          </p>
        </div>
        <Link href="/documentation/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Documentation
          </Button>
        </Link>
      </div>

      {/* Info Alert */}
      {currentProperty && (
        <Alert>
          <Camera className="h-4 w-4" />
          <AlertDescription>
            Documenting for: <strong>{currentProperty.address}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Sessions Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documentation yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start documenting property conditions to build your evidence library
            </p>
            <Link href="/documentation/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Documentation
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {session.type.charAt(0).toUpperCase() + session.type.slice(1).replace('_', ' ')} Documentation
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(session.created_at), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(session.status) as any}>
                      {session.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/documentation/${session.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/documentation/${session.id}/share`}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/documentation/${session.id}/download`}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(session.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {session.rooms.length} rooms documented • {session.rooms.reduce((acc, room) => acc + room.media.length, 0)} photos/videos
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{session.rooms.filter(r => r.completed).length}/{session.rooms.length} rooms</span>
                  </div>
                  <Progress value={(session.rooms.filter(r => r.completed).length / session.rooms.length) * 100} className="h-2" />
                </div>


                <div className="mt-4">
                  <Link href={`/documentation/${session.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {!isLoading && sessions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.reduce((sum, s) => sum + s.rooms.reduce((acc, room) => acc + room.media.filter(m => m.type === 'photo').length, 0), 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">AI Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.filter(s => s.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Draft Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.filter(s => s.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}