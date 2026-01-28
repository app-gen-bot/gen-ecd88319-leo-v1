"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  GitBranch, 
  Briefcase, 
  BarChart3, 
  Settings,
  HelpCircle,
  Bell
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Workflows",
    href: "/workflows",
    icon: GitBranch,
  },
  {
    name: "Cases",
    href: "/cases",
    icon: Briefcase,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      {navigation.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== "/" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-foreground/60"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden lg:inline-block">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}