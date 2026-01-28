"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Upload, 
  Music, 
  X, 
  Check,
  AlertCircle,
  FileAudio,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface FileWithMetadata {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  metadata?: {
    title: string
    artist: string
    album: string
    releaseDate: string
    genre: string
    writers: string[]
    publishers: string[]
    isrc: string
  }
}

const genres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 
  'Jazz', 'Classical', 'Latin', 'Alternative', 'Indie', 'Other'
]

const platforms = [
  { id: 'mlc', name: 'MLC (Mechanical Licensing)', checked: true },
  { id: 'soundexchange', name: 'SoundExchange (Digital Performance)', checked: true },
  { id: 'pro', name: 'PROs (ASCAP/BMI/SESAC)', checked: true },
  { id: 'distribution', name: 'Distribution Partners', checked: true },
  { id: 'copyright', name: 'Copyright Office', checked: false, disabled: true, badge: 'Phase 2' },
]

export default function UploadMusicPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<FileWithMetadata[]>([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    platforms.filter(p => p.checked && !p.disabled).map(p => p.id)
  )
  const [registrationTiming, setRegistrationTiming] = useState('immediate')
  const [scheduledDate, setScheduledDate] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending' as const,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Demo Artist',
        album: '',
        releaseDate: new Date().toISOString().split('T')[0],
        genre: '',
        writers: [''],
        publishers: [''],
        isrc: '',
      }
    }))
    setFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload progress
    newFiles.forEach((fileData, index) => {
      setTimeout(() => {
        simulateUpload(fileData.id)
      }, index * 1000)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.aac']
    },
    maxFiles: 10,
    maxSize: 500 * 1024 * 1024 // 500MB
  })

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          if (f.progress >= 100) {
            clearInterval(interval)
            return { ...f, status: 'processing' }
          }
          return { ...f, status: 'uploading', progress: f.progress + 10 }
        }
        return f
      }))
    }, 500)

    // Simulate processing completion
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'complete' } : f
      ))
    }, 8000)
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const updateMetadata = (fileId: string, field: string, value: any) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId && f.metadata) {
        return {
          ...f,
          metadata: {
            ...f.metadata,
            [field]: value
          }
        }
      }
      return f
    }))
  }

  const handleNext = () => {
    if (step === 1 && files.length === 0) {
      toast.error('Please upload at least one file')
      return
    }
    if (step === 2 && currentFileIndex < files.length - 1) {
      setCurrentFileIndex(prev => prev + 1)
    } else {
      setStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    if (step === 2 && currentFileIndex > 0) {
      setCurrentFileIndex(prev => prev - 1)
    } else {
      setStep(prev => Math.max(prev - 1, 1))
      if (step === 2) {
        setCurrentFileIndex(0)
      }
    }
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    toast.success('Upload complete! Starting registration process...')
    router.push('/music')
  }

  const currentFile = files[currentFileIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Music</h1>
        <p className="text-muted-foreground mt-2">
          Upload your tracks and we&apos;ll handle registration across all platforms
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Upload Files', 'Review Metadata', 'Registration Options'].map((label, index) => (
          <div key={index} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              ${step > index + 1 ? 'bg-primary text-primary-foreground' : 
                step === index + 1 ? 'bg-primary text-primary-foreground' : 
                'bg-muted text-muted-foreground'}
            `}>
              {step > index + 1 ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            <span className={`ml-2 text-sm ${step >= index + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
            {index < 2 && (
              <div className={`w-12 h-0.5 mx-4 ${step > index + 1 ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: File Upload */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Drop your audio files here or click to browse. Accepted formats: MP3, WAV, FLAC, M4A, AAC
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">
                {isDragActive ? 'Drop the files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <Button variant="outline">Choose Files</Button>
              <p className="text-xs text-muted-foreground mt-4">
                Maximum 10 files, up to 500MB each
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((fileData) => (
                  <div key={fileData.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileAudio className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {fileData.status === 'pending' && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      {fileData.status === 'uploading' && (
                        <div className="flex items-center gap-2">
                          <Progress value={fileData.progress} className="w-20" />
                          <span className="text-xs text-muted-foreground">{fileData.progress}%</span>
                        </div>
                      )}
                      {fileData.status === 'processing' && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <Badge>Processing</Badge>
                        </div>
                      )}
                      {fileData.status === 'complete' && (
                        <Badge variant="success">Ready</Badge>
                      )}
                      {fileData.status === 'error' && (
                        <Badge variant="destructive">Error</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(fileData.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Metadata Review */}
      {step === 2 && currentFile && (
        <Card>
          <CardHeader>
            <CardTitle>Review Metadata</CardTitle>
            <CardDescription>
              File {currentFileIndex + 1} of {files.length}: {currentFile.file.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={currentFile.metadata?.title || ''}
                  onChange={(e) => updateMetadata(currentFile.id, 'title', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist *</Label>
                <Input
                  id="artist"
                  value={currentFile.metadata?.artist || ''}
                  onChange={(e) => updateMetadata(currentFile.id, 'artist', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="album">Album</Label>
                <Input
                  id="album"
                  value={currentFile.metadata?.album || ''}
                  onChange={(e) => updateMetadata(currentFile.id, 'album', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={currentFile.metadata?.releaseDate || ''}
                  onChange={(e) => updateMetadata(currentFile.id, 'releaseDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={currentFile.metadata?.genre || ''}
                  onValueChange={(value) => updateMetadata(currentFile.id, 'genre', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isrc">ISRC</Label>
                <Input
                  id="isrc"
                  value={currentFile.metadata?.isrc || ''}
                  onChange={(e) => updateMetadata(currentFile.id, 'isrc', e.target.value)}
                  placeholder="Leave empty to auto-generate"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Writers</Label>
              <div className="space-y-2">
                {currentFile.metadata?.writers.map((writer, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={writer}
                      onChange={(e) => {
                        const newWriters = [...(currentFile.metadata?.writers || [])]
                        newWriters[index] = e.target.value
                        updateMetadata(currentFile.id, 'writers', newWriters)
                      }}
                      placeholder="Writer name"
                    />
                    {index === (currentFile.metadata?.writers?.length || 0) - 1 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          updateMetadata(currentFile.id, 'writers', [...(currentFile.metadata?.writers || []), ''])
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Publishers</Label>
              <div className="space-y-2">
                {currentFile.metadata?.publishers.map((publisher, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={publisher}
                      onChange={(e) => {
                        const newPublishers = [...(currentFile.metadata?.publishers || [])]
                        newPublishers[index] = e.target.value
                        updateMetadata(currentFile.id, 'publishers', newPublishers)
                      }}
                      placeholder="Publisher name"
                    />
                    {index === (currentFile.metadata?.publishers?.length || 0) - 1 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          updateMetadata(currentFile.id, 'publishers', [...(currentFile.metadata?.publishers || []), ''])
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-extract Metadata
              </Button>
              {files.length > 1 && (
                <Button variant="outline" size="sm">
                  Copy to All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Registration Options */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Selection</CardTitle>
              <CardDescription>
                Choose which platforms to register your music with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlatforms(prev => [...prev, platform.id])
                        } else {
                          setSelectedPlatforms(prev => prev.filter(p => p !== platform.id))
                        }
                      }}
                      disabled={platform.disabled}
                    />
                    <Label
                      htmlFor={platform.id}
                      className={`font-medium ${platform.disabled ? 'text-muted-foreground' : ''}`}
                    >
                      {platform.name}
                    </Label>
                    {platform.badge && (
                      <Badge variant="secondary">{platform.badge}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration Timing</CardTitle>
              <CardDescription>
                When should we start the registration process?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="timing"
                  value="immediate"
                  checked={registrationTiming === 'immediate'}
                  onChange={(e) => setRegistrationTiming(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium">Register Immediately</p>
                  <p className="text-sm text-muted-foreground">Start registration as soon as upload completes</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="timing"
                  value="draft"
                  checked={registrationTiming === 'draft'}
                  onChange={(e) => setRegistrationTiming(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium">Save as Draft</p>
                  <p className="text-sm text-muted-foreground">Upload files but don&apos;t register yet</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="timing"
                  value="scheduled"
                  checked={registrationTiming === 'scheduled'}
                  onChange={(e) => setRegistrationTiming(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">Schedule for Later</p>
                  <p className="text-sm text-muted-foreground mb-2">Set a specific date and time</p>
                  {registrationTiming === 'scheduled' && (
                    <Input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="max-w-xs"
                    />
                  )}
                </div>
              </label>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          {step < 3 && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
                    router.push('/music')
                  }
                }}
              >
                Cancel
              </Button>
              {step === 1 && (
                <Button variant="outline" onClick={() => router.push('/music')}>
                  Save as Draft
                </Button>
              )}
              <Button onClick={handleNext}>
                {step === 2 && currentFileIndex < files.length - 1 ? 'Next File' : 'Next'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => router.push('/music')}>
                Save as Draft
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isProcessing || selectedPlatforms.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upload & Register'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}