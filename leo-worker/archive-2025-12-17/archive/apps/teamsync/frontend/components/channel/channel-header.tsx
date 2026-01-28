import { Hash, Lock, Star, Settings, Users, Pin, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Channel } from "@/types";
import { cn } from "@/lib/utils";

interface ChannelHeaderProps {
  channel: Channel;
  onStarClick?: () => void;
  onMembersClick?: () => void;
  onSettingsClick?: () => void;
}

export function ChannelHeader({
  channel,
  onStarClick,
  onMembersClick,
  onSettingsClick,
}: ChannelHeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        {channel.is_private ? (
          <Lock className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Hash className="h-5 w-5 text-muted-foreground" />
        )}
        <h1 className="text-lg font-semibold">{channel.name}</h1>
        {channel.description && (
          <span className="text-sm text-muted-foreground hidden md:inline">
            {channel.description}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onStarClick}
          className="h-8 w-8"
        >
          <Star className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onMembersClick}
          className="h-8"
        >
          <Users className="h-4 w-4 mr-1" />
          <span>{channel.member_count}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pin className="mr-2 h-4 w-4" />
              Pinned Messages
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              View Members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              Channel Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}