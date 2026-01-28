'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, MessageCircle, Trophy, Gift, Search, Filter, Sparkles, Plus } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'

// Mock messages
const mockMessages = [
  {
    id: '1',
    task_id: '1',
    sender_id: '1',
    sender_name: 'Mom',
    sender_avatar: '',
    recipient_id: '2',
    recipient_name: 'Sarah',
    original_content: 'Take out the trash',
    transformed_content: "Hey superstar! 🌟 Could you work your magic and help our home stay fresh by taking out the trash? You&apos;re the best!",
    message_type: 'task',
    style: 'encouraging',
    reactions: { '❤️': ['Sarah', 'Dad'], '😄': ['Emma'] },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    task_id: '2',
    sender_id: '2',
    sender_name: 'Sarah',
    sender_avatar: '',
    recipient_id: '1',
    recipient_name: 'Mom',
    original_content: 'I finished organizing the garage!',
    transformed_content: "I finished organizing the garage! It looks fantastic now - you're going to love it! 🎆",
    message_type: 'celebration',
    style: 'playful',
    reactions: { '🎉': ['Mom', 'Dad'], '👏': ['Emma'] },
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    task_id: '3',
    sender_id: '1',
    sender_name: 'Mom',
    sender_avatar: '',
    recipient_id: '3',
    recipient_name: 'Emma',
    original_content: 'Thank you for helping with dinner',
    transformed_content: 'Thank you for being such an amazing helper in the kitchen tonight! Your contribution makes our family dinners so special! 💕',
    message_type: 'appreciation',
    style: 'loving',
    reactions: { '🥰': ['Emma'], '❤️': ['Dad', 'Sarah'] },
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '4',
    task_id: '4',
    sender_id: '4',
    sender_name: 'Dad',
    sender_avatar: '',
    recipient_id: '2',
    recipient_name: 'Sarah',
    original_content: 'Can you help with groceries?',
    transformed_content: "Shopping adventure time! 🛒 Your excellent taste and smart choices would really help. Want to join me for a grocery mission?",
    message_type: 'task',
    style: 'funny',
    reactions: { '👍': ['Sarah'] },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

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

import { CheckSquare } from 'lucide-react'

export default function MessageHistoryPage() {
  const [messages] = useState(mockMessages)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'original' | 'transformed'>('all')
  const [selectedSender, setSelectedSender] = useState<string>('all')

  // Get unique senders for filter
  const senders = Array.from(new Set(messages.map(m => m.sender_name)))

  const filteredMessages = messages.filter(message => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const matchesContent = 
        message.original_content.toLowerCase().includes(searchLower) ||
        message.transformed_content.toLowerCase().includes(searchLower)
      const matchesPeople = 
        message.sender_name.toLowerCase().includes(searchLower) ||
        message.recipient_name.toLowerCase().includes(searchLower)
      
      if (!matchesContent && !matchesPeople) return false
    }

    // Sender filter
    if (selectedSender !== 'all' && message.sender_name !== selectedSender) {
      return false
    }

    return true
  })

  const handleReact = async (messageId: string, emoji: string) => {
    // Mock reaction
    toast.success(`Reacted with ${emoji}`)
  }

  const handleShare = async (message: typeof mockMessages[0]) => {
    try {
      await navigator.share({
        title: 'Lovely Message',
        text: message.transformed_content,
      })
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(message.transformed_content)
      toast.success('Message copied to clipboard!')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Message History</h1>
        <p className="text-muted-foreground">All the love your family has shared</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            className="px-3 py-2 rounded-md border bg-background"
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
          >
            <option value="all">All Members</option>
            {senders.map(sender => (
              <option key={sender} value={sender}>{sender}</option>
            ))}
          </select>
        </div>

        <Tabs value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <TabsList>
            <TabsTrigger value="all">Both</TabsTrigger>
            <TabsTrigger value="original">Original Only</TabsTrigger>
            <TabsTrigger value="transformed">Transformed Only</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSender('all')
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </Card>
        ) : (
          filteredMessages.map((message) => {
            const Icon = MESSAGE_TYPE_ICONS[message.message_type as keyof typeof MESSAGE_TYPE_ICONS]
            const colorClass = MESSAGE_TYPE_COLORS[message.message_type as keyof typeof MESSAGE_TYPE_COLORS]
            
            return (
              <Card key={message.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Link href={`/messages/${message.id}`} className="block p-4 hover:bg-accent/5 transition-colors">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={message.sender_avatar} />
                          <AvatarFallback>{getInitials(message.sender_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{message.sender_name}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium">{message.recipient_name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className={colorClass}>
                        <Icon className="h-3 w-3 mr-1" />
                        {message.message_type}
                      </Badge>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3">
                      {(filterType === 'all' || filterType === 'original') && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Original</p>
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm">{message.original_content}</p>
                          </div>
                        </div>
                      )}
                      
                      {(filterType === 'all' || filterType === 'transformed') && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs text-muted-foreground">Transformed</p>
                            <Sparkles className="h-3 w-3 text-primary" />
                            <Badge variant="outline" className="text-xs">
                              {message.style}
                            </Badge>
                          </div>
                          <div className="p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                            <p className="text-sm">{message.transformed_content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Reactions and Actions */}
                  <div className="px-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {Object.entries(message.reactions).map(([emoji, users]) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(message.id, emoji)}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted hover:bg-accent transition-colors"
                        >
                          <span>{emoji}</span>
                          <span className="text-xs">{users.length}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => handleReact(message.id, '👍')}
                        className="p-1 rounded-full hover:bg-accent transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        handleShare(message)
                      }}
                    >
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}