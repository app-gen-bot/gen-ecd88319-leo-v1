'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Camera, 
  Upload, 
  X, 
  AlertCircle,
  Info,
  MapPin,
  Calendar,
  Tag,
  Loader2,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Sparkles
} from 'lucide-react'
import { format } from 'date-fns'

interface MediaFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
  description?: string
}

const issueCategories = [
  'Water Damage',
  'Mold',
  'Pest Infestation',
  'Electrical Issues',
  'Plumbing Problems',
  'Structural Damage',
  'HVAC Issues',
  'Security Concerns',
  'General Maintenance',
  'Move-in Condition',
  'Move-out Condition',
  'Other'
]

export default function NewDocumentationPage() {
  const router = useRouter()
  const { currentProperty } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isProcessingAI, setIsProcessingAI] = useState(false)

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const newFiles: MediaFile[] = []
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const preview = URL.createObjectURL(file)
        newFiles.push({
          id: Date.now().toString() + Math.random().toString(),
          file,
          preview,
          type: file.type.startsWith('image/') ? 'image' : 'video',
        })
      }
    })

    setMediaFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setMediaFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const validateStep1 = () => {
    if (!title.trim()) {
      setError('Please enter a title')
      return false
    }
    if (!category) {
      setError('Please select a category')
      return false
    }
    if (!description.trim()) {
      setError('Please enter a description')
      return false
    }
    setError(null)
    return true
  }

  const validateStep2 = () => {
    if (mediaFiles.length === 0) {
      setError('Please upload at least one photo or video')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!currentProperty) {
      setError('No property selected')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create the documentation session
      const sessionData = {
        propertyId: currentProperty.id,
        title,
        description,
        category,
        location,
        date,
        tags,
        mediaCount: mediaFiles.length,
      }

      const session = await apiClient.documentation.createSession(sessionData)

      // Upload media files
      for (const mediaFile of mediaFiles) {
        const formData = new FormData()
        formData.append('file', mediaFile.file)
        formData.append('sessionId', session.id)
        formData.append('description', mediaFile.description || '')
        
        await apiClient.documentation.uploadMedia(session.id, 'general', [mediaFile.file])
      }

      // Trigger AI analysis if requested
      if (isProcessingAI) {
        // In a real app, this would trigger AI analysis
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Navigate to the session details page
      router.push(`/documentation/${session.id}`)
    } catch (err) {
      console.error('Failed to create documentation:', err)
      setError('Failed to create documentation. Please try again.')
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      setError(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Documentation Session</h1>
        <p className="text-muted-foreground mt-2">
          Document property conditions with photos and videos
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {step} of 3</span>
          <span className="text-sm text-muted-foreground">
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Upload Media'}
            {step === 3 && 'Review & Submit'}
          </span>
        </div>
        <Progress value={(step / 3) * 100} />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide details about what you're documenting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                placeholder="e.g., Water leak in bathroom ceiling"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {issueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location in Property</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., Master bedroom"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tags"
                    placeholder="Add tags..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="pl-10"
                  />
                </div>
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload Media */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>
              Add photos and videos to document the condition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Take clear photos from multiple angles. Include close-ups of damage and wide shots for context.
              </AlertDescription>
            </Alert>

            {/* Upload Area */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Support for images and videos up to 50MB each
                </p>
                <Button variant="outline" className="mt-4">
                  <Camera className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
              </label>
            </div>

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Uploaded Files ({mediaFiles.length})</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {mediaFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        {file.type === 'image' ? (
                          <img
                            src={file.preview}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {file.type === 'image' ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Add description..."
                        className="mt-2 text-sm"
                        value={file.description || ''}
                        onChange={(e) => {
                          setMediaFiles(prev => prev.map(f => 
                            f.id === file.id ? { ...f, description: e.target.value } : f
                          ))
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>
                Review your documentation before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Title:</dt>
                      <dd className="font-medium">{title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category:</dt>
                      <dd>{category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location:</dt>
                      <dd>{location || 'Not specified'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Date:</dt>
                      <dd>{format(new Date(date), 'MMMM d, yyyy')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Media Files:</dt>
                      <dd>{mediaFiles.length} files</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                {tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Analysis Option */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">AI Analysis</CardTitle>
                    </div>
                    <Button
                      variant={isProcessingAI ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsProcessingAI(!isProcessingAI)}
                    >
                      {isProcessingAI ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Enabled
                        </>
                      ) : (
                        'Enable'
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI will analyze your photos to detect damage severity, identify potential issues, 
                    and provide recommendations. This helps strengthen your documentation.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={step === 1 ? () => router.push('/documentation') : prevStep}
        >
          {step === 1 ? 'Cancel' : 'Previous'}
        </Button>
        
        {step < 3 ? (
          <Button onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Create Documentation
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}