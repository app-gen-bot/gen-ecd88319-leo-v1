'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageList } from '../channel/message-list';
import { MessageInput } from '../channel/message-input';
import { DirectMessageHeader } from './direct-message-header';
import { ThreadPanel } from '../channel/thread-panel';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';
import useSWR from 'swr';
import type { DirectMessage, Message } from '@/types/api';

interface DirectMessageViewProps {
  dmId: string;
}

export function DirectMessageView({ dmId }: DirectMessageViewProps) {
  const router = useRouter();
  const [threadMessageId, setThreadMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Fetch DM
  const { data: directMessages } = useSWR('/direct-messages', () => apiClient.getDirectMessages());
  const dm = directMessages?.find(d => d.id === dmId);

  // Fetch messages
  const { data: messages = [], mutate: mutateMessages } = useSWR(
    dm ? `/messages?dm_id=${dm.id}` : null,
    () => apiClient.getMessages(undefined, dm?.id),
    {
      refreshInterval: 5000, // Poll every 5 seconds
      onError: handleApiError,
    }
  );

  // Handle DM not found
  useEffect(() => {
    if (directMessages && !dm) {
      router.push('/channel/general');
    }
  }, [directMessages, dm, router]);

  const handleSendMessage = async (content: string) => {
    if (!dm) return;

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      dm_id: dm.id,
      user_id: 'user-1', // Would come from auth context
      user_name: 'Demo User',
      user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      content,
      is_edited: false,
      created_at: new Date().toISOString(),
    };

    mutateMessages([...messages, optimisticMessage], false);

    try {
      const realMessage = await apiClient.sendMessage({
        dm_id: dm.id,
        content,
      });

      // Replace optimistic message with real one
      mutateMessages(
        messages => messages?.map(m => 
          m.id === optimisticMessage.id ? realMessage : m
        ),
        false
      );
    } catch (error) {
      // Revert on error
      mutateMessages(
        messages => messages?.filter(m => m.id !== optimisticMessage.id),
        false
      );
      handleApiError(error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      const updatedMessage = await apiClient.updateMessage(messageId, { content });
      mutateMessages(
        messages => messages?.map(m => m.id === messageId ? updatedMessage : m),
        false
      );
      setEditingMessageId(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await apiClient.deleteMessage(messageId);
      mutateMessages(
        messages => messages?.filter(m => m.id !== messageId),
        false
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await apiClient.addReaction({ message_id: messageId, emoji });
      mutateMessages();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      await apiClient.removeReaction(messageId, emoji);
      mutateMessages();
    } catch (error) {
      handleApiError(error);
    }
  };

  if (!dm) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <DirectMessageHeader user={dm.other_user} />
        
        <MessageList
          messages={messages}
          onReplyClick={setThreadMessageId}
          onEditClick={setEditingMessageId}
          onDeleteClick={handleDeleteMessage}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          editingMessageId={editingMessageId}
          onEditCancel={() => setEditingMessageId(null)}
          onEditSave={handleEditMessage}
        />
        
        <MessageInput
          onSend={handleSendMessage}
          placeholder={`Message ${dm.other_user.name}`}
        />
      </div>

      {threadMessageId && (
        <ThreadPanel
          messageId={threadMessageId}
          onClose={() => setThreadMessageId(null)}
        />
      )}
    </div>
  );
}