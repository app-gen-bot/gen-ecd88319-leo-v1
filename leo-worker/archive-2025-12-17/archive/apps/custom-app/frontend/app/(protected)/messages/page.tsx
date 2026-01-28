"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Heart,
  Star,
  StarOff,
  Search,
  MessageSquareHeart,
  Sparkles,
  Copy,
  Share2,
  Calendar,
  Filter,
  TrendingUp
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MESSAGE_STYLES } from "@/lib/constants"
import { cn } from "@/lib/utils"

// Mock data
const mockMessages = [
  {
    id: "1",
    content: "You're doing amazing sweetie! The lawn looks fantastic! 🌱",
    original_content: "Mow the lawn",
    transformation_style: "encouraging",
    sender: { id: "1", name: "Mom", avatar: null },
    receiver: { id: "2", name: "Dad", avatar: null },
    task: { id: "1", title: "Lawn care" },
    timestamp: "2024-01-20T14:30:00",
    is_favorite: true,
    love_score: 15,
    message_type: "task_assignment"
  },
  {
    id: "2",
    content: "Thanks for making dinner, you're the best chef in the house! 👨‍🍳",
    original_content: "Make dinner",
    transformation_style: "funny",
    sender: { id: "2", name: "Dad", avatar: null },
    receiver: { id: "1", name: "Mom", avatar: null },
    task: { id: "2", title: "Dinner prep" },
    timestamp: "2024-01-20T10:15:00",
    is_favorite: false,
    love_score: 20,
    message_type: "task_response"
  },
  {
    id: "3",
    content: "Room cleaning champion! Your space looks incredible! 🏆",
    original_content: "Clean your room",
    transformation_style: "encouraging",
    sender: { id: "1", name: "Mom", avatar: null },
    receiver: { id: "3", name: "Emma", avatar: null },
    task: { id: "3", title: "Room cleaning" },
    timestamp: "2024-01-19T16:45:00",
    is_favorite: true,
    love_score: 25,
    message_type: "task_assignment"
  },
  {
    id: "4",
    content: "Yo fam, dishes are done and they're sparkling clean fr fr! ✨💯",
    original_content: "I finished the dishes",
    transformation_style: "gen_z",
    sender: { id: "3", name: "Emma", avatar: null },
    receiver: { id: "1", name: "Mom", avatar: null },
    task: { id: "4", title: "Dish duty" },
    timestamp: "2024-01-19T12:00:00",
    is_favorite: false,
    love_score: 15,
    message_type: "task_update"
  },
  {
    id: "5",
    content: "My darling, taking out the trash would mean the world to me 💕",
    original_content: "Take out the trash",
    transformation_style: "romantic",
    sender: { id: "1", name: "Mom", avatar: null },
    receiver: { id: "2", name: "Dad", avatar: null },
    task: { id: "5", title: "Trash duty" },
    timestamp: "2024-01-18T20:30:00",
    is_favorite: false,
    love_score: 10,
    message_type: "task_assignment"
  }
]

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<typeof mockMessages[0] | null>(null)
  const [messages, setMessages] = useState(mockMessages)
  const { toast } = useToast()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredMessages = messages.filter(message => {
    if (activeTab === "sent" && message.sender.name !== "You") return false
    if (activeTab === "received" && message.receiver.name !== "You") return false
    if (activeTab === "favorites" && !message.is_favorite) return false
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        message.content.toLowerCase().includes(query) ||
        message.original_content.toLowerCase().includes(query) ||
        message.sender.name.toLowerCase().includes(query) ||
        message.receiver.name.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const toggleFavorite = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, is_favorite: !msg.is_favorite }
        : msg
    ))
    
    const message = messages.find(m => m.id === messageId)
    toast({
      title: message?.is_favorite ? "Removed from favorites" : "Added to favorites",
      description: message?.is_favorite 
        ? "Message removed from your favorites" 
        : "Message saved to your favorites",
    })
  }

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      })
    }
  }

  const getStyleInfo = (style: string) => {
    return MESSAGE_STYLES[style as keyof typeof MESSAGE_STYLES] || MESSAGE_STYLES.professional
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "task_assignment": return <MessageSquareHeart className="h-4 w-4" />
      case "task_response": return <Heart className="h-4 w-4" />
      case "task_update": return <TrendingUp className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
    }
  }

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  // Stats for header
  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.sender.name === "You").length,
    received: messages.filter(m => m.receiver.name === "You").length,
    favorites: messages.filter(m => m.is_favorite).length,
    thisWeek: messages.filter(m => {
      const msgDate = new Date(m.timestamp)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return msgDate > weekAgo
    }).length
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Love Messages</h1>
        <p className="text-muted-foreground mt-1">
          Your history of heartfelt task messages
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              By you
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.received}</div>
            <p className="text-xs text-muted-foreground mt-1">
              For you
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="h-4 w-4 mr-1" />
              Favorites
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative flex-1 sm:max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchQuery 
                ? "No messages match your search"
                : activeTab === "favorites"
                ? "Star your favorite messages to save them here"
                : "No love messages yet! Create your first task to see the magic ✨"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Card 
              key={message.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMessage(message)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Message Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {message.sender.name} → {message.receiver.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getMessageTypeIcon(message.message_type)}
                            <Badge variant="outline" className="text-xs">
                              {getStyleInfo(message.transformation_style).label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getRelativeTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(message.id)
                        }}
                      >
                        {message.is_favorite ? (
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Message Content */}
                    <div className="space-y-2">
                      <p className="text-lg">{message.content}</p>
                      <p className="text-sm text-muted-foreground">
                        Original: "{message.original_content}"
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {message.task && (
                          <Badge variant="secondary" className="text-xs">
                            Task: {message.task.title}
                          </Badge>
                        )}
                        <span className="text-sm text-primary">
                          +{message.love_score} love points
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyMessage(message.content)
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast({
                              title: "Share Feature",
                              description: "Sharing functionality coming soon!",
                            })
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredMessages.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Messages
          </Button>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Full message transformation and details
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              {/* Sender/Receiver */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{getInitials(selectedMessage.sender.name)}</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">→</span>
                <Avatar>
                  <AvatarFallback>{getInitials(selectedMessage.receiver.name)}</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <p className="font-medium">
                    {selectedMessage.sender.name} to {selectedMessage.receiver.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedMessage.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Transformed Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Lovely Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{selectedMessage.content}</p>
                </CardContent>
              </Card>

              {/* Original Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Original Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{selectedMessage.original_content}</p>
                </CardContent>
              </Card>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Style Used</p>
                  <Badge>{getStyleInfo(selectedMessage.transformation_style).label}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Love Score</p>
                  <Badge variant="secondary">+{selectedMessage.love_score} points</Badge>
                </div>
                {selectedMessage.task && (
                  <div>
                    <p className="text-sm font-medium mb-1">Related Task</p>
                    <Badge variant="outline">{selectedMessage.task.title}</Badge>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium mb-1">Message Type</p>
                  <Badge variant="outline">{selectedMessage.message_type}</Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "You'll be able to use this style for future tasks!",
                    })
                  }}
                >
                  Use This Style Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => copyMessage(selectedMessage.content)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "Share messages with family members!",
                    })
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}