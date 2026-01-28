'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Printer,
  Download,
  Clock,
  Calendar,
  Tag,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileText,
  Scale,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { format } from 'date-fns';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  readTime: string;
  lastUpdated: Date;
  author: string;
  tags: string[];
  relatedArticles: string[];
  legalReferences: {
    title: string;
    code: string;
    url?: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

// Mock article data
const mockArticle: Article = {
  id: '1',
  title: 'California Tenant Rights: A Complete Guide',
  description: 'Everything you need to know about your rights as a tenant in California, including habitability, privacy, and protection from retaliation.',
  content: `## Introduction

As a tenant in California, you have significant rights protected by state law. Understanding these rights is crucial for maintaining a positive rental experience and protecting yourself from unlawful practices.

## Your Basic Rights

### 1. Right to a Habitable Living Space

California law requires landlords to provide and maintain rental units that meet basic health and safety standards. This is known as the "implied warranty of habitability" under Civil Code § 1941.1.

**What makes a unit habitable?**
- Effective waterproofing and weather protection
- Plumbing and gas facilities in good working order
- Hot and cold running water
- Heating facilities
- Electrical systems in good working order
- Clean and sanitary buildings and grounds
- Adequate trash receptacles
- Floors, stairways, and railings in good repair

### 2. Right to Privacy

Your landlord cannot enter your rental unit whenever they want. Under Civil Code § 1954, landlords can only enter:
- In case of emergency
- To make necessary or agreed-upon repairs
- To show the unit to prospective tenants, purchasers, or contractors
- When you have abandoned the rental unit
- Pursuant to court order

**Notice Requirements:**
- 24-hour written notice for non-emergency entry
- Reasonable hours (generally 8 AM to 5 PM on weekdays)
- Notice must state the date, approximate time, and purpose of entry

### 3. Protection from Retaliation

California law prohibits landlords from retaliating against tenants who:
- Complain to the landlord about habitability issues
- Complain to a government agency about building or health code violations
- Exercise any legal tenant rights
- Join or organize a tenant union

**What constitutes retaliation?**
- Raising rent
- Decreasing services
- Threatening eviction
- Filing eviction within 180 days of protected activity

### 4. Security Deposit Rights

Under Civil Code § 1950.5:
- Landlords can charge maximum of 2 months' rent (unfurnished) or 3 months' rent (furnished)
- Must be returned within 21 days after move-out
- Deductions allowed only for:
  - Unpaid rent
  - Cleaning to return unit to move-in condition
  - Repair of damage beyond normal wear and tear
  - Restoration of furniture (if furnished unit)

### 5. Right to Organize

Tenants have the right to:
- Form tenant associations
- Meet with other tenants
- Distribute literature about tenants' rights
- Peacefully organize for better conditions

## Recent Changes in California Tenant Law

### AB 1482 (Tenant Protection Act of 2019)

This law provides:
- Rent increase caps: 5% + local CPI, max 10% annually
- Just cause eviction protections after 12 months of tenancy
- Applies to most residential properties built before 2005

### SB 567 (2024 Updates)

Strengthens protections by:
- Increasing penalties for wrongful evictions
- Requiring more detailed notices
- Expanding tenant remedies

## What to Do If Your Rights Are Violated

1. **Document Everything**
   - Take photos and videos
   - Keep all written communications
   - Create a timeline of events

2. **Communicate in Writing**
   - Send certified letters
   - Keep copies of everything
   - Follow up verbal conversations with written summaries

3. **Know Your Resources**
   - Local tenant rights organizations
   - Legal aid societies
   - Small claims court for disputes under $10,000
   - Housing department complaints

4. **Consider Legal Action**
   - Consult with a tenant rights attorney
   - File complaints with appropriate agencies
   - Pursue remedies in court if necessary

## Conclusion

Knowledge is power when it comes to protecting your rights as a tenant. Stay informed, document everything, and don't hesitate to seek help when needed. Remember, the law is on your side when landlords fail to meet their obligations.`,
  category: 'tenant-rights',
  readTime: '15 min',
  lastUpdated: new Date('2024-03-01'),
  author: 'California Legal Aid',
  tags: ['basics', 'rights', 'california-law', 'habitability', 'privacy', 'retaliation'],
  relatedArticles: ['2', '4', '5'],
  legalReferences: [
    {
      title: 'Implied Warranty of Habitability',
      code: 'Cal. Civ. Code § 1941.1',
      url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1941.1'
    },
    {
      title: 'Right of Entry',
      code: 'Cal. Civ. Code § 1954',
      url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1954'
    },
    {
      title: 'Security Deposits',
      code: 'Cal. Civ. Code § 1950.5',
      url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1950.5'
    }
  ],
  faqs: [
    {
      question: 'Can my landlord enter without notice in an emergency?',
      answer: 'Yes, landlords can enter without notice in case of a genuine emergency, such as a fire, flood, or gas leak that threatens safety or property.'
    },
    {
      question: 'What is considered "normal wear and tear"?',
      answer: 'Normal wear and tear includes minor scuffs on walls, worn carpet from regular use, faded paint, and loose door handles from regular use. It does not include large holes in walls, pet damage, or broken fixtures.'
    },
    {
      question: 'How long does my landlord have to make repairs?',
      answer: 'California law requires repairs to be made within a "reasonable time," typically interpreted as 30 days for non-urgent repairs and 24-72 hours for urgent issues affecting health and safety.'
    }
  ]
};

export default function ArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState({ yes: 45, no: 3 });
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    // In real app, fetch article by ID
    setArticle(mockArticle);
  }, [params.id]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Bookmark removed' : 'Article bookmarked',
      description: isBookmarked ? 'Removed from your saved articles' : 'You can find this in your bookmarks',
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article?.title,
        text: article?.description,
        url: window.location.href,
      });
    } catch {
      // Fallback to copying link
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Article link copied to clipboard',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!article) return;
    
    // Create a formatted version for PDF-like download
    const content = `${article.title}
================\n\n${article.description}\n\nLast Updated: ${format(article.lastUpdated, 'MMMM d, yyyy')}\nAuthor: ${article.author}\n\n${article.content}\n\n\nLegal References\n----------------\n${article.legalReferences.map(ref => `• ${ref.title} (${ref.code})`).join('\n')}\n\n\nFrequently Asked Questions\n--------------------------\n${article.faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}\n`).join('\n')}\n\n\n© ${new Date().getFullYear()} AI Tenant Rights Advisor. This content is for informational purposes only.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    
    toast({
      title: 'Article downloaded',
      description: 'The article has been saved as a text file',
    });
  };

  const handleVote = (vote: 'yes' | 'no') => {
    if (userVote === vote) {
      // Remove vote
      setUserVote(null);
      setHelpfulVotes({
        yes: vote === 'yes' ? helpfulVotes.yes - 1 : helpfulVotes.yes,
        no: vote === 'no' ? helpfulVotes.no - 1 : helpfulVotes.no
      });
    } else {
      // Add or change vote
      const prevVote = userVote;
      setUserVote(vote);
      setHelpfulVotes({
        yes: vote === 'yes' ? helpfulVotes.yes + 1 : (prevVote === 'yes' ? helpfulVotes.yes - 1 : helpfulVotes.yes),
        no: vote === 'no' ? helpfulVotes.no + 1 : (prevVote === 'no' ? helpfulVotes.no - 1 : helpfulVotes.no)
      });
    }
  };

  if (!article) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/knowledge')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Knowledge Base
      </Button>

      <article className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{article.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <ChevronRight className="h-4 w-4" />
            <span>{article.title}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">{article.description}</p>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {article.readTime}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Updated {format(article.lastUpdated, 'MMM d, yyyy')}
              </span>
              <span>By {article.author}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                ) : (
                  <Bookmark className="h-4 w-4 mr-2" />
                )}
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            {article.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />').replace(/##/g, '<h2>').replace(/\*\*/g, '<strong>') }} />
        </div>

        <Separator />

        {/* Additional Resources */}
        <Tabs defaultValue="references" className="w-full">
          <TabsList>
            <TabsTrigger value="references">Legal References</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="related">Related Articles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="references" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Scale className="h-5 w-5 mr-2" />
                  Legal References
                </CardTitle>
                <CardDescription>
                  California codes and regulations referenced in this article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {article.legalReferences.map((ref, index) => (
                    <div key={index} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{ref.title}</p>
                        <p className="text-sm text-muted-foreground">{ref.code}</p>
                      </div>
                      {ref.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={ref.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="faqs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {article.faqs.map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <p className="font-medium">{faq.question}</p>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      {index < article.faqs.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="related" className="space-y-4">
            <div className="grid gap-4">
              <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">Security Deposit Laws in California</h3>
                  <p className="text-sm text-muted-foreground">Learn about deposit limits, return timelines, and allowable deductions.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">Just Cause Eviction Protections</h3>
                  <p className="text-sm text-muted-foreground">Understanding AB 1482 and local just cause eviction ordinances.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">Rent Control: What's Covered</h3>
                  <p className="text-sm text-muted-foreground">Which properties are covered by rent control and how increases are calculated.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Feedback */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg font-medium mb-4">Was this article helpful?</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={userVote === 'yes' ? 'default' : 'outline'}
                  onClick={() => handleVote('yes')}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Yes ({helpfulVotes.yes})
                </Button>
                <Button
                  variant={userVote === 'no' ? 'default' : 'outline'}
                  onClick={() => handleVote('no')}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  No ({helpfulVotes.no})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Need personalized help?</strong> Chat with our AI Legal Advisor for guidance specific to your situation.
            <Button variant="link" className="px-2" onClick={() => router.push('/chat')}>
              Start Chat <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </AlertDescription>
        </Alert>
      </article>
    </div>
  );
}