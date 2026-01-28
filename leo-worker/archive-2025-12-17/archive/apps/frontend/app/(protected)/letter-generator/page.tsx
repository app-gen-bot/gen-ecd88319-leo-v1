'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  Search,
  FileText,
  Clock,
  Star,
  Info,
  ArrowRight,
  Download,
  Send,
  Home,
  DollarSign,
  Wrench,
  Shield,
  AlertCircle,
  Key,
  Users,
  Calendar
} from 'lucide-react';

interface LetterTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  estimatedTime: string;
  popularity: number;
  tags: string[];
}

const letterTemplates: LetterTemplate[] = [
  {
    id: 'repair-request',
    title: 'Repair Request',
    description: 'Formal request for repairs with legal requirements',
    category: 'Maintenance',
    icon: Wrench,
    estimatedTime: '5 minutes',
    popularity: 95,
    tags: ['repairs', 'maintenance', 'urgent']
  },
  {
    id: 'rent-withholding',
    title: 'Rent Withholding Notice',
    description: 'Legal notice for withholding rent due to habitability issues',
    category: 'Maintenance',
    icon: Home,
    estimatedTime: '10 minutes',
    popularity: 75,
    tags: ['rent', 'withholding', 'habitability']
  },
  {
    id: 'deposit-return',
    title: 'Security Deposit Return Request',
    description: 'Demand letter for return of security deposit',
    category: 'Move-out',
    icon: DollarSign,
    estimatedTime: '8 minutes',
    popularity: 90,
    tags: ['deposit', 'move-out', 'money']
  },
  {
    id: 'notice-entry-objection',
    title: 'Improper Entry Objection',
    description: 'Object to landlord entering without proper notice',
    category: 'Privacy',
    icon: Shield,
    estimatedTime: '5 minutes',
    popularity: 70,
    tags: ['privacy', 'entry', 'notice']
  },
  {
    id: 'discrimination-complaint',
    title: 'Discrimination Complaint',
    description: 'Formal complaint about discriminatory treatment',
    category: 'Rights',
    icon: Users,
    estimatedTime: '15 minutes',
    popularity: 60,
    tags: ['discrimination', 'rights', 'complaint']
  },
  {
    id: 'lease-violation-response',
    title: 'Response to Lease Violation',
    description: 'Respond to alleged lease violation notice',
    category: 'Disputes',
    icon: AlertCircle,
    estimatedTime: '10 minutes',
    popularity: 80,
    tags: ['violation', 'response', 'dispute']
  },
  {
    id: 'rent-increase-objection',
    title: 'Rent Increase Objection',
    description: 'Challenge improper or excessive rent increase',
    category: 'Rent',
    icon: DollarSign,
    estimatedTime: '8 minutes',
    popularity: 85,
    tags: ['rent', 'increase', 'objection']
  },
  {
    id: 'move-in-inspection',
    title: 'Move-in Inspection Request',
    description: 'Request joint move-in inspection to document condition',
    category: 'Move-in',
    icon: Key,
    estimatedTime: '5 minutes',
    popularity: 65,
    tags: ['move-in', 'inspection', 'condition']
  },
  {
    id: '30-day-notice',
    title: '30-Day Move Notice',
    description: 'Proper notice to terminate month-to-month tenancy',
    category: 'Move-out',
    icon: Calendar,
    estimatedTime: '5 minutes',
    popularity: 88,
    tags: ['notice', 'move-out', '30-day']
  }
];

const categories = ['All', 'Maintenance', 'Move-out', 'Move-in', 'Privacy', 'Rights', 'Disputes', 'Rent'];

export default function LetterGeneratorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const filteredTemplates = letterTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartLetter = () => {
    if (!selectedTemplate) {
      toast({
        title: 'Please select a template',
        description: 'Choose a letter template to continue',
        variant: 'destructive'
      });
      return;
    }
    router.push(`/letter-generator/compose?template=${selectedTemplate}`);
  };

  const popularTemplates = [...letterTemplates]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Letter Generator</h1>
          <p className="text-muted-foreground mt-2">
            Create professional legal letters to communicate with your landlord
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            All letters are tailored to California tenant law and include proper legal language. 
            You can customize any template before sending.
          </AlertDescription>
        </Alert>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search letter templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Popular Templates */}
        {!searchQuery && selectedCategory === 'All' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Most Used Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {popularTemplates.map(template => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-primary'
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <template.icon className="h-6 w-6 text-primary" />
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        {template.popularity}%
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{template.category}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.estimatedTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {searchQuery || selectedCategory !== 'All' ? 'Letter Templates' : 'All Templates'}
          </h2>
          {filteredTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </Card>
          ) : (
            <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <div className="grid gap-4">
                {filteredTemplates.map(template => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-primary'
                        : 'hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <Label
                              htmlFor={template.id}
                              className="flex items-center space-x-2 text-base font-medium cursor-pointer"
                            >
                              <template.icon className="h-5 w-5" />
                              <span>{template.title}</span>
                            </Label>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.estimatedTime}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{template.category}</Badge>
                            <div className="flex gap-1">
                              {template.tags.map(tag => (
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
            </RadioGroup>
          )}
        </div>

        {/* Action Buttons */}
        {selectedTemplate && (
          <Card className="border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Ready to create your letter?
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can customize all fields before sending
                  </p>
                </div>
                <Button onClick={handleStartLetter} size="lg">
                  Start Letter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Letter Writing Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p>Always keep copies of all correspondence with your landlord</p>
            </div>
            <div className="flex items-start space-x-2">
              <Send className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p>Send important letters via certified mail with return receipt</p>
            </div>
            <div className="flex items-start space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p>Document the date and method of delivery for your records</p>
            </div>
            <div className="flex items-start space-x-2">
              <Download className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p>Download a copy before sending and save it with your documentation</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}