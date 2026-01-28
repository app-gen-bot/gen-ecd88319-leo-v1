'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import {
  Search,
  Plus,
  Mail,
  MessageSquare,
  Send,
  Inbox,
  Archive,
  Star,
  Paperclip,
  Calendar,
  Clock,
  CheckCheck,
  Circle,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  subject: string;
  preview: string;
  from: string;
  to: string;
  date: Date;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  type: 'email' | 'text' | 'letter';
  status: 'sent' | 'received' | 'draft';
  thread: string[];
}

// Mock data
const mockMessages: Message[] = [
  {
    id: '1',
    subject: 'Repair Request - Kitchen Sink',
    preview: 'I am writing to formally request repairs to the kitchen sink that has been leaking...',
    from: 'You',
    to: 'John Smith (Landlord)',
    date: new Date('2024-03-15'),
    read: true,
    starred: false,
    hasAttachment: true,
    type: 'email',
    status: 'sent',
    thread: ['1', '2']
  },
  {
    id: '2',
    subject: 'Re: Repair Request - Kitchen Sink',
    preview: 'I received your request and will send a plumber this week...',
    from: 'John Smith (Landlord)',
    to: 'You',
    date: new Date('2024-03-16'),
    read: true,
    starred: false,
    hasAttachment: false,
    type: 'email',
    status: 'received',
    thread: ['1', '2']
  },
  {
    id: '3',
    subject: '30-Day Notice to Vacate',
    preview: 'This letter serves as my 30-day notice to vacate the property...',
    from: 'You',
    to: 'John Smith (Landlord)',
    date: new Date('2024-03-10'),
    read: true,
    starred: true,
    hasAttachment: true,
    type: 'letter',
    status: 'sent',
    thread: ['3']
  },
  {
    id: '4',
    subject: 'Security Deposit Return Request',
    preview: 'It has been 25 days since I vacated the property and I have not received...',
    from: 'You',
    to: 'ABC Property Management',
    date: new Date('2024-03-05'),
    read: true,
    starred: false,
    hasAttachment: false,
    type: 'email',
    status: 'sent',
    thread: ['4']
  },
  {
    id: '5',
    subject: 'Maintenance Completed',
    preview: 'The plumber fixed the kitchen sink today. Please let me know if...',
    from: 'John Smith (Landlord)',
    to: 'You',
    date: new Date('2024-03-18'),
    read: false,
    starred: false,
    hasAttachment: false,
    type: 'text',
    status: 'received',
    thread: ['5']
  }
];

export default function CommunicationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTab === 'inbox') return matchesSearch && message.status === 'received';
    if (selectedTab === 'sent') return matchesSearch && message.status === 'sent';
    if (selectedTab === 'starred') return matchesSearch && message.starred;
    if (selectedTab === 'all') return matchesSearch;
    return false;
  });

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const toggleStar = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
    ));
  };

  const archiveMessage = (messageId: string) => {
    toast({
      title: 'Message archived',
      description: 'The message has been moved to archive.',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'text': return <MessageSquare className="h-4 w-4" />;
      case 'letter': return <Send className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'email': return 'default';
      case 'text': return 'secondary';
      case 'letter': return 'outline';
      default: return 'default';
    }
  };

  const unreadCount = messages.filter(m => !m.read && m.status === 'received').length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Communication Hub</h1>
            <p className="text-muted-foreground mt-2">
              Track all landlord communications in one place
            </p>
          </div>
          <Button onClick={() => router.push('/communications/compose')} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Compose
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Messages List */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="inbox" className="relative">
              <Inbox className="h-4 w-4 mr-2" />
              Inbox
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">
              <Send className="h-4 w-4 mr-2" />
              Sent
            </TabsTrigger>
            <TabsTrigger value="starred">
              <Star className="h-4 w-4 mr-2" />
              Starred
            </TabsTrigger>
            <TabsTrigger value="all">
              All Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-2">
            {filteredMessages.length === 0 ? (
              <Card className="p-8 text-center">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No messages found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search' : 'Start a conversation with your landlord'}
                </p>
              </Card>
            ) : (
              filteredMessages.map(message => (
                <Card
                  key={message.id}
                  className={`hover:shadow-sm transition-shadow cursor-pointer ${!message.read ? 'border-primary/50' : ''}`}
                  onClick={() => {
                    markAsRead(message.id);
                    setSelectedMessage(message);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {message.status === 'received' ? message.from[0] : message.to[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              {!message.read && (
                                <Circle className="h-2 w-2 fill-primary text-primary" />
                              )}
                              <h3 className={`font-medium truncate ${!message.read ? 'font-semibold' : ''}`}>
                                {message.subject}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge variant={getTypeBadgeVariant(message.type)}>
                                {getTypeIcon(message.type)}
                                <span className="ml-1">{message.type}</span>
                              </Badge>
                              {message.hasAttachment && (
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(message.id);
                                }}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <Star className={`h-4 w-4 ${message.starred ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <span className="font-medium">
                              {message.status === 'received' ? message.from : `To: ${message.to}`}
                            </span>
                            <span className="mx-2">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{message.date.toLocaleDateString()}</span>
                            {message.status === 'sent' && message.read && (
                              <>
                                <span className="mx-2">•</span>
                                <CheckCheck className="h-3 w-3 mr-1" />
                                <span>Read</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.preview}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="ml-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/communications/thread/${message.id}`)}>
                            View Thread
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => archiveMessage(message.id)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{messages.length}</p>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                </div>
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{messages.filter(m => m.type === 'letter').length}</p>
                  <p className="text-sm text-muted-foreground">Legal Letters</p>
                </div>
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-sm text-muted-foreground">Unread</p>
                </div>
                <Circle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{messages.filter(m => m.hasAttachment).length}</p>
                  <p className="text-sm text-muted-foreground">With Attachments</p>
                </div>
                <Paperclip className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}