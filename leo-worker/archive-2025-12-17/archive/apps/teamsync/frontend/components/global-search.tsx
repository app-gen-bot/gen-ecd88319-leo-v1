"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Hash, 
  MessageSquare, 
  Folder, 
  FileText, 
  User,
  Clock,
  X,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Lock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import type { Channel, Message, Task, Project, User as UserType } from "@/types";

interface GlobalSearchProps {
  onClose: () => void;
}

type SearchResult = {
  id: string;
  type: "channel" | "message" | "task" | "project" | "user" | "file";
  title: string;
  subtitle?: string;
  url: string;
  icon: React.ReactNode;
  metadata?: Record<string, any>;
};

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const router = useRouter();
  const { workspace } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = localStorage.getItem("recent_searches");
    if (recent) {
      setRecentSearches(JSON.parse(recent).slice(0, 5));
    }
    
    // Focus the input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const totalResults = searchQuery ? searchResults.length : recentSearches.length;
      
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % totalResults);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults);
          break;
        case "Enter":
          e.preventDefault();
          const results = searchQuery ? searchResults : recentSearches;
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery, searchResults, recentSearches, selectedIndex, onClose]);

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would call the API
      // For now, we'll perform searches across different entities
      const results: SearchResult[] = [];
      
      if (workspace) {
        // Search channels
        const channels = await apiClient.getChannels(workspace.id);
        channels.forEach(channel => {
          if (channel.name.toLowerCase().includes(query.toLowerCase()) ||
              channel.description?.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              id: channel.id,
              type: "channel",
              title: channel.name,
              subtitle: channel.description || `${channel.member_count} members`,
              url: `/app/channel/${channel.id}`,
              icon: channel.is_private ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />,
              metadata: { is_private: channel.is_private },
            });
          }
        });

        // Search projects
        const projects = await apiClient.getProjects(workspace.id);
        projects.forEach(project => {
          if (project.name.toLowerCase().includes(query.toLowerCase()) ||
              project.description?.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              id: project.id,
              type: "project",
              title: project.name,
              subtitle: project.description || `${project.progress}% complete`,
              url: `/app/projects/${project.id}`,
              icon: <Folder className="h-4 w-4" />,
              metadata: { status: project.status },
            });
          }
        });

        // Search users
        const users = await apiClient.searchUsers(query);
        users.forEach(user => {
          results.push({
            id: user.id,
            type: "user",
            title: user.full_name,
            subtitle: user.title || user.email,
            url: `/app/dm/${user.id}`,
            icon: <User className="h-4 w-4" />,
            metadata: { status: user.status },
          });
        });

        // Add some mock message results
        if (query.length > 2) {
          results.push({
            id: "msg-search-1",
            type: "message",
            title: `Messages containing "${query}"`,
            subtitle: "Search in all channels",
            url: `/app/search?q=${encodeURIComponent(query)}&type=messages`,
            icon: <MessageSquare className="h-4 w-4" />,
          });
        }
      }

      setSearchResults(results.slice(0, 10)); // Limit to 10 results
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const recent = [result, ...recentSearches.filter((r) => r.id !== result.id)].slice(
      0,
      5
    );
    localStorage.setItem("recent_searches", JSON.stringify(recent));
    
    router.push(result.url);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center px-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search channels, messages, people, and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-4">
            {searchQuery ? (
              loading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No results found for "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    Search Results
                  </h3>
                  <div className="space-y-1">
                    {searchResults.map((result, index) => (
                      <Button
                        key={result.id}
                        variant={selectedIndex === index ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                            {result.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{result.title}</p>
                            {result.subtitle && (
                              <p className="text-xs text-muted-foreground">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )
            ) : (
              recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                      Recent Searches
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={clearRecentSearches}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((result, index) => (
                      <Button
                        key={result.id}
                        variant={selectedIndex === index ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{result.title}</p>
                            {result.subtitle && (
                              <p className="text-xs text-muted-foreground">
                                {result.subtitle}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </ScrollArea>

        <Separator />
        <div className="flex items-center justify-between p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              <ArrowDown className="h-3 w-3" />
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" />
              Select
            </span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 text-xs font-mono border rounded">G</kbd>
            <span>then</span>
            <kbd className="px-2 py-1 text-xs font-mono border rounded">C</kbd>
            <span>for channels</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}