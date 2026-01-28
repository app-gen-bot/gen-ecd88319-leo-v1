'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getMockOwners } from '@/lib/mock-data';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Search, 
  Send, 
  Paperclip, 
  Phone, 
  Mail,
  MessageSquare,
  Clock,
  CheckCheck,
  AlertCircle,
  Archive,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientMessage {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  preview: string;
  fullMessage: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  status: 'unread' | 'read' | 'replied' | 'archived';
  petName?: string;
}

const mockMessages: ClientMessage[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'John Smith',
    subject: 'Question about Max\'s medication',
    preview: 'Hi, I wanted to ask about the dosage for Max\'s antibiotics...',
    fullMessage: 'Hi, I wanted to ask about the dosage for Max\'s antibiotics. The label says twice daily but I\'m not sure about the timing. Should I give it with food? Also, he seems to be doing better but still has a slight cough. Is this normal?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
    isStarred: true,
    hasAttachment: false,
    status: 'unread',
    petName: 'Max',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Sarah Johnson',
    subject: 'Thank you!',
    preview: 'Just wanted to thank you and the team for taking such good care of Bella...',
    fullMessage: 'Just wanted to thank you and the team for taking such good care of Bella during her surgery. She\'s recovering well at home and seems much more comfortable. You all are amazing!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    status: 'read',
    petName: 'Bella',
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Mike Williams',
    subject: 'Appointment request',
    preview: 'I need to schedule a follow-up appointment for Charlie...',
    fullMessage: 'I need to schedule a follow-up appointment for Charlie. You mentioned we should come back in 2 weeks for a check-up. What days do you have available next week? Mornings work best for me.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    status: 'replied',
    petName: 'Charlie',
  },
];

export default function ClientMessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ClientMessage[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<ClientMessage | null>(mockMessages[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const owners = getMockOwners();

  const filteredMessages = messages.filter(message => {
    if (filter === 'unread' && message.status !== 'unread') return false;
    if (filter === 'starred' && !message.isStarred) return false;
    if (filter === 'archived' && message.status !== 'archived') return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        message.clientName.toLowerCase().includes(search) ||
        message.subject.toLowerCase().includes(search) ||
        message.preview.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const handleSelectMessage = (message: ClientMessage) => {
    setSelectedMessage(message);
    setReplyText('');
    setIsReplying(false);
    
    // Mark as read
    if (!message.isRead) {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, isRead: true, status: 'read' } : m
      ));
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;

    toast({
      title: 'Reply sent',
      description: 'Your message has been sent to the client.',
    });

    // Update message status
    setMessages(prev => prev.map(m => 
      m.id === selectedMessage.id ? { ...m, status: 'replied' } : m
    ));

    setReplyText('');
    setIsReplying(false);
  };

  const handleToggleStar = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
    ));
  };

  const handleArchive = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'archived' } : m
    ));
    toast({
      title: 'Message archived',
      description: 'The message has been moved to archives.',
    });
  };

  const getOwnerDetails = (clientId: string) => {
    return owners.find(o => o.id === clientId);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Message List */}
      <div className="w-96 border-r bg-muted/10">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">Client Messages</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Filters */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">
                All
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Message List */}
        <ScrollArea className="h-[calc(100%-140px)]">
          <div className="p-2">
            {filteredMessages.map((message) => (
              <Card
                key={message.id}
                className={cn(
                  "mb-2 cursor-pointer transition-colors",
                  selectedMessage?.id === message.id && "bg-accent",
                  !message.isRead && "border-primary/50"
                )}
                onClick={() => handleSelectMessage(message)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {message.clientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm truncate",
                          !message.isRead && "font-semibold"
                        )}>
                          {message.clientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {message.petName && `Pet: ${message.petName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {message.isStarred && (
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      )}
                      {message.hasAttachment && (
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <h4 className={cn(
                    "text-sm mb-1 truncate",
                    !message.isRead && "font-semibold"
                  )}>
                    {message.subject}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {message.preview}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                    {message.status === 'replied' && (
                      <CheckCheck className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message Detail */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedMessage.clientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedMessage.clientName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMessage.subject}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToggleStar(selectedMessage.id)}
                  >
                    <Star className={cn(
                      "h-4 w-4",
                      selectedMessage.isStarred && "fill-yellow-500 text-yellow-500"
                    )} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleArchive(selectedMessage.id)}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {format(new Date(selectedMessage.timestamp), 'PPP • p')}
                  </p>
                  <p className="whitespace-pre-wrap">{selectedMessage.fullMessage}</p>
                </div>

                {/* Client Info */}
                {(() => {
                  const owner = getOwnerDetails(selectedMessage.clientId);
                  return owner ? (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base">Client Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{owner.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{owner.email}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null;
                })()}

                {/* Reply Section */}
                {!isReplying ? (
                  <Button onClick={() => setIsReplying(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Reply</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="min-h-[120px] mb-4"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                          <Send className="mr-2 h-4 w-4" />
                          Send Reply
                        </Button>
                        <Button variant="outline" onClick={() => setIsReplying(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Select a message to view</p>
          </div>
        )}
      </div>
    </div>
  );
}