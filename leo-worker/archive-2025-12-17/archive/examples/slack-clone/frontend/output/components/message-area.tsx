"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, MessageSquare, Smile, MoreVertical } from "lucide-react";
import { UserProfilePopover } from "@/components/user-profile-popover";
import { useMessages } from "@/hooks/use-messages";
import { useSlackData } from "@/hooks/use-slack-data";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MessageAreaProps {
  channelId: string;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  timestamp_human?: string;
  is_edited: boolean;
  reactions?: Array<{ emoji: string; count: number }>;
  thread_count?: number;
}

export function MessageArea({ channelId }: MessageAreaProps) {
  const { messages, isLoading, error, addReaction, updateMessage, deleteMessage } = useMessages(channelId);
  const { currentUser } = useSlackData();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [, setThreadOpenId] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const startEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const saveEdit = async (messageId: string) => {
    if (!editContent.trim()) return;
    
    try {
      await updateMessage(messageId, editContent);
      setEditingMessageId(null);
      setEditContent("");
      toast({
        title: "Message updated",
        description: "Your message has been edited.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setDeleteConfirmId(null);
      toast({
        title: "Message deleted",
        description: "Your message has been removed.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canEditMessage = (message: Message) => {
    if (!currentUser) return false;
    if (message.user_id !== currentUser.id) return false;
    const messageTime = new Date(message.created_at).getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;
    return (now - messageTime) < fiveMinutes;
  };

  const canDeleteMessage = (message: Message) => {
    return currentUser && message.user_id === currentUser.id;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-1 px-4">
      <div className="py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="group hover:bg-[#222529] -mx-4 px-4 py-2 rounded relative">
              {/* Hover Actions */}
              <div className="absolute -top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1d21] border border-[#2c2f33] rounded-md shadow-lg flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white"
                  onClick={() => handleReaction(message.id, "👍")}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white"
                  onClick={() => setThreadOpenId(message.id)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                {canEditMessage(message) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white"
                    onClick={() => startEdit(message)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {canDeleteMessage(message) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white"
                    onClick={() => setDeleteConfirmId(message.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Copy link</DropdownMenuItem>
                    <DropdownMenuItem>Pin message</DropdownMenuItem>
                    <DropdownMenuItem>Mark unread</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex gap-3">
                <UserProfilePopover 
                  user={{
                    id: message.user_id,
                    name: message.user_name,
                    avatar: message.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user_name}`,
                    status: "online",
                    title: "Team Member",
                    email: `${message.user_name.toLowerCase().replace(" ", ".")}@company.com`
                  }}
                >
                  <Avatar className="w-9 h-9 bg-[#5865f2] text-white flex items-center justify-center cursor-pointer hover:opacity-80">
                    <span className="text-sm font-medium">
                      {message.user_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </span>
                  </Avatar>
                </UserProfilePopover>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white">{message.user_name}</span>
                    <span className="text-xs text-gray-500">{message.timestamp_human || new Date(message.created_at).toLocaleTimeString()}</span>
                    {message.is_edited && (
                      <span className="text-xs text-gray-500">(edited)</span>
                    )}
                  </div>
                  
                  {/* Message Content or Edit Mode */}
                  {editingMessageId === message.id ? (
                    <div className="mt-1">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            saveEdit(message.id);
                          } else if (e.key === "Escape") {
                            cancelEdit();
                          }
                        }}
                        className="bg-[#40444b] border-[#40444b] text-white"
                        autoFocus
                      />
                      <div className="mt-2 text-xs text-gray-400">
                        escape to <button onClick={cancelEdit} className="text-[#5865f2] hover:underline">cancel</button> • 
                        enter to <button onClick={() => saveEdit(message.id)} className="text-[#5865f2] hover:underline">save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-300 mt-0.5">{message.content}</div>
                  )}
                  
                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {message.reactions.map((reaction: { emoji: string; count: number }, idx: number) => (
                        <Button
                          key={idx}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 bg-[#2c2f33] hover:bg-[#383b40] text-gray-300"
                          onClick={() => handleReaction(message.id, reaction.emoji)}
                        >
                          <span className="mr-1">{reaction.emoji}</span>
                          <span className="text-xs">{reaction.count}</span>
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Thread indicator */}
                  {message.thread_count && message.thread_count > 0 && (
                    <Button
                      variant="ghost"
                      className="mt-2 h-auto p-2 text-[#5865f2] hover:bg-[#2c2f33]"
                      onClick={() => {
                        setThreadOpenId(message.id);
                        toast({
                          title: "Thread view",
                          description: "Thread panel would open here. Not implemented in demo.",
                        });
                      }}
                    >
                      <span className="text-sm">{message.thread_count} replies</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
    
    {/* Delete Confirmation Dialog */}
    <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete message?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your message. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}