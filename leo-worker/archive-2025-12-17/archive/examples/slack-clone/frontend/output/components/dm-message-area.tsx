"use client";

import { useEffect, useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserProfilePopover } from "@/components/user-profile-popover";

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  edited?: boolean;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

interface DMMessageAreaProps {
  userId: string;
}

// Mock users data
const users: Record<string, { name: string; avatar: string; status: string }> = {
  "1": { name: "Alice Johnson", avatar: "AJ", status: "online" },
  "2": { name: "Bob Smith", avatar: "BS", status: "away" },
  "3": { name: "Charlie Brown", avatar: "CB", status: "offline" },
  "4": { name: "Diana Prince", avatar: "DP", status: "online" },
};

// Mock DM conversations
const generateMockDMMessages = (userId: string): Message[] => {

  const dmConversations: Record<string, Message[]> = {
    "1": [
      {
        id: "dm1",
        userId: "1",
        userName: "Alice Johnson",
        userAvatar: "AJ",
        content: "Hey! I wanted to discuss the new project requirements with you.",
        timestamp: "10:30 AM",
      },
      {
        id: "dm2",
        userId: "me",
        userName: "You",
        userAvatar: "ME",
        content: "Sure! I'm free now. What specific aspects did you want to cover?",
        timestamp: "10:32 AM",
      },
      {
        id: "dm3",
        userId: "1",
        userName: "Alice Johnson",
        userAvatar: "AJ",
        content: "I think we need to revisit the timeline. The client has some new requests that might impact our delivery date.",
        timestamp: "10:35 AM",
      },
      {
        id: "dm4",
        userId: "me",
        userName: "You",
        userAvatar: "ME",
        content: "I see. Do you have the list of new requirements? We should assess the impact first.",
        timestamp: "10:37 AM",
        reactions: [
          { emoji: "👍", count: 1, users: ["Alice"] },
        ],
      },
    ],
    "2": [
      {
        id: "dm5",
        userId: "2",
        userName: "Bob Smith",
        userAvatar: "BS",
        content: "Quick question - do you have the API documentation handy?",
        timestamp: "2:15 PM",
      },
      {
        id: "dm6",
        userId: "me",
        userName: "You",
        userAvatar: "ME",
        content: "Yes! Here's the link: [api-docs.example.com]",
        timestamp: "2:18 PM",
      },
      {
        id: "dm7",
        userId: "2",
        userName: "Bob Smith",
        userAvatar: "BS",
        content: "Perfect, thanks! 🙏",
        timestamp: "2:19 PM",
        reactions: [
          { emoji: "✅", count: 1, users: ["You"] },
        ],
      },
    ],
    "3": [
      {
        id: "dm8",
        userId: "me",
        userName: "You",
        userAvatar: "ME",
        content: "Hey Charlie, how's the design review going?",
        timestamp: "Yesterday",
      },
      {
        id: "dm9",
        userId: "3",
        userName: "Charlie Brown",
        userAvatar: "CB",
        content: "Going well! I'll have feedback ready by tomorrow morning.",
        timestamp: "Yesterday",
      },
    ],
    "4": [
      {
        id: "dm10",
        userId: "4",
        userName: "Diana Prince",
        userAvatar: "DP",
        content: "The new mockups look amazing! Great work on the color scheme 🎨",
        timestamp: "3:00 PM",
      },
      {
        id: "dm11",
        userId: "me",
        userName: "You",
        userAvatar: "ME",
        content: "Thank you! I tried to keep it consistent with our brand guidelines while making it feel fresh.",
        timestamp: "3:05 PM",
      },
    ],
  };

  return dmConversations[userId] || [];
};

export function DMMessageArea({ userId }: DMMessageAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = users[userId];

  useEffect(() => {
    // Load mock messages for the DM
    setMessages(generateMockDMMessages(userId));
  }, [userId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleReaction = (messageId: string, emoji: string) => {
    console.log(`Added ${emoji} to message ${messageId}`);
  };

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="py-4 space-y-4">
        {/* DM Header */}
        <div className="pb-4 border-b border-[#2c2f33]">
          <div className="flex items-center gap-3">
            <UserProfilePopover 
              user={{
                id: userId,
                name: user?.name || "Unknown User",
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || userId}`,
                status: user?.status as "online" | "offline" | "away",
                title: "Team Member",
                email: `${(user?.name || "unknown").toLowerCase().replace(" ", ".")}@company.com`
              }}
            >
              <Avatar className="w-12 h-12 bg-[#5865f2] text-white flex items-center justify-center cursor-pointer hover:opacity-80">
                <span className="text-lg font-medium">{user?.avatar || "?"}</span>
              </Avatar>
            </UserProfilePopover>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name || "Unknown User"}</h2>
              <p className="text-sm text-gray-400">
                {user?.status === "online" ? "Active now" : 
                 user?.status === "away" ? "Away" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <div key={message.id} className="group hover:bg-[#222529] -mx-4 px-4 py-2 rounded">
            <div className="flex gap-3">
              <UserProfilePopover 
                user={{
                  id: message.userId,
                  name: message.userName,
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userName}`,
                  status: message.userId === "me" ? "online" : (users[message.userId]?.status as "online" | "offline" | "away"),
                  title: message.userId === "me" ? "You" : "Team Member",
                  email: `${message.userName.toLowerCase().replace(" ", ".")}@company.com`
                }}
              >
                <Avatar className="w-9 h-9 bg-[#5865f2] text-white flex items-center justify-center cursor-pointer hover:opacity-80">
                  <span className="text-sm font-medium">{message.userAvatar}</span>
                </Avatar>
              </UserProfilePopover>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-white">{message.userName}</span>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                  {message.edited && (
                    <span className="text-xs text-gray-500">(edited)</span>
                  )}
                </div>
                <div className="text-gray-300 mt-0.5">{message.content}</div>
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {message.reactions.map((reaction, idx) => (
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
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}