"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Search,
  MessageSquare,
  FileText,
  Video,
  Book,
  HelpCircle,
  ExternalLink,
  Send,
  Upload,
  Play,
  Clock,
  TrendingUp,
  Code,
  Shield,
  Zap,
  Users
} from "lucide-react";
import Link from "next/link";

// Mock data
const popularArticles = [
  {
    id: "1",
    title: "Getting Started with Identfy",
    category: "Getting Started",
    readTime: "5 min",
    icon: TrendingUp,
  },
  {
    id: "2",
    title: "Creating Your First Workflow",
    category: "Workflows",
    readTime: "10 min",
    icon: Zap,
  },
  {
    id: "3",
    title: "Understanding Risk Scores",
    category: "Verification",
    readTime: "7 min",
    icon: Shield,
  },
  {
    id: "4",
    title: "API Authentication Guide",
    category: "API",
    readTime: "8 min",
    icon: Code,
  },
  {
    id: "5",
    title: "Managing Team Members",
    category: "Account",
    readTime: "3 min",
    icon: Users,
  },
];

const videoTutorials = [
  {
    id: "1",
    title: "Platform Overview",
    duration: "12:34",
    thumbnail: "/api/placeholder/320/180",
  },
  {
    id: "2",
    title: "Building Custom Workflows",
    duration: "18:45",
    thumbnail: "/api/placeholder/320/180",
  },
  {
    id: "3",
    title: "Case Management Deep Dive",
    duration: "15:20",
    thumbnail: "/api/placeholder/320/180",
  },
  {
    id: "4",
    title: "Analytics & Reporting",
    duration: "10:15",
    thumbnail: "/api/placeholder/320/180",
  },
];

const categories = [
  { id: "general", label: "General Question" },
  { id: "technical", label: "Technical Issue" },
  { id: "billing", label: "Billing & Subscription" },
  { id: "api", label: "API Integration" },
  { id: "feature", label: "Feature Request" },
  { id: "bug", label: "Bug Report" },
];

const priorities = [
  { id: "low", label: "Low", color: "secondary" },
  { id: "medium", label: "Medium", color: "warning" },
  { id: "high", label: "High", color: "destructive" },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTicket = async () => {
    if (!ticketCategory || !ticketSubject || !ticketDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    toast.success("Support ticket submitted successfully. We'll respond within 24 hours.");
    
    // Reset form
    setTicketCategory("");
    setTicketPriority("medium");
    setTicketSubject("");
    setTicketDescription("");
    setAttachments([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground mt-1">
          Find answers, watch tutorials, or contact our support team
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, tutorials, or documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentation</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Comprehensive guides and API reference
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Tutorials</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Step-by-step video walkthroughs
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Reference</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Technical API documentation
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Articles</CardTitle>
            <CardDescription>
              Most viewed help articles this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularArticles.map((article) => {
                const Icon = article.icon;
                return (
                  <Link
                    key={article.id}
                    href="#"
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="p-2 bg-muted rounded">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{article.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime} read
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Articles
            </Button>
          </CardContent>
        </Card>

        {/* Video Tutorials */}
        <Card>
          <CardHeader>
            <CardTitle>Video Tutorials</CardTitle>
            <CardDescription>
              Learn with step-by-step video guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {videoTutorials.map((video) => (
                <div
                  key={video.id}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-2">{video.title}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Tutorials
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Submit a support ticket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={ticketCategory} onValueChange={setTicketCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={ticketPriority} onValueChange={setTicketPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant={priority.color as any} className="h-2 w-2 p-0 rounded-full" />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide as much detail as possible..."
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                rows={6}
              />
            </div>

            <div className="grid gap-2">
              <Label>Attachments (Optional)</Label>
              <div className="flex items-center gap-4">
                <Label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose Files</span>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".jpg,.jpeg,.png,.pdf,.txt,.log"
                  />
                </Label>
                <p className="text-xs text-muted-foreground">
                  Max 10MB per file. JPG, PNG, PDF, TXT, or LOG files.
                </p>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={handleSubmitTicket} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Ticket
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="rounded-full shadow-lg" size="lg">
          <MessageSquare className="mr-2 h-5 w-5" />
          Live Chat
        </Button>
      </div>
    </div>
  );
}