"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api-client"
import { type LeaseAnalysis, type LeaseIssue } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  AlertTriangle,
  XCircle,
  AlertCircle,
  Info,
  FileText,
  Copy,
  CheckCircle
} from "lucide-react"

export default function DocumentAnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<LeaseAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState<LeaseIssue | null>(null)

  useEffect(() => {
    loadAnalysis()
  }, [params.id])

  const loadAnalysis = async () => {
    try {
      // In a real app, this would fetch the analysis
      const mockAnalysis: LeaseAnalysis = {
        id: params.id as string,
        user_id: 'user-1',
        property_id: 'prop-1',
        file_name: 'Rental_Agreement_2024.pdf',
        file_url: '/documents/lease.pdf',
        status: 'completed',
        issues: [
          {
            id: 'issue-1',
            type: 'illegal',
            severity: 'high',
            title: 'Illegal Late Fee Amount',
            description: 'The lease specifies a late fee of $100 per day, which exceeds California\'s reasonable late fee limits.',
            clause_text: 'Tenant agrees to pay a late fee of $100 for each day rent is late...',
            legal_citation: 'CA Civil Code § 1671',
            suggested_revision: 'Late fees should be reasonable and proportional to actual damages, typically 5-10% of monthly rent.',
            page_number: 3,
          },
          {
            id: 'issue-2',
            type: 'illegal',
            severity: 'high',
            title: 'Waiver of Tenant Rights',
            description: 'The lease attempts to waive your right to a habitable living space, which is illegal in California.',
            clause_text: 'Tenant waives all rights to request repairs or maintenance...',
            legal_citation: 'CA Civil Code § 1942.1',
            suggested_revision: 'Remove this clause entirely. Tenants cannot waive their right to habitability.',
            page_number: 5,
          },
          {
            id: 'issue-3',
            type: 'concerning',
            severity: 'medium',
            title: 'Automatic Renewal Clause',
            description: 'The lease automatically renews for another year unless notice is given 90 days in advance.',
            clause_text: 'This lease shall automatically renew for successive one-year terms unless either party provides written notice at least 90 days...',
            suggested_revision: 'Consider negotiating for 30-60 day notice period or month-to-month after initial term.',
            page_number: 8,
          },
          {
            id: 'issue-4',
            type: 'missing',
            severity: 'low',
            title: 'Missing Mold Disclosure',
            description: 'California law requires landlords to provide information about mold.',
            clause_text: 'N/A - Required disclosure is missing from the lease agreement.',
            legal_citation: 'CA Health & Safety Code § 26147',
            suggested_revision: 'Request the landlord provide the required mold disclosure form.',
          },
        ],
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      }
      
      setAnalysis(mockAnalysis)
    } catch (error) {
      toast({
        title: "Error loading analysis",
        description: "Please try again",
        variant: "destructive",
      })
      router.push('/document-review')
    } finally {
      setIsLoading(false)
    }
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'illegal':
        return <XCircle className="h-4 w-4" />
      case 'concerning':
        return <AlertTriangle className="h-4 w-4" />
      case 'missing':
        return <Info className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'illegal':
        return "destructive"
      case 'concerning':
        return "warning"
      case 'missing':
        return "secondary"
      default:
        return "default"
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      high: "destructive",
      medium: "warning",
      low: "secondary"
    }
    return (
      <Badge variant={colors[severity as keyof typeof colors] as any}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority
      </Badge>
    )
  }

  const handleDownloadReport = () => {
    // In a real app, this would generate and download a PDF report
    toast({
      title: "Downloading report",
      description: "Your analysis report is being prepared...",
    })
  }

  const handleShare = () => {
    // In a real app, this would generate a shareable link
    const shareUrl = `${window.location.origin}/shared/analysis/${analysis?.id}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link copied",
      description: "Share this link with your attorney or advocate",
    })
  }

  const handleCopySuggestion = (suggestion: string) => {
    navigator.clipboard.writeText(suggestion)
    toast({
      title: "Copied to clipboard",
      description: "Suggested revision copied",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  const issuesByType = {
    illegal: analysis.issues.filter(i => i.type === 'illegal'),
    concerning: analysis.issues.filter(i => i.type === 'concerning'),
    missing: analysis.issues.filter(i => i.type === 'missing'),
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/document-review')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lease Analysis Complete</h1>
            <p className="text-muted-foreground">
              {analysis.file_name} • Analyzed on {new Date(analysis.completed_at!).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Alert */}
      <Alert className="mb-8" variant={issuesByType.illegal.length > 0 ? "destructive" : "default"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analysis Summary</AlertTitle>
        <AlertDescription>
          Found {analysis.issues.length} issue{analysis.issues.length !== 1 ? 's' : ''} in your lease agreement:
          {issuesByType.illegal.length > 0 && ` ${issuesByType.illegal.length} illegal clause${issuesByType.illegal.length !== 1 ? 's' : ''}`}
          {issuesByType.concerning.length > 0 && `, ${issuesByType.concerning.length} concerning term${issuesByType.concerning.length !== 1 ? 's' : ''}`}
          {issuesByType.missing.length > 0 && `, ${issuesByType.missing.length} missing disclosure${issuesByType.missing.length !== 1 ? 's' : ''}`}.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Issues List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Issues ({analysis.issues.length})</TabsTrigger>
              <TabsTrigger value="illegal">Illegal ({issuesByType.illegal.length})</TabsTrigger>
              <TabsTrigger value="concerning">Concerning ({issuesByType.concerning.length})</TabsTrigger>
              <TabsTrigger value="missing">Missing ({issuesByType.missing.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {analysis.issues.map((issue) => (
                <Card 
                  key={issue.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={getIssueColor(issue.type) as any} className="gap-1">
                          {getIssueIcon(issue.type)}
                          {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
                        </Badge>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      {issue.page_number && (
                        <span className="text-sm text-muted-foreground">Page {issue.page_number}</span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold mb-2">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                    
                    {issue.clause_text && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm italic">"{issue.clause_text}"</p>
                      </div>
                    )}
                    
                    {issue.legal_citation && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Legal Reference: {issue.legal_citation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="illegal" className="space-y-4">
              {issuesByType.illegal.map((issue) => (
                <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedIssue(issue)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-4 w-4" />
                        Illegal Clause
                      </Badge>
                      {issue.page_number && (
                        <span className="text-sm text-muted-foreground">Page {issue.page_number}</span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="concerning" className="space-y-4">
              {issuesByType.concerning.map((issue) => (
                <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedIssue(issue)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="gap-1 bg-yellow-500 text-white hover:bg-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        Concerning Term
                      </Badge>
                      {issue.page_number && (
                        <span className="text-sm text-muted-foreground">Page {issue.page_number}</span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="missing" className="space-y-4">
              {issuesByType.missing.map((issue) => (
                <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedIssue(issue)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="gap-1">
                        <Info className="h-4 w-4" />
                        Missing Disclosure
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href={`/letters/create/lease-negotiation?analysis_id=${analysis.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Negotiation Letter
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/ai-advisor">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Ask AI Legal Advisor
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share with Attorney
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm">Illegal Clauses</span>
                  </div>
                  <span className="font-semibold">{issuesByType.illegal.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    <span className="text-sm">Concerning Terms</span>
                  </div>
                  <span className="font-semibold">{issuesByType.concerning.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Missing Disclosures</span>
                  </div>
                  <span className="font-semibold">{issuesByType.missing.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              This analysis is for informational purposes. Consider consulting with a local attorney for legal advice specific to your situation.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Issue Detail Modal */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl">
          {selectedIssue && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant={getIssueColor(selectedIssue.type) as any} className="gap-1">
                    {getIssueIcon(selectedIssue.type)}
                    {selectedIssue.type.charAt(0).toUpperCase() + selectedIssue.type.slice(1)}
                  </Badge>
                  {selectedIssue.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedIssue.page_number && `Found on page ${selectedIssue.page_number}`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-6">
                <div>
                  <h4 className="font-semibold mb-2">Issue Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>
                </div>
                
                {selectedIssue.clause_text && (
                  <div>
                    <h4 className="font-semibold mb-2">Problematic Clause</h4>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm italic">"{selectedIssue.clause_text}"</p>
                    </div>
                  </div>
                )}
                
                {selectedIssue.legal_citation && (
                  <div>
                    <h4 className="font-semibold mb-2">Legal Reference</h4>
                    <p className="text-sm">{selectedIssue.legal_citation}</p>
                  </div>
                )}
                
                {selectedIssue.suggested_revision && (
                  <div>
                    <h4 className="font-semibold mb-2">Suggested Alternative</h4>
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md">
                      <p className="text-sm">{selectedIssue.suggested_revision}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleCopySuggestion(selectedIssue.suggested_revision!)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Suggestion
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}