"use client"

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNextAuth } from '@/contexts/nextauth-context';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { 
  Send, 
  Loader2, 
  AlertCircle, 
  Copy, 
  MessageSquare,
  Sparkles,
  Scale
} from 'lucide-react';
import type { ChatMessage, Citation } from '@/shared/types/api';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { user, pendingQuestion, setPendingQuestion } = useNextAuth();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load suggestions on mount and handle pending question
  useEffect(() => {
    loadSuggestions();
    
    // Check for pending question from URL or context
    const urlQuestion = searchParams.get('q');
    if (urlQuestion) {
      setInput(decodeURIComponent(urlQuestion));
      // Clear the question from URL
      window.history.replaceState({}, '', '/dashboard/chat');
    } else if (pendingQuestion) {
      setInput(pendingQuestion);
      setPendingQuestion(null);
    }
  }, [searchParams, pendingQuestion, setPendingQuestion]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSuggestions = async () => {
    try {
      const response = await apiClient.getChatSuggestions();
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    const tempUserMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      conversationId: conversationId || '',
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await apiClient.sendChatMessage({
        message: userMessage,
        conversationId: conversationId || undefined,
      });

      // Update conversation ID if this is the first message
      if (!conversationId) {
        setConversationId(response.conversationId);
      }

      // Add AI response
      setMessages(prev => [...prev, response.message]);
      
      // Clear suggestions after first message
      if (suggestions.length > 0) {
        setSuggestions([]);
      }
    } catch (error: any) {
      toast({
        title: 'Error sending message',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      setInput(userMessage); // Restore input
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The message has been copied to your clipboard',
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const renderCitations = (citations: Citation[]) => {
    if (!citations || citations.length === 0) return null;

    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">Legal References:</p>
        <ul className="space-y-1">
          {citations.map((citation, index) => (
            <li key={index} className="text-xs text-blue-800">
              • {citation.law} {citation.section} - {citation.text}
              {citation.url && (
                <a 
                  href={citation.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:text-blue-600"
                >
                  [View]
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          AI Legal Advisor
        </h1>
        <p className="text-gray-600 mt-1">
          Ask questions about California tenant law and get instant answers
        </p>
      </div>

      <Separator />

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="space-y-6">
            {/* Welcome Message */}
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Scale className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Welcome to AI Legal Advisor</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    I'm here to help you understand your rights as a {user?.userType} in California. 
                    I can answer questions about:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>• Security deposits and deductions</li>
                    <li>• Eviction procedures and tenant protections</li>
                    <li>• Repairs and habitability requirements</li>
                    <li>• Rent increases and lease terms</li>
                    <li>• And much more...</li>
                  </ul>
                  <div className="mt-4 p-3 bg-amber-50 rounded-md">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        Remember: This is legal information, not legal advice. 
                        For specific situations, consult with a qualified attorney.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Popular questions to get started:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="line-clamp-2">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-4',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.role === 'assistant' && message.citations && (
                    renderCitations(message.citations)
                  )}
                  
                  <div className={cn(
                    'mt-2 flex items-center gap-2 text-xs',
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-gray-500'
                  )}>
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 hover:bg-gray-200"
                        onClick={() => copyToClipboard(message.content)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Input Area */}
      <div className="p-6">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about California tenant law..."
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}