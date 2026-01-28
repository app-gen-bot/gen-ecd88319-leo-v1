'use client';

import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './message-item';
import { MessageSquare } from 'lucide-react';
import type { Message } from '@/types/api';

interface MessageListProps {
  messages: Message[];
  onReplyClick: (messageId: string) => void;
  onEditClick: (messageId: string) => void;
  onDeleteClick: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  editingMessageId: string | null;
  onEditCancel: () => void;
  onEditSave: (messageId: string, content: string) => void;
}

export function MessageList({
  messages,
  onReplyClick,
  onEditClick,
  onDeleteClick,
  onAddReaction,
  onRemoveReaction,
  editingMessageId,
  onEditCancel,
  onEditSave,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-3">
          <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
          <div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Be the first to say something!</p>
          </div>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <ScrollArea
      ref={scrollRef}
      className="flex-1 px-4"
      onScroll={handleScroll}
    >
      <div className="py-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            
            {dateMessages.map((message, index) => {
              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const showAvatar = !prevMessage || 
                prevMessage.user_id !== message.user_id ||
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000;

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  showAvatar={showAvatar}
                  isEditing={editingMessageId === message.id}
                  onReplyClick={() => onReplyClick(message.id)}
                  onEditClick={() => onEditClick(message.id)}
                  onDeleteClick={() => onDeleteClick(message.id)}
                  onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
                  onRemoveReaction={(emoji) => onRemoveReaction(message.id, emoji)}
                  onEditCancel={onEditCancel}
                  onEditSave={(content) => onEditSave(message.id, content)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}