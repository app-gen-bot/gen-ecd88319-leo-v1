"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import { type Dispute, type Evidence, type TimelineEvent } from "@/lib/types"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Upload, 
  Download, 
  Mail, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  Plus
} from "lucide-react"

export default function DisputeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDispute()
  }, [params.id])

  const loadDispute = async () => {
    try {
      const data = await apiClient.getDispute(params.id as string)
      setDispute(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dispute details",
        variant: "destructive",
      })
      router.push('/disputes')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />
      case 'closed':
        return <XCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return "success"
      case 'closed':
        return "secondary"
      case 'in_progress':
        return "warning"
      case 'open':
        return "default"
      default:
        return "outline"
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await apiClient.updateDispute(params.id as string, { status: newStatus })
      setDispute(prev => prev ? { ...prev, status: newStatus as Dispute['status'] } : null)
      toast({
        title: "Status updated",
        description: `Dispute marked as ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleGenerateLetter = () => {
    router.push(`/letters/create/dispute-${dispute?.type}?dispute_id=${dispute?.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!dispute) {
    return null
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/disputes')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Disputes
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{dispute.title}</h1>
            <div className="flex items-center gap-4">
              <Badge variant={getStatusColor(dispute.status) as any} className="gap-1">
                {getStatusIcon(dispute.status)}
                {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1).replace('_', ' ')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Started {format(new Date(dispute.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateLetter}>
              <Mail className="mr-2 h-4 w-4" />
              Generate Letter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {dispute.ai_assessment && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>AI Assessment:</strong> {dispute.ai_assessment.summary}
            <br />
            <strong>Strength:</strong> {dispute.ai_assessment.strength}/10
            {dispute.ai_assessment.recommendations && (
              <>
                <br />
                <strong>Recommendations:</strong>
                <ul className="list-disc list-inside mt-2">
                  {dispute.ai_assessment.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evidence">Evidence ({dispute.evidence?.length || 0})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="resolution">Resolution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-1">Type</p>
                  <p className="text-muted-foreground">{dispute.type.replace('_', ' ').charAt(0).toUpperCase() + dispute.type.slice(1).replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Property</p>
                  <p className="text-muted-foreground">{dispute.property?.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Other Party</p>
                  <p className="text-muted-foreground">{dispute.other_party_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Date of Issue</p>
                  <p className="text-muted-foreground">{format(new Date(dispute.date_of_issue), 'PPP')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{dispute.description}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Desired Outcome</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{dispute.desired_outcome}</p>
              </div>
              
              {dispute.attempted_resolution && (
                <div>
                  <p className="text-sm font-medium mb-1">Resolution Attempts</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{dispute.resolution_details}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
              <CardDescription>All supporting documents and media for this dispute</CardDescription>
            </CardHeader>
            <CardContent>
              {dispute.evidence && dispute.evidence.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dispute.evidence.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-medium text-sm mb-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(item.uploaded_at), 'MMM d, yyyy')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No evidence uploaded yet</p>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Evidence
                  </Button>
                </div>
              )}
              
              <div className="mt-6">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add More Evidence
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline of Events</CardTitle>
              <CardDescription>Chronological order of dispute events</CardDescription>
            </CardHeader>
            <CardContent>
              {dispute.timeline && dispute.timeline.length > 0 ? (
                <div className="space-y-4">
                  {dispute.timeline.sort((a, b) => 
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                  ).map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        {index < dispute.timeline.length - 1 && (
                          <div className="absolute top-8 left-4 w-px h-full bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="text-sm font-medium mb-1">
                          {format(new Date(event.date), 'PPP')}
                        </p>
                        <p className="text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No timeline events recorded</p>
                </div>
              )}
              
              <div className="mt-6">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resolution Status</CardTitle>
              <CardDescription>Track the progress and outcome of your dispute</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Current Status</p>
                <div className="flex gap-2">
                  <Button
                    variant={dispute.status === 'open' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate('open')}
                  >
                    Open
                  </Button>
                  <Button
                    variant={dispute.status === 'in_progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate('in_progress')}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={dispute.status === 'resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate('resolved')}
                  >
                    Resolved
                  </Button>
                  <Button
                    variant={dispute.status === 'closed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate('closed')}
                  >
                    Closed
                  </Button>
                </div>
              </div>
              
              {dispute.status === 'resolved' && (
                <div>
                  <p className="text-sm font-medium mb-2">Resolution Details</p>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        Document the final resolution of this dispute for your records.
                      </p>
                      <Button>Add Resolution Details</Button>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium mb-2">Available Actions</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleGenerateLetter}>
                    <Mail className="mr-2 h-4 w-4" />
                    Generate Demand Letter
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Prepare Small Claims Filing
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Request Mediation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}