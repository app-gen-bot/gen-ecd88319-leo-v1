"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Info, Star, Phone, Users, Hash, Lock, Settings, LogOut, User, Circle, MinusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { SearchModal } from "@/components/search-modal";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { useRouter } from "next/navigation";
import { useSlackData } from "@/hooks/use-slack-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import apiClient from "@/lib/api-client";


// Mock data for channels and users
const channelInfo: Record<string, { name: string; isPrivate: boolean; memberCount: number }> = {
  general: { name: "general", isPrivate: false, memberCount: 4 },
  random: { name: "random", isPrivate: false, memberCount: 4 },
  engineering: { name: "engineering", isPrivate: true, memberCount: 3 },
  design: { name: "design", isPrivate: false, memberCount: 2 },
};

const userInfo: Record<string, { name: string }> = {
  "1": { name: "Alice Johnson" },
  "2": { name: "Bob Smith" },
  "3": { name: "Charlie Brown" },
  "4": { name: "Diana Prince" },
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useSlackData();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  
  const updateStatus = async (status: string) => {
    try {
      await apiClient.updatePresence(status);
      toast({
        title: "Status updated",
        description: `Your status is now ${status}`,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Determine current context from pathname
  let title = "Select a channel";
  let icon = null;
  let showChannelActions = false;
  
  if (pathname?.startsWith("/channel/")) {
    const channelId = pathname.split("/")[2];
    const channel = channelInfo[channelId];
    if (channel) {
      title = channel.name;
      icon = channel.isPrivate ? <Lock className="h-4 w-4 mr-1" /> : <Hash className="h-4 w-4 mr-1" />;
      showChannelActions = true;
    }
  } else if (pathname?.startsWith("/dm/")) {
    const userId = pathname.split("/")[2];
    const user = userInfo[userId];
    if (user) {
      title = user.name;
      showChannelActions = false;
    }
  }
  
  return (
    <header className="h-16 border-b border-[#2c2f33] bg-[#1a1d21] px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold text-white flex items-center">
          {icon}
          {title}
        </h2>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Star className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search messages..."
            className="pl-10 bg-[#2c2f33] border-[#2c2f33] text-white placeholder:text-gray-400 focus:bg-[#404449] cursor-pointer"
            onFocus={(e) => {
              e.target.blur();
              setSearchOpen(true);
            }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {showChannelActions && (
          <>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Users className="h-4 w-4" />
            </Button>
          </>
        )}
        <NotificationsDropdown />
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Info className="h-4 w-4" />
        </Button>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.name} />
                <AvatarFallback>
                  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Circle className="mr-2 h-4 w-4 fill-green-500 text-green-500" />
                <span>Set Status</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => updateStatus("online")}>
                  <Circle className="mr-2 h-4 w-4 fill-green-500 text-green-500" />
                  <span>Active</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("away")}>
                  <Circle className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>Away</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("dnd")}>
                  <MinusCircle className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
                  <span>Do Not Disturb</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("offline")}>
                  <Circle className="mr-2 h-4 w-4 fill-gray-500 text-gray-500" />
                  <span>Offline</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings/preferences")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-500 focus:text-red-500" 
              onClick={async () => {
                await logout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}