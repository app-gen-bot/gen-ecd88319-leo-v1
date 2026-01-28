'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Download,
  Share2,
  AlertTriangle,
  XCircle,
  Info,
  FileText,
  Scale,
  Shield,
  CheckCircle,
  Copy,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface Issue {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  location: string;
  explanation: string;
  recommendation: string;
  legalReference?: string;
}

// Mock detailed analysis data
const mockAnalysis = {
  id: '1',
  fileName: 'lease_agreement_2024.pdf',
  uploadDate: new Date('2024-03-10'),
  documentType: 'Lease Agreement',
  overallScore: 65,
  summary: 'This lease agreement contains several provisions that may violate California tenant law. Critical issues include an illegal late fee structure and missing required disclosures.',
  issues: [
    {
      id: '1',
      type: 'critical' as const,
      category: 'Fees',
      title: 'Illegal Late Fee Amount',
      description: 'The lease specifies a $100 late fee, which exceeds California\'s reasonable amount standard.',
      location: 'Page 3, Section 4.2',
      explanation: 'California law requires late fees to be reasonable and related to actual costs. Courts typically consider fees over 5-6% of monthly rent excessive.',
      recommendation: 'Request the landlord reduce the late fee to a reasonable amount (typically $50-75 for your rent amount).',
      legalReference: 'Orozco v. Casimiro, 121 Cal.App.4th Supp. 7 (2004)'
    },
    {
      id: '2',
      type: 'critical' as const,
      category: 'Disclosures',
      title: 'Missing Bed Bug Disclosure',
      description: 'The lease lacks the required bed bug information disclosure.',
      location: 'Not found',
      explanation: 'California law requires landlords to provide tenants with information about bed bugs, including identification and reporting procedures.',
      recommendation: 'Request the landlord provide the required bed bug disclosure form.',
      legalReference: 'California Civil Code § 1954.603'
    },
    {
      id: '3',
      type: 'warning' as const,
      category: 'Maintenance',
      title: 'Overly Broad Repair Responsibility',
      description: 'Lease attempts to make tenant responsible for all repairs under $200.',
      location: 'Page 5, Section 7.1',
      explanation: 'Landlords cannot shift their legal maintenance obligations to tenants. They must maintain habitable conditions.',
      recommendation: 'Document that this clause is unenforceable and keep records of any repair requests.',
      legalReference: 'California Civil Code § 1941.1'
    },
    {
      id: '4',
      type: 'warning' as const,
      category: 'Entry',
      title: 'Insufficient Notice Period',
      description: 'Lease allows entry with only 12 hours notice.',
      location: 'Page 6, Section 8.3',
      explanation: 'California law requires 24 hours written notice for non-emergency entry.',
      recommendation: 'Remind landlord of 24-hour notice requirement if they attempt entry with less notice.',
      legalReference: 'California Civil Code § 1954'
    },
    {
      id: '5',
      type: 'info' as const,
      category: 'Pets',
      title: 'High Pet Deposit',
      description: 'Pet deposit is set at $500.',
      location: 'Page 4, Section 5.3',
      explanation: 'While legal, this is on the higher end of typical pet deposits. Total security deposit (including pet) cannot exceed 2 months rent.',
      recommendation: 'Try negotiating a lower pet deposit, especially for smaller pets.',
    }
  ]
};

export default function DocumentAnalysisPage() {
  const router = useRouter();
  const _params = useParams();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-destructive';
  };

  const copyToClipboard = async (text: string, issueId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(issueId);
      toast({
        title: 'Copied to clipboard',
        description: 'The issue details have been copied.',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadReport = () => {
    toast({
      title: 'Downloading report',
      description: 'Your detailed analysis report is being prepared.',
    });
  };

  const handleShareReport = () => {
    toast({
      title: 'Share feature coming soon',
      description: 'You\'ll be able to share this report with your lawyer.',
    });
  };

  const issuesByCategory = mockAnalysis.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/document-review')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Document Review
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" onClick={handleShareReport}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Document Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>{mockAnalysis.fileName}</CardTitle>
                <CardDescription className="mt-1">
                  {mockAnalysis.documentType} • Analyzed on {mockAnalysis.uploadDate.toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(mockAnalysis.overallScore)}`}>
                {mockAnalysis.overallScore}%
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Scale className="h-4 w-4" />
            <AlertTitle>Legal Analysis Summary</AlertTitle>
            <AlertDescription>{mockAnalysis.summary}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Issues Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {mockAnalysis.issues.filter(i => i.type === 'critical').length}
                </p>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {mockAnalysis.issues.filter(i => i.type === 'warning').length}
                </p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {mockAnalysis.issues.filter(i => i.type === 'info').length}
                </p>
                <p className="text-sm text-muted-foreground">Information</p>
              </div>
              <Info className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Issues */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Issues ({mockAnalysis.issues.length})
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({mockAnalysis.issues.filter(i => i.type === 'critical').length})
          </TabsTrigger>
          <TabsTrigger value="warning">
            Warnings ({mockAnalysis.issues.filter(i => i.type === 'warning').length})
          </TabsTrigger>
          <TabsTrigger value="info">
            Info ({mockAnalysis.issues.filter(i => i.type === 'info').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Object.entries(issuesByCategory).map(([category, issues]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {issues.map((issue, index) => (
                  <div key={issue.id}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getIssueIcon(issue.type)}
                          <div className="space-y-1">
                            <h4 className="font-medium">{issue.title}</h4>
                            <p className="text-sm text-muted-foreground">{issue.location}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(
                            `${issue.title}\n${issue.description}\n\nRecommendation: ${issue.recommendation}`,
                            issue.id
                          )}
                        >
                          {copiedId === issue.id ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="ml-8 space-y-3">
                        <div>
                          <p className="text-sm">{issue.description}</p>
                        </div>
                        
                        <Alert className="bg-muted/50">
                          <Shield className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>Legal Context:</strong> {issue.explanation}
                          </AlertDescription>
                        </Alert>
                        
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-sm font-medium mb-1">Recommended Action:</p>
                          <p className="text-sm">{issue.recommendation}</p>
                        </div>
                        
                        {issue.legalReference && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>Reference: {issue.legalReference}</span>
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {mockAnalysis.issues
            .filter(issue => issue.type === 'critical')
            .map(issue => (
              <Card key={issue.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      {getIssueIcon(issue.type)}
                      <div className="space-y-1">
                        <h4 className="font-medium">{issue.title}</h4>
                        <p className="text-sm text-muted-foreground">{issue.location}</p>
                      </div>
                    </div>
                    <p className="text-sm ml-8">{issue.description}</p>
                    <Alert className="ml-8">
                      <AlertDescription className="text-sm">
                        <strong>Action Required:</strong> {issue.recommendation}
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="warning" className="space-y-4">
          {mockAnalysis.issues
            .filter(issue => issue.type === 'warning')
            .map(issue => (
              <Card key={issue.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      {getIssueIcon(issue.type)}
                      <div className="space-y-1">
                        <h4 className="font-medium">{issue.title}</h4>
                        <p className="text-sm text-muted-foreground">{issue.location}</p>
                      </div>
                    </div>
                    <p className="text-sm ml-8">{issue.description}</p>
                    <div className="ml-8 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <p className="text-sm">{issue.recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          {mockAnalysis.issues
            .filter(issue => issue.type === 'info')
            .map(issue => (
              <Card key={issue.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      {getIssueIcon(issue.type)}
                      <div className="space-y-1">
                        <h4 className="font-medium">{issue.title}</h4>
                        <p className="text-sm text-muted-foreground">{issue.location}</p>
                      </div>
                    </div>
                    <p className="text-sm ml-8">{issue.description}</p>
                    <p className="text-sm ml-8 text-muted-foreground">{issue.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Document all issues</p>
                <p className="text-sm text-muted-foreground">
                  Save this report and take screenshots of the problematic clauses
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Communicate with your landlord</p>
                <p className="text-sm text-muted-foreground">
                  Use our Letter Generator to request corrections to illegal clauses
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Seek legal advice if needed</p>
                <p className="text-sm text-muted-foreground">
                  For critical issues, consider consulting with a tenant rights attorney
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}