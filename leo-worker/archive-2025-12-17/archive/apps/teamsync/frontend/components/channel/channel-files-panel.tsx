"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  Image, 
  FileCode, 
  FileSpreadsheet,
  File,
  Download,
  ExternalLink,
  Calendar
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Attachment } from "@/types";

interface FileWithMetadata extends Attachment {
  uploaded_by: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export function ChannelFilesPanel() {
  const params = useParams();
  const channelId = params.channelId as string;
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "images" | "docs" | "code">("all");
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, [channelId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockFiles: FileWithMetadata[] = [
        {
          id: "file-1",
          message_id: "msg-1",
          file_name: "Project_Mockup_v2.png",
          file_size: 2457600,
          file_type: "image/png",
          file_url: "/mock-file-1.png",
          thumbnail_url: "/mock-thumb-1.png",
          uploaded_at: new Date(Date.now() - 86400000).toISOString(),
          uploaded_by: {
            id: "user-2",
            full_name: "Alice Johnson",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
          },
        },
        {
          id: "file-2",
          message_id: "msg-2",
          file_name: "API_Documentation.pdf",
          file_size: 1048576,
          file_type: "application/pdf",
          file_url: "/mock-file-2.pdf",
          uploaded_at: new Date(Date.now() - 172800000).toISOString(),
          uploaded_by: {
            id: "user-3",
            full_name: "Bob Smith",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
          },
        },
        {
          id: "file-3",
          message_id: "msg-3",
          file_name: "auth-service.ts",
          file_size: 15360,
          file_type: "text/typescript",
          file_url: "/mock-file-3.ts",
          uploaded_at: new Date(Date.now() - 259200000).toISOString(),
          uploaded_by: {
            id: "user-3",
            full_name: "Bob Smith",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
          },
        },
        {
          id: "file-4",
          message_id: "msg-4",
          file_name: "Q4_Budget.xlsx",
          file_size: 524288,
          file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          file_url: "/mock-file-4.xlsx",
          uploaded_at: new Date(Date.now() - 604800000).toISOString(),
          uploaded_by: {
            id: "user-1",
            full_name: "Demo User",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
          },
        },
      ];
      setFiles(mockFiles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load channel files.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return Image;
    if (fileType.includes("pdf") || fileType.includes("document")) return FileText;
    if (fileType.includes("sheet") || fileType.includes("excel")) return FileSpreadsheet;
    if (fileType.includes("typescript") || fileType.includes("javascript") || fileType.includes("code")) return FileCode;
    return File;
  };

  const getFileCategory = (fileType: string) => {
    if (fileType.startsWith("image/")) return "images";
    if (fileType.includes("pdf") || fileType.includes("document")) return "docs";
    if (fileType.includes("typescript") || fileType.includes("javascript") || fileType.includes("code")) return "code";
    return "other";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || getFileCategory(file.file_type) === filter;
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { value: "all", label: "All Files" },
    { value: "images", label: "Images" },
    { value: "docs", label: "Documents" },
    { value: "code", label: "Code" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Search and Filter */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value as any)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Files List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading files...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || filter !== "all" ? "No files found" : "No files shared in this channel"}
            </div>
          ) : (
            filteredFiles.map((file) => {
              const Icon = getFileIcon(file.file_type);
              return (
                <div
                  key={file.id}
                  className="group flex items-start gap-3 rounded-lg border p-3 hover:bg-accent cursor-pointer"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)} • Shared by {file.uploaded_by.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(file.uploaded_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: "Download",
                              description: "File download will be implemented soon.",
                            });
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: "Open File",
                              description: "File preview will be implemented soon.",
                            });
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      <div className="border-t p-4">
        <div className="text-sm text-muted-foreground">
          {files.length} files • {formatFileSize(files.reduce((sum, file) => sum + file.file_size, 0))} total
        </div>
      </div>
    </div>
  );
}