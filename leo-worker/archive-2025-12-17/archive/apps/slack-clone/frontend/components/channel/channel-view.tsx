'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { ChannelHeader } from './channel-header';
import { ThreadPanel } from './thread-panel';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';
import useSWR from 'swr';
import type { Channel, Message } from '@/types/api';

interface ChannelViewProps {
  channelName: string;
}

export function ChannelView({ channelName }: ChannelViewProps) {
  const router = useRouter();
  const [threadMessageId, setThreadMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Fetch channel
  const { data: channels } = useSWR('/channels', () => apiClient.getChannels());
  const channel = channels?.find(ch => ch.name === channelName);

  // Fetch messages
  const { data: messages = [], mutate: mutateMessages } = useSWR(
    channel ? `/messages?channel_id=${channel.id}` : null,
    () => apiClient.getMessages(channel?.id),
    {
      refreshInterval: 5000, // Poll every 5 seconds
      onError: handleApiError,
    }
  );

  // Handle channel not found
  useEffect(() => {
    if (channels && !channel) {
      router.push('/channel/general');
    }
  }, [channels, channel, router]);

  const handleSendMessage = async (content: string) => {
    if (!channel) return;

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      channel_id: channel.id,
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
        channel_id: channel.id,
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

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <ChannelHeader channel={channel} />
        
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
          placeholder={`Message #${channel.name}`}
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