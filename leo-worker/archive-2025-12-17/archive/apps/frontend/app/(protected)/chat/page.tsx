'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Loader2, 
  Copy, 
  RefreshCw, 
  Paperclip,
  Mic,
  CheckCircle,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  Search,
  MessageSquare,
  Download,
  Settings,
  Menu,
  Trash2,
  Star,
  StarOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
  starred?: boolean;
}

const suggestedQuestions = [
  "What are my rights if my landlord won't fix a broken heater?",
  "Can my landlord enter my apartment without notice?",
  "How do I get my security deposit back?",
  "What constitutes an illegal eviction in California?",
  "How much can my landlord raise the rent?"
];

export default function ChatPage() {
  const { toast } = useToast();
  const initialMessage: Message = {
    id: '1',
    content: "Hello! I'm your AI Legal Advisor specializing in California tenant rights. I can help you understand your rights, review documents, and guide you through disputes with your landlord. What questions do you have today?",
    role: 'assistant',
    timestamp: new Date()
  };
  
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'New Chat',
      messages: [initialMessage],
      timestamp: new Date(),
      starred: false
    }
  ]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Simulate API call with mock response
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      // Mock AI response based on input
      let responseContent = '';
      
      if (input.toLowerCase().includes('heater') || input.toLowerCase().includes('repair')) {
        responseContent = `Under California law, landlords are required to maintain rental properties in a habitable condition. This includes ensuring that heating systems work properly.

Here's what you can do:

1. **Written Notice**: Send a written notice to your landlord describing the problem and requesting repairs. Keep a copy for your records.

2. **Reasonable Time**: Your landlord must make repairs within a "reasonable time" - typically 30 days for non-emergency repairs, but heating in winter could be considered urgent.

3. **Repair and Deduct**: If your landlord doesn't respond, you may have the right to "repair and deduct" - hire someone to fix it and deduct the cost from rent (up to one month's rent).

4. **Withhold Rent**: In severe cases, you might be able to withhold rent until repairs are made, but this carries legal risks.

5. **Report to Authorities**: You can file a complaint with your local building or health department.

Would you like help drafting a repair request letter?`;
      } else if (input.toLowerCase().includes('deposit')) {
        responseContent = `California has strong protections for tenant security deposits:

**Key Rights:**
- Landlords must return deposits within 21 days after you move out
- They must provide an itemized list of any deductions
- Deposits can only be used for: unpaid rent, cleaning, and damage beyond normal wear and tear

**To Maximize Your Return:**
1. Document everything with photos/videos when moving in and out
2. Request a pre-move-out inspection
3. Clean thoroughly and repair any damage you caused
4. Keep all receipts if you make repairs

**If Not Returned:**
- You can sue in small claims court for up to 2x the deposit amount in bad faith cases
- The security deposit tracker tool can help calculate any interest owed

Do you need help documenting your apartment's condition?`;
      } else {
        responseContent = `I understand you're asking about "${input}". While I'm trained on California tenant law, I want to make sure I give you the most accurate information.

Could you provide more details about your specific situation? For example:
- What type of housing do you live in?
- How long have you been a tenant?
- What specific issue are you facing?

In the meantime, you might find our Knowledge Base helpful for general information about California tenant rights.`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch {
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      toast({
        title: 'Failed to send message',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      toast({
        title: 'Copied to clipboard',
        description: 'The message has been copied to your clipboard.',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const clearChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [initialMessage],
      timestamp: new Date(),
      starred: false
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([initialMessage]);
    
    toast({
      title: 'New chat started',
      description: 'Your previous conversation has been saved.',
    });
  };
  
  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
      setSidebarOpen(false);
    }
  };
  
  const deleteChatSession = (sessionId: string) => {
    if (chatSessions.length === 1) {
      toast({
        title: 'Cannot delete',
        description: 'You must have at least one chat session.',
        variant: 'destructive'
      });
      return;
    }
    
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
      loadChatSession(remainingSessions[0].id);
    }
    
    toast({
      title: 'Chat deleted',
      description: 'The chat session has been deleted.',
    });
  };
  
  const toggleStarSession = (sessionId: string) => {
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, starred: !session.starred }
        : session
    ));
  };
  
  const exportChat = () => {
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;
    
    const chatContent = currentSession.messages.map(msg => 
      `[${format(msg.timestamp, 'PPp')}] ${msg.role === 'user' ? 'You' : 'AI Legal Advisor'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.txt`;
    a.click();
    
    toast({
      title: 'Chat exported',
      description: 'Check your downloads folder.',
    });
  };
  
  // Update chat session when messages change
  useEffect(() => {
    setChatSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            messages,
            title: messages.length > 1 && messages[1].role === 'user' 
              ? messages[1].content.substring(0, 50) + '...'
              : session.title
          }
        : session
    ));
  }, [messages, currentSessionId]);
  
  const filteredSessions = chatSessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  const handleFileUpload = () => {
    toast({
      title: 'File upload coming soon',
      description: 'You\'ll soon be able to upload documents for analysis.',
    });
  };

  const handleVoiceInput = () => {
    toast({
      title: 'Voice input coming soon',
      description: 'Voice input will be available in the next update.',
    });
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 pb-3">
            <SheetTitle>Chat History</SheetTitle>
          </SheetHeader>
          
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer",
                    session.id === currentSessionId && "bg-accent"
                  )}
                  onClick={() => loadChatSession(session.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div className="flex-1 truncate">
                    <p className="font-medium truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(session.timestamp, 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStarSession(session.id);
                      }}
                    >
                      {session.starred ? (
                        <Star className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <StarOff className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(session.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <Separator />
          
          <div className="p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={exportChat}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Current Chat
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                toast({
                  title: 'Settings coming soon',
                  description: 'Chat settings will be available in the next update.',
                });
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">AI Legal Advisor</h1>
                <p className="text-sm text-muted-foreground">
                  Get instant answers about your tenant rights
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Alert */}
        <div className="p-4 pb-0">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Legal Disclaimer:</strong> This AI provides general information about California tenant rights.
              For specific legal advice, please consult with a qualified attorney.
            </AlertDescription>
          </Alert>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={cn(
                  'group relative max-w-[80%] rounded-lg px-4 py-2',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.isTyping ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <span>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="p-4 pt-0">
            <div className="max-w-3xl mx-auto">
              <p className="text-sm text-muted-foreground mb-2 flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" />
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4 bg-card">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about your tenant rights..."
                  className="min-h-[60px] max-h-[200px] pr-24 resize-none"
                  disabled={isLoading}
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileUpload}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceInput}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 md:hidden"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}