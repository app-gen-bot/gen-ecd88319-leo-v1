'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { getMockStaff } from '@/lib/mock-data';
import { format, isToday, isYesterday } from 'date-fns';
import { Send, Hash, Users, Search, Plus, Paperclip, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'direct';
  unreadCount: number;
  lastMessage?: {
    text: string;
    timestamp: string;
    sender: string;
  };
}

interface Message {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  isEdited?: boolean;
}

const mockChannels: Channel[] = [
  {
    id: 'general',
    name: 'general',
    type: 'channel',
    unreadCount: 0,
    lastMessage: {
      text: 'Good morning everyone!',
      timestamp: new Date().toISOString(),
      sender: 'Dr. Smith',
    },
  },
  {
    id: 'emergencies',
    name: 'emergencies',
    type: 'channel',
    unreadCount: 2,
    lastMessage: {
      text: 'Emergency surgery scheduled for 3pm',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      sender: 'Dr. Johnson',
    },
  },
  {
    id: 'staff-updates',
    name: 'staff-updates',
    type: 'channel',
    unreadCount: 0,
    lastMessage: {
      text: 'Staff meeting moved to 2pm',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      sender: 'Manager',
    },
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    channelId: 'general',
    userId: '1',
    userName: 'Dr. Sarah Smith',
    text: 'Good morning everyone!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '2',
    channelId: 'general',
    userId: '2',
    userName: 'Dr. Mike Johnson',
    text: 'Morning! Ready for a busy day.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '3',
    channelId: 'general',
    userId: '3',
    userName: 'Tech Amy',
    text: 'We have 3 surgeries scheduled today. All prep rooms are ready.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

export default function TeamChatPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(mockChannels[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const staff = getMockStaff();

  useEffect(() => {
    // Load messages for selected channel
    const channelMessages = mockMessages.filter(m => m.channelId === selectedChannel.id);
    setMessages(channelMessages);
    
    // Mark channel as read
    setChannels(prev => prev.map(ch => 
      ch.id === selectedChannel.id ? { ...ch, unreadCount: 0 } : ch
    ));
  }, [selectedChannel]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      channelId: selectedChannel.id,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update last message in channel
    setChannels(prev => prev.map(ch => 
      ch.id === selectedChannel.id 
        ? {
            ...ch,
            lastMessage: {
              text: newMessage,
              timestamp: message.timestamp,
              sender: `${user.firstName} ${user.lastName}`,
            },
          }
        : ch
    ));
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const formatChannelTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Team Chat</h2>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          {/* Channels */}
          <div className="space-y-1">
            <div className="flex items-center px-2 py-1 text-xs font-semibold text-muted-foreground">
              <Hash className="mr-1 h-3 w-3" />
              CHANNELS
            </div>
            {channels
              .filter(ch => ch.type === 'channel')
              .map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel.id === channel.id ? 'secondary' : 'ghost'}
                  className={cn(
                    "w-full justify-start px-2 py-1 h-auto font-normal",
                    channel.unreadCount > 0 && "font-semibold"
                  )}
                  onClick={() => setSelectedChannel(channel)}
                >
                  <Hash className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">{channel.name}</span>
                  {channel.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 px-1">
                      {channel.unreadCount}
                    </Badge>
                  )}
                </Button>
              ))}
          </div>

          {/* Direct Messages */}
          <div className="mt-4 space-y-1">
            <div className="flex items-center px-2 py-1 text-xs font-semibold text-muted-foreground">
              <Users className="mr-1 h-3 w-3" />
              DIRECT MESSAGES
            </div>
            {staff.slice(0, 5).map((person) => (
              <Button
                key={person.id}
                variant="ghost"
                className="w-full justify-start px-2 py-1 h-auto font-normal"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span>{person.firstName} {person.lastName}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b px-6 flex items-center">
          <Hash className="h-5 w-5 mr-2 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{selectedChannel.name}</h2>
          <span className="ml-2 text-sm text-muted-foreground">
            {staff.length} members
          </span>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center my-4">
                  <Separator className="flex-1" />
                  <span className="mx-4 text-xs text-muted-foreground font-medium">
                    {getDateLabel(date)}
                  </span>
                  <Separator className="flex-1" />
                </div>

                {/* Messages for this date */}
                {dateMessages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.userAvatar} />
                      <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">{message.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {message.isEdited && (
                          <span className="text-xs text-muted-foreground">(edited)</span>
                        )}
                      </div>
                      <p className="text-sm mt-1">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" size="icon" variant="ghost">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${selectedChannel.name}`}
              className="flex-1"
            />
            <Button type="button" size="icon" variant="ghost">
              <Smile className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}