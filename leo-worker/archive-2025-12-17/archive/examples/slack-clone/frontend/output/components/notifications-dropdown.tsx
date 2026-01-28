"use client"

import { Bell, Hash, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"

interface Notification {
  id: string
  type: "mention" | "channel" | "dm" | "file"
  title: string
  subtitle: string
  timestamp: string
  read: boolean
  icon?: React.ReactNode
  avatar?: string
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "mention",
    title: "Alice Johnson mentioned you",
    subtitle: "@You can you review the PR?",
    timestamp: "5m ago",
    read: false,
    avatar: "AJ",
  },
  {
    id: "2",
    type: "channel",
    title: "New message in #engineering",
    subtitle: "Bob: API deployment complete",
    timestamp: "10m ago",
    read: false,
    icon: <Hash className="w-4 h-4" />,
  },
  {
    id: "3",
    type: "dm",
    title: "Diana Prince sent you a message",
    subtitle: "Thanks for the feedback!",
    timestamp: "1h ago",
    read: true,
    avatar: "DP",
  },
  {
    id: "4",
    type: "file",
    title: "Charlie Brown shared a file",
    subtitle: "Q4-Planning.pdf",
    timestamp: "2h ago",
    read: true,
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "5",
    type: "mention",
    title: "Bob Smith mentioned you",
    subtitle: "@You meeting at 3pm?",
    timestamp: "3h ago",
    read: true,
    avatar: "BS",
  },
]

export function NotificationsDropdown() {
  const unreadCount = mockNotifications.filter(n => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-[#222529] border-[#2a2e33]"
      >
        <DropdownMenuLabel className="text-white flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-[#5865f2] hover:text-[#7289da]">
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2a2e33]" />
        
        <div className="max-h-[400px] overflow-y-auto">
          {mockNotifications.map((notification) => (
            <DropdownMenuItem 
              key={notification.id}
              className="p-3 cursor-pointer hover:bg-[#2a2e33] focus:bg-[#2a2e33]"
            >
              <div className="flex gap-3 w-full">
                {notification.avatar ? (
                  <Avatar className="w-8 h-8 bg-[#5865f2] text-white flex items-center justify-center">
                    <span className="text-xs font-medium">{notification.avatar}</span>
                  </Avatar>
                ) : (
                  <div className="w-8 h-8 bg-[#2a2e33] rounded-full flex items-center justify-center text-gray-400">
                    {notification.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.read ? 'text-gray-300' : 'text-white font-semibold'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {notification.subtitle}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-[#5865f2] rounded-full mt-2" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator className="bg-[#2a2e33]" />
        <DropdownMenuItem className="p-3 text-center cursor-pointer hover:bg-[#2a2e33] focus:bg-[#2a2e33]">
          <span className="text-sm text-[#5865f2] hover:text-[#7289da] w-full">
            View all notifications
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}