"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { useSearch } from "@/lib/hooks/use-search"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Heart, Search, Menu, X, CheckSquare, MessageSquare, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { formatDistanceToNow } from "date-fns"

export function Header() {
  const pathname = usePathname()
  const { user, family, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { query, results, isSearching, search, clearSearch } = useSearch()
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Tasks", href: "/tasks" },
    { name: "Family", href: "/family" },
    { name: "Messages", href: "/messages" },
    { name: "Stats", href: "/stats" },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSearchSelect = (result: any) => {
    clearSearch()
    setSearchOpen(false)
    
    if (result.type === 'task') {
      router.push(`/tasks/${result.item.id}`)
    } else if (result.type === 'message') {
      router.push(`/messages/${result.item.id}`)
    } else if (result.type === 'person') {
      router.push(`/family/member/${result.item.id}`)
    }
  }

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-4 sm:px-6">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2 mr-6">
          <Heart className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold hidden sm:inline">LoveyTasks</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 flex-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="flex items-center space-x-4 ml-auto">
          <div className="hidden sm:flex items-center">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="w-[200px] lg:w-[300px] justify-start text-muted-foreground"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {query || "Search tasks... (⌘K)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search tasks, messages, or people..." 
                    value={query}
                    onValueChange={search}
                  />
                  <CommandList>
                    {isSearching ? (
                      <CommandEmpty>Searching...</CommandEmpty>
                    ) : results.length === 0 && query ? (
                      <CommandEmpty>No results found.</CommandEmpty>
                    ) : (
                      <>
                        {results.filter(r => r.type === 'task').length > 0 && (
                          <CommandGroup heading="Tasks">
                            {results
                              .filter(r => r.type === 'task')
                              .slice(0, 3)
                              .map((result) => (
                                <CommandItem
                                  key={result.item.id}
                                  onSelect={() => handleSearchSelect(result)}
                                >
                                  <CheckSquare className="mr-2 h-4 w-4" />
                                  <div className="flex-1">
                                    <p className="text-sm">{result.item.transformed_title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {result.item.assignee_name} • {result.item.status}
                                    </p>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        )}
                        
                        {results.filter(r => r.type === 'message').length > 0 && (
                          <>
                            <CommandSeparator />
                            <CommandGroup heading="Messages">
                              {results
                                .filter(r => r.type === 'message')
                                .slice(0, 3)
                                .map((result) => (
                                  <CommandItem
                                    key={result.item.id}
                                    onSelect={() => handleSearchSelect(result)}
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    <div className="flex-1">
                                      <p className="text-sm line-clamp-1">
                                        {result.item.transformed_content || result.item.content}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {result.item.sender_name} → {result.item.receiver_name}
                                      </p>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </>
                        )}
                        
                        {results.filter(r => r.type === 'person').length > 0 && (
                          <>
                            <CommandSeparator />
                            <CommandGroup heading="People">
                              {results
                                .filter(r => r.type === 'person')
                                .slice(0, 3)
                                .map((result) => (
                                  <CommandItem
                                    key={result.item.id}
                                    onSelect={() => handleSearchSelect(result)}
                                  >
                                    <User className="mr-2 h-4 w-4" />
                                    <div className="flex-1">
                                      <p className="text-sm">{result.item.full_name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {result.item.email}
                                      </p>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </>
                        )}
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px]">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      markAllAsRead()
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <>
                  {notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`cursor-pointer ${!notification.is_read ? 'bg-muted/50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex flex-col space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{notification.title}</p>
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center">
                    <Link href="/notifications" className="text-sm text-primary w-full">
                      View All Notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || undefined} alt={user?.full_name} />
                  <AvatarFallback>
                    {user?.full_name ? getInitials(user.full_name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">My Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/preferences">Message Preferences</Link>
              </DropdownMenuItem>
              {user?.is_family_admin && (
                <DropdownMenuItem asChild>
                  <Link href="/family/settings">Family Settings</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/settings/notifications">Notification Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/family/switch">Switch Family</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/help">Help & Support</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}