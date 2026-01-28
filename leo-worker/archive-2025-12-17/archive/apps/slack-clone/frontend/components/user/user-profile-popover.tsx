'use client';

import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';
import useSWR from 'swr';
import { MessageSquare, User, Video, Phone, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfilePopoverProps {
  userId: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserProfilePopover({ 
  userId, 
  children, 
  open, 
  onOpenChange 
}: UserProfilePopoverProps) {
  const router = useRouter();

  // In a real app, we'd fetch user data
  // For now, using mock data
  const user = {
    id: userId,
    email: 'alice@example.com',
    name: 'Alice Johnson',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    title: 'Senior Developer',
    status: 'online' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

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
        return 'Active';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Offline';
      default:
        return 'Offline';
    }
  };

  const handleMessage = async () => {
    try {
      const dm = await apiClient.createDirectMessage(userId);
      router.push(`/dm/${dm.id}`);
      onOpenChange?.(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleViewProfile = () => {
    // In a real app, would navigate to full profile
    console.log('View profile:', userId);
    onOpenChange?.(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              {user.title && (
                <p className="text-sm text-muted-foreground">{user.title}</p>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Circle className={cn('h-2 w-2 fill-current', getStatusColor(user.status))} />
                <span>{getStatusLabel(user.status)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Email:</span>
              <a 
                href={`mailto:${user.email}`}
                className="ml-2 text-primary hover:underline"
              >
                {user.email}
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              Local time: {new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full justify-start"
              onClick={handleMessage}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleViewProfile}
            >
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 justify-center"
                disabled
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button
                variant="outline"
                className="flex-1 justify-center"
                disabled
              >
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Call and video features coming soon
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}