"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Search, Hash, FileText, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  id: string
  type: "message" | "channel" | "user" | "file"
  title: string
  subtitle?: string
  icon?: React.ReactNode
  timestamp?: string
  avatar?: string
}

// Mock search results
const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    type: "message",
    title: "Hey team! Welcome to our new Slack workspace 👋",
    subtitle: "Alice Johnson in #general",
    timestamp: "Yesterday",
  },
  {
    id: "2",
    type: "channel",
    title: "general",
    subtitle: "42 members",
    icon: <Hash className="w-4 h-4" />,
  },
  {
    id: "3",
    type: "channel",
    title: "engineering",
    subtitle: "15 members",
    icon: <Hash className="w-4 h-4" />,
  },
  {
    id: "4",
    type: "user",
    title: "Alice Johnson",
    subtitle: "Software Engineer",
    avatar: "AJ",
  },
  {
    id: "5",
    type: "user",
    title: "Bob Smith",
    subtitle: "Product Manager",
    avatar: "BS",
  },
  {
    id: "6",
    type: "file",
    title: "Q4 Roadmap.pdf",
    subtitle: "Shared by Diana Prince",
    icon: <FileText className="w-4 h-4" />,
    timestamp: "Last week",
  },
  {
    id: "7",
    type: "message",
    title: "New mockups are ready for review!",
    subtitle: "Diana Prince in #design",
    timestamp: "2 days ago",
  },
]

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFilteredResults([])
      return
    }

    setIsSearching(true)
    try {
      // Call the search API
      const results = await apiClient.search(query, selectedCategory)
      
      // Transform API results to our format
      const transformed: SearchResult[] = results.map((item: { 
        id: string; 
        type: string; 
        content?: string; 
        user_name?: string; 
        channel_name?: string;
        created_at?: string;
        name?: string;
        member_count?: number;
        title?: string;
      }) => {
        switch (item.type) {
          case 'message':
            return {
              id: item.id,
              type: 'message' as const,
              title: item.content || '',
              subtitle: `${item.user_name} in #${item.channel_name}`,
              timestamp: item.created_at,
            }
          case 'channel':
            return {
              id: item.id,
              type: 'channel' as const,
              title: item.name || '',
              subtitle: `${item.member_count || 0} members`,
              icon: <Hash className="w-4 h-4" />,
            }
          case 'user':
            return {
              id: item.id,
              type: 'user' as const,
              title: item.name || 'Unknown User',
              subtitle: item.title || 'Team Member',
              avatar: (item.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
            }
          default:
            // Default to message type for unknown types
            return {
              id: item.id,
              type: 'message' as const,
              title: item.name || item.content || 'Unknown',
              subtitle: 'Unknown type',
            }
        }
      })
      
      setFilteredResults(transformed)
    } catch (error) {
      console.error('Search error:', error)
      // Fall back to mock data on error
      const filtered = mockSearchResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
      
      if (selectedCategory) {
        setFilteredResults(filtered.filter(r => r.type === selectedCategory))
      } else {
        setFilteredResults(filtered)
      }
      
      toast({
        title: "Search unavailable",
        description: "Using local search. Backend search is not connected.",
      })
    } finally {
      setIsSearching(false)
    }
  }, [selectedCategory, toast])

  useEffect(() => {
    // Debounce search
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }
    
    const timeout = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)
    
    setSearchDebounce(timeout)
    
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [searchQuery, selectedCategory, performSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  const categoryLabels = {
    message: "Messages",
    channel: "Channels",
    user: "People",
    file: "Files",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1d21] border-[#2a2e33] p-0">
        <div className="p-4 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for messages, files, channels, or people..."
              className="flex-1 bg-[#222529] border-[#2a2e33] text-white placeholder:text-gray-500 focus:ring-0 focus:border-[#5865f2]"
              autoFocus
            />
          </div>
          
          {/* Category filters */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-[#5865f2]" : "text-gray-400 hover:text-white"}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === "message" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory("message")}
              className={selectedCategory === "message" ? "bg-[#5865f2]" : "text-gray-400 hover:text-white"}
            >
              Messages
            </Button>
            <Button
              variant={selectedCategory === "channel" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory("channel")}
              className={selectedCategory === "channel" ? "bg-[#5865f2]" : "text-gray-400 hover:text-white"}
            >
              Channels
            </Button>
            <Button
              variant={selectedCategory === "user" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory("user")}
              className={selectedCategory === "user" ? "bg-[#5865f2]" : "text-gray-400 hover:text-white"}
            >
              People
            </Button>
            <Button
              variant={selectedCategory === "file" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory("file")}
              className={selectedCategory === "file" ? "bg-[#5865f2]" : "text-gray-400 hover:text-white"}
            >
              Files
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {searchQuery.trim() === "" ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>Start typing to search</p>
            </div>
          ) : isSearching ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-6 h-6 mx-auto mb-4 animate-spin" />
              <p>Searching...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No results found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="px-4 pb-4">
              {Object.entries(groupedResults).map(([type, results]) => (
                <div key={type} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    {categoryLabels[type as keyof typeof categoryLabels]}
                  </h3>
                  <div className="space-y-1">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        className="w-full p-3 hover:bg-[#2a2e33] rounded-md flex items-center gap-3 text-left transition-colors"
                        onClick={() => {
                          // Navigate based on result type
                          switch (result.type) {
                            case 'channel':
                              router.push(`/channel/${result.id}`)
                              break
                            case 'user':
                              router.push(`/dm/${result.id}`)
                              break
                            case 'message':
                              // In a real app, this would navigate to the message
                              toast({
                                title: "Message navigation",
                                description: "Would navigate to message in context. Not implemented in demo.",
                              })
                              break
                            case 'file':
                              toast({
                                title: "File preview",
                                description: "Would open file preview. Not implemented in demo.",
                              })
                              break
                          }
                          onOpenChange(false)
                        }}
                      >
                        {result.type === "user" ? (
                          <Avatar className="w-8 h-8 bg-[#5865f2] text-white flex items-center justify-center">
                            <span className="text-xs font-medium">{result.avatar}</span>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8 bg-[#2a2e33] rounded flex items-center justify-center text-gray-400">
                            {result.icon}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white truncate">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-sm text-gray-400 truncate">{result.subtitle}</p>
                          )}
                        </div>
                        {result.timestamp && (
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}