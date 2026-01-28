'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AuthCheck } from '@/contexts/auth-context'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Calendar as CalendarIcon, Mic, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { cn, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

const TASK_EXAMPLES = [
  "Take out the trash",
  "Clean your room",
  "Walk the dog",
  "Do the dishes",
  "Help with groceries",
  "Water the plants",
]

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', description: 'Important!', color: 'text-destructive' },
  { value: 'medium', label: 'Medium', description: 'When you can', color: 'text-yellow-600' },
  { value: 'low', label: 'Low', description: 'No rush', color: 'text-green-600' },
]

const CATEGORIES = [
  { value: 'household', label: 'Household', emoji: '🏠' },
  { value: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { value: 'kids', label: 'Kids', emoji: '👶' },
  { value: 'pets', label: 'Pets', emoji: '🐶' },
  { value: 'shopping', label: 'Shopping', emoji: '🛒' },
  { value: 'outdoor', label: 'Outdoor', emoji: '🌿' },
  { value: 'other', label: 'Other', emoji: '📦' },
]

function CreateTaskContent() {
  const router = useRouter()
  const { user, family } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)

  // Form data
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState<Date>()
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('household')
  const [transformedMessage, setTransformedMessage] = useState('')
  const [messageStyle, setMessageStyle] = useState('')

  // Mock family members
  const familyMembers = [
    { id: '1', name: 'Sarah', avatar: '', role: 'child', active_tasks: 3 },
    { id: '2', name: 'Mike', avatar: '', role: 'partner', active_tasks: 2 },
    { id: '3', name: 'Emma', avatar: '', role: 'child', active_tasks: 1 },
    { id: '4', name: 'Dad', avatar: '', role: 'parent', active_tasks: 2 },
  ]

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step === 1 && description.length < 5) {
      toast.error('Please enter at least 5 characters')
      return
    }
    if (step === 2 && !assigneeId) {
      toast.error('Please select who should do this task')
      return
    }
    if (step === 3 && !dueDate) {
      toast.error('Please select a due date')
      return
    }
    if (step === 3) {
      transformMessage()
    } else if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const transformMessage = async () => {
    setIsTransforming(true)
    try {
      // Mock transformation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const assignee = familyMembers.find(m => m.id === assigneeId)
      const transformations = [
        `Hey ${assignee?.name}! 🌟 ${description} would be super helpful. You&apos;re amazing for taking this on!`,
        `${assignee?.name}, you wonderful human! 💖 Could you sprinkle your magic and ${description.toLowerCase()}? We appreciate you so much!`,
        `Mission for ${assignee?.name}: ${description}! Your superpowers are needed to save the day! 🦸‍♂️`,
      ]
      
      setTransformedMessage(transformations[Math.floor(Math.random() * transformations.length)])
      setMessageStyle(['encouraging', 'playful', 'superhero'][Math.floor(Math.random() * 3)])
      setStep(4)
    } catch (error) {
      toast.error('Failed to transform message. Please try again.')
    } finally {
      setIsTransforming(false)
    }
  }

  const handleRegenerateMessage = async () => {
    setIsTransforming(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const assignee = familyMembers.find(m => m.id === assigneeId)
      const newTransformations = [
        `${assignee?.name}, champion of our home! 🏆 Your mission: ${description}. You've got this!`,
        `Dear ${assignee?.name}, your special touch is needed! ✨ ${description} - and we know you&apos;ll do it wonderfully!`,
        `Calling ${assignee?.name}! 📣 ${description} needs your awesome skills. Thanks for being you!`,
      ]
      
      setTransformedMessage(newTransformations[Math.floor(Math.random() * newTransformations.length)])
    } catch (error) {
      toast.error('Failed to regenerate message')
    } finally {
      setIsTransforming(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Task sent with love! 💕')
      router.push('/tasks/active')
    } catch (error) {
      toast.error('Failed to create task. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const setQuickDate = (option: 'today' | 'tomorrow' | 'weekend') => {
    const date = new Date()
    if (option === 'tomorrow') {
      date.setDate(date.getDate() + 1)
    } else if (option === 'weekend') {
      const daysUntilSaturday = (6 - date.getDay() + 7) % 7 || 7
      date.setDate(date.getDate() + daysUntilSaturday)
    }
    setDueDate(date)
  }

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        toast.info('Listening... Speak now!')
      }
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setDescription(transcript)
        toast.success('Voice input captured!')
      }
      
      recognition.onerror = (event: any) => {
        toast.error('Voice input failed. Please try again.')
      }
      
      recognition.start()
    } else {
      toast.error('Voice input is not supported in your browser')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 pb-20 md:pb-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold">Create a Task</h1>
          <p className="text-muted-foreground">Transform a simple task into a message of love</p>
        </div>

        <Card>
          <CardHeader>
            <Progress value={progress} className="h-2 mb-4" />
            <CardTitle>Step {step} of {totalSteps}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Task Description */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">What needs to be done?</Label>
                  <div className="relative">
                    <Textarea
                      id="description"
                      placeholder="Describe the task..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[120px] pr-10"
                      maxLength={500}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute bottom-2 right-2"
                      type="button"
                      onClick={handleVoiceInput}
                      title="Use voice input"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{description.length} / 500</span>
                    <span>{description.length >= 5 ? '✓ Valid' : 'Min 5 characters'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Quick examples</Label>
                  <div className="flex flex-wrap gap-2">
                    {TASK_EXAMPLES.map((example) => (
                      <Button
                        key={example}
                        variant="outline"
                        size="sm"
                        onClick={() => setDescription(example)}
                        type="button"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Assignee */}
            {step === 2 && (
              <div className="space-y-4">
                <Label>Who should do this task?</Label>
                <RadioGroup value={assigneeId} onValueChange={setAssigneeId}>
                  <div className="grid gap-3">
                    {familyMembers.map((member) => (
                      <div
                        key={member.id}
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                          assigneeId === member.id ? "border-primary bg-primary/5" : "hover:bg-accent"
                        )}
                        onClick={() => setAssigneeId(member.id)}
                      >
                        <RadioGroupItem value={member.id} id={member.id} />
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.active_tasks} active tasks
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                        assigneeId === user?.id ? "border-primary bg-primary/5" : "hover:bg-accent"
                      )}
                      onClick={() => setAssigneeId(user?.id || '')}
                    >
                      <RadioGroupItem value={user?.id || ''} id="self" />
                      <Avatar>
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{getInitials(user?.name || 'Me')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">Assign to myself</p>
                        <p className="text-sm text-muted-foreground">I&apos;ll do it!</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Task Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDate('today')}
                      type="button"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDate('tomorrow')}
                      type="button"
                    >
                      Tomorrow
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDate('weekend')}
                      type="button"
                    >
                      This Weekend
                    </Button>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <RadioGroup value={priority} onValueChange={setPriority}>
                    <div className="grid gap-3">
                      {PRIORITY_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            priority === option.value ? "border-primary bg-primary/5" : "hover:bg-accent"
                          )}
                          onClick={() => setPriority(option.value)}
                        >
                          <RadioGroupItem value={option.value} id={option.value} />
                          <div className="flex-1">
                            <p className={cn("font-medium", option.color)}>
                              {option.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{cat.emoji}</span>
                            {cat.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: AI Transformation */}
            {step === 4 && (
              <div className="space-y-6">
                {isTransforming ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-muted-foreground">{description}</p>
                    </div>
                    <div className="flex justify-center py-4">
                      <Sparkles className="h-8 w-8 text-primary animate-sparkle" />
                    </div>
                    <div className="p-4 rounded-lg border shimmer">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                    <p className="text-center text-muted-foreground">
                      Creating something lovely...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Original message</Label>
                      <div className="mt-2 p-4 rounded-lg bg-muted">
                        <p>{description}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Transformed with love ✨</Label>
                        <Badge variant="secondary">{messageStyle}</Badge>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                        <p className="text-foreground">{transformedMessage}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleRegenerateMessage}
                        disabled={isTransforming}
                        type="button"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Another
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setTransformedMessage(description)}
                        type="button"
                      >
                        Use Original
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <div className="p-6 pt-0 flex justify-between">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading || isTransforming}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={isTransforming}
                className="ml-auto"
              >
                {step === 3 ? 'Transform Message' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || isTransforming}
                className="ml-auto lovely-gradient"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Task'
                )}
              </Button>
            )}
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  )
}

export default function CreateTaskPage() {
  return (
    <AuthCheck>
      <CreateTaskContent />
    </AuthCheck>
  )
}