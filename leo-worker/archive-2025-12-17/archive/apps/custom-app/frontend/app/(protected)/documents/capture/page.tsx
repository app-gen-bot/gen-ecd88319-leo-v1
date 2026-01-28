'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Camera, 
  Video, 
  X, 
  Check, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Flashlight,
  RotateCcw,
  Upload,
  AlertCircle,
  Info
} from 'lucide-react'

const rooms = [
  'Living Room',
  'Kitchen',
  'Master Bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Master Bathroom',
  'Bathroom 2',
  'Dining Room',
  'Garage',
  'Basement',
  'Attic',
  'Hallway',
  'Entrance',
  'Backyard',
  'Front Yard',
  'Other'
]

interface CapturedMedia {
  id: string
  type: 'photo' | 'video'
  blob: Blob
  url: string
  room: string
  timestamp: Date
  issues?: DetectedIssue[]
  notes?: string
}

interface DetectedIssue {
  id: string
  description: string
  severity: 'minor' | 'moderate' | 'severe'
  bbox?: { x: number; y: number; width: number; height: number }
}

export default function DocumentCaptureePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, currentProperty } = useAuth()
  
  const propertyId = searchParams.get('propertyId')
  const documentationType = searchParams.get('type') || 'move_in'
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isCapturing, setIsCapturing] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(rooms[0])
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([])
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: cameraMode === 'video'
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
        }
      } catch (err) {
        console.error('Failed to access camera:', err)
        toast.error('Failed to access camera. Please check permissions.')
      }
    }

    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraMode])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0)
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return
      
      const url = URL.createObjectURL(blob)
      const media: CapturedMedia = {
        id: Date.now().toString(),
        type: 'photo',
        blob,
        url,
        room: selectedRoom,
        timestamp: new Date(),
        issues: []
      }
      
      // Simulate AI detection (in real app, this would be an API call)
      setIsProcessing(true)
      setTimeout(() => {
        // Mock detected issues
        if (Math.random() > 0.5) {
          media.issues = [
            {
              id: '1',
              description: 'Water stain detected on ceiling',
              severity: 'moderate',
              bbox: { x: 100, y: 50, width: 200, height: 150 }
            }
          ]
        }
        
        setCapturedMedia(prev => [...prev, media])
        setCurrentMediaIndex(capturedMedia.length)
        setIsProcessing(false)
        setIsCapturing(false)
        
        toast.success('Photo captured successfully')
      }, 1500)
    }, 'image/jpeg', 0.9)
  }, [selectedRoom, capturedMedia.length])

  const startVideoRecording = useCallback(async () => {
    if (!streamRef.current) return

    setIsRecording(true)
    recordingChunksRef.current = []
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm'
    })
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingChunksRef.current.push(event.data)
      }
    }
    
    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordingChunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      
      const media: CapturedMedia = {
        id: Date.now().toString(),
        type: 'video',
        blob,
        url,
        room: selectedRoom,
        timestamp: new Date(),
        issues: []
      }
      
      setCapturedMedia(prev => [...prev, media])
      setCurrentMediaIndex(capturedMedia.length)
      setIsRecording(false)
      setRecordingDuration(0)
      
      toast.success('Video recorded successfully')
    }
    
    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    
    // Start duration counter
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1)
    }, 1000)
  }, [selectedRoom, capturedMedia.length])

  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const handleCapture = () => {
    if (cameraMode === 'photo') {
      capturePhoto()
    } else {
      if (isRecording) {
        stopVideoRecording()
      } else {
        startVideoRecording()
      }
    }
  }

  const deleteMedia = (id: string) => {
    setCapturedMedia(prev => {
      const newMedia = prev.filter(m => m.id !== id)
      if (currentMediaIndex !== null && currentMediaIndex >= newMedia.length) {
        setCurrentMediaIndex(newMedia.length - 1)
      }
      return newMedia
    })
    toast.success('Media deleted')
  }

  const saveAndContinue = async () => {
    if (capturedMedia.length === 0) {
      toast.error('Please capture at least one photo or video')
      return
    }

    // In real app, upload media and save to backend
    toast.success(`${capturedMedia.length} items saved for ${selectedRoom}`)
    
    // Move to next room or finish
    const currentRoomIndex = rooms.indexOf(selectedRoom)
    if (currentRoomIndex < rooms.length - 1) {
      setSelectedRoom(rooms[currentRoomIndex + 1])
      setCapturedMedia([])
      setCurrentMediaIndex(null)
    } else {
      // All rooms completed
      router.push(`/documents/property/${propertyId}?completed=true`)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                Document {documentationType === 'move_in' ? 'Move-In' : documentationType === 'move_out' ? 'Move-Out' : 'Property'} Condition
              </h1>
              <p className="text-sm text-white/60">{currentProperty?.address}</p>
            </div>
          </div>
          
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rooms.map(room => (
                <SelectItem key={room} value={room}>
                  {room}
                  {capturedMedia.filter(m => m.room === room).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {capturedMedia.filter(m => m.room === room).length}
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative h-screen pt-20">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-full w-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            Recording {formatDuration(recordingDuration)}
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          {/* Camera Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex gap-1">
              <Button
                size="sm"
                variant={cameraMode === 'photo' ? 'default' : 'ghost'}
                onClick={() => setCameraMode('photo')}
                className="rounded-full"
              >
                <Camera className="h-4 w-4 mr-1" />
                Photo
              </Button>
              <Button
                size="sm"
                variant={cameraMode === 'video' ? 'default' : 'ghost'}
                onClick={() => setCameraMode('video')}
                className="rounded-full"
              >
                <Video className="h-4 w-4 mr-1" />
                Video
              </Button>
            </div>
          </div>

          {/* Capture Controls */}
          <div className="flex items-center justify-center gap-6 mb-4">
            {/* Gallery */}
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => setCurrentMediaIndex(capturedMedia.length - 1)}
              disabled={capturedMedia.length === 0}
            >
              <div className="relative">
                <Upload className="h-6 w-6" />
                {capturedMedia.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {capturedMedia.length}
                  </Badge>
                )}
              </div>
            </Button>

            {/* Capture Button */}
            <Button
              size="icon"
              onClick={handleCapture}
              disabled={isCapturing || isProcessing}
              className={`h-20 w-20 rounded-full ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-white hover:bg-white/90'
              }`}
            >
              {isCapturing || isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin text-black" />
              ) : cameraMode === 'video' && isRecording ? (
                <div className="h-6 w-6 bg-black rounded-sm" />
              ) : cameraMode === 'video' ? (
                <Video className="h-8 w-8 text-black" />
              ) : (
                <Camera className="h-8 w-8 text-black" />
              )}
            </Button>

            {/* Options */}
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3x3 className={`h-6 w-6 ${showGrid ? 'text-primary' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setFlashEnabled(!flashEnabled)}
              >
                <Flashlight className={`h-6 w-6 ${flashEnabled ? 'text-primary' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setCapturedMedia([])}
              className="text-white hover:bg-white/10"
              disabled={capturedMedia.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Room
            </Button>
            
            <Button
              onClick={saveAndContinue}
              className="bg-primary text-primary-foreground"
              disabled={capturedMedia.length === 0}
            >
              {rooms.indexOf(selectedRoom) < rooms.length - 1 ? 'Next Room' : 'Finish'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Hidden Canvas for Photo Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Media Review Modal */}
      {currentMediaIndex !== null && capturedMedia[currentMediaIndex] && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="flex flex-col h-full">
            {/* Review Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Review Capture</h2>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMedia(capturedMedia[currentMediaIndex].id)}
                  className="text-red-500 hover:bg-red-500/10"
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setCurrentMediaIndex(null)}
                  className="text-white hover:bg-white/10"
                >
                  <Check className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Media Display */}
            <div className="flex-1 relative">
              {capturedMedia[currentMediaIndex].type === 'photo' ? (
                <img
                  src={capturedMedia[currentMediaIndex].url}
                  alt="Captured"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={capturedMedia[currentMediaIndex].url}
                  controls
                  className="w-full h-full"
                />
              )}

              {/* Detected Issues Overlay */}
              {capturedMedia[currentMediaIndex].issues?.map(issue => (
                <div
                  key={issue.id}
                  className="absolute border-2 border-red-500"
                  style={{
                    left: issue.bbox?.x,
                    top: issue.bbox?.y,
                    width: issue.bbox?.width,
                    height: issue.bbox?.height
                  }}
                >
                  <Badge 
                    variant={issue.severity === 'severe' ? 'destructive' : 'secondary'}
                    className="absolute -top-6 left-0"
                  >
                    {issue.description}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Issue Details */}
            <div className="p-4 border-t border-white/10 bg-black/80">
              {capturedMedia[currentMediaIndex].issues && capturedMedia[currentMediaIndex].issues!.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">AI Detected {capturedMedia[currentMediaIndex].issues!.length} Potential Issue(s)</span>
                  </div>
                  {capturedMedia[currentMediaIndex].issues!.map(issue => (
                    <div key={issue.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{issue.description}</span>
                        <Badge 
                          variant={
                            issue.severity === 'severe' ? 'destructive' : 
                            issue.severity === 'moderate' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="h-5 w-5" />
                  <span>No issues detected</span>
                </div>
              )}

              {/* Add Notes */}
              <Textarea
                placeholder="Add notes about this capture..."
                className="mt-4 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                value={capturedMedia[currentMediaIndex].notes || ''}
                onChange={(e) => {
                  const newMedia = [...capturedMedia]
                  newMedia[currentMediaIndex].notes = e.target.value
                  setCapturedMedia(newMedia)
                }}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                disabled={currentMediaIndex === 0}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <span className="text-white/60">
                {currentMediaIndex + 1} of {capturedMedia.length}
              </span>
              
              <Button
                variant="ghost"
                onClick={() => setCurrentMediaIndex(Math.min(capturedMedia.length - 1, currentMediaIndex + 1))}
                disabled={currentMediaIndex === capturedMedia.length - 1}
                className="text-white hover:bg-white/10"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}