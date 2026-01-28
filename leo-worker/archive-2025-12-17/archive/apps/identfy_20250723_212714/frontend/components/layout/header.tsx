"use client";

import Link from "next/link";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">
              I
            </div>
            <span className="font-bold text-xl">Identfy</span>
          </Link>
          <div className="hidden lg:block">
            <MainNav />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </div>
      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}