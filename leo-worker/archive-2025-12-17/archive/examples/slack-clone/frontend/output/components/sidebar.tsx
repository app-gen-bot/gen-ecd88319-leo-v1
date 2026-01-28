"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash, Lock, Plus, ChevronDown, Circle, Settings, UserPlus, LogOut, Building, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSlackData } from "@/hooks/use-slack-data";
import { CreateChannelModal } from "@/components/create-channel-modal";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";



export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { currentWorkspace, currentUser, channels, users, isLoading } = useSlackData();
  const [showChannels, setShowChannels] = useState(true);
  const [showDirectMessages, setShowDirectMessages] = useState(true);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  
  // Mock additional workspaces for demo
  const mockWorkspaces = [
    { id: "1", name: currentWorkspace?.name || "Acme Corp" },
    { id: "2", name: "Personal Projects" },
    { id: "3", name: "Open Source" },
  ];

  // Extract selected channel from pathname
  const selectedChannel = pathname.split('/').pop() || "general";

  // Filter online users for DMs
  const onlineUsers = users.filter(u => u.status === "online");

  if (isLoading) {
    return (
      <div className="w-64 bg-[#1a1d21] border-r border-[#2c2f33] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#1a1d21] border-r border-[#2c2f33] flex flex-col">
      {/* Workspace Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#2c2f33]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-white hover:bg-[#2c2f33] hover:text-white"
            >
              <span className="font-bold text-lg">{currentWorkspace?.name || "Workspace"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Building className="mr-2 h-4 w-4" />
                <span>Switch Workspace</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {mockWorkspaces.map((workspace) => (
                  <DropdownMenuItem 
                    key={workspace.id}
                    onClick={() => {
                      toast({
                        title: "Switching workspace",
                        description: `Would switch to ${workspace.name}. Not implemented in demo.`,
                      });
                    }}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    <span>{workspace.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Create Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push("/admin")}
              disabled={currentUser?.role !== "admin"}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Workspace Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Invite People</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-500 focus:text-red-500"
              onClick={() => {
                localStorage.removeItem("slack-auth-token");
                router.push("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="py-4 space-y-6">
          {/* Channels Section */}
          <div>
            <div className="flex items-center justify-between px-2 py-1">
              <Button
                variant="ghost"
                className="p-0 h-auto text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => setShowChannels(!showChannels)}
              >
                <span className="text-xs">CHANNELS</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 text-gray-400 hover:text-white"
                onClick={() => setCreateChannelOpen(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {showChannels && (
              <div className="mt-1 space-y-0.5">
                {channels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={`/channel/${channel.id}`}
                  >
                    <div
                      className={cn(
                        "flex items-center px-2 py-1 rounded cursor-pointer group",
                        selectedChannel === channel.id
                          ? "bg-[#5865f2] text-white"
                          : "text-gray-400 hover:bg-[#2c2f33] hover:text-white"
                      )}
                    >
                      {channel.is_private ? (
                        <Lock className="h-4 w-4 mr-2" />
                      ) : (
                        <Hash className="h-4 w-4 mr-2" />
                      )}
                      <span className="flex-1 text-sm">{channel.name}</span>
                      {channel.unreadCount && channel.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {channel.unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Direct Messages Section */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between px-2 py-1 text-gray-400 hover:text-white hover:bg-transparent"
              onClick={() => setShowDirectMessages(!showDirectMessages)}
            >
              <span className="text-xs">DIRECT MESSAGES</span>
              <Plus className="h-4 w-4" />
            </Button>
            
            {showDirectMessages && (
              <div className="mt-1 space-y-0.5">
                {onlineUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/dm/${user.id}`}
                  >
                    <div className="flex items-center px-2 py-1 rounded cursor-pointer text-gray-400 hover:bg-[#2c2f33] hover:text-white">
                      <div className="relative mr-2">
                        <Circle
                          className={cn(
                            "h-2 w-2 absolute -bottom-0.5 -right-0.5",
                            user.status === "online"
                              ? "fill-green-500 text-green-500"
                              : user.status === "away"
                              ? "fill-yellow-500 text-yellow-500"
                              : "fill-gray-500 text-gray-500"
                          )}
                        />
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                          {user.avatar_initials || user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      
      <CreateChannelModal 
        open={createChannelOpen} 
        onOpenChange={setCreateChannelOpen} 
      />
    </div>
  );
}