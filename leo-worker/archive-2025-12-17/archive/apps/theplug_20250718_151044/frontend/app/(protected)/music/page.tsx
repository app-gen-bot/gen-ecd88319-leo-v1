"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Music, 
  Upload, 
  Search, 
  Filter, 
  MoreVertical, 
  Download,
  Edit,
  Eye,
  FileCheck,
  Trash2,
  Grid,
  List,
  CheckCircle,
  Clock,
  XCircle,
  FileX
} from 'lucide-react'

// Mock data
const mockSongs = [
  {
    id: '1',
    title: 'Summer Vibes',
    artist: 'Demo Artist',
    album: 'Sunset Collection',
    duration: '3:24',
    releaseDate: '2024-06-15',
    albumArt: '/api/placeholder/200/200',
    registrationStatus: 'fully_registered',
    platformStatuses: [
      { platform: 'MLC', status: 'registered' },
      { platform: 'SoundExchange', status: 'registered' },
      { platform: 'ASCAP', status: 'registered' },
    ],
    uploadDate: '2024-06-01',
  },
  {
    id: '2',
    title: 'Night Drive',
    artist: 'Demo Artist',
    album: 'Midnight Sessions',
    duration: '4:12',
    releaseDate: '2024-05-20',
    albumArt: '/api/placeholder/200/200',
    registrationStatus: 'partially_registered',
    platformStatuses: [
      { platform: 'MLC', status: 'registered' },
      { platform: 'SoundExchange', status: 'pending' },
      { platform: 'ASCAP', status: 'not_started' },
    ],
    uploadDate: '2024-05-15',
  },
  {
    id: '3',
    title: 'Electric Dreams',
    artist: 'Demo Artist',
    album: 'Future Sounds',
    duration: '3:45',
    releaseDate: '2024-04-10',
    albumArt: '/api/placeholder/200/200',
    registrationStatus: 'not_registered',
    platformStatuses: [
      { platform: 'MLC', status: 'failed' },
      { platform: 'SoundExchange', status: 'not_started' },
      { platform: 'ASCAP', status: 'not_started' },
    ],
    uploadDate: '2024-04-05',
  },
]

export default function MusicLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fully_registered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'partially_registered':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'not_registered':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileX className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fully_registered':
        return <Badge variant="success">Fully Registered</Badge>
      case 'partially_registered':
        return <Badge variant="warning">Partially Registered</Badge>
      case 'not_registered':
        return <Badge variant="destructive">Not Registered</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPlatformStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'text-green-500'
      case 'pending':
        return 'text-yellow-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    )
  }

  const selectAllSongs = () => {
    if (selectedSongs.length === mockSongs.length) {
      setSelectedSongs([])
    } else {
      setSelectedSongs(mockSongs.map(song => song.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Music</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{mockSongs.length} Total Songs</span>
          <span>•</span>
          <span>1 Fully Registered</span>
          <span>•</span>
          <span>2 Need Action</span>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, artist..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Songs</SelectItem>
              <SelectItem value="fully_registered">Fully Registered</SelectItem>
              <SelectItem value="partially_registered">Partially Registered</SelectItem>
              <SelectItem value="not_registered">Not Registered</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
              <SelectItem value="status">Registration Status</SelectItem>
              <SelectItem value="release">Release Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Link href="/music/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload New Song
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Bulk Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Import from CSV</DropdownMenuItem>
              <DropdownMenuItem>Import from Spotify</DropdownMenuItem>
              <DropdownMenuItem>Import from Apple Music</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            Export Library
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedSongs.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedSongs.length} songs selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Register Selected
            </Button>
            <Button size="sm" variant="outline">
              Export Selected
            </Button>
            <Button size="sm" variant="outline" className="text-destructive">
              Delete Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedSongs([])}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Songs Grid/List */}
      {mockSongs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No songs yet</h3>
            <p className="text-muted-foreground mb-4">Upload your first track to get started!</p>
            <Link href="/music/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Song
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {mockSongs.map((song) => (
            <Card key={song.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedSongs.includes(song.id)}
                    onCheckedChange={() => toggleSongSelection(song.id)}
                    className="mt-1"
                  />
                  <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                    <Music className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{song.title}</CardTitle>
                    <CardDescription className="truncate">{song.artist}</CardDescription>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(song.registrationStatus)}
                      {getStatusBadge(song.registrationStatus)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/music/${song.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/music/${song.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Metadata
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/music/${song.id}/registrations`}>
                          <FileCheck className="mr-2 h-4 w-4" />
                          View Registrations
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{song.duration}</span>
                  <span>{song.uploadDate}</span>
                </div>
                <div className="flex gap-4 mt-3">
                  {song.platformStatuses.map((platform) => (
                    <div key={platform.platform} className="flex items-center gap-1">
                      <span className="text-xs font-medium">{platform.platform}</span>
                      <CheckCircle className={`h-3 w-3 ${getPlatformStatusColor(platform.status)}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {mockSongs.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More (15 remaining)
          </Button>
        </div>
      )}
    </div>
  )
}