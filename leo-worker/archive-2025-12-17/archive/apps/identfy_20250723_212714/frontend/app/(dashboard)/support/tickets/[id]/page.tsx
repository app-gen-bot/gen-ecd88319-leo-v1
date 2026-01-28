"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ChevronLeft,
  MessageSquare,
  Clock,
  CheckCircle,
  User,
  Send,
  Paperclip,
  Upload,
  X,
  Archive,
  Ticket,
  Calendar,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { formatDateTime, getInitials } from "@/lib/utils";

// Mock ticket data
const mockTicket = {
  id: "SUP-2024-1234",
  subject: "API Integration Error - 401 Unauthorized",
  category: "technical",
  priority: "high",
  status: "open",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  assignee: {
    name: "Alice Chen",
    email: "alice@identfy.com",
    avatar: "/avatars/alice.jpg",
    role: "Senior Support Engineer",
  },
  reporter: {
    name: "John Doe",
    email: "john.doe@example.com",
    company: "Acme Corp",
  },
  description: `I'm experiencing issues with the API integration. When I try to make requests to the verification endpoint, I'm getting a 401 Unauthorized error.

Here's what I've tried:
1. Regenerated my API key
2. Checked the authorization header format
3. Verified the endpoint URL

The error message I'm receiving:
{
  "error": "unauthorized",
  "message": "Invalid API key or insufficient permissions"
}

My workflow ID is: wf_123456789
API endpoint: POST /v1/verifications

This is blocking our production deployment, so any help would be greatly appreciated.`,
  workflowId: "wf_123456789",
  errorCode: "401",
  messages: [
    {
      id: "1",
      author: {
        name: "John Doe",
        email: "john.doe@example.com",
        isSupport: false,
      },
      content: "I've checked the API key and it seems to be correct. I'm using the production key from the dashboard.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      attachments: [],
    },
    {
      id: "2",
      author: {
        name: "Alice Chen",
        email: "alice@identfy.com",
        isSupport: true,
      },
      content: "Hi John, thank you for reaching out. I can see that you're experiencing authentication issues. Let me check your account configuration. Can you confirm which environment you're trying to access - production or sandbox?",
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
      attachments: [],
    },
    {
      id: "3",
      author: {
        name: "John Doe",
        email: "john.doe@example.com",
        isSupport: false,
      },
      content: "I'm trying to access the production environment. The same code works fine in sandbox with the sandbox API key.",
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      attachments: [],
    },
    {
      id: "4",
      author: {
        name: "Alice Chen",
        email: "alice@identfy.com",
        isSupport: true,
      },
      content: "I've checked your account and noticed that your production API key doesn't have the necessary permissions for the verification endpoint. It looks like it was created with read-only access. Let me help you create a new key with the correct permissions.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      attachments: [],
    },
  ],
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setNewMessage("");
    setAttachments([]);
    setIsSubmitting(false);
    toast.success("Message sent");
  };

  const handleCloseTicket = async () => {
    setIsClosing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Ticket closed successfully");
    router.push("/support/tickets");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles].slice(0, 3)); // Max 3 files
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="warning">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary">Open</Badge>;
      case "in_progress":
        return <Badge variant="default">In Progress</Badge>;
      case "resolved":
        return <Badge variant="success">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/support/tickets">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{mockTicket.id}</h1>
              {getStatusBadge(mockTicket.status)}
              {getPriorityBadge(mockTicket.priority)}
            </div>
            <p className="text-muted-foreground mt-1">
              Created {formatDateTime(mockTicket.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {mockTicket.status === "open" && (
            <>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Change Priority
              </Button>
              <Button variant="destructive" onClick={handleCloseTicket} disabled={isClosing}>
                {isClosing ? "Closing..." : "Close Ticket"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject and Description */}
          <Card>
            <CardHeader>
              <CardTitle>{mockTicket.subject}</CardTitle>
              <CardDescription>
                Reported by {mockTicket.reporter.name} ({mockTicket.reporter.company})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{mockTicket.description}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTicket.messages.map((message, index) => (
                <div key={message.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(message.author.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{message.author.name}</p>
                            {message.author.isSupport && (
                              <Badge variant="secondary" className="text-xs">
                                Support Team
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-12">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.attachments.map((attachment, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Paperclip className="mr-1 h-3 w-3" />
                              {attachment}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reply */}
          {mockTicket.status === "open" && (
            <Card>
              <CardHeader>
                <CardTitle>Reply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={5}
                />
                
                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <input
                      type="file"
                      id="reply-attachments"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.txt,.log"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <label htmlFor="reply-attachments" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Attach Files
                      </label>
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSubmitting || (!newMessage.trim() && attachments.length === 0)}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(mockTicket.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <div className="mt-1">{getPriorityBadge(mockTicket.priority)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {mockTicket.category}
                </Badge>
              </div>
              {mockTicket.workflowId && (
                <div>
                  <p className="text-sm text-muted-foreground">Workflow ID</p>
                  <code className="text-sm">{mockTicket.workflowId}</code>
                </div>
              )}
              {mockTicket.errorCode && (
                <div>
                  <p className="text-sm text-muted-foreground">Error Code</p>
                  <code className="text-sm">{mockTicket.errorCode}</code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              {mockTicket.assignee ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={mockTicket.assignee.avatar} />
                      <AvatarFallback>{getInitials(mockTicket.assignee.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mockTicket.assignee.name}</p>
                      <p className="text-sm text-muted-foreground">{mockTicket.assignee.role}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat with Agent
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not yet assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Related Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Related Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/support/docs/api-overview" className="flex items-center gap-2 text-sm text-primary hover:underline">
                API Documentation →
              </Link>
              <Link href="/support/docs/common-errors" className="flex items-center gap-2 text-sm text-primary hover:underline">
                Common Errors Guide →
              </Link>
              <Link href="/workflows/wf_123456789" className="flex items-center gap-2 text-sm text-primary hover:underline">
                View Workflow →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}