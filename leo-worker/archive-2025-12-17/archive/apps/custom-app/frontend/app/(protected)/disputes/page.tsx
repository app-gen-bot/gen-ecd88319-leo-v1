"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiClient } from "@/lib/api-client"
import { type Dispute } from "@/lib/types"
import { Plus, AlertTriangle, Clock, CheckCircle, XCircle, FileText } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadDisputes()
  }, [])

  const loadDisputes = async () => {
    try {
      const data = await apiClient.getDisputes()
      setDisputes(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      })
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'security_deposit':
        return 'Security Deposit'
      case 'repairs':
        return 'Repairs & Maintenance'
      case 'lease_violation':
        return 'Lease Violation'
      case 'rent_increase':
        return 'Rent Increase'
      case 'eviction':
        return 'Eviction Notice'
      default:
        return 'Other'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Active Disputes</h1>
          <p className="text-muted-foreground mt-1">
            Document and track disputes with evidence and timelines
          </p>
        </div>
        <Button asChild>
          <Link href="/disputes/new">
            <Plus className="mr-2 h-4 w-4" />
            Start New Dispute
          </Link>
        </Button>
      </div>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Active Disputes</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              We hope it stays that way! If issues arise, we're here to help you document and resolve them properly.
            </p>
            <Button asChild>
              <Link href="/disputes/new">
                <Plus className="mr-2 h-4 w-4" />
                Start Your First Dispute
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Disputes</CardTitle>
            <CardDescription>Click on any dispute to view details and manage evidence</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Started</TableHead>
                  <TableHead>Other Party</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow 
                    key={dispute.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/disputes/${dispute.id}`)}
                  >
                    <TableCell className="font-medium">
                      {getTypeLabel(dispute.type)}
                    </TableCell>
                    <TableCell>{dispute.property?.address || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(dispute.status) as any} className="gap-1">
                        {getStatusIcon(dispute.status)}
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(dispute.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{dispute.other_party_name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                        <Link href={`/disputes/${dispute.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}