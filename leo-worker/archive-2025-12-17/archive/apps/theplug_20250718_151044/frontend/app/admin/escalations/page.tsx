'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Shield, User, Clock } from 'lucide-react'
import Link from 'next/link'

const mockEscalations = [
  {
    id: 'esc_1',
    songTitle: 'Electric Dreams',
    artist: 'Demo Artist',
    platform: 'ASCAP',
    issue: 'Publisher information does not match platform records',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-18T14:00:00Z',
    assignedTo: 'Support Agent 1',
  },
  {
    id: 'esc_2',
    songTitle: 'Future Bass',
    artist: 'Demo Artist',
    platform: 'MLC',
    issue: 'Duplicate registration detected',
    status: 'in_review',
    priority: 'medium',
    createdAt: '2024-01-18T12:30:00Z',
    assignedTo: 'Support Agent 2',
  },
]

export default function AdminEscalationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Admin Notice */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Admin Panel - Human-in-the-Loop Escalations</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Escalations</h1>
            <p className="text-muted-foreground">
              Handle registrations requiring manual intervention
            </p>
          </div>
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {mockEscalations.filter(e => e.status === 'open').length} Open
          </Badge>
        </div>

        {/* Escalation Cards */}
        <div className="space-y-6">
          {mockEscalations.map((escalation) => (
            <Card key={escalation.id} className={escalation.priority === 'high' ? 'border-red-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      {escalation.songTitle} - {escalation.platform}
                    </CardTitle>
                    <CardDescription>
                      By {escalation.artist} • Created {new Date(escalation.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={escalation.priority === 'high' ? 'destructive' : 'secondary'}>
                      {escalation.priority}
                    </Badge>
                    <Badge variant={escalation.status === 'open' ? 'warning' : 'default'}>
                      {escalation.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Issue Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {escalation.issue}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{escalation.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>2h in queue</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Resolution Notes</h4>
                  <Textarea 
                    placeholder="Add resolution notes..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">Request Info</Button>
                  <Button variant="destructive">Reject</Button>
                  <Button>Approve & Continue</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Navigation */}
        <div className="mt-8 flex gap-4">
          <Link href="/admin/users">
            <Button variant="outline">User Management</Button>
          </Link>
          <Link href="/admin/registrations">
            <Button variant="outline">Registration Queue</Button>
          </Link>
          <Link href="/admin/platforms">
            <Button variant="outline">Platform Status</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}