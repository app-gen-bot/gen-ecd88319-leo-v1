'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth, AuthCheck } from '@/contexts/auth-context'
import { ChevronLeft, Upload, Camera, Sparkles, PartyPopper, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { apiClient } from '@/lib/api-client'

// Mock task data
const mockTask = {
  id: '1',
  description: 'Take out the trash',
  transformed_message: "Hey superstar! Could you work your magic and help our home stay fresh by taking out the trash? You're the best!",
  assignee_id: '2',
  assignee_name: 'Sarah',
  assigned_by_id: '1',
  assigned_by_name: 'Mom',
  priority: 'medium',
  category: 'chores',
  status: 'in_progress',
  due_date: new Date(Date.now() + 3600000).toISOString(),
}

export default function CompleteTaskPage() {
  return (
    <AuthCheck>
      <CompleteTaskContent />
    </AuthCheck>
  )
}

function CompleteTaskContent() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [completionMessage, setCompletionMessage] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [step, setStep] = useState<'message' | 'photo' | 'confirm'>('message')

  useEffect(() => {
    generateCelebrationMessage()
  }, [])

  const generateCelebrationMessage = async () => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const messages = [
        "Woohoo! I crushed it! The trash is out and our home is fresh and clean!",
        "Mission accomplished! Trash has been taken to its new home!",
        "Done and dusted! Our home is now trash-free thanks to me!",
        "Task complete! I'm the trash-taking-out champion!",
      ]
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setGeneratedMessage(randomMessage)
      setCompletionMessage(randomMessage)
    } catch (error) {
      toast.error('Failed to generate message')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      toast.success('Photo added!')
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await apiClient.completeTask(params.taskId as string, completionMessage, photoFile || undefined)
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      toast.success('Task completed! Great job!')
      
      setTimeout(() => {
        router.push(`/tasks/${params.taskId}`)
      }, 2000)
    } catch (error) {
      toast.error('Failed to complete task')
      setIsLoading(false)
    }
  }

  const handleSkipPhoto = () => {
    setStep('confirm')
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/tasks/${params.taskId}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Complete Task</h1>
          <p className="text-muted-foreground">Celebrate your achievement!</p>
        </div>
      </div>

      {/* Task Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">{mockTask.description}</CardTitle>
          <CardDescription>
            Assigned by {mockTask.assigned_by_name}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Step Content */}
      {step === 'message' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Share Your Success!</CardTitle>
            </div>
            <CardDescription>
              Let your family know you completed the task
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Creating your celebration message...</p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
                  <p className="text-lg">{generatedMessage}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Or write your own message</Label>
                  <Textarea
                    id="message"
                    value={completionMessage}
                    onChange={(e) => setCompletionMessage(e.target.value)}
                    placeholder="Share how you completed the task..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={generateCelebrationMessage}
                    disabled={isGenerating}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Try Another
                  </Button>
                  <Button onClick={() => setStep('photo')}>
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'photo' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <CardTitle>Add a Photo (Optional)</CardTitle>
            </div>
            <CardDescription>
              Show your completed task to the family!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {photoPreview ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <Image
                    src={photoPreview}
                    alt="Task completion"
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPhotoFile(null)
                      setPhotoPreview(null)
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <Button onClick={() => setStep('confirm')} className="w-full">
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">Click to upload a photo</p>
                  <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('message')}>
                    Back
                  </Button>
                  <Button variant="ghost" onClick={handleSkipPhoto} className="flex-1">
                    Skip Photo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" />
              <CardTitle>Ready to Celebrate!</CardTitle>
            </div>
            <CardDescription>
              Review and complete your task
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Message Preview */}
            <div className="space-y-2">
              <Label>Your celebration message</Label>
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
                <p>{completionMessage}</p>
              </div>
            </div>
            
            {/* Photo Preview */}
            {photoPreview && (
              <div className="space-y-2">
                <Label>Your photo</Label>
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src={photoPreview}
                    alt="Task completion"
                    width={600}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(photoPreview ? 'photo' : 'message')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Complete Task
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}