"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageItem } from "@/components/channel/message-item";
import { MessageComposer } from "@/components/channel/message-composer";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket, wsService } from "@/lib/websocket";
import type { Message } from "@/types";
import { format } from "date-fns";

interface ThreadViewProps {
  parentMessage: Message;
  channelId: string;
  onClose: () => void;
}

export function ThreadView({ parentMessage, channelId, onClose }: ThreadViewProps) {
  const { toast } = useToast();
  const [replies, setReplies] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock thread replies
  useEffect(() => {
    loadThreadReplies();
  }, [parentMessage.id]);

  const loadThreadReplies = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch thread replies from the API
      const mockReplies: Message[] = [
        {
          id: "reply-1",
          channel_id: channelId,
          user_id: "user-2",
          content: "I'll take a look at this right away!",
          is_edited: false,
          thread_count: 0,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString(),
          user: {
            id: "user-2",
            email: "alice@teamsync.com",
            full_name: "Alice Johnson",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
            status: "online",
            last_seen_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          id: "reply-2",
          channel_id: channelId,
          user_id: "user-3",
          content: "Let me know if you need any help with this.",
          is_edited: false,
          thread_count: 0,
          created_at: new Date(Date.now() - 900000).toISOString(),
          updated_at: new Date(Date.now() - 900000).toISOString(),
          user: {
            id: "user-3",
            email: "bob@teamsync.com",
            full_name: "Bob Smith",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
            status: "away",
            last_seen_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ];
      setReplies(mockReplies);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load thread replies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up WebSocket handlers for thread updates
  useWebSocket({
    [`thread:${parentMessage.id}:reply:new`]: (reply: Message) => {
      setReplies(prev => [...prev, reply]);
    },
    [`thread:${parentMessage.id}:reply:update`]: (reply: Message) => {
      setReplies(prev => prev.map(r => r.id === reply.id ? reply : r));
    },
    [`thread:${parentMessage.id}:reply:delete`]: (replyId: string) => {
      setReplies(prev => prev.filter(r => r.id !== replyId));
    },
  }, [parentMessage.id]);

  const handleSendReply = async (content: string) => {
    try {
      // In a real app, this would send the reply to the API
      const newReply: Message = {
        id: `reply-${Date.now()}`,
        channel_id: channelId,
        user_id: "user-1",
        content,
        is_edited: false,
        thread_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: "user-1",
          email: "demo@teamsync.com",
          full_name: "Demo User",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
          status: "online",
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      setReplies(prev => [...prev, newReply]);
      
      // Update parent message thread count
      parentMessage.thread_count = (parentMessage.thread_count || 0) + 1;
      
      toast({
        title: "Reply sent",
        description: "Your reply has been added to the thread.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  // Auto-scroll to bottom when new replies arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [replies]);

  return (
    <div className="w-[480px] h-full border-l bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">Thread</h3>
          <p className="text-sm text-muted-foreground">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {/* Parent Message */}
          <div className="relative">
            <div className="absolute left-8 top-12 bottom-0 w-px bg-border" />
            <MessageItem
              message={parentMessage}
              showAvatar={true}
              onReply={() => {}} // Disable reply button in thread view
              onCreateTask={() => {
                toast({
                  title: "Create Task",
                  description: "Task creation from thread will be implemented soon.",
                });
              }}
              onEdit={() => {
                toast({
                  title: "Edit Message",
                  description: "Message editing will be implemented soon.",
                });
              }}
              onDelete={() => {
                toast({
                  title: "Delete Message",
                  description: "Message deletion will be implemented soon.",
                });
              }}
              onReact={(emoji) => {
                toast({
                  title: "Reaction Added",
                  description: `You reacted with ${emoji}`,
                });
              }}
            />
          </div>

          {/* Thread Separator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-11">
            <span>{replies.length} {replies.length === 1 ? "reply" : "replies"}</span>
            <Separator className="flex-1" />
            <span>
              Last reply {replies.length > 0 
                ? format(new Date(replies[replies.length - 1].created_at), "h:mm a")
                : ""}
            </span>
          </div>

          {/* Replies */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading replies...
            </div>
          ) : (
            <div className="space-y-4 pl-11">
              {replies.map((reply, index) => (
                <MessageItem
                  key={reply.id}
                  message={reply}
                  showAvatar={true}
                  onReply={() => {}} // Disable nested replies
                  onCreateTask={() => {
                    toast({
                      title: "Create Task",
                      description: "Task creation from reply will be implemented soon.",
                    });
                  }}
                  onEdit={() => {
                    toast({
                      title: "Edit Reply",
                      description: "Reply editing will be implemented soon.",
                    });
                  }}
                  onDelete={() => {
                    toast({
                      title: "Delete Reply",
                      description: "Reply deletion will be implemented soon.",
                    });
                  }}
                  onReact={(emoji) => {
                    toast({
                      title: "Reaction Added",
                      description: `You reacted with ${emoji}`,
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Reply Composer */}
      <div className="border-t p-4">
        <MessageComposer
          channelName="thread"
          channelId={`thread-${parentMessage.id}`}
          onSend={handleSendReply}
          placeholder="Reply to thread..."
        />
      </div>
    </div>
  );
}