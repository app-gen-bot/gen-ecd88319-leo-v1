'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  BookOpen,
  Download,
  Star,
  Clock,
  FileText,
  Home,
  DollarSign,
  Shield,
  Users,
  Gavel,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Bookmark,
  Share2,
  Printer
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  lastUpdated: Date;
  popular: boolean;
  bookmarked: boolean;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  articleCount: number;
}

const categories: Category[] = [
  {
    id: 'tenant-rights',
    name: 'Tenant Rights',
    icon: Shield,
    description: 'Your fundamental rights as a California tenant',
    articleCount: 15
  },
  {
    id: 'rent-control',
    name: 'Rent & Deposits',
    icon: DollarSign,
    description: 'Rent control, increases, and security deposits',
    articleCount: 12
  },
  {
    id: 'repairs',
    name: 'Repairs & Maintenance',
    icon: Home,
    description: 'Habitability standards and repair rights',
    articleCount: 18
  },
  {
    id: 'eviction',
    name: 'Eviction Protection',
    icon: AlertCircle,
    description: 'Eviction procedures and tenant protections',
    articleCount: 10
  },
  {
    id: 'discrimination',
    name: 'Fair Housing',
    icon: Users,
    description: 'Anti-discrimination laws and protected classes',
    articleCount: 8
  },
  {
    id: 'legal-process',
    name: 'Legal Process',
    icon: Gavel,
    description: 'Court procedures and legal remedies',
    articleCount: 14
  }
];

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'California Tenant Rights: A Complete Guide',
    description: 'Everything you need to know about your rights as a tenant in California, including habitability, privacy, and protection from retaliation.',
    category: 'tenant-rights',
    readTime: '15 min',
    lastUpdated: new Date('2024-03-01'),
    popular: true,
    bookmarked: false,
    tags: ['basics', 'rights', 'california-law']
  },
  {
    id: '2',
    title: 'Security Deposit Laws in California',
    description: 'Learn about security deposit limits, return timelines, allowable deductions, and how to get your deposit back.',
    category: 'rent-control',
    readTime: '10 min',
    lastUpdated: new Date('2024-03-10'),
    popular: true,
    bookmarked: true,
    tags: ['deposits', 'move-out', 'deductions']
  },
  {
    id: '3',
    title: 'Handling Emergency Repairs',
    description: 'What qualifies as an emergency repair, landlord response times, and your rights to repair and deduct.',
    category: 'repairs',
    readTime: '8 min',
    lastUpdated: new Date('2024-03-15'),
    popular: false,
    bookmarked: false,
    tags: ['repairs', 'emergency', 'habitability']
  },
  {
    id: '4',
    title: 'Just Cause Eviction Protections',
    description: 'Understanding AB 1482 and local just cause eviction ordinances that protect tenants from no-fault evictions.',
    category: 'eviction',
    readTime: '12 min',
    lastUpdated: new Date('2024-02-28'),
    popular: true,
    bookmarked: false,
    tags: ['eviction', 'AB-1482', 'just-cause']
  },
  {
    id: '5',
    title: 'Rent Control: What\'s Covered',
    description: 'Which properties are covered by rent control, how increases are calculated, and your rights under local ordinances.',
    category: 'rent-control',
    readTime: '10 min',
    lastUpdated: new Date('2024-03-05'),
    popular: true,
    bookmarked: false,
    tags: ['rent-control', 'increases', 'AB-1482']
  }
];

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState<Article[]>(mockArticles);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularArticles = articles.filter(a => a.popular).slice(0, 3);
  const bookmarkedArticles = articles.filter(a => a.bookmarked);

  const toggleBookmark = (articleId: string) => {
    setArticles(articles.map(article =>
      article.id === articleId ? { ...article, bookmarked: !article.bookmarked } : article
    ));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            California tenant laws, resources, and required forms
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles, laws, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 text-base"
          />
        </div>

        {/* Category Cards */}
        {!searchQuery && selectedCategory === 'all' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <category.icon className="h-8 w-8 text-primary" />
                      <Badge variant="secondary">{category.articleCount} articles</Badge>
                    </div>
                    <CardTitle className="mt-4">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full">
                      Browse Articles
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Articles */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Articles</TabsTrigger>
            <TabsTrigger value="popular">
              <Star className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="bookmarked">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarked ({bookmarkedArticles.length})
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Recently Updated
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {selectedCategory !== 'all' && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  View All Categories
                </Button>
              </div>
            )}
            
            {filteredArticles.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map(article => (
                  <Card
                    key={article.id}
                    className="hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => router.push(`/knowledge/article/${article.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            <div className="flex items-center space-x-2 ml-4">
                              {article.popular && (
                                <Badge variant="secondary">
                                  <Star className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(article.id);
                                }}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <Bookmark className={`h-4 w-4 ${article.bookmarked ? 'fill-current text-primary' : 'text-muted-foreground'}`} />
                              </button>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-3">{article.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {article.readTime}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Updated {article.lastUpdated.toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                              {article.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            {popularArticles.map(article => (
              <Card
                key={article.id}
                className="hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => router.push(`/knowledge/article/${article.id}`)}
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <p className="text-muted-foreground mb-3">{article.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {article.readTime}
                    </span>
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-4">
            {bookmarkedArticles.length === 0 ? (
              <Card className="p-8 text-center">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookmarked articles</h3>
                <p className="text-muted-foreground">
                  Save articles for quick access later
                </p>
              </Card>
            ) : (
              bookmarkedArticles.map(article => (
                <Card
                  key={article.id}
                  className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => router.push(`/knowledge/article/${article.id}`)}
                >
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                    <p className="text-muted-foreground mb-3">{article.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(article.id);
                      }}
                    >
                      Remove Bookmark
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {[...articles]
              .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
              .slice(0, 5)
              .map(article => (
                <Card
                  key={article.id}
                  className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => router.push(`/knowledge/article/${article.id}`)}
                >
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                    <p className="text-muted-foreground mb-3">{article.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Updated {article.lastUpdated.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button variant="ghost" className="justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Required Forms Library
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="ghost" className="justify-start">
                <Gavel className="h-4 w-4 mr-2" />
                California Civil Code
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="ghost" className="justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Tenant Rights Handbook
                <Download className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="ghost" className="justify-start">
                <AlertCircle className="h-4 w-4 mr-2" />
                Emergency Resources
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}