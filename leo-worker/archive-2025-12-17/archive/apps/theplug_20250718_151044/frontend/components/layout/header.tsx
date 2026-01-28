"use client"

import Link from 'next/link'
// import { useUser } from '@clerk/nextjs' // Disabled for demo
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bell, Search, Music, Upload, Menu } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'

export function Header() {
  // const { user } = useUser() // Disabled for demo
  const user = {
    firstName: 'Demo',
    lastName: 'User',
    imageUrl: undefined,
    emailAddresses: [{ emailAddress: 'demo@example.com' }]
  }
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications] = useState([
    { id: 1, title: 'Registration Success', message: 'Your song "Summer Vibes" was registered with MLC', time: '5 min ago', type: 'success' },
    { id: 2, title: 'Registration Failed', message: 'Failed to register "Night Drive" with SoundExchange', time: '1 hour ago', type: 'error' },
    { id: 3, title: 'Platform Update', message: 'ASCAP integration now available', time: '2 hours ago', type: 'info' },
  ])
  const [unreadCount, setUnreadCount] = useState(3)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search
    // Search functionality would be implemented here
  }

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-6 overflow-visible">
          <div className="flex items-center justify-center w-8 h-8 overflow-visible">
            <Music className="h-8 w-8 text-primary flex-shrink-0" style={{ minWidth: '32px', minHeight: '32px' }} />
          </div>
          <span className="text-xl font-bold hidden sm:inline">The Plug</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search songs, registrations, platforms..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Quick Upload */}
          <Link href="/music/upload">
            <Button variant="ghost" size="icon">
              <Upload className="h-5 w-5" />
            </Button>
          </Link>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark All Read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                  <div className="flex items-center gap-2 w-full">
                    <Badge 
                      variant={
                        notification.type === 'success' ? 'success' : 
                        notification.type === 'error' ? 'destructive' : 
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {notification.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {notification.time}
                    </span>
                  </div>
                  <p className="font-medium text-sm mt-1">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="w-full text-center">
                  View All
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.imageUrl} alt={user?.firstName || ''} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/api-credentials">API Credentials</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/billing">Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/notifications">Notifications</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/help">Help Center</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/changelog">What&apos;s New</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}