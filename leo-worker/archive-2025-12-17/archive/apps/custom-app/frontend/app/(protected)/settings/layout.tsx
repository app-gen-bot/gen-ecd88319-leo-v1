"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, MessageSquare, Bell, Shield } from "lucide-react"

const settingsNavigation = [
  {
    name: "Profile",
    href: "/settings/profile",
    icon: User
  },
  {
    name: "Message Preferences",
    href: "/settings/preferences",
    icon: MessageSquare
  },
  {
    name: "Notifications",
    href: "/settings/notifications",
    icon: Bell
  },
  {
    name: "Security",
    href: "/settings/security",
    icon: Shield
  }
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="lg:w-1/5">
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
          {settingsNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 lg:max-w-3xl">{children}</div>
    </div>
  )
}