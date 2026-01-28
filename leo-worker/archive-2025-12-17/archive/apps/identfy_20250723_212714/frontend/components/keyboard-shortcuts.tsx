"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Keyboard } from "lucide-react";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  category: string;
}

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();
  const { status } = useSession();
  const isSignedIn = status === "authenticated";

  const shortcuts: Shortcut[] = [
    {
      key: "/",
      description: "Focus search",
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          setSearchFocused(true);
        }
      },
      category: "Navigation",
    },
    {
      key: "?",
      description: "Show keyboard shortcuts",
      action: () => setShowHelp(true),
      category: "General",
    },
    {
      key: "g h",
      description: "Go to home",
      action: () => router.push("/"),
      category: "Navigation",
    },
    {
      key: "g w",
      description: "Go to workflows",
      action: () => router.push("/workflows"),
      category: "Navigation",
    },
    {
      key: "g c",
      description: "Go to cases",
      action: () => router.push("/cases"),
      category: "Navigation",
    },
    {
      key: "g a",
      description: "Go to analytics",
      action: () => router.push("/analytics"),
      category: "Navigation",
    },
    {
      key: "g s",
      description: "Go to settings",
      action: () => router.push("/settings"),
      category: "Navigation",
    },
    {
      key: "n",
      description: "Create new (context-aware)",
      action: () => {
        // Check current page and navigate accordingly
        const pathname = window.location.pathname;
        if (pathname.includes("/workflows")) {
          router.push("/workflows/new");
        } else if (pathname.includes("/settings/team")) {
          router.push("/settings/team/invite");
        } else if (pathname.includes("/settings/api")) {
          // Trigger new API key modal
          const newButton = document.querySelector('button:has-text("Create New Key")') as HTMLButtonElement;
          newButton?.click();
        }
      },
      category: "Actions",
    },
    {
      key: "Escape",
      description: "Close modals/dialogs",
      action: () => {
        // This is handled by individual components
      },
      category: "General",
    },
  ];

  useEffect(() => {
    if (!isSignedIn) return;

    let keySequence = "";
    let keyTimer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        // Allow Escape in inputs
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      // Handle Escape key globally
      if (e.key === "Escape") {
        setShowHelp(false);
        // Close any open modals
        const closeButton = document.querySelector('[aria-label="Close"]') as HTMLButtonElement;
        closeButton?.click();
        return;
      }

      // Build key sequence for multi-key shortcuts
      clearTimeout(keyTimer);
      keySequence += e.key;
      
      // Check for single key shortcuts
      const singleKeyShortcut = shortcuts.find(s => s.key === e.key);
      if (singleKeyShortcut && keySequence.length === 1) {
        e.preventDefault();
        singleKeyShortcut.action();
        keySequence = "";
        return;
      }

      // Check for multi-key shortcuts
      const multiKeyShortcut = shortcuts.find(s => s.key === keySequence);
      if (multiKeyShortcut) {
        e.preventDefault();
        multiKeyShortcut.action();
        keySequence = "";
        return;
      }

      // Reset key sequence after 1 second
      keyTimer = setTimeout(() => {
        keySequence = "";
      }, 1000);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(keyTimer);
    };
  }, [isSignedIn, router]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Quick keyboard shortcuts to navigate and perform actions
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="font-medium text-sm mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.key.split(" ").map((key, index) => (
                          <div key={index} className="flex items-center gap-1">
                            {index > 0 && (
                              <span className="text-xs text-muted-foreground">then</span>
                            )}
                            <Badge variant="secondary" className="font-mono">
                              {key}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {category !== Object.keys(groupedShortcuts)[Object.keys(groupedShortcuts).length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}