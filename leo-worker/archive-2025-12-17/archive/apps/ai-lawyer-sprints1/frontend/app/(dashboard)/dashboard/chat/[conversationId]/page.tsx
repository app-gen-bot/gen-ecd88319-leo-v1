"use client"

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Copy, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  Download,
  MessageSquare
} from 'lucide-react';
import type { ChatMessage, Citation } from '@/shared/types/api';
import { cn } from '@/lib/utils';

export default function ContinueConversationPage() {
  const { user } = useNextAuth();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation history
  useEffect(() => {
    loadConversationHistory();
  }, [conversationId]);

  const loadConversationHistory = async () => {
    try {
      const response = await apiClient.getConversationDetail(conversationId);
      if (response && response.messages) {
        setMessages(response.messages);
      }
    } catch (error: any) {
      toast({
        title: "Error loading conversation",
        description: error.message || "Failed to load conversation history",
        variant: "destructive",
      });
      // Redirect back to chat list if conversation not found
      if (error.code === 'NOT_FOUND') {
        router.push('/dashboard/chat');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await apiClient.sendChatMessage({
        message: userMessage,
        conversationId: conversationId,
      });

      // Add AI response
      setMessages(prev => [...prev, response.message]);
    } catch (error: any) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
      
      toast({
        title: "Error sending message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Focus back on input
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "The response has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      // Generate PDF client-side
      const { PDFGenerator, downloadPDF } = await import('@/lib/pdf-generator');
      const generator = new PDFGenerator();
      
      const conversationTitle = `Conversation from ${new Date(messages[0]?.timestamp || Date.now()).toLocaleDateString()}`;
      const pdfBlob = generator.generateConversationPDF(
        conversationTitle,
        messages,
        user?.name || 'User',
        new Date().toLocaleDateString()
      );
      
      const filename = `conversation_${conversationId}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdfBlob, filename);
      
      toast({
        title: "Conversation exported",
        description: "Your conversation has been downloaded as a PDF",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/history')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Continue Conversation
            </h1>
            <p className="text-sm text-gray-500">
              {messages.length} messages • Started {messages[0]?.timestamp ? new Date(messages[0].timestamp).toLocaleDateString() : 'today'}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-4">
              {message.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg p-4">
                    <p className="text-sm font-medium mb-1">You</p>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-[80%] space-y-3">
                    <Card className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-600">AI Legal Advisor</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.citations && message.citations.length > 0 && (
                        <>
                          <Separator className="my-3" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Legal Citations:</p>
                            {message.citations.map((citation, idx) => (
                              <div key={idx} className="text-sm bg-gray-50 rounded p-2">
                                <p className="font-medium">{citation.law} {citation.section}</p>
                                <p className="text-gray-600 text-xs mt-1">{citation.text}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </Card>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <Card className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-xs text-gray-600">
              This service provides legal information, not legal advice. Always consult with a qualified attorney.
            </p>
          </div>
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Continue your conversation..."
              className="flex-1 min-h-[60px] max-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}