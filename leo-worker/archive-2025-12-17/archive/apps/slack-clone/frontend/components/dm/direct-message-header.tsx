'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Circle, Phone, Video, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/types/api';

interface DirectMessageHeaderProps {
  user: User;
}

export function DirectMessageHeader({ user }: DirectMessageHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'away':
        return 'text-yellow-500';
      case 'offline':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return 'Active now';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Offline';
      default:
        return 'Offline';
    }
  };

  return (
    <div className="border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">{user.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Circle className={cn('h-2 w-2 fill-current', getStatusColor(user.status))} />
              <span>{getStatusLabel(user.status)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}