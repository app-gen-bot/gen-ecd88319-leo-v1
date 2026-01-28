"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  BookOpen,
  Code,
  FileText,
  Video,
  Download,
  ExternalLink,
  ChevronRight,
  Book,
  Zap,
  Shield,
  Settings,
  HelpCircle,
  MessageSquare,
  PlayCircle,
  FileCode,
  Terminal,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

// Mock documentation structure
const docCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Zap,
    articles: [
      { id: "quick-start", title: "Quick Start Guide", readTime: "5 min", popularity: 95 },
      { id: "account-setup", title: "Account Setup", readTime: "3 min", popularity: 88 },
      { id: "first-verification", title: "Your First Verification", readTime: "7 min", popularity: 92 },
      { id: "best-practices", title: "Best Practices", readTime: "10 min", popularity: 85 },
    ],
  },
  {
    id: "integration",
    title: "Integration Guides",
    icon: Code,
    articles: [
      { id: "api-overview", title: "API Overview", readTime: "8 min", popularity: 94 },
      { id: "sdk-installation", title: "SDK Installation", readTime: "5 min", popularity: 90 },
      { id: "webhooks", title: "Webhooks Setup", readTime: "6 min", popularity: 78 },
      { id: "testing", title: "Testing Integration", readTime: "12 min", popularity: 82 },
      { id: "error-handling", title: "Error Handling", readTime: "8 min", popularity: 76 },
    ],
  },
  {
    id: "workflows",
    title: "Workflows",
    icon: Settings,
    articles: [
      { id: "workflow-basics", title: "Workflow Basics", readTime: "6 min", popularity: 87 },
      { id: "signal-configuration", title: "Configuring Signals", readTime: "10 min", popularity: 83 },
      { id: "conditional-logic", title: "Conditional Logic", readTime: "8 min", popularity: 71 },
      { id: "templates", title: "Using Templates", readTime: "5 min", popularity: 79 },
    ],
  },
  {
    id: "security",
    title: "Security & Compliance",
    icon: Shield,
    articles: [
      { id: "security-overview", title: "Security Overview", readTime: "7 min", popularity: 91 },
      { id: "gdpr-compliance", title: "GDPR Compliance", readTime: "15 min", popularity: 86 },
      { id: "data-encryption", title: "Data Encryption", readTime: "8 min", popularity: 74 },
      { id: "audit-logs", title: "Audit Logs", readTime: "5 min", popularity: 68 },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: HelpCircle,
    articles: [
      { id: "common-errors", title: "Common Errors", readTime: "10 min", popularity: 96 },
      { id: "debugging-guide", title: "Debugging Guide", readTime: "12 min", popularity: 88 },
      { id: "faq", title: "Frequently Asked Questions", readTime: "8 min", popularity: 93 },
      { id: "status-codes", title: "API Status Codes", readTime: "5 min", popularity: 81 },
    ],
  },
];

const codeExamples = [
  {
    id: "node-js",
    language: "Node.js",
    icon: FileCode,
    snippet: `const identfy = require('@identfy/sdk');

const client = new identfy.Client({
  apiKey: process.env.IDENTFY_API_KEY
});

const result = await client.verify({
  workflowId: 'wf_123',
  userId: 'user_456',
  data: { /* user data */ }
});`,
  },
  {
    id: "python",
    language: "Python",
    icon: FileCode,
    snippet: `import identfy

client = identfy.Client(
    api_key=os.environ['IDENTFY_API_KEY']
)

result = client.verify(
    workflow_id='wf_123',
    user_id='user_456',
    data={} # user data
)`,
  },
  {
    id: "curl",
    language: "cURL",
    icon: Terminal,
    snippet: `curl -X POST https://api.identfy.com/v1/verifications \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflow_id": "wf_123",
    "user_id": "user_456",
    "data": {}
  }'`,
  },
];

const videoTutorials = [
  { id: "intro", title: "Introduction to Identfy", duration: "3:45", views: 12543 },
  { id: "workflow-builder", title: "Using the Workflow Builder", duration: "8:22", views: 8921 },
  { id: "api-integration", title: "API Integration Tutorial", duration: "12:15", views: 7832 },
  { id: "best-practices", title: "Security Best Practices", duration: "6:30", views: 5643 },
];

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("getting-started");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const filteredArticles = docCategories
    .flatMap(cat => cat.articles.map(article => ({ ...article, category: cat.id, categoryTitle: cat.title })))
    .filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const currentCategory = docCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Everything you need to integrate and use Identfy
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-1">
                  {docCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {category.title}
                        <Badge variant="outline" className="ml-auto">
                          {category.articles.length}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/support/contact" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <MessageSquare className="h-4 w-4" />
                Contact Support
              </Link>
              <Link href="/workflows/templates" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <FileText className="h-4 w-4" />
                Workflow Templates
              </Link>
              <a href="https://status.identfy.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <TrendingUp className="h-4 w-4" />
                API Status
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {searchQuery ? (
            // Search Results
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Search Results ({filteredArticles.length})
              </h2>
              <div className="grid gap-4">
                {filteredArticles.map((article) => (
                  <Card key={`${article.category}-${article.id}`} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          <CardDescription>
                            {article.categoryTitle} • {article.readTime} read
                          </CardDescription>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Category Articles */}
              {currentCategory && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const Icon = currentCategory.icon;
                      return <Icon className="h-6 w-6" />;
                    })()}
                    <h2 className="text-2xl font-semibold">{currentCategory.title}</h2>
                  </div>
                  <div className="grid gap-4">
                    {currentCategory.articles.map((article) => (
                      <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{article.title}</CardTitle>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {article.readTime}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {article.popularity}% helpful
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Examples */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Code Examples</CardTitle>
                  <CardDescription>
                    Get started with our SDKs in your preferred language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="node-js">
                    <TabsList>
                      {codeExamples.map((example) => (
                        <TabsTrigger key={example.id} value={example.id}>
                          {example.language}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {codeExamples.map((example) => (
                      <TabsContent key={example.id} value={example.id}>
                        <div className="relative">
                          <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                            <code className="text-sm">{example.snippet}</code>
                          </pre>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              navigator.clipboard.writeText(example.snippet);
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Video Tutorials */}
              <Card>
                <CardHeader>
                  <CardTitle>Video Tutorials</CardTitle>
                  <CardDescription>
                    Learn through our comprehensive video guides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {videoTutorials.map((video) => (
                      <div key={video.id} className="group cursor-pointer">
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-2">
                          <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                            <div className="p-3 bg-primary/90 rounded-full group-hover:scale-110 transition-transform">
                              <PlayCircle className="h-8 w-8 text-primary-foreground" />
                            </div>
                          </div>
                        </div>
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{video.duration}</span>
                          <span>•</span>
                          <span>{video.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Need More Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" asChild>
                      <Link href="/support/contact">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact Support
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/support/tickets">
                        <FileText className="mr-2 h-4 w-4" />
                        View Tickets
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="https://github.com/identfy/examples" target="_blank" rel="noopener noreferrer">
                        <Code className="mr-2 h-4 w-4" />
                        Code Examples
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}