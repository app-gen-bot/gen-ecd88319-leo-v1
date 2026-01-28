'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ChevronLeft,
  Save,
  X,
  Plus,
  Calendar as CalendarIcon,
  AlertCircle,
  Music
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Mock song data
const mockSong = {
  id: '1',
  title: 'Electric Dreams',
  artist: 'Demo Artist',
  album: 'Future Sounds',
  releaseDate: new Date('2024-01-15'),
  genre: 'Electronic',
  isrc: 'USRC17607839',
  writers: ['Demo Artist', 'Jane Producer'],
  publishers: ['Demo Music Publishing'],
  description: 'An uplifting electronic track with dreamy synths and powerful beats.',
  albumArt: '/placeholder-album.jpg'
}

const genres = [
  'Alternative',
  'Blues',
  'Classical',
  'Country',
  'Electronic',
  'Folk',
  'Hip Hop',
  'Jazz',
  'Latin',
  'Metal',
  'Pop',
  'R&B',
  'Reggae',
  'Rock',
  'Soul',
  'World'
]

export default function EditSongPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: mockSong.title,
    artist: mockSong.artist,
    album: mockSong.album,
    releaseDate: mockSong.releaseDate,
    genre: mockSong.genre,
    isrc: mockSong.isrc,
    description: mockSong.description || ''
  })
  
  const [writers, setWriters] = useState<string[]>(mockSong.writers)
  const [publishers, setPublishers] = useState<string[]>(mockSong.publishers)
  const [newWriter, setNewWriter] = useState('')
  const [newPublisher, setNewPublisher] = useState('')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const addWriter = () => {
    if (newWriter.trim() && !writers.includes(newWriter.trim())) {
      setWriters([...writers, newWriter.trim()])
      setNewWriter('')
      setHasChanges(true)
    }
  }

  const removeWriter = (writer: string) => {
    setWriters(writers.filter(w => w !== writer))
    setHasChanges(true)
  }

  const addPublisher = () => {
    if (newPublisher.trim() && !publishers.includes(newPublisher.trim())) {
      setPublishers([...publishers, newPublisher.trim()])
      setNewPublisher('')
      setHasChanges(true)
    }
  }

  const removePublisher = (publisher: string) => {
    setPublishers(publishers.filter(p => p !== publisher))
    setHasChanges(true)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.artist.trim()) {
      toast.error('Artist is required')
      return
    }
    if (writers.length === 0) {
      toast.error('At least one writer is required')
      return
    }

    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success('Song metadata updated successfully')
    router.push(`/music/${params.id}`)
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push(`/music/${params.id}`)
      }
    } else {
      router.push(`/music/${params.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Song Metadata</h1>
              <p className="text-muted-foreground">Update song information and credits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {hasChanges && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have unsaved changes. Don't forget to save before leaving this page.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core metadata for your song</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Song title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist *</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => handleInputChange('artist', e.target.value)}
                    placeholder="Artist name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="album">Album</Label>
                  <Input
                    id="album"
                    value={formData.album}
                    onChange={(e) => handleInputChange('album', e.target.value)}
                    placeholder="Album name (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select 
                    value={formData.genre} 
                    onValueChange={(value) => handleInputChange('genre', value)}
                  >
                    <SelectTrigger id="genre">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="releaseDate"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.releaseDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.releaseDate ? format(formData.releaseDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.releaseDate}
                        onSelect={(date) => handleInputChange('releaseDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isrc">ISRC</Label>
                  <Input
                    id="isrc"
                    value={formData.isrc}
                    onChange={(e) => handleInputChange('isrc', e.target.value)}
                    placeholder="International Standard Recording Code"
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the song (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Writers */}
          <Card>
            <CardHeader>
              <CardTitle>Writers *</CardTitle>
              <CardDescription>Song writers and composers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {writers.map((writer) => (
                  <Badge key={writer} variant="secondary" className="px-3 py-1">
                    {writer}
                    <button
                      onClick={() => removeWriter(writer)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {writers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No writers added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add writer name"
                  value={newWriter}
                  onChange={(e) => setNewWriter(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWriter())}
                />
                <Button type="button" onClick={addWriter} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Publishers */}
          <Card>
            <CardHeader>
              <CardTitle>Publishers</CardTitle>
              <CardDescription>Music publishers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {publishers.map((publisher) => (
                  <Badge key={publisher} variant="secondary" className="px-3 py-1">
                    {publisher}
                    <button
                      onClick={() => removePublisher(publisher)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {publishers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No publishers added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add publisher name"
                  value={newPublisher}
                  onChange={(e) => setNewPublisher(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPublisher())}
                />
                <Button type="button" onClick={addPublisher} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Album Art */}
          <Card>
            <CardHeader>
              <CardTitle>Album Art</CardTitle>
              <CardDescription>Upload or change album artwork</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <Music className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Button variant="outline">Upload New Image</Button>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 1400x1400px, JPG or PNG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}