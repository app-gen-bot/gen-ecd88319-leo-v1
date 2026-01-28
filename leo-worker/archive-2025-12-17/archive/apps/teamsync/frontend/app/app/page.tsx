"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DEFAULT_ROUTE } from "@/lib/constants";

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default channel
    router.replace(DEFAULT_ROUTE);
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}