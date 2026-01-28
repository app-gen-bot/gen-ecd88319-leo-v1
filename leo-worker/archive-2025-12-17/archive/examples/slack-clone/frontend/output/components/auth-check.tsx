"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === "/login") {
      return;
    }

    // Redirect to login if not authenticated and not loading
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  // Show loading state while checking auth
  if (isLoading && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-[#1a1d21] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render protected content if not authenticated (except login page)
  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}