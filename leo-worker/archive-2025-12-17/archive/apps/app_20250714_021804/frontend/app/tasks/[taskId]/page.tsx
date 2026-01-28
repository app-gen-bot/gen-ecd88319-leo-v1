'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthCheck } from '@/contexts/auth-context'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Calendar, Clock, Heart, MessageCircle, MoreVertical, Share, CheckCircle, Loader2, Edit } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDueDate, getInitials } from '@/lib/utils'
import { toast } from 'sonner'

// Mock task data
const mockTask = {
  id: '1',
  description: 'Take out the trash',
  original_message: 'Take out the trash',
  transformed_message: "Hey superstar! 🌟 Could you work your magic and help our home stay fresh by taking out the trash? You're the best!",
  assignee_id: '1',
  assignee_name: 'Sarah',
  assignee_avatar: '',
  assigned_by_id: '2',
  assigned_by_name: 'Mom',
  status: 'pending',
  priority: 'high',
  category: 'household',
  due_date: new Date().toISOString(),
  created_at: new Date(Date.now() - 3600000).toISOString(),
  style: 'encouraging',
}

function TaskDetailContent({ params }: { params: { taskId: string } }) {
  const router = useRouter()
  const [task] = useState(mockTask)
  const [showOriginal, setShowOriginal] = useState(false)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showNegotiateDialog, setShowNegotiateDialog] = useState(false)
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [acceptMessage, setAcceptMessage] = useState('')
  const [negotiateOption, setNegotiateOption] = useState('')
  const [negotiateMessage, setNegotiateMessage] = useState('')
  const [question, setQuestion] = useState('')

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      // Mock AI generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      setAcceptMessage("I'm on it! 💪 Happy to help keep our home fresh and clean!")
    } catch (error) {
      toast.error('Failed to generate response')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendAccept = async () => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Response sent! You\'re awesome! 🌟')
      setShowAcceptDialog(false)
      router.push('/tasks/active')
    } catch (error) {
      toast.error('Failed to send response')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNegotiate = async () => {
    if (!negotiateOption) {
      toast.error('Please select a reason')
      return
    }
    
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Generate message based on option
      const messages = {
        'different-date': "I'd love to help! Could we adjust the timing? I have something scheduled right now.",
        'share': "This would be perfect as a team effort! Maybe Emma could help me?",
        'need-help': "I'm happy to do this but might need some guidance on the best way.",
        'other': negotiateMessage || "I have a suggestion about this task...",
      }
      toast.success('Negotiation sent with love 💕')
      setShowNegotiateDialog(false)
    } catch (error) {
      toast.error('Failed to send negotiation')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuestion = async () => {
    if (!question) {
      toast.error('Please enter your question')
      return
    }
    
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Question sent! You\'ll get an answer soon 💬')
      setShowQuestionDialog(false)
    } catch (error) {
      toast.error('Failed to send question')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleComplete = async () => {
    router.push(`/tasks/${task.id}/complete`)
  }

  const quickQuestions = [
    "Where exactly?",
    "What supplies do I need?",
    "How long will this take?",
    "Any special instructions?",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 pb-20 md:pb-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Task Details</CardTitle>
                <CardDescription>
                  Assigned to {task.assignee_name} by {task.assigned_by_name}
                </CardDescription>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share className="mr-2 h-4 w-4" />
                    Share Message
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Save as Template
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Report Issue
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Message Display */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Task Message</Label>
                <Tabs value={showOriginal ? 'original' : 'transformed'} onValueChange={(v) => setShowOriginal(v === 'original')}>
                  <TabsList>
                    <TabsTrigger value="transformed">Transformed</TabsTrigger>
                    <TabsTrigger value="original">Original</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <Card className={showOriginal ? 'bg-muted' : 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20'}>
                <CardContent className="p-4">
                  <p className="text-lg">
                    {showOriginal ? task.original_message : task.transformed_message}
                  </p>
                  {!showOriginal && (
                    <Badge variant="secondary" className="mt-3">
                      {task.style} style
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Task Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Assignee</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Avatar>
                      <AvatarImage src={task.assignee_avatar} />
                      <AvatarFallback>{getInitials(task.assignee_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{task.assignee_name}</p>
                      <p className="text-sm text-muted-foreground">Family member</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Assigned by</Label>
                  <p className="mt-1">{task.assigned_by_name}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Due Date</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{formatDueDate(task.due_date)}</span>
                    <span className="text-muted-foreground ml-2">
                      ({new Date(task.due_date).toLocaleDateString()})
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <div className="flex items-center mt-1">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{new Date(task.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <Label className="text-muted-foreground">Priority</Label>
                <Badge
                  variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}
                  className="mt-1"
                >
                  {task.priority}
                </Badge>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <Badge variant="outline" className="mt-1">
                  {task.category}
                </Badge>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge variant="secondary" className="mt-1">
                  {task.status}
                </Badge>
              </div>
            </div>
            
            {/* Response Actions */}
            <div className="space-y-3 pt-4 border-t">
              <Label>How would you like to respond?</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button 
                  onClick={() => setShowAcceptDialog(true)}
                  className="justify-start"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Accept with Love
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowNegotiateDialog(true)}
                  className="justify-start"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Let&apos;s Negotiate
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowQuestionDialog(true)}
                  className="justify-start"
                >
                  Ask Question
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={handleComplete}
                  className="justify-start"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
      
      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Task with Love</DialogTitle>
            <DialogDescription>
              We&apos;ll create a lovely acceptance message for you!
            </DialogDescription>
          </DialogHeader>
          
          {!acceptMessage ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Working on something sweet...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p>{acceptMessage}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Want to edit the message?</Label>
                <Textarea
                  value={acceptMessage}
                  onChange={(e) => setAcceptMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Cancel
            </Button>
            {acceptMessage && (
              <Button onClick={handleSendAccept} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send This'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Negotiate Dialog */}
      <Dialog open={showNegotiateDialog} onOpenChange={setShowNegotiateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Let&apos;s Negotiate</DialogTitle>
            <DialogDescription>
              What would you like to discuss about this task?
            </DialogDescription>
          </DialogHeader>
          
          <RadioGroup value={negotiateOption} onValueChange={setNegotiateOption}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                   onClick={() => setNegotiateOption('different-date')}>
                <RadioGroupItem value="different-date" id="different-date" />
                <Label htmlFor="different-date" className="cursor-pointer flex-1">
                  Different Due Date
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                   onClick={() => setNegotiateOption('share')}>
                <RadioGroupItem value="share" id="share" />
                <Label htmlFor="share" className="cursor-pointer flex-1">
                  Share with Someone
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                   onClick={() => setNegotiateOption('need-help')}>
                <RadioGroupItem value="need-help" id="need-help" />
                <Label htmlFor="need-help" className="cursor-pointer flex-1">
                  Need Help
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                   onClick={() => setNegotiateOption('other')}>
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer flex-1">
                  Something Else
                </Label>
              </div>
            </div>
          </RadioGroup>
          
          {negotiateOption === 'other' && (
            <div className="space-y-2 mt-4">
              <Label>Your message</Label>
              <Textarea
                placeholder="Explain what you'd like to discuss..."
                value={negotiateMessage}
                onChange={(e) => setNegotiateMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNegotiateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleNegotiate} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Negotiation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
            <DialogDescription>
              What would you like to know about this task?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Quick questions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {quickQuestions.map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestion(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Your question</Label>
              <Textarea
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuestion} disabled={isProcessing || !question}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Question'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function TaskDetailPage({ params }: { params: { taskId: string } }) {
  return (
    <AuthCheck>
      <TaskDetailContent params={params} />
    </AuthCheck>
  )
}