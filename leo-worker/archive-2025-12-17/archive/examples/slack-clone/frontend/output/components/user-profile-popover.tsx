"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MessageSquare, Phone, Video } from "lucide-react"

interface UserProfilePopoverProps {
  user: {
    id: string
    name: string
    avatar: string
    status?: "online" | "offline" | "away"
    title?: string
    email?: string
  }
  children: React.ReactNode
}

export function UserProfilePopover({ user, children }: UserProfilePopoverProps) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    away: "bg-yellow-500",
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#222529] border-[#2a2e33]">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{user.name}</h3>
              {user.status && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${statusColors[user.status]}`} />
                  <span className="text-xs text-gray-400 capitalize">{user.status}</span>
                </div>
              )}
            </div>
            {user.title && (
              <p className="text-sm text-gray-400">{user.title}</p>
            )}
            {user.email && (
              <p className="text-sm text-gray-500">{user.email}</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 bg-transparent border-[#2a2e33] hover:bg-[#2a2e33] text-gray-300"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Message
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-transparent border-[#2a2e33] hover:bg-[#2a2e33] text-gray-300"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-transparent border-[#2a2e33] hover:bg-[#2a2e33] text-gray-300"
          >
            <Video className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[#2a2e33]">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2a2e33]"
          >
            View full profile
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}