'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  Loader2,
  AlertCircle,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Info,
  Scale,
  FileText,
  DollarSign,
  Home,
  Shield
} from 'lucide-react'
import { format } from 'date-fns'
import { ChatMessage } from '@/lib/types'

const suggestedQuestions = [
  {
    category: 'Security Deposits',
    icon: DollarSign,
    questions: [
      'How much can my landlord charge for a security deposit?',
      'When should I get my security deposit back?',
      'What deductions can my landlord make from my deposit?',
    ]
  },
  {
    category: 'Repairs & Maintenance',
    icon: Home,
    questions: [
      'How long does my landlord have to fix urgent repairs?',
      'Can I withhold rent if repairs aren\'t made?',
      'Who is responsible for mold remediation?',
    ]
  },
  {
    category: 'Eviction Protection',
    icon: Shield,
    questions: [
      'What are valid reasons for eviction in California?',
      'How much notice must my landlord give me?',
      'What are my rights if I receive an eviction notice?',
    ]
  },
  {
    category: 'Lease Terms',
    icon: FileText,
    questions: [
      'Can my landlord enter without permission?',
      'Is my no-pets clause enforceable?',
      'Can my landlord raise rent during my lease?',
    ]
  }
]

export default function AIAdvisorPage() {
  const { user, currentProperty } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const loadConversations = async () => {
    try {
      const convos = await apiClient.getConversations()
      setConversations(convos)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const startNewConversation = () => {
    setSelectedConversation(null)
    setMessages([])
    setInput('')
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const messages = await apiClient.getMessages(conversationId)
      setMessages(messages)
      setSelectedConversation(conversationId)
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conversation_id: selectedConversation || 'new',
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await apiClient.sendMessage(
        input,
        selectedConversation,
        currentProperty?.id
      )

      const aiMessage: ChatMessage = {
        id: response.messageId,
        conversation_id: response.conversationId,
        role: 'assistant',
        content: response.content,
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMessage])
      
      if (!selectedConversation) {
        setSelectedConversation(response.conversationId)
        loadConversations()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        conversation_id: selectedConversation || 'new',
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuestionClick = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add a toast notification here
  }

  const handleFeedback = async (messageId: string, isHelpful: boolean) => {
    try {
      await apiClient.submitFeedback(messageId, isHelpful)
      // Update UI to show feedback was received
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar with conversation history */}
      <aside className="w-80 flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <CardDescription>Your chat history</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            <Button 
              onClick={startNewConversation}
              className="w-full mb-3"
              variant="outline"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation === conv.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <p className="font-medium text-sm truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conv.lastMessageAt), 'MMM d, h:mm a')}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            I'm trained on California tenant law and can help with lease questions, 
            repairs, deposits, evictions, and more. I provide information, not legal advice.
          </AlertDescription>
        </Alert>
      </aside>

      {/* Main chat area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI Legal Advisor</CardTitle>
                <CardDescription>Ask me anything about California tenant law</CardDescription>
              </div>
            </div>
            <Badge variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                  <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                  <p className="text-muted-foreground">
                    Ask me about your rights as a tenant in California
                  </p>
                </div>

                {/* Suggested questions */}
                <div className="space-y-4">
                  {suggestedQuestions.map((category) => (
                    <div key={category.category}>
                      <div className="flex items-center gap-2 mb-3">
                        <category.icon className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">{category.category}</h4>
                      </div>
                      <div className="grid gap-2">
                        {category.questions.map((question) => (
                          <button
                            key={question}
                            onClick={() => handleQuestionClick(question)}
                            className="text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors text-sm"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                      <div
                        className={`rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Legal citations could be added here if available */}
                      </div>
                      
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            className="h-8 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(message.id, true)}
                            className="h-8"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(message.id, false)}
                            className="h-8"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 order-2">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="border-t p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your tenant rights..."
                className="flex-1 min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This AI provides legal information, not legal advice. 
              For specific situations, consult with a licensed attorney.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}