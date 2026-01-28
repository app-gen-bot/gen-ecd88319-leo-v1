"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket";
import type { TypingIndicator as TypingIndicatorType } from "@/types";

interface TypingIndicatorProps {
  channelId: string;
  currentUserId: string;
}

export function TypingIndicator({ channelId, currentUserId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicatorType>>(new Map());

  useWebSocket({
    [`channel:${channelId}:typing:start`]: (indicator: TypingIndicatorType) => {
      if (indicator.user_id !== currentUserId) {
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.set(indicator.user_id, indicator);
          return next;
        });
      }
    },
    [`channel:${channelId}:typing:stop`]: (indicator: TypingIndicatorType) => {
      setTypingUsers(prev => {
        const next = new Map(prev);
        next.delete(indicator.user_id);
        return next;
      });
    },
  }, [channelId, currentUserId]);

  // Clean up stale typing indicators after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const next = new Map(prev);
        let changed = false;
        
        prev.forEach((indicator, userId) => {
          // Remove if older than 5 seconds
          const createdAt = (indicator as any).created_at || Date.now();
          if (now - new Date(createdAt).getTime() > 5000) {
            next.delete(userId);
            changed = true;
          }
        });
        
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const typingUsersList = Array.from(typingUsers.values());

  if (typingUsersList.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsersList.length === 1) {
      return `${typingUsersList[0].user.full_name} is typing...`;
    } else if (typingUsersList.length === 2) {
      return `${typingUsersList[0].user.full_name} and ${typingUsersList[1].user.full_name} are typing...`;
    } else {
      return `${typingUsersList[0].user.full_name} and ${typingUsersList.length - 1} others are typing...`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground flex items-center space-x-2">
      <div className="flex space-x-1">
        <span className="animate-bounce animation-delay-0">•</span>
        <span className="animate-bounce animation-delay-200">•</span>
        <span className="animate-bounce animation-delay-400">•</span>
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
}