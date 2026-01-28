'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { mockMessages } from '@/lib/mock-data';
import { Message } from '@/types';
import { format } from 'date-fns';
import { ArrowLeft, Send, Paperclip, Download } from 'lucide-react';
import { toast } from '@/lib/use-toast';

interface MessageThread {
  original: Message;
  replies: Message[];
}

export default function MessageDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const message = mockMessages.find(m => m.id === params.id);
      if (message) {
        // In a real app, we'd fetch the full thread
        setThread({
          original: message,
          replies: [], // Would fetch replies here
        });
      }
      setIsLoading(false);
    }, 1000);
  }, [params.id]);

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    
    setIsSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add reply to thread
      const newReply: Message = {
        id: `reply-${Date.now()}`,
        fromId: user?.id || '',
        from: user || undefined,
        toId: thread?.original.fromId || '',
        subject: `Re: ${thread?.original.subject}`,
        content: replyContent,
        read: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setThread(prev => prev ? {
        ...prev,
        replies: [...prev.replies, newReply]
      } : null);
      
      setReplyContent('');
      toast({
        title: 'Reply sent',
        description: 'Your message has been sent successfully.',
      });
    } catch (error) {
      toast({
        title: 'Failed to send',
        description: 'Unable to send your reply. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Message not found</p>
          <Link href="/client/messages/inbox">
            <Button>Back to Inbox</Button>
          </Link>
        </div>
      </div>
    );
  }

  const messages = [thread.original, ...thread.replies];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/client/messages/inbox">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inbox
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{thread.original.subject}</h1>
        <div className="flex items-center space-x-2 mt-2">
          {thread.original.priority && thread.original.priority !== 'normal' && (
            <Badge 
              variant={thread.original.priority === 'urgent' ? 'destructive' : 'secondary'}
            >
              {thread.original.priority}
            </Badge>
          )}
          {thread.original.relatedPet && (
            <Badge variant="outline">
              Regarding: {thread.original.relatedPet.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message, index) => (
          <Card key={message.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={message.from?.avatar} />
                    <AvatarFallback>
                      {message.from?.firstName?.[0]}{message.from?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {message.from?.firstName} {message.from?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Separator />
                  <p className="text-sm font-medium">Attachments</p>
                  <div className="space-y-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Reply</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Type your reply here..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={4}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleSendReply}
            disabled={!replyContent.trim() || isSending}
          >
            {isSending ? 'Sending...' : 'Send Reply'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}