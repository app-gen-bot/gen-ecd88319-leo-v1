'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Clock, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react'
import Link from 'next/link'

const mockQueueItems = [
  {
    id: 'queue_1',
    songTitle: 'Electric Dreams',
    artist: 'Demo Artist',
    platform: 'MLC',
    status: 'processing',
    priority: 'normal',
    submittedAt: '2024-01-18T10:00:00Z',
    processingTime: '2h 30m',
  },
  {
    id: 'queue_2',
    songTitle: 'Neon Nights',
    artist: 'Demo Artist',
    platform: 'ASCAP',
    status: 'pending',
    priority: 'high',
    submittedAt: '2024-01-18T11:30:00Z',
    processingTime: '1h 00m',
  },
]

export default function AdminRegistrationsPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Admin Notice */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Admin Panel - Registration Queue Management</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registration Queue</h1>
            <p className="text-muted-foreground">
              Monitor and manage registration processing
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export Queue</Button>
            <Button>Process Batch</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total in Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">35</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1h 45m</div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Queue</CardTitle>
            <CardDescription>
              Active and pending registrations across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Song</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQueueItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {getStatusIcon(item.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.songTitle}</p>
                        <p className="text-sm text-muted-foreground">{item.artist}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.platform}</TableCell>
                    <TableCell>
                      <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(item.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{item.processingTime}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Admin Navigation */}
        <div className="mt-8 flex gap-4">
          <Link href="/admin/users">
            <Button variant="outline">User Management</Button>
          </Link>
          <Link href="/admin/escalations">
            <Button variant="outline">Escalations</Button>
          </Link>
          <Link href="/admin/platforms">
            <Button variant="outline">Platform Status</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}