"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Home, 
  MessageSquare, 
  FileText,
  Camera,
  AlertTriangle,
  DollarSign,
  Mail,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  Bot
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "AI Legal Advisor", href: "/ai-advisor", icon: Bot },
    { name: "Property Docs", href: "/documents", icon: Camera },
    { name: "Active Disputes", href: "/disputes", icon: AlertTriangle },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Security Deposits", href: "/deposits", icon: DollarSign },
    { name: "Letters & Notices", href: "/letters", icon: Mail },
    { name: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  ]

  const bottomNavigation = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help", href: "/help", icon: HelpCircle },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn("flex h-full w-[240px] flex-col border-r bg-background", className)}>
      {/* Quick Actions */}
      <div className="p-4">
        <Button className="w-full" size="sm" asChild>
          <Link href="/ai-advisor">
            <Bot className="mr-2 h-4 w-4" />
            Ask Legal Question
          </Link>
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade Prompt for Free Users */}
      {user && !user.is_premium && (
        <div className="border-t p-4">
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="sm"
            asChild
          >
            <Link href="/upgrade">
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="border-t p-2">
        {bottomNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* User Info */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar_url || undefined} alt={user?.full_name} />
            <AvatarFallback>
              {user?.full_name ? getInitials(user.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground">{user?.user_type === 'tenant' ? 'Tenant' : 'Landlord'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}