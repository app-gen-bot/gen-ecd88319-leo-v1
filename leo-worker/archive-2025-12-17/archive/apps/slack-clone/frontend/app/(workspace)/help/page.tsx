'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Search, MessageSquare, Keyboard, Bell, Shield, Users, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const helpCategories = [
  {
    icon: MessageSquare,
    title: 'Getting Started',
    description: 'Learn the basics of using Slack Clone',
    articles: [
      'How to send your first message',
      'Creating and joining channels',
      'Direct messaging basics',
      'Understanding workspaces',
    ],
  },
  {
    icon: Keyboard,
    title: 'Keyboard Shortcuts',
    description: 'Work faster with keyboard shortcuts',
    articles: [
      'Navigation shortcuts',
      'Message shortcuts',
      'Search shortcuts (Cmd/Ctrl+K)',
      'Quick switcher',
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Control when and how you get notified',
    articles: [
      'Setting notification preferences',
      'Channel-specific notifications',
      'Do not disturb mode',
      'Mobile notifications',
    ],
  },
  {
    icon: Shield,
    title: 'Security & Privacy',
    description: 'Keep your workspace secure',
    articles: [
      'Two-factor authentication',
      'Managing workspace access',
      'Data retention policies',
      'Privacy settings',
    ],
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work better together',
    articles: [
      'Using threads effectively',
      'Sharing files and documents',
      'Video calling basics',
      'Managing user roles',
    ],
  },
  {
    icon: Zap,
    title: 'Power Features',
    description: 'Advanced features for power users',
    articles: [
      'Custom emoji and reactions',
      'Workflow automation',
      'Integrations and apps',
      'Advanced search techniques',
    ],
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => article.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Help Center</h1>
            <p className="text-sm text-muted-foreground">
              Find answers and learn how to use Slack Clone
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Keyboard Shortcuts
              </Button>
              <Button variant="outline" size="sm">
                Send a Message
              </Button>
              <Button variant="outline" size="sm">
                Create a Channel
              </Button>
              <Button variant="outline" size="sm">
                Invite Team Members
              </Button>
            </div>
          </div>

          {/* Help Categories */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{category.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex}>
                          <button className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                            {article}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Support */}
          <Card className="mt-8 bg-muted/50">
            <CardHeader>
              <CardTitle>Still need help?</CardTitle>
              <CardDescription>
                Our support team is here to help you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline">
                  Visit Community Forum
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}