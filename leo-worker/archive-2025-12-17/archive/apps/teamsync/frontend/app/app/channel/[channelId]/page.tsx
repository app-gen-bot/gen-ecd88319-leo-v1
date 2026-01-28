"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Hash, Star, Settings, Users, Pin, MoreVertical, Send, Paperclip, Smile, AtSign, Bold, Italic, Code, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { Channel, Message } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MessageItem } from "@/components/channel/message-item";
import { MessageComposer } from "@/components/channel/message-composer";
import { ChannelHeader } from "@/components/channel/channel-header";
import { TypingIndicator } from "@/components/channel/typing-indicator";
import { ThreadView } from "@/components/channel/thread-view";
import { MessageToTaskModal } from "@/components/channels/message-to-task-modal";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWebSocket, wsService } from "@/lib/websocket";
import { useAuth } from "@/contexts/auth-context";
import useSWR, { mutate } from "swr";

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.channelId as string;
  const { setRightPanel, setSelectedThread, selectedThread, rightPanelContent, closeRightPanel } = useWorkspaceStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [messageToTaskModal, setMessageToTaskModal] = useState<{
    open: boolean;
    message: Message | null;
  }>({ open: false, message: null });

  // Fetch channel data
  const { data: channel, error: channelError } = useSWR(
    `/channels/${channelId}`,
    () => apiClient.getChannel(channelId),
    {
      revalidateOnFocus: false,
    }
  );

  // Fetch messages
  const { data: messagesData, error: messagesError } = useSWR(
    channel ? `/messages?channel_id=${channelId}` : null,
    () => apiClient.getMessages(channelId),
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const messages = messagesData?.data || [];

  // Set up WebSocket handlers
  useWebSocket({
    [`channel:${channelId}:message:new`]: (message: Message) => {
      // Add new message to the list
      mutate(
        `/messages?channel_id=${channelId}`,
        (data: any) => ({
          ...data,
          data: [...(data?.data || []), message],
        }),
        false
      );
    },
    [`channel:${channelId}:message:update`]: (message: Message) => {
      // Update existing message
      mutate(
        `/messages?channel_id=${channelId}`,
        (data: any) => ({
          ...data,
          data: data?.data?.map((m: Message) => 
            m.id === message.id ? message : m
          ) || [],
        }),
        false
      );
    },
    [`channel:${channelId}:message:delete`]: (messageId: string) => {
      // Remove deleted message
      mutate(
        `/messages?channel_id=${channelId}`,
        (data: any) => ({
          ...data,
          data: data?.data?.filter((m: Message) => m.id !== messageId) || [],
        }),
        false
      );
    },
  }, [channelId]);

  // Subscribe to channel updates
  useEffect(() => {
    if (channel) {
      wsService.subscribeToChannel(channelId);
      
      return () => {
        wsService.unsubscribeFromChannel(channelId);
      };
    }
  }, [channel, channelId]);

  // Auto-scroll to bottom when new messages arrive (if already at bottom)
  useEffect(() => {
    if (isAtBottom && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const threshold = 100;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < threshold;
    setIsAtBottom(isNearBottom);
  };

  const handleSendMessage = async (content: string, alsoCreateTask?: boolean) => {
    try {
      const newMessage = await apiClient.sendMessage({
        channel_id: channelId,
        content,
      });

      // Optimistically update the messages
      mutate(
        `/messages?channel_id=${channelId}`,
        (data: any) => ({
          ...data,
          data: [...(data?.data || []), newMessage],
        }),
        false
      );

      if (alsoCreateTask) {
        toast({
          title: "Task Creation",
          description: "Task creation from message will be implemented soon.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStarChannel = () => {
    toast({
      title: "Channel Starred",
      description: "Channel has been added to your favorites.",
    });
  };

  const handleShowMembers = () => {
    setRightPanel("members");
  };

  const handleChannelSettings = () => {
    toast({
      title: "Channel Settings",
      description: "Channel settings will be implemented soon.",
    });
  };

  if (channelError || messagesError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Error loading channel</p>
          <p className="text-sm text-muted-foreground">
            {channelError?.message || messagesError?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading channel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Channel Header */}
      <ChannelHeader
        channel={channel}
        onStarClick={handleStarChannel}
        onMembersClick={handleShowMembers}
        onSettingsClick={handleChannelSettings}
      />

      {/* Messages Area */}
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 px-4"
        onScroll={handleScroll}
      >
        <div className="py-4 space-y-4">
          {/* Channel Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Hash className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                Welcome to #{channel.name}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {channel.description ||
                  "This is the very beginning of this channel. Start a conversation!"}
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar =
              !previousMessage ||
              previousMessage.user_id !== message.user_id ||
              new Date(message.created_at).getTime() -
                new Date(previousMessage.created_at).getTime() >
                300000; // 5 minutes

            return (
              <MessageItem
                key={message.id}
                message={message}
                showAvatar={showAvatar}
                onReply={() => {
                  setSelectedThread(message);
                }}
                onCreateTask={() => {
                  setMessageToTaskModal({ open: true, message });
                }}
                onEdit={() =>
                  toast({
                    title: "Edit Message",
                    description: "Message editing will be implemented soon.",
                  })
                }
                onDelete={() =>
                  toast({
                    title: "Delete Message",
                    description: "Message deletion will be implemented soon.",
                  })
                }
                onReact={(emoji) =>
                  toast({
                    title: "Reaction Added",
                    description: `You reacted with ${emoji}`,
                  })
                }
              />
            );
          })}

          {/* New Message Indicator */}
          {!isAtBottom && (
            <div className="sticky bottom-4 flex justify-center">
              <Button
                size="sm"
                onClick={() => {
                  if (scrollAreaRef.current) {
                    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
                  }
                }}
              >
                New messages ↓
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      {user && <TypingIndicator channelId={channelId} currentUserId={user.id} />}

      {/* Message Composer */}
      <div className="border-t p-4">
        <MessageComposer
          channelName={channel.name}
          channelId={channelId}
          onSend={handleSendMessage}
          onAttach={() =>
            toast({
              title: "File Upload",
              description: "File upload will be implemented soon.",
            })
          }
        />
      </div>

      {/* Message to Task Modal */}
      {messageToTaskModal.message && (
        <MessageToTaskModal
          open={messageToTaskModal.open}
          onOpenChange={(open) => {
            if (!open) {
              setMessageToTaskModal({ open: false, message: null });
            }
          }}
          message={messageToTaskModal.message}
          onSuccess={(taskId) => {
            toast({
              title: "Task Created",
              description: "Task has been created from the message.",
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Get project ID from the created task
                    router.push(`/app/projects/proj-1`); // In real app, get project ID from task
                  }}
                >
                  View Task
                </Button>
              ),
            });
            setMessageToTaskModal({ open: false, message: null });
          }}
        />
      )}
    </div>
  );
}