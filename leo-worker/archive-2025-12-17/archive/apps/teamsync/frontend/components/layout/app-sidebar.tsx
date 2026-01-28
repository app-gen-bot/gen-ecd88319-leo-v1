"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Hash, 
  Lock, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Folder,
  Archive,
  MessageSquare,
  Users,
  Zap,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { apiClient } from "@/lib/api-client";
import { Channel, Project, User } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const { user, workspace } = useAuth();
  const { sidebarCollapsed } = useWorkspaceStore();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [directMessages, setDirectMessages] = useState<User[]>([]);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (workspace) {
      loadChannels();
      loadProjects();
      loadDirectMessages();
    }
  }, [workspace]);

  const loadChannels = async () => {
    try {
      const data = await apiClient.getChannels(workspace!.id);
      setChannels(data);
    } catch (error) {
      console.error("Failed to load channels:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await apiClient.getProjects(workspace!.id);
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const loadDirectMessages = async () => {
    // Mock DM users for now
    const mockDMs: User[] = [
      {
        id: "user-2",
        email: "alice@teamsync.com",
        full_name: "Alice Johnson",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
        status: "online",
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "user-3",
        email: "bob@teamsync.com",
        full_name: "Bob Smith",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
        status: "away",
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    setDirectMessages(mockDMs);
  };

  const handleCreateChannel = () => {
    toast({
      title: "Create Channel",
      description: "Channel creation will be implemented soon.",
    });
  };

  const handleCreateProject = () => {
    router.push("/app/projects");
  };

  const handleNewMessage = () => {
    toast({
      title: "New Message",
      description: "Direct messaging will be implemented soon.",
    });
  };

  const isChannelActive = (channelId: string) => {
    return pathname === `/app/channel/${channelId}`;
  };

  const isProjectActive = (projectId: string) => {
    return pathname.startsWith(`/app/projects/${projectId}`);
  };

  const isDMActive = (userId: string) => {
    return pathname === `/app/dm/${userId}`;
  };

  if (sidebarCollapsed) {
    return (
      <div className="flex h-full w-full flex-col border-r bg-background">
        <div className="flex h-16 items-center justify-center border-b">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-2">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={isChannelActive(channel.id) ? "secondary" : "ghost"}
                size="icon"
                className="w-full"
                onClick={() => router.push(`/app/channel/${channel.id}`)}
                title={channel.name}
              >
                {channel.is_private ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
              </Button>
            ))}
            <Separator className="my-2" />
            {projects.map((project) => (
              <Button
                key={project.id}
                variant={isProjectActive(project.id) ? "secondary" : "ghost"}
                size="icon"
                className="w-full"
                onClick={() => router.push(`/app/projects/${project.id}`)}
                title={project.name}
              >
                <Folder className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col border-r bg-background">
      {/* Workspace Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={workspace?.logo_url} />
                  <AvatarFallback>
                    {workspace?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{workspace?.name}</span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => router.push("/app/workspace/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Workspace Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              Invite People
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Channels Section */}
          <Collapsible open={channelsOpen} onOpenChange={setChannelsOpen}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start p-1">
                  {channelsOpen ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Channels
                  </span>
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCreateChannel}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <CollapsibleContent className="mt-2 space-y-1">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={isChannelActive(channel.id) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => router.push(`/app/channel/${channel.id}`)}
                >
                  {channel.is_private ? (
                    <Lock className="mr-2 h-4 w-4" />
                  ) : (
                    <Hash className="mr-2 h-4 w-4" />
                  )}
                  <span className="truncate">{channel.name}</span>
                  {channel.member_count && (
                    <Badge variant="secondary" className="ml-auto">
                      {channel.member_count}
                    </Badge>
                  )}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => router.push("/app/channels")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Browse Channels
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {/* Projects Section */}
          <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start p-1">
                  {projectsOpen ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Projects
                  </span>
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCreateProject}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <CollapsibleContent className="mt-2 space-y-1">
              {projects.filter(p => p.status === "active").map((project) => (
                <Button
                  key={project.id}
                  variant={isProjectActive(project.id) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => router.push(`/app/projects/${project.id}`)}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  <span className="truncate">{project.name}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => router.push("/app/projects")}
              >
                <Plus className="mr-2 h-4 w-4" />
                View All Projects
              </Button>
              {projects.some(p => p.status === "archived") && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => router.push("/app/projects?filter=archived")}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archived Projects
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Direct Messages Section */}
          <Collapsible open={dmsOpen} onOpenChange={setDmsOpen}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start p-1">
                  {dmsOpen ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Direct Messages
                  </span>
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleNewMessage}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <CollapsibleContent className="mt-2 space-y-1">
              {directMessages.map((dm) => (
                <Button
                  key={dm.id}
                  variant={isDMActive(dm.id) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => router.push(`/app/dm/${dm.id}`)}
                >
                  <div className="relative mr-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={dm.avatar_url} />
                      <AvatarFallback>
                        {dm.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-background",
                        dm.status === "online" && "bg-green-500",
                        dm.status === "away" && "bg-yellow-500",
                        dm.status === "offline" && "bg-gray-500"
                      )}
                    />
                  </div>
                  <span className="truncate">{dm.full_name}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={handleNewMessage}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}