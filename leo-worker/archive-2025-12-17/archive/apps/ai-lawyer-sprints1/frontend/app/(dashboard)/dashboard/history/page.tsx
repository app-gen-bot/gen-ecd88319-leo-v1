"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { 
  Search, 
  MessageSquare, 
  Calendar,
  FileText,
  Loader2,
  ChevronRight,
  Download,
  History as HistoryIcon
} from 'lucide-react';
import type { Conversation } from '@/shared/types/api';
import { format } from 'date-fns';

export default function ConversationHistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await apiClient.getConversations();
      setConversations(response.conversations);
      setFilteredConversations(response.conversations);
    } catch (error: any) {
      toast({
        title: 'Error loading conversations',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.searchConversations({
        query: searchQuery,
      });
      setFilteredConversations(response.conversations);
    } catch (error: any) {
      toast({
        title: 'Search failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleExport = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Get conversation details with messages
      const [conversationData] = await Promise.all([
        apiClient.getConversationMessages(conversationId)
      ]);
      
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      // Generate PDF client-side
      const { PDFGenerator, downloadPDF } = await import('@/lib/pdf-generator');
      const generator = new PDFGenerator();
      
      const pdfBlob = generator.generateConversationPDF(
        conversation.title,
        conversationData.messages,
        conversationData.user_name || 'User',
        format(new Date(conversation.createdAt), 'MMMM d, yyyy')
      );
      
      const filename = `conversation_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
      downloadPDF(pdfBlob, filename);
      
      toast({
        title: 'Export successful',
        description: 'Your conversation has been exported as PDF',
      });
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const viewConversation = (conversationId: string) => {
    router.push(`/dashboard/chat/${conversationId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else if (diffDays < 7) {
      return format(date, 'EEEE at h:mm a');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HistoryIcon className="h-6 w-6" />
          Conversation History
        </h1>
        <p className="text-gray-600 mt-1">
          View and search your past legal consultations
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start a new conversation to see it here'}
            </p>
            <Button onClick={() => router.push('/dashboard/chat')}>
              Start New Chat
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => viewConversation(conversation.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {conversation.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(conversation.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {conversation.messageCount} messages
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleExport(conversation.id, e)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              {conversation.last_message && (
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {conversation.last_message}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}