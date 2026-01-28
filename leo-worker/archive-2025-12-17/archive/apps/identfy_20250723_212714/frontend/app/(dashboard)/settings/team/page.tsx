"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  MoreVertical,
  Mail,
  Shield,
  Clock,
  UserX,
  RefreshCw,
  Activity
} from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils";

// Mock team data
const mockTeamMembers = [
  {
    id: "1",
    name: "Alice Chen",
    email: "alice.chen@acme.com",
    role: "admin",
    status: "active",
    lastActive: new Date(Date.now() - 1000 * 60 * 15),
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
    avatar: null,
  },
  {
    id: "2",
    name: "Bob Wilson",
    email: "bob.wilson@acme.com",
    role: "analyst",
    status: "active",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    avatar: null,
  },
  {
    id: "3",
    name: "Charlie Davis",
    email: "charlie.davis@acme.com",
    role: "analyst",
    status: "active",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    avatar: null,
  },
  {
    id: "4",
    name: "Diana Martinez",
    email: "diana.martinez@acme.com",
    role: "viewer",
    status: "suspended",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    avatar: null,
  },
];

const mockPendingInvitations = [
  {
    id: "1",
    email: "john.doe@example.com",
    role: "analyst",
    invitedBy: "Alice Chen",
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
  },
];

const roles = [
  { value: "admin", label: "Admin", description: "Full access to all features" },
  { value: "analyst", label: "Analyst", description: "Can review and manage cases" },
  { value: "viewer", label: "Viewer", description: "Read-only access" },
  { value: "developer", label: "Developer", description: "API access only" },
];

export default function TeamSettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("analyst");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const filteredMembers = mockTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsInviting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsInviting(false);
    
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteModalOpen(false);
    setInviteEmail("");
    setInviteMessage("");
  };

  const handleResendInvite = async (email: string) => {
    toast.success(`Invitation resent to ${email}`);
  };

  const handleCancelInvite = async (id: string) => {
    toast.success("Invitation cancelled");
  };

  const handleResetPassword = async (member: typeof mockTeamMembers[0]) => {
    toast.success(`Password reset email sent to ${member.email}`);
  };

  const handleSuspend = async (member: typeof mockTeamMembers[0]) => {
    toast.success(`${member.name}'s access has been suspended`);
  };

  const handleDelete = async (member: typeof mockTeamMembers[0]) => {
    toast.success(`${member.name} has been removed from the team`);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "analyst":
        return "default";
      case "viewer":
        return "secondary";
      case "developer":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "suspended":
        return "warning";
      case "invited":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team members and their access levels
              </CardDescription>
            </div>
            <Button onClick={() => setInviteModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(member.lastActive)}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(member.joinedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Activity className="mr-2 h-4 w-4" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(member)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {member.status === "active" ? (
                          <DropdownMenuItem onClick={() => handleSuspend(member)}>
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend Access
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Restore Access
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(member)}
                          className="text-destructive"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {mockPendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Team invitations that haven't been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPendingInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(invitation.role)}>
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{invitation.invitedBy}</TableCell>
                    <TableCell>{formatDateTime(invitation.invitedAt)}</TableCell>
                    <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvite(invitation.email)}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelInvite(invitation.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <p className="font-medium">{role.label}</p>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Welcome Message (Optional)</Label>
              <textarea
                id="message"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add a personal message to the invitation..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={isInviting}>
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Import formatDate
import { formatDate } from "@/lib/utils";