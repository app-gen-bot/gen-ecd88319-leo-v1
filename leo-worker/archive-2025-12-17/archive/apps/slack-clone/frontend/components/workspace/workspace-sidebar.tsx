'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ChevronDown, 
  Hash, 
  Lock, 
  Plus, 
  Settings,
  LogOut,
  Users,
  Circle,
  MoreVertical,
  Volume2,
  VolumeX,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateChannelModal } from './create-channel-modal';
import { InviteModal } from './invite-modal';
import { UserPicker } from './user-picker';
import useSWR from 'swr';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';

export function WorkspaceSidebar() {
  const { user, workspace, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [deleteChannelId, setDeleteChannelId] = useState<string | null>(null);
  const [mutedChannels, setMutedChannels] = useState<Set<string>>(new Set());

  // Fetch channels
  const { data: channels = [], mutate: mutateChannels } = useSWR(
    '/channels',
    () => apiClient.getChannels(),
    {
      onError: handleApiError,
    }
  );

  // Fetch direct messages
  const { data: directMessages = [], mutate: mutateDMs } = useSWR(
    '/direct-messages',
    () => apiClient.getDirectMessages(),
    {
      onError: handleApiError,
    }
  );

  const handleCreateWorkspace = () => {
    router.push('/create-workspace');
  };

  const handleLeaveChannel = async (channelId: string) => {
    try {
      await apiClient.leaveChannel(channelId);
      mutateChannels();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteChannel = async () => {
    if (!deleteChannelId) return;
    
    try {
      await apiClient.deleteChannel(deleteChannelId);
      mutateChannels();
      setDeleteChannelId(null);
      
      // Navigate away if we're in the deleted channel
      if (pathname.includes(deleteChannelId)) {
        router.push('/channel/general');
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const toggleMuteChannel = (channelId: string) => {
    setMutedChannels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(channelId)) {
        newSet.delete(channelId);
      } else {
        newSet.add(channelId);
      }
      return newSet;
    });
  };

  const getPresenceColor = (status: string) => {
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

  const isChannelActive = (channelId: string) => {
    return pathname === `/channel/${channelId}`;
  };

  const isDMActive = (dmId: string) => {
    return pathname === `/dm/${dmId}`;
  };

  return (
    <div className="w-[250px] bg-muted/30 border-r flex flex-col h-full">
      {/* Workspace Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between px-4 py-6 rounded-none border-b"
          >
            <span className="font-semibold truncate">{workspace?.name || 'Workspace'}</span>
            <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[230px]">
          <DropdownMenuItem disabled>
            Switch Workspace
          </DropdownMenuItem>
          {user?.id === workspace?.owner_id && (
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              <Settings className="mr-2 h-4 w-4" />
              Workspace Settings
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCreateWorkspace}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Workspace
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Channels Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Channels
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setCreateChannelOpen(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-0.5">
              {channels.map(channel => (
                <div key={channel.id} className="group relative">
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start px-2 py-1 h-7 font-normal',
                      isChannelActive(channel.name) && 'bg-primary/10 text-primary',
                      channel.unread_count && channel.unread_count > 0 && 'font-semibold'
                    )}
                    onClick={() => router.push(`/channel/${channel.name}`)}
                  >
                    {channel.is_private ? (
                      <Lock className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <Hash className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    <span className="truncate">{channel.name}</span>
                    {channel.unread_count && channel.unread_count > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                        {channel.unread_count}
                      </Badge>
                    )}
                    {mutedChannels.has(channel.id) && (
                      <VolumeX className="h-3 w-3 ml-1 text-muted-foreground" />
                    )}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-0.5 h-6 w-6 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(user?.id === workspace?.owner_id || user?.id === channel.created_by) && (
                        <DropdownMenuItem onClick={() => router.push(`/channel/${channel.name}/settings`)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Channel Settings
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        Notification Preferences
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleMuteChannel(channel.id)}>
                        {mutedChannels.has(channel.id) ? (
                          <>
                            <Volume2 className="mr-2 h-4 w-4" />
                            Unmute Channel
                          </>
                        ) : (
                          <>
                            <VolumeX className="mr-2 h-4 w-4" />
                            Mute Channel
                          </>
                        )}
                      </DropdownMenuItem>
                      {channel.name !== 'general' && channel.name !== 'random' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleLeaveChannel(channel.id)}
                            className="text-destructive"
                          >
                            Leave Channel
                          </DropdownMenuItem>
                          {(user?.id === workspace?.owner_id || user?.id === channel.created_by) && (
                            <DropdownMenuItem
                              onClick={() => setDeleteChannelId(channel.id)}
                              className="text-destructive"
                            >
                              Delete Channel
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1 h-7 font-normal text-muted-foreground"
                onClick={() => router.push('/browse-channels')}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Browse channels
              </Button>
            </div>
          </div>

          <Separator />

          {/* Direct Messages Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Direct Messages
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setUserPickerOpen(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-0.5">
              {directMessages.map(dm => (
                <Button
                  key={dm.id}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start px-2 py-1 h-7 font-normal',
                    isDMActive(dm.id) && 'bg-primary/10 text-primary',
                    dm.unread_count > 0 && 'font-semibold'
                  )}
                  onClick={() => router.push(`/dm/${dm.id}`)}
                >
                  <Circle className={cn('h-2 w-2 mr-2', getPresenceColor(dm.other_user.status))} />
                  <span className="truncate">{dm.other_user.name}</span>
                  {dm.unread_count > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {dm.unread_count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Modals */}
      <CreateChannelModal 
        open={createChannelOpen} 
        onOpenChange={setCreateChannelOpen}
        onSuccess={() => {
          mutateChannels();
          setCreateChannelOpen(false);
        }}
      />
      
      <InviteModal 
        open={inviteOpen} 
        onOpenChange={setInviteOpen}
      />
      
      <UserPicker
        open={userPickerOpen}
        onOpenChange={setUserPickerOpen}
        onSelect={async (userId) => {
          try {
            const dm = await apiClient.createDirectMessage(userId);
            mutateDMs();
            router.push(`/dm/${dm.id}`);
            setUserPickerOpen(false);
          } catch (error) {
            handleApiError(error);
          }
        }}
      />

      {/* Delete Channel Confirmation */}
      <AlertDialog open={!!deleteChannelId} onOpenChange={() => setDeleteChannelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this channel? This action cannot be undone.
              All messages in this channel will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChannel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}