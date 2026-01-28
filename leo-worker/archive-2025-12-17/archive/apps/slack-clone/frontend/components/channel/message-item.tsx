'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageReactions } from './message-reactions';
import { EmojiPicker } from './emoji-picker';
import { UserProfilePopover } from '../user/user-profile-popover';
import { useAuth } from '@/contexts/auth-context';
import { 
  Smile, 
  MessageSquare, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/api';

interface MessageItemProps {
  message: Message;
  showAvatar: boolean;
  isEditing: boolean;
  onReplyClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  onEditCancel: () => void;
  onEditSave: (content: string) => void;
}

export function MessageItem({
  message,
  showAvatar,
  isEditing,
  onReplyClick,
  onEditClick,
  onDeleteClick,
  onAddReaction,
  onRemoveReaction,
  onEditCancel,
  onEditSave,
}: MessageItemProps) {
  const { user } = useAuth();
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isOwnMessage = user?.id === message.user_id;
  const canEdit = isOwnMessage && 
    new Date().getTime() - new Date(message.created_at).getTime() < 5 * 60 * 1000;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEditSave(editContent);
    } else {
      onEditCancel();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditContent(message.content);
      onEditCancel();
    }
  };

  return (
    <div
      className={cn(
        'group relative flex gap-3 px-2 py-1 rounded hover:bg-accent/50',
        showAvatar ? 'mt-4' : 'mt-0.5'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar or timestamp */}
      <div className="w-10 shrink-0">
        {showAvatar ? (
          <UserProfilePopover
            userId={message.user_id}
            open={profileOpen}
            onOpenChange={setProfileOpen}
          >
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={message.user_avatar} alt={message.user_name} />
              <AvatarFallback>{getInitials(message.user_name)}</AvatarFallback>
            </Avatar>
          </UserProfilePopover>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 cursor-default">
                  {format(new Date(message.created_at), 'HH:mm')}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {format(new Date(message.created_at), 'PPpp')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-1">
            <button
              className="font-semibold text-sm hover:underline"
              onClick={() => setProfileOpen(true)}
            >
              {message.user_name}
            </button>
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), 'h:mm a')}
            </span>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="min-h-[60px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEditSave}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditContent(message.content);
                  onEditCancel();
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              escape to cancel • enter to save
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
              {message.is_edited && (
                <span className="text-xs text-muted-foreground ml-1">(edited)</span>
              )}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <MessageReactions
                reactions={message.reactions}
                onAddReaction={onAddReaction}
                onRemoveReaction={onRemoveReaction}
                currentUserId={user?.id || ''}
              />
            )}

            {/* Thread indicator */}
            {message.thread_count && message.thread_count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-auto py-1 px-2 text-primary"
                onClick={onReplyClick}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                {message.thread_count} {message.thread_count === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      {showActions && !isEditing && (
        <div className="absolute right-2 -top-3 bg-background border rounded-md shadow-sm flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add reaction</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onReplyClick}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reply in thread</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {canEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onEditClick}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isOwnMessage && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={onDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute right-2 top-8 z-50">
          <EmojiPicker
            onSelect={(emoji) => {
              onAddReaction(emoji);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}
    </div>
  );
}