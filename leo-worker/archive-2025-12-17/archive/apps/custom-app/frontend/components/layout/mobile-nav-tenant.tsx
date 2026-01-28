"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bot, FileText, MessageSquare, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function MobileNavTenant() {
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Advisor", href: "/ai-advisor", icon: Bot },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Messages", href: "/messages", icon: MessageSquare },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        {navigation.map((item) => {
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
        
        {/* More menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
            <Sidebar className="h-full border-0" />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}