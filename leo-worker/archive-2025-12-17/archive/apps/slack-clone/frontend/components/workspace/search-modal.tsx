'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/handle-api-error';
import { Search, Hash, MessageSquare, FileText, User, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, Channel, User as UserType } from '@/types/api';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResults {
  messages: Message[];
  channels: Channel[];
  users: UserType[];
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    messages: [],
    channels: [],
    users: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Load recent searches from localStorage
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 10));
      }
    }
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  const saveRecentSearch = useCallback((searchQuery: string) => {
    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 10);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ messages: [], channels: [], users: [] });
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiClient.search(searchQuery);
      setResults(data);
      saveRecentSearch(searchQuery);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [saveRecentSearch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleResultClick = (type: string, id: string) => {
    onOpenChange(false);
    setQuery('');
    
    switch (type) {
      case 'channel':
        router.push(`/channel/${id}`);
        break;
      case 'dm':
        router.push(`/dm/${id}`);
        break;
      case 'message':
        // Navigate to the message's channel/DM
        // In a real app, you'd parse the message context
        break;
      case 'user':
        // Create or navigate to DM
        apiClient.createDirectMessage(id).then(dm => {
          router.push(`/dm/${dm.id}`);
        }).catch(handleApiError);
        break;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={i} className="bg-yellow-500/30 text-inherit">{part}</mark> : 
        part
    );
  };

  const totalResults = results.messages.length + results.channels.length + results.users.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[600px] p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for messages, files, channels, or people"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              All {totalResults > 0 && `(${totalResults})`}
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Messages {results.messages.length > 0 && `(${results.messages.length})`}
            </TabsTrigger>
            <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Files
            </TabsTrigger>
            <TabsTrigger value="channels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Channels {results.channels.length > 0 && `(${results.channels.length})`}
            </TabsTrigger>
            <TabsTrigger value="people" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              People {results.users.length > 0 && `(${results.users.length})`}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-4">
              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Recent searches</h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, i) => (
                      <Button
                        key={i}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setQuery(search)}
                      >
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  Searching...
                </div>
              )}

              {/* No Results */}
              {!isLoading && query && totalResults === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No results found for &quot;{query}&quot;
                </div>
              )}

              {/* Results */}
              {!isLoading && query && totalResults > 0 && (
                <div className="space-y-6">
                  {/* All tab */}
                  {activeTab === 'all' && (
                    <>
                      {results.channels.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-3">Channels</h3>
                          <div className="space-y-1">
                            {results.channels.slice(0, 3).map(channel => (
                              <Button
                                key={channel.id}
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => handleResultClick('channel', channel.name)}
                              >
                                <Hash className="h-4 w-4 mr-2" />
                                <span>{highlightMatch(channel.name, query)}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.users.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-3">People</h3>
                          <div className="space-y-1">
                            {results.users.slice(0, 3).map(user => (
                              <Button
                                key={user.id}
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => handleResultClick('user', user.id)}
                              >
                                <User className="h-4 w-4 mr-2" />
                                <span>{highlightMatch(user.name, query)}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.messages.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-3">Messages</h3>
                          <div className="space-y-2">
                            {results.messages.slice(0, 5).map(message => (
                              <Button
                                key={message.id}
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2"
                                onClick={() => handleResultClick('message', message.id)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
                                <div className="overflow-hidden">
                                  <div className="text-sm">{highlightMatch(message.content, query)}</div>
                                  <div className="text-xs text-muted-foreground">{message.user_name}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Messages tab */}
                  {activeTab === 'messages' && results.messages.length > 0 && (
                    <div className="space-y-2">
                      {results.messages.map(message => (
                        <Button
                          key={message.id}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleResultClick('message', message.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
                          <div className="overflow-hidden">
                            <div className="text-sm">{highlightMatch(message.content, query)}</div>
                            <div className="text-xs text-muted-foreground">{message.user_name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Channels tab */}
                  {activeTab === 'channels' && results.channels.length > 0 && (
                    <div className="space-y-1">
                      {results.channels.map(channel => (
                        <Button
                          key={channel.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleResultClick('channel', channel.name)}
                        >
                          <Hash className="h-4 w-4 mr-2" />
                          <div className="text-left">
                            <div>{highlightMatch(channel.name, query)}</div>
                            {channel.description && (
                              <div className="text-xs text-muted-foreground">{channel.description}</div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* People tab */}
                  {activeTab === 'people' && results.users.length > 0 && (
                    <div className="space-y-1">
                      {results.users.map(user => (
                        <Button
                          key={user.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleResultClick('user', user.id)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          <div className="text-left">
                            <div>{highlightMatch(user.name, query)}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Files tab */}
                  {activeTab === 'files' && (
                    <div className="text-center py-8 text-muted-foreground">
                      File search coming soon
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}