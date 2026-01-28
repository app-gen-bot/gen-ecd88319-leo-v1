'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
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
import { Heart, Bell, Plus, Menu, ChevronDown, Users, Check } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function Header() {
  const { user, family, signOut } = useAuth()
  const router = useRouter()
  const [notificationCount] = useState(3) // Mock notification count
  const [showFamilyModal, setShowFamilyModal] = useState(false)
  
  // Mock multiple families
  const mockFamilies = [
    { id: '1', name: 'The Johnson Family', code: 'JHN123', member_count: 4, current: true },
    { id: '2', name: 'Extended Family', code: 'EXT456', member_count: 8, current: false },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo - Desktop */}
        <Link href="/dashboard" className="hidden md:flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          <span className="text-xl font-bold">LoveyTasks</span>
        </Link>

        {/* Mobile Menu */}
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="space-y-6">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                  <span className="text-xl font-bold">LoveyTasks</span>
                </Link>
                <nav className="space-y-4">
                  <Link href="/dashboard" className="block text-lg hover:text-primary">
                    Dashboard
                  </Link>
                  <Link href="/tasks/active" className="block text-lg hover:text-primary">
                    Tasks
                  </Link>
                  <Link href="/messages/history" className="block text-lg hover:text-primary">
                    Messages
                  </Link>
                  <Link href="/family/members" className="block text-lg hover:text-primary">
                    Family
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - Mobile (centered) */}
        <Link href="/dashboard" className="flex md:hidden items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          <span className="text-xl font-bold">LoveyTasks</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Family Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <span>{family?.name || 'My Family'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Family Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/family/settings')}>
                Family Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/family/invite')}>
                Invite Members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowFamilyModal(true)}>
                <Users className="mr-2 h-4 w-4" />
                Switch Family
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Task Button */}
          <Button onClick={() => router.push('/create-task')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2">
                <div className="rounded-lg p-3 hover:bg-accent cursor-pointer">
                  <p className="text-sm font-medium">New task from Mom</p>
                  <p className="text-xs text-muted-foreground">&ldquo;Could you please take out the trash?&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                </div>
                <div className="rounded-lg p-3 hover:bg-accent cursor-pointer">
                  <p className="text-sm font-medium">Task completed by Sarah</p>
                  <p className="text-xs text-muted-foreground">&ldquo;Cleaned my room!&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                </div>
                <div className="rounded-lg p-3 hover:bg-accent cursor-pointer">
                  <p className="text-sm font-medium">Response from Dad</p>
                  <p className="text-xs text-muted-foreground">&ldquo;I&apos;ll help with the groceries!&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center">
                View All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/profile/edit')}>
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/profile/preferences')}>
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowFamilyModal(true)}>
                <Users className="mr-2 h-4 w-4" />
                Switch Family
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    {/* Switch Family Modal */}
    <Dialog open={showFamilyModal} onOpenChange={setShowFamilyModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Switch Family</DialogTitle>
          <DialogDescription>
            Select a family to switch to or create a new one
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Family List */}
          <div className="space-y-2">
            {mockFamilies.map((fam) => (
              <button
                key={fam.id}
                onClick={() => {
                  // In real app, would switch family context
                  setShowFamilyModal(false)
                  router.push('/dashboard')
                }}
                className={`w-full flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors ${
                  fam.current ? 'bg-primary/5 border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{fam.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {fam.member_count} members • Code: {fam.code}
                    </p>
                  </div>
                </div>
                {fam.current && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
          
          {/* Actions */}
          <div className="space-y-2 pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setShowFamilyModal(false)
                router.push('/family/invite')
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Join Existing Family
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setShowFamilyModal(false)
                router.push('/signup')
              }}
            >
              Create New Family
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}