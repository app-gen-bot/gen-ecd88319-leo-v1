'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Users, Settings, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Channel } from '@/types/api';

interface ChannelHeaderProps {
  channel: Channel;
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  return (
    <div className="border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h1 className="font-semibold text-lg">{channel.name}</h1>
          {channel.member_count && (
            <Badge variant="secondary" className="ml-2">
              <Users className="h-3 w-3 mr-1" />
              {channel.member_count}
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Channel details</DropdownMenuItem>
            <DropdownMenuItem>Notification preferences</DropdownMenuItem>
            <DropdownMenuItem>Add people</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {channel.description && (
        <p className="text-sm text-muted-foreground mt-1">{channel.description}</p>
      )}
    </div>
  );
}