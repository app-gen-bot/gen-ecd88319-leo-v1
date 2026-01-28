# AI Integration: Chat UI Patterns

**Purpose:** Production-ready chat interfaces with proper UX

---

## Complete Chat Interface

```typescript
// client/src/components/ai/ChatInterface.tsx
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Trash2, User, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export function ChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    loadHistory();
  }, [sessionId]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/ai/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const { history } = await response.json();
      setMessages(history.map(h => ({ ...h, timestamp: new Date() })));
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/ai/chat/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ message: userMessage.content })
      });

      if (!response.ok) throw new Error('API request failed');

      const { reply } = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`/api/ai/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>AI Assistant</CardTitle>
        <Button variant="ghost" size="icon" onClick={clearChat}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="rounded-full bg-primary/10 p-2">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    msg.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : msg.isError
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-50 mt-1 block">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="rounded-full bg-secondary p-2">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Message Formatting

```typescript
// Support markdown in messages
import ReactMarkdown from 'react-markdown';

<div className="prose prose-sm dark:prose-invert max-w-none">
  <ReactMarkdown>{msg.content}</ReactMarkdown>
</div>
```

---

## Typing Indicator

```typescript
const [isTyping, setIsTyping] = useState(false);

{isTyping && (
  <div className="flex gap-2">
    <Bot className="h-4 w-4" />
    <div className="flex gap-1">
      <span className="animate-bounce">.</span>
      <span className="animate-bounce animation-delay-100">.</span>
      <span className="animate-bounce animation-delay-200">.</span>
    </div>
  </div>
)}
```

---

## Empty State

```typescript
{messages.length === 0 && (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <Bot className="h-16 w-16 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      Ask me anything! I'm here to help with your questions.
    </p>
  </div>
)}
```

---

## Why This Matters

Chat UX requires proper loading states, error handling, auto-scroll, and keyboard navigation. Good UI makes AI features feel polished and professional.
