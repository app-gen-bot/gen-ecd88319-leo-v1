'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  HelpCircle,
  MessageSquare,
  FileText,
  Shield,
  Home,
  Mail,
  Phone,
  ExternalLink,
  BookOpen,
  Lightbulb,
  AlertCircle,
  Clock,
  Video,
  Download,
  ChevronRight,
  Zap,
  GraduationCap
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ElementType;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How does the AI Legal Advisor work?',
    answer: 'Our AI Legal Advisor uses advanced language models trained on California tenant law to provide personalized guidance. Simply describe your situation, and it will offer relevant legal information, suggest actions, and help you understand your rights. Note: This is not a substitute for professional legal advice.',
    category: 'ai-advisor'
  },
  {
    id: '2',
    question: 'Is my data secure and private?',
    answer: 'Yes, we take data security seriously. All your documents and communications are encrypted both in transit and at rest. We never share your personal information with third parties without your explicit consent. You can export or delete your data at any time from the Settings page.',
    category: 'privacy'
  },
  {
    id: '3',
    question: 'What types of documents can I upload?',
    answer: 'You can upload various document types including PDFs, images (JPG, PNG), and text files. Common documents include leases, rent receipts, repair requests, photos of issues, and correspondence with your landlord. Our AI can analyze these documents to help build your case.',
    category: 'documents'
  },
  {
    id: '4',
    question: 'How do I generate a legal letter?',
    answer: 'Navigate to the Letter Generator, select a template that matches your situation (e.g., repair request, deposit return), fill in the required information, and our AI will generate a professionally formatted letter with appropriate legal language. You can then edit, download, or send it directly.',
    category: 'letters'
  },
  {
    id: '5',
    question: 'What is the Dispute Wizard?',
    answer: 'The Dispute Wizard guides you through documenting and resolving conflicts with your landlord. It helps you organize evidence, understand relevant laws, track communications, and prepare documentation if you need to escalate to small claims court or other legal proceedings.',
    category: 'disputes'
  },
  {
    id: '6',
    question: 'How accurate is the security deposit calculator?',
    answer: 'Our calculator uses California state law requirements including the 21-day return deadline and allowable deductions. It calculates interest based on local regulations when applicable. While highly accurate, always verify calculations for your specific situation.',
    category: 'deposits'
  },
  {
    id: '7',
    question: 'Can I use this app if I\'m not in California?',
    answer: 'Currently, our app is specifically designed for California tenant law, which has unique protections and requirements. While some general features may be helpful, the legal information and document templates are California-specific. We plan to expand to other states in the future.',
    category: 'general'
  },
  {
    id: '8',
    question: 'How do I track communications with my landlord?',
    answer: 'Use the Communication Hub to log all interactions. You can record emails, texts, phone calls, and in-person conversations. The app automatically timestamps entries and allows you to attach related documents, creating a comprehensive record for legal purposes.',
    category: 'communications'
  }
];

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Getting Started with AI Lawyer',
    description: 'Learn the basics of navigating the app and understanding your tenant rights',
    duration: '5 min',
    difficulty: 'beginner',
    icon: GraduationCap
  },
  {
    id: '2',
    title: 'Document Your Rental Issues',
    description: 'Best practices for photographing and documenting problems in your rental',
    duration: '8 min',
    difficulty: 'beginner',
    icon: FileText
  },
  {
    id: '3',
    title: 'Writing Effective Legal Letters',
    description: 'How to customize templates and ensure your letters have legal weight',
    duration: '10 min',
    difficulty: 'intermediate',
    icon: Mail
  },
  {
    id: '4',
    title: 'Building a Strong Dispute Case',
    description: 'Organize evidence and prepare for potential legal proceedings',
    duration: '15 min',
    difficulty: 'advanced',
    icon: Shield
  },
  {
    id: '5',
    title: 'Understanding Security Deposits',
    description: 'Know your rights regarding deposits and how to get yours back',
    duration: '7 min',
    difficulty: 'beginner',
    icon: Home
  },
  {
    id: '6',
    title: 'Using the AI Legal Advisor',
    description: 'Get the most out of AI-powered legal guidance',
    duration: '6 min',
    difficulty: 'intermediate',
    icon: Zap
  }
];

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'ai-advisor', name: 'AI Advisor', icon: Zap },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'letters', name: 'Letters', icon: Mail },
    { id: 'disputes', name: 'Disputes', icon: Shield },
    { id: 'deposits', name: 'Deposits', icon: Home },
    { id: 'communications', name: 'Communications', icon: MessageSquare },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'general', name: 'General', icon: HelpCircle }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground mt-2">
            Find answers, watch tutorials, and get support
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 text-base"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => router.push('/chat')}>
            <CardContent className="p-6">
              <MessageSquare className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Chat with AI Advisor</h3>
              <p className="text-sm text-muted-foreground">
                Get instant help with your questions
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-6">
              <Video className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Watch Video Tutorials</h3>
              <p className="text-sm text-muted-foreground">
                Learn with step-by-step guides
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-6">
              <Mail className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Email us at support@ailawyer.com
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faqs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </div>

            {/* FAQ Accordion */}
            {filteredFAQs.length === 0 ? (
              <Card className="p-8 text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or browse all FAQs
                </p>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQs.map(faq => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="text-left">
                        <p className="font-medium">{faq.question}</p>
                        <Badge variant="secondary" className="mt-1">
                          {categories.find(c => c.id === faq.category)?.name}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground pt-2">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map(tutorial => (
                <Card key={tutorial.id} className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <tutorial.icon className="h-8 w-8 text-primary" />
                      <Badge variant={
                        tutorial.difficulty === 'beginner' ? 'secondary' :
                        tutorial.difficulty === 'intermediate' ? 'default' : 'outline'
                      }>
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{tutorial.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {tutorial.duration}
                      </span>
                      <Button variant="ghost" size="sm">
                        Watch Now
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Start with beginner tutorials to understand the basics, then move to intermediate topics for specific features.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Choose your preferred method of contact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@ailawyer.com</p>
                      <p className="text-sm text-muted-foreground">Response time: 24-48 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">Available Mon-Fri, 9 AM - 6 PM PST</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">1-800-TENANT-1</p>
                      <p className="text-sm text-muted-foreground">Premium members only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Office Hours</CardTitle>
                  <CardDescription>
                    When our support team is available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Monday - Friday</span>
                      <span className="text-sm font-medium">9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Saturday</span>
                      <span className="text-sm font-medium">10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sunday</span>
                      <span className="text-sm font-medium">Closed</span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Emergency legal issues? Our AI advisor is available 24/7.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Before contacting support:</strong> Please check our FAQs and tutorials. Most questions can be answered there!
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Legal Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-between">
                    California Tenant Law Guide
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Sample Legal Letters
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Court Filing Templates
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Tenant Rights Checklist
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">External Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      CA Dept of Consumer Affairs
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Legal Aid Foundation
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Small Claims Court Info
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Tenant Union Directory
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <BookOpen className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">AI Lawyer User Guide</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download our comprehensive user guide to learn everything about using AI Lawyer effectively.
                    </p>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF Guide
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Still Need Help */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Still need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI Legal Advisor is available 24/7 to answer your questions
                </p>
              </div>
              <Button onClick={() => router.push('/chat')}>
                Chat with AI
                <MessageSquare className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}