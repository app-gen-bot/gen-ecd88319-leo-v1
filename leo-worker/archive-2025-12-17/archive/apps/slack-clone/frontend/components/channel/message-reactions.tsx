'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reaction } from '@/types/api';

interface MessageReactionsProps {
  reactions: Reaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  currentUserId: string;
}

export function MessageReactions({
  reactions,
  onAddReaction,
  onRemoveReaction,
  currentUserId,
}: MessageReactionsProps) {
  const handleReactionClick = (reaction: Reaction) => {
    if (reaction.users.includes(currentUserId)) {
      onRemoveReaction(reaction.emoji);
    } else {
      onAddReaction(reaction.emoji);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction) => {
        const hasReacted = reaction.users.includes(currentUserId);
        
        return (
          <TooltipProvider key={reaction.emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    'h-7 px-2 text-xs gap-1',
                    hasReacted && 'bg-primary/20 hover:bg-primary/30 border-primary'
                  )}
                  onClick={() => handleReactionClick(reaction)}
                >
                  <span className="text-base">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {reaction.users.length === 1 
                  ? 'You reacted' 
                  : `${reaction.users.length} people reacted`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => {
                // This would typically open an emoji picker
                // For now, just add a thumbs up
                onAddReaction('👍');
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add reaction</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}