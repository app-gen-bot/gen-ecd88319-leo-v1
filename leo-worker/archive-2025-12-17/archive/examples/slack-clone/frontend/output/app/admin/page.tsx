"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Hash, Settings, Mail, Trash2, UserPlus } from "lucide-react";

// Mock data
const mockUsers = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active", lastActive: "2 minutes ago" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "Member", status: "Active", lastActive: "1 hour ago" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "Member", status: "Inactive", lastActive: "3 days ago" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", role: "Member", status: "Active", lastActive: "5 minutes ago" },
];

const mockChannels = [
  { id: "general", name: "general", type: "Public", members: 4, messages: 157, created: "Default" },
  { id: "random", name: "random", type: "Public", members: 4, messages: 89, created: "Default" },
  { id: "engineering", name: "engineering", type: "Private", members: 3, messages: 342, created: "2 weeks ago" },
  { id: "design", name: "design", type: "Public", members: 2, messages: 56, created: "1 month ago" },
];

const stats = {
  totalUsers: 4,
  activeUsers: 3,
  totalChannels: 4,
  totalMessages: 644,
  fileStorage: "124 MB / 1 GB",
  lastWeekMessages: 89,
};

export default function AdminPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);

  const handleInviteUser = () => {
    console.log("Inviting user:", inviteEmail);
    setInviteEmail("");
  };

  const handleCreateChannel = () => {
    console.log("Creating channel:", { name: newChannelName, private: newChannelPrivate });
    setNewChannelName("");
    setNewChannelPrivate(false);
  };

  const handleDeactivateUser = (userId: string) => {
    console.log("Deactivating user:", userId);
  };

  const handleDeleteChannel = (channelId: string) => {
    console.log("Deleting channel:", channelId);
  };

  return (
    <WorkspaceLayout>
      <div className="flex-1 bg-[#1a1d21] overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your workspace settings, users, and channels</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-[#2c2f33] border-[#404449]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#2c2f33] border-[#404449]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#2c2f33] border-[#404449]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalChannels}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#2c2f33] border-[#404449]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Total Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalMessages}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#2c2f33] border-[#404449]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">File Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-white">{stats.fileStorage}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#2c2f33] border-[#404449]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.lastWeekMessages} <span className="text-sm text-gray-400">msgs</span></div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="bg-[#2c2f33]">
              <TabsTrigger value="users" className="data-[state=active]:bg-[#5865f2]">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="channels" className="data-[state=active]:bg-[#5865f2]">
                <Hash className="h-4 w-4 mr-2" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-[#5865f2]">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card className="bg-[#2c2f33] border-[#404449]">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Users</CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage workspace members and invitations
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-[#5865f2] hover:bg-[#4752c4]">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#2c2f33] border-[#404449]">
                        <DialogHeader>
                          <DialogTitle className="text-white">Invite User</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Send an invitation to join your workspace
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="invite-email" className="text-white">
                              Email Address
                            </Label>
                            <Input
                              id="invite-email"
                              type="email"
                              placeholder="user@example.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              className="bg-[#1a1d21] border-[#404449] text-white"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleInviteUser} className="bg-[#5865f2] hover:bg-[#4752c4]">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invitation
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#404449]">
                        <TableHead className="text-gray-400">Name</TableHead>
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Role</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Last Active</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.map((user) => (
                        <TableRow key={user.id} className="border-[#404449]">
                          <TableCell className="text-white">{user.name}</TableCell>
                          <TableCell className="text-gray-400">{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={user.role === "Admin" ? "default" : "secondary"}
                              className={user.role === "Admin" ? "bg-[#5865f2]" : ""}
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.status === "Active" ? "default" : "secondary"}
                              className={user.status === "Active" ? "bg-green-600" : "bg-gray-600"}
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400">{user.lastActive}</TableCell>
                          <TableCell>
                            {user.role !== "Admin" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => handleDeactivateUser(user.id)}
                              >
                                Deactivate
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4">
              <Card className="bg-[#2c2f33] border-[#404449]">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">Channels</CardTitle>
                      <CardDescription className="text-gray-400">
                        Manage workspace channels
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-[#5865f2] hover:bg-[#4752c4]">
                          <Hash className="h-4 w-4 mr-2" />
                          Create Channel
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#2c2f33] border-[#404449]">
                        <DialogHeader>
                          <DialogTitle className="text-white">Create Channel</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Create a new channel for your workspace
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="channel-name" className="text-white">
                              Channel Name
                            </Label>
                            <Input
                              id="channel-name"
                              type="text"
                              placeholder="project-updates"
                              value={newChannelName}
                              onChange={(e) => setNewChannelName(e.target.value)}
                              className="bg-[#1a1d21] border-[#404449] text-white"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="private-channel"
                              checked={newChannelPrivate}
                              onChange={(e) => setNewChannelPrivate(e.target.checked)}
                              className="rounded border-[#404449]"
                            />
                            <Label htmlFor="private-channel" className="text-white">
                              Make this channel private
                            </Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateChannel} className="bg-[#5865f2] hover:bg-[#4752c4]">
                            Create Channel
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#404449]">
                        <TableHead className="text-gray-400">Channel</TableHead>
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">Members</TableHead>
                        <TableHead className="text-gray-400">Messages</TableHead>
                        <TableHead className="text-gray-400">Created</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockChannels.map((channel) => (
                        <TableRow key={channel.id} className="border-[#404449]">
                          <TableCell className="text-white">#{channel.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={channel.type === "Public" ? "default" : "secondary"}
                              className={channel.type === "Public" ? "bg-green-600" : "bg-yellow-600"}
                            >
                              {channel.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400">{channel.members}</TableCell>
                          <TableCell className="text-gray-400">{channel.messages}</TableCell>
                          <TableCell className="text-gray-400">{channel.created}</TableCell>
                          <TableCell>
                            {channel.created !== "Default" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => handleDeleteChannel(channel.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-[#2c2f33] border-[#404449]">
                <CardHeader>
                  <CardTitle className="text-white">Workspace Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure workspace preferences and limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Workspace Name</Label>
                    <Input
                      value="AppFactory Team"
                      className="bg-[#1a1d21] border-[#404449] text-white"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Workspace Limits</Label>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex justify-between">
                        <span>Maximum Users</span>
                        <span className="text-white">50</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum Channels</span>
                        <span className="text-white">100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>File Upload Limit</span>
                        <span className="text-white">50 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>File Retention</span>
                        <span className="text-white">1 year</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Security Settings</Label>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex justify-between">
                        <span>Session Timeout</span>
                        <span className="text-white">7 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Two-Factor Authentication</span>
                        <Badge className="bg-gray-600">Optional</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </WorkspaceLayout>
  );
}