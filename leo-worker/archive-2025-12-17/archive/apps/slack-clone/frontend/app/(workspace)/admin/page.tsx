'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCheck } from '@/components/auth-check';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';
import { toast } from '@/components/ui/use-toast';
import useSWR from 'swr';
import { 
  ArrowLeft, 
  Users, 
  Hash, 
  MessageSquare, 
  HardDrive,
  UserPlus,
  Search,
  MoreVertical,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InviteModal } from '@/components/workspace/invite-modal';
import { CreateChannelModal } from '@/components/workspace/create-channel-modal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [channelSearchQuery, setChannelSearchQuery] = useState('');

  // Fetch workspace stats
  const { data: stats } = useSWR(
    '/workspace/stats',
    () => apiClient.getWorkspaceStats(),
    {
      onError: handleApiError,
    }
  );

  // Fetch users
  const { data: users = [], mutate: mutateUsers } = useSWR(
    '/workspace/users',
    () => apiClient.getWorkspaceUsers(),
    {
      onError: handleApiError,
    }
  );

  // Fetch channels
  const { data: channels = [], mutate: mutateChannels } = useSWR(
    '/channels',
    () => apiClient.getChannels(),
    {
      onError: handleApiError,
    }
  );

  // Filter users by search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Filter channels by search
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(channelSearchQuery.toLowerCase())
  );

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      await apiClient.updateUserRole(userId, newRole);
      mutateUsers();
      toast({
        title: 'Role updated',
        description: 'User role has been updated successfully.',
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeactivateUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${userName}?`)) {
      return;
    }

    try {
      await apiClient.deactivateUser(userId);
      mutateUsers();
      toast({
        title: 'User deactivated',
        description: `${userName} has been deactivated.`,
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteChannel = async (channelId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to delete #${channelName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteChannel(channelId);
      mutateChannels();
      toast({
        title: 'Channel deleted',
        description: `#${channelName} has been deleted.`,
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <AuthCheck requireAdmin>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Workspace Admin</h1>
              <p className="text-sm text-muted-foreground">
                Manage your workspace settings and members
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="px-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalChannels || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {channels.filter(ch => ch.is_private).length} private
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages/Day</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.messagesPerDay || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    <Activity className="h-3 w-3 inline mr-1" />
                    Average this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.storageUsed || 0} GB</div>
                  <p className="text-xs text-muted-foreground">
                    Of 100 GB total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Chart would go here */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  User activity over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Activity chart visualization would go here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="flex-1">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={() => setInviteOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </div>

              <Card>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleChangeRole(user.id, value as any)}
                            >
                              <SelectTrigger className="h-8 w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'online' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Send Message</DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeactivateUser(user.id, user.name)}
                                >
                                  Deactivate User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="flex-1">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search channels..."
                    value={channelSearchQuery}
                    onChange={(e) => setChannelSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={() => setCreateChannelOpen(true)}>
                  <Hash className="h-4 w-4 mr-2" />
                  Create Channel
                </Button>
              </div>

              <Card>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChannels.map(channel => (
                        <TableRow key={channel.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {channel.is_private ? '🔒' : '#'}
                              {channel.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={channel.is_private ? 'secondary' : 'default'}>
                              {channel.is_private ? 'Private' : 'Public'}
                            </Badge>
                          </TableCell>
                          <TableCell>{channel.member_count || 0}</TableCell>
                          <TableCell>
                            {new Date(channel.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => router.push(`/channel/${channel.name}`)}
                                >
                                  View Channel
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit Channel</DropdownMenuItem>
                                <DropdownMenuItem>Archive Channel</DropdownMenuItem>
                                {channel.name !== 'general' && channel.name !== 'random' && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteChannel(channel.id, channel.name)}
                                  >
                                    Delete Channel
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <InviteModal open={inviteOpen} onOpenChange={setInviteOpen} />
        <CreateChannelModal
          open={createChannelOpen}
          onOpenChange={setCreateChannelOpen}
          onSuccess={() => {
            mutateChannels();
            setCreateChannelOpen(false);
          }}
        />
      </div>
    </AuthCheck>
  );
}