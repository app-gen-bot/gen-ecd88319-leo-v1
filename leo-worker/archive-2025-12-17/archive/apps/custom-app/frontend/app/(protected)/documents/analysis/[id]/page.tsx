'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Download,
  Share2,
  MessageSquare,
  Scale,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  AlertTriangle,
  FileWarning,
  Copy,
  ExternalLink,
  BookOpen
} from 'lucide-react'
import { LeaseAnalysis, LeaseIssue } from '@/lib/types'

export default function DocumentAnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [analysis, setAnalysis] = useState<LeaseAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState<LeaseIssue | null>(null)
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0)

  useEffect(() => {
    loadAnalysis()
  }, [params.id])

  const loadAnalysis = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getLeaseAnalysis(params.id as string)
      setAnalysis(data as LeaseAnalysis)
      if (data.issues.length > 0) {
        setSelectedIssue(data.issues[0] as LeaseIssue)
      }
    } catch (error) {
      console.error('Failed to load analysis:', error)
      toast.error('Failed to load document analysis')
    } finally {
      setIsLoading(false)
    }
  }

  const getIssueCounts = () => {
    if (!analysis) return { illegal: 0, concerning: 0, missing: 0 }
    
    return {
      illegal: analysis.issues.filter(i => i.type === 'illegal').length,
      concerning: analysis.issues.filter(i => i.type === 'concerning').length,
      missing: analysis.issues.filter(i => i.type === 'missing').length,
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'default'
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

  const handleDownloadReport = async () => {
    try {
      const report = await apiClient.downloadLeaseReport(params.id as string)
      // Handle download
      toast.success('Report downloaded successfully')
    } catch (error) {
      toast.error('Failed to download report')
    }
  }

  const handleShare = async () => {
    try {
      const shareUrl = await apiClient.shareLeaseAnalysis(params.id as string)
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard')
    } catch (error) {
      toast.error('Failed to share analysis')
    }
  }

  const navigateToIssue = (index: number) => {
    if (!analysis) return
    const issue = analysis.issues[index]
    setSelectedIssue(issue)
    setCurrentIssueIndex(index)
    
    // Scroll to issue in document view if available
    if (issue.location) {
      const element = document.getElementById(`issue-${issue.id}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Analyzing your lease agreement...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load document analysis. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const issueCounts = getIssueCounts()

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Lease Analysis Results</h1>
            <p className="text-muted-foreground">{analysis.file_name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className={issueCounts.illegal > 0 ? 'border-destructive' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Illegal Clauses</CardTitle>
              <XCircle className={`h-5 w-5 ${issueCounts.illegal > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issueCounts.illegal}</div>
            <p className="text-sm text-muted-foreground">
              {issueCounts.illegal > 0 ? 'Requires immediate attention' : 'None found'}
            </p>
          </CardContent>
        </Card>

        <Card className={issueCounts.concerning > 0 ? 'border-orange-500' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Concerning Terms</CardTitle>
              <AlertTriangle className={`h-5 w-5 ${issueCounts.concerning > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issueCounts.concerning}</div>
            <p className="text-sm text-muted-foreground">
              {issueCounts.concerning > 0 ? 'Review recommended' : 'None found'}
            </p>
          </CardContent>
        </Card>

        <Card className={issueCounts.missing > 0 ? 'border-blue-500' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Missing Disclosures</CardTitle>
              <Info className={`h-5 w-5 ${issueCounts.missing > 0 ? 'text-blue-500' : 'text-muted-foreground'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issueCounts.missing}</div>
            <p className="text-sm text-muted-foreground">
              {issueCounts.missing > 0 ? 'Should be included' : 'All present'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      {analysis.issues.length > 0 && (
        <Alert className="mb-6">
          <Scale className="h-4 w-4" />
          <AlertDescription>
            <strong>AI Legal Assessment:</strong> Your lease contains {analysis.issues.length} potential issues that may affect your rights as a tenant. 
            {issueCounts.illegal > 0 && ' Illegal clauses found that violate California tenant law should be addressed immediately.'}
            {issueCounts.concerning > 0 && ' Some terms are concerning and may be negotiable.'}
            {issueCounts.missing > 0 && ' Required disclosures are missing and should be provided by your landlord.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issues List */}
        <Card>
          <CardHeader>
            <CardTitle>Identified Issues</CardTitle>
            <CardDescription>
              Click on any issue to see details and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2 p-6">
                {analysis.issues.map((issue, index) => (
                  <button
                    key={issue.id}
                    onClick={() => navigateToIssue(index)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedIssue?.id === issue.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${
                        issue.type === 'illegal' ? 'text-destructive' :
                        issue.type === 'concerning' ? 'text-orange-500' :
                        'text-blue-500'
                      }`}>
                        {getIssueIcon(issue.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{issue.title}</p>
                          <Badge variant={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {issue.description}
                        </p>
                        {issue.page_number && (
                          <p className="text-xs text-muted-foreground">
                            Page {issue.page_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Issue Details */}
        {selectedIssue ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Issue Details</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToIssue(Math.max(0, currentIssueIndex - 1))}
                    disabled={currentIssueIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentIssueIndex + 1} of {analysis.issues.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToIssue(Math.min(analysis.issues.length - 1, currentIssueIndex + 1))}
                    disabled={currentIssueIndex === analysis.issues.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Issue Type and Severity */}
              <div className="flex items-center gap-2">
                <Badge variant={getSeverityColor(selectedIssue.severity)}>
                  {selectedIssue.severity} severity
                </Badge>
                <Badge variant="outline">
                  {selectedIssue.type}
                </Badge>
              </div>

              {/* Title and Description */}
              <div>
                <h3 className="font-semibold mb-2">{selectedIssue.title}</h3>
                <p className="text-muted-foreground">{selectedIssue.description}</p>
              </div>

              {/* Problematic Clause */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Problematic Clause:</h4>
                <blockquote className="border-l-4 border-destructive pl-4 italic text-sm bg-muted/50 p-3 rounded">
                  "{selectedIssue.clause_text}"
                </blockquote>
              </div>

              {/* Legal Citation */}
              {selectedIssue.legal_citation && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Legal Reference:</h4>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{selectedIssue.legal_citation}</p>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/knowledge/search?q=${encodeURIComponent(selectedIssue.legal_citation)}`} target="_blank">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Suggested Revision */}
              {selectedIssue.suggested_revision && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Suggested Alternative:</h4>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-sm">{selectedIssue.suggested_revision}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedIssue.suggested_revision!)
                        toast.success('Copied to clipboard')
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <a href={`/letters/create/lease-negotiation?issue=${selectedIssue.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Generate Negotiation Letter
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/ai-advisor">
                    <Scale className="h-4 w-4 mr-2" />
                    Ask AI Legal Advisor
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/knowledge/search?q=${encodeURIComponent(selectedIssue.title)}`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learn More
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <FileWarning className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select an issue to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Steps */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {issueCounts.illegal > 0 && (
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Address Illegal Clauses</p>
                  <p className="text-sm text-muted-foreground">
                    These clauses violate California law and are unenforceable. Generate a letter requesting their removal.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">{issueCounts.illegal > 0 ? '2' : '1'}</span>
              </div>
              <div>
                <p className="font-medium">Review with Landlord</p>
                <p className="text-sm text-muted-foreground">
                  Schedule a meeting to discuss concerning terms and negotiate better conditions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">{issueCounts.illegal > 0 ? '3' : '2'}</span>
              </div>
              <div>
                <p className="font-medium">Document Everything</p>
                <p className="text-sm text-muted-foreground">
                  Save this analysis and any correspondence about lease modifications for your records.
                </p>
              </div>
            </div>

            {analysis.issues.length > 5 && (
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">{issueCounts.illegal > 0 ? '4' : '3'}</span>
                </div>
                <div>
                  <p className="font-medium">Consider Legal Consultation</p>
                  <p className="text-sm text-muted-foreground">
                    With multiple issues identified, consulting with a tenant rights attorney may be beneficial.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}