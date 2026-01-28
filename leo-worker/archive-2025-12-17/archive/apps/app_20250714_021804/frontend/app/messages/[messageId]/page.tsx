'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/auth-context'
import { getInitials } from '@/lib/utils'
import { ChevronLeft, Heart, MessageCircle, Trophy, CheckSquare, Share2, Flag, Sparkles, Copy, Check, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Mock message data (in real app, would fetch based on messageId)
const mockMessage = {
  id: '1',
  task_id: '1',
  task_title: 'Take out the trash',
  sender_id: '1',
  sender_name: 'Mom',
  sender_avatar: '',
  sender_role: 'parent',
  recipient_id: '2',
  recipient_name: 'Sarah',
  recipient_avatar: '',
  recipient_role: 'child',
  original_content: 'Take out the trash',
  transformed_content: "Hey superstar! 🌟 Could you work your magic and help our home stay fresh by taking out the trash? You&apos;re the best!",
  message_type: 'task',
  style: 'encouraging',
  reactions: {
    '❤️': ['Sarah', 'Dad'],
    '😄': ['Emma'],
    '👍': ['Mom'],
  },
  created_at: new Date(Date.now() - 3600000).toISOString(),
  task_status: 'completed',
  completion_message: "All done! The trash is out and our home smells amazing again! 🌸",
  completed_at: new Date(Date.now() - 1800000).toISOString(),
}

const MESSAGE_TYPE_ICONS = {
  task: CheckSquare,
  response: MessageCircle,
  celebration: Trophy,
  appreciation: Heart,
}

const MESSAGE_TYPE_COLORS = {
  task: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  response: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  celebration: 'bg-green-500/10 text-green-700 dark:text-green-400',
  appreciation: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
}

const reactionEmojis = ['❤️', '😄', '👍', '🎉', '🙌', '💪', '🌟', '🤗']

export default function MessageDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('transformed')
  const [reactions, setReactions] = useState<Record<string, string[]>>(mockMessage.reactions)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [copiedOriginal, setCopiedOriginal] = useState(false)
  const [copiedTransformed, setCopiedTransformed] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  if (!user) return null

  const Icon = MESSAGE_TYPE_ICONS[mockMessage.message_type as keyof typeof MESSAGE_TYPE_ICONS]
  const colorClass = MESSAGE_TYPE_COLORS[mockMessage.message_type as keyof typeof MESSAGE_TYPE_COLORS]

  const handleReact = (emoji: string) => {
    setReactions(prev => {
      const newReactions = { ...prev }
      const currentUsers = newReactions[emoji] || []
      
      if (currentUsers.includes(user.name)) {
        // Remove reaction
        newReactions[emoji] = currentUsers.filter(name => name !== user.name)
        if (newReactions[emoji].length === 0) {
          delete newReactions[emoji]
        }
      } else {
        // Add reaction
        newReactions[emoji] = [...currentUsers, user.name]
      }
      
      return newReactions
    })
    
    toast.success(`Reacted with ${emoji}`)
    setShowReactionPicker(false)
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Lovely Message',
        text: mockMessage.transformed_content,
      })
    } catch (error) {
      // Fallback to clipboard
      handleCopy('transformed')
    }
  }

  const handleCopy = (type: 'original' | 'transformed') => {
    const content = type === 'original' ? mockMessage.original_content : mockMessage.transformed_content
    navigator.clipboard.writeText(content)
    
    if (type === 'original') {
      setCopiedOriginal(true)
      setTimeout(() => setCopiedOriginal(false), 2000)
    } else {
      setCopiedTransformed(true)
      setTimeout(() => setCopiedTransformed(false), 2000)
    }
    
    toast.success('Message copied to clipboard!')
  }

  const handleReport = () => {
    toast.info('Report feature coming soon!')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/messages/history">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Message Details</h1>
            <p className="text-muted-foreground">View the lovely exchange</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/tasks/${mockMessage.task_id}`)}>
              <CheckSquare className="mr-2 h-4 w-4" />
              View Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReport} className="text-destructive">
              <Flag className="mr-2 h-4 w-4" />
              Report Issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Message Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mockMessage.sender_avatar} />
                <AvatarFallback>{getInitials(mockMessage.sender_name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{mockMessage.sender_name}</h3>
                  <span className="text-muted-foreground">→</span>
                  <h3 className="font-semibold">{mockMessage.recipient_name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(mockMessage.created_at)}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className={colorClass}>
              <Icon className="h-3 w-3 mr-1" />
              {mockMessage.message_type}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Message Content */}
      <Card>
        <CardHeader>
          <CardTitle>Message Content</CardTitle>
          <CardDescription>
            {mockMessage.message_type === 'task' ? `Task: ${mockMessage.task_title}` : 'Lovely exchange'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transformed">Transformed</TabsTrigger>
              <TabsTrigger value="original">Original</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transformed" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Badge variant="outline" className="text-xs">
                      {mockMessage.style}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('transformed')}
                  >
                    {copiedTransformed ? (
                      <>
                        <Check className="mr-2 h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                  <p className="text-lg">{mockMessage.transformed_content}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="original" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Original message</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('original')}
                  >
                    {copiedOriginal ? (
                      <>
                        <Check className="mr-2 h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p>{mockMessage.original_content}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Completion Status (if applicable) */}
      {mockMessage.task_status === 'completed' && mockMessage.completion_message && (
        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>
              Completed {new Date(mockMessage.completed_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={mockMessage.recipient_avatar} />
                <AvatarFallback>{getInitials(mockMessage.recipient_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <p className="font-medium">{mockMessage.recipient_name}</p>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p>{mockMessage.completion_message}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reactions */}
      <Card>
        <CardHeader>
          <CardTitle>Reactions</CardTitle>
          <CardDescription>How your family responded to this message</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
                  users.includes(user.name)
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted hover:bg-accent'
                }`}
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-sm font-medium">{users.length}</span>
                {users.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {users.slice(0, 2).join(', ')}
                    {users.length > 2 && ` +${users.length - 2}`}
                  </span>
                )}
              </button>
            ))}
            
            <Dialog open={showReactionPicker} onOpenChange={setShowReactionPicker}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReactionPicker(true)}
                className="h-auto px-3 py-1.5"
              >
                <span className="text-lg mr-1">+</span>
                Add Reaction
              </Button>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Choose a reaction</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-2 py-4">
                  {reactionEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(emoji)}
                      className="p-3 text-2xl hover:bg-accent rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Related Actions */}
      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/tasks/${mockMessage.task_id}`}>
            View Task Details
          </Link>
        </Button>
        <Button onClick={handleShare} variant="outline" className="flex-1">
          <Share2 className="mr-2 h-4 w-4" />
          Share Message
        </Button>
      </div>
    </div>
  )
}