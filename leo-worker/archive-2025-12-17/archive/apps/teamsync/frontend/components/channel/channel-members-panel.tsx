"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ChannelMember } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ChannelMembersPanel() {
  const params = useParams();
  const channelId = params.channelId as string;
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, [channelId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockMembers: ChannelMember[] = [
        {
          id: "cm-1",
          channel_id: channelId,
          user_id: "user-1",
          joined_at: new Date().toISOString(),
          user: {
            id: "user-1",
            email: "demo@teamsync.com",
            full_name: "Demo User",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
            title: "Product Manager",
            status: "online",
            last_seen_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          id: "cm-2",
          channel_id: channelId,
          user_id: "user-2",
          joined_at: new Date().toISOString(),
          user: {
            id: "user-2",
            email: "alice@teamsync.com",
            full_name: "Alice Johnson",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
            title: "Senior Developer",
            status: "online",
            last_seen_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          id: "cm-3",
          channel_id: channelId,
          user_id: "user-3",
          joined_at: new Date().toISOString(),
          user: {
            id: "user-3",
            email: "bob@teamsync.com",
            full_name: "Bob Smith",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
            title: "Full Stack Developer",
            status: "away",
            last_seen_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          id: "cm-4",
          channel_id: channelId,
          user_id: "user-4",
          joined_at: new Date().toISOString(),
          user: {
            id: "user-4",
            email: "charlie@teamsync.com",
            full_name: "Charlie Davis",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
            title: "Designer",
            status: "offline",
            last_seen_at: new Date(Date.now() - 3600000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ];
      setMembers(mockMembers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load channel members.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Members List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 pb-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading members...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No members found" : "No members in this channel"}
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent cursor-pointer"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.user.avatar_url} />
                    <AvatarFallback>{getInitials(member.user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                      getStatusColor(member.user.status)
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.user.title || member.user.email}
                  </p>
                </div>
                {member.user.status === "online" && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Members Button */}
      <div className="border-t p-4">
        <Button className="w-full" onClick={() => {
          toast({
            title: "Add Members",
            description: "Member invitation will be implemented soon.",
          });
        }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Members
        </Button>
      </div>
    </div>
  );
}