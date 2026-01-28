"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Settings,
  Users,
  Shield,
  Key,
  Webhook,
  Database,
  CreditCard,
  Bell,
  Building
} from "lucide-react";

const sidebarItems = [
  {
    title: "General",
    href: "/settings/general",
    icon: Settings,
  },
  {
    title: "Team",
    href: "/settings/team",
    icon: Users,
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: Shield,
  },
  {
    title: "API Keys",
    href: "/settings/api",
    icon: Key,
  },
  {
    title: "Webhooks",
    href: "/settings/webhooks",
    icon: Webhook,
  },
  {
    title: "Data Privacy",
    href: "/settings/privacy",
    icon: Database,
  },
  {
    title: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="w-full md:w-64 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}