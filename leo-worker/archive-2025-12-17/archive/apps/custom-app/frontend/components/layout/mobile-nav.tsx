"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CheckSquare, Plus, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function MobileNav() {
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Family", href: "/family", icon: Users },
    { name: "Profile", href: "/profile", icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        {navigation.slice(0, 2).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
        
        {/* Floating Action Button */}
        <div className="flex items-center justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Actions</DialogTitle>
                <DialogDescription>
                  What would you like to do?
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Link href="/tasks/new">
                  <Button className="w-full" variant="outline">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
                </Link>
                <Button variant="outline" disabled>
                  <Users className="mr-2 h-4 w-4" />
                  Quick Assign
                </Button>
                <Button variant="outline" disabled>
                  <Home className="mr-2 h-4 w-4" />
                  Send Love Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {navigation.slice(2).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}