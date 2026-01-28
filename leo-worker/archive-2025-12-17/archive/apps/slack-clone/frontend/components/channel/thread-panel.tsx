'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageItem } from './message-item';
import { MessageInput } from './message-input';
import { X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';
import useSWR from 'swr';

interface ThreadPanelProps {
  messageId: string;
  onClose: () => void;
}

export function ThreadPanel({ messageId, onClose }: ThreadPanelProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // In a real app, we'd fetch the thread data
  // For now, using mock data
  const originalMessage = {
    id: messageId,
    channel_id: 'ch-1',
    user_id: 'user-2',
    user_name: 'Alice Johnson',
    user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    content: 'Hey team! Just pushed the new feature to staging. Can someone review?',
    is_edited: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reactions: [
      { emoji: '👍', users: ['user-3', 'user-4'], count: 2 },
      { emoji: '🚀', users: ['user-1'], count: 1 },
    ],
  };

  const threadReplies = [
    {
      id: 'reply-1',
      channel_id: 'ch-1',
      user_id: 'user-3',
      user_name: 'Bob Smith',
      user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      content: 'Looking at it now!',
      is_edited: false,
      created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'reply-2',
      user_id: 'user-3',
      user_name: 'Bob Smith',
      user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      content: 'LGTM! The new component works great. Just one small suggestion - maybe we should add loading state?',
      is_edited: false,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'reply-3',
      user_id: 'user-2',
      user_name: 'Alice Johnson',
      user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      content: 'Good catch! I\'ll add that before merging.',
      is_edited: false,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ];

  const handleSendReply = async (content: string) => {
    try {
      // In real app, would send to API
      console.log('Sending thread reply:', content);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      // In real app, would update via API
      console.log('Editing message:', messageId, content);
      setEditingMessageId(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // In real app, would delete via API
      console.log('Deleting message:', messageId);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      // In real app, would add reaction via API
      console.log('Adding reaction:', messageId, emoji);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      // In real app, would remove reaction via API
      console.log('Removing reaction:', messageId, emoji);
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <div className="w-[400px] border-l flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Thread</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {threadReplies.length} {threadReplies.length === 1 ? 'reply' : 'replies'}
        </p>
      </div>

      {/* Original Message */}
      <div className="p-4 border-b bg-muted/30">
        <MessageItem
          message={originalMessage}
          showAvatar={true}
          isEditing={false}
          onReplyClick={() => {}}
          onEditClick={() => {}}
          onDeleteClick={() => {}}
          onAddReaction={(emoji) => handleAddReaction(originalMessage.id, emoji)}
          onRemoveReaction={(emoji) => handleRemoveReaction(originalMessage.id, emoji)}
          onEditCancel={() => {}}
          onEditSave={() => {}}
        />
      </div>

      {/* Thread Replies */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {threadReplies.map((reply, index) => {
            const prevReply = index > 0 ? threadReplies[index - 1] : null;
            const showAvatar = !prevReply || 
              prevReply.user_id !== reply.user_id ||
              new Date(reply.created_at).getTime() - new Date(prevReply.created_at).getTime() > 5 * 60 * 1000;

            return (
              <MessageItem
                key={reply.id}
                message={reply}
                showAvatar={showAvatar}
                isEditing={editingMessageId === reply.id}
                onReplyClick={() => {}}
                onEditClick={() => setEditingMessageId(reply.id)}
                onDeleteClick={() => handleDeleteMessage(reply.id)}
                onAddReaction={(emoji) => handleAddReaction(reply.id, emoji)}
                onRemoveReaction={(emoji) => handleRemoveReaction(reply.id, emoji)}
                onEditCancel={() => setEditingMessageId(null)}
                onEditSave={(content) => handleEditMessage(reply.id, content)}
              />
            );
          })}
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="border-t">
        <MessageInput
          onSend={handleSendReply}
          placeholder="Reply..."
        />
      </div>
    </div>
  );
}