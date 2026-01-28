import { useState } from "react";
import { MoreHorizontal, Reply, FileText, Edit, Trash, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Message } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/auth-context";

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
  onReply?: () => void;
  onCreateTask?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReact?: (emoji: string) => void;
}

export function MessageItem({
  message,
  showAvatar = true,
  onReply,
  onCreateTask,
  onEdit,
  onDelete,
  onReact,
}: MessageItemProps) {
  const { user: currentUser } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwnMessage = currentUser?.id === message.user_id;

  const commonReactions = ["👍", "❤️", "😄", "🎉", "👀", "🚀"];

  const handleReaction = (emoji: string) => {
    onReact?.(emoji);
    setShowEmojiPicker(false);
  };

  const messageActions = (
    <>
      <DropdownMenuItem onClick={onReply}>
        <Reply className="mr-2 h-4 w-4" />
        Reply in Thread
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onCreateTask}>
        <FileText className="mr-2 h-4 w-4" />
        Create Task
      </DropdownMenuItem>
      {isOwnMessage && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Message
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete Message
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "group flex gap-3 px-1 py-1 hover:bg-accent/50 rounded-md transition-colors",
            !showAvatar && "ml-11"
          )}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {showAvatar && (
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarImage src={message.user.avatar_url} />
              <AvatarFallback>
                {message.user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex-1 space-y-1">
            {showAvatar && (
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{message.user.full_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                  })}
                </span>
                {message.is_edited && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
              </div>
            )}
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction) => (
                  <Button
                    key={reaction.id}
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleReaction(reaction.emoji)}
                  >
                    {reaction.emoji} {reaction.user_id === currentUser?.id && "1"}
                  </Button>
                ))}
              </div>
            )}

            {/* Thread indicator */}
            {message.thread_count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs text-primary"
                onClick={onReply}
              >
                {message.thread_count} {message.thread_count === 1 ? "reply" : "replies"}
              </Button>
            )}

            {/* Task indicator */}
            {message.task_id && (
              <Badge variant="secondary" className="text-xs">
                <FileText className="mr-1 h-3 w-3" />
                Task created
              </Badge>
            )}
          </div>

          {/* Floating actions */}
          <div
            className={cn(
              "flex items-start gap-1 opacity-0 transition-opacity",
              showActions && "opacity-100"
            )}
          >
            {/* Emoji reaction */}
            <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Smile className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto p-2">
                <div className="grid grid-cols-6 gap-1">
                  {commonReactions.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Message actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">{messageActions}</DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onReply}>
          <Reply className="mr-2 h-4 w-4" />
          Reply in Thread
        </ContextMenuItem>
        <ContextMenuItem onClick={onCreateTask}>
          <FileText className="mr-2 h-4 w-4" />
          Create Task
        </ContextMenuItem>
        {isOwnMessage && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Message
            </ContextMenuItem>
            <ContextMenuItem onClick={onDelete} className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete Message
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}