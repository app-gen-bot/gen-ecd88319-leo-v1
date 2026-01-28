'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';
import useSWR from 'swr';
import { Search, Hash, Lock, Users, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function BrowseChannelsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningChannelId, setJoiningChannelId] = useState<string | null>(null);

  const { data: allChannels = [], mutate } = useSWR(
    '/channels',
    () => apiClient.getChannels(),
    {
      onError: handleApiError,
    }
  );

  // Filter to show only public channels (in a real app, this would be done server-side)
  const publicChannels = allChannels.filter(ch => !ch.is_private);
  
  // Filter by search query
  const filteredChannels = publicChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinChannel = async (channelId: string, channelName: string) => {
    setJoiningChannelId(channelId);
    
    try {
      await apiClient.joinChannel(channelId);
      
      toast({
        title: 'Joined channel',
        description: `You've joined #${channelName}`,
      });
      
      // Navigate to the channel
      router.push(`/channel/${channelName}`);
    } catch (error) {
      handleApiError(error);
    } finally {
      setJoiningChannelId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Browse channels</h1>
            <p className="text-sm text-muted-foreground">
              {publicChannels.length} public channels in this workspace
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {filteredChannels.length === 0 ? (
            <div className="text-center py-12">
              <Hash className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No channels found matching your search' : 'No public channels available'}
              </p>
            </div>
          ) : (
            filteredChannels.map(channel => {
              // Check if user is already a member (in real app, this would be in the data)
              const isMember = ['general', 'random'].includes(channel.name);
              
              return (
                <Card key={channel.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {channel.is_private ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Hash className="h-5 w-5 text-muted-foreground" />
                        )}
                        <h3 className="font-semibold">{channel.name}</h3>
                        {channel.member_count && (
                          <Badge variant="secondary" className="ml-2">
                            <Users className="h-3 w-3 mr-1" />
                            {channel.member_count}
                          </Badge>
                        )}
                      </div>
                      
                      {isMember ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/channel/${channel.name}`)}
                        >
                          View
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleJoinChannel(channel.id, channel.name)}
                          disabled={joiningChannelId === channel.id}
                        >
                          {joiningChannelId === channel.id ? 'Joining...' : 'Join'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {channel.description && (
                    <CardContent>
                      <CardDescription>{channel.description}</CardDescription>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}