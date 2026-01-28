'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { getMockMessagesByUser } from '@/lib/mock-data';
import { Message } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageSquare, Search, Plus, Mail, Paperclip, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InboxPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        const userMessages = getMockMessagesByUser(user.id);
        setMessages(userMessages);
        setFilteredMessages(userMessages);
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  useEffect(() => {
    const filtered = messages.filter(msg => 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.from?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.from?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(filtered);
  }, [searchTerm, messages]);

  const markAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const getTimeAgo = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(messageDate, { addSuffix: true });
    }
    return format(messageDate, 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
          </p>
        </div>
        <Link href="/client/messages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No messages found' : 'No messages'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search' 
                : 'Start a conversation with your veterinary clinic'}
            </p>
            {!searchTerm && (
              <Link href="/client/messages/new">
                <Button>Send Your First Message</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <Link
              key={message.id}
              href={`/client/messages/${message.id}`}
              onClick={() => markAsRead(message.id)}
            >
              <Card className={cn(
                "transition-colors hover:bg-accent cursor-pointer",
                !message.read && "border-primary"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {!message.read && (
                        <Circle className="h-2 w-2 fill-primary text-primary mt-2" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={cn(
                              "text-sm",
                              !message.read && "font-semibold"
                            )}>
                              {message.from?.firstName} {message.from?.lastName}
                            </p>
                            <h4 className={cn(
                              "text-base",
                              !message.read && "font-semibold"
                            )}>
                              {message.subject}
                            </h4>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          {message.priority && message.priority !== 'normal' && (
                            <Badge 
                              variant={message.priority === 'urgent' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {message.priority}
                            </Badge>
                          )}
                          {message.relatedPet && (
                            <Badge variant="outline" className="text-xs">
                              {message.relatedPet.name}
                            </Badge>
                          )}
                          {message.attachments && message.attachments.length > 0 && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {message.attachments.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}