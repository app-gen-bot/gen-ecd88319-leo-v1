'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, UserPlus, MoreVertical, Shield } from 'lucide-react'
import Link from 'next/link'

const mockUsers = [
  { 
    id: '1', 
    email: 'demo@example.com', 
    name: 'Demo Artist',
    role: 'user',
    status: 'active',
    songsCount: 24,
    registrationsCount: 48,
    joinedAt: '2024-01-01',
  },
  { 
    id: '2', 
    email: 'admin@theplug.com', 
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    songsCount: 0,
    registrationsCount: 0,
    joinedAt: '2023-12-01',
  },
]

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Admin Notice */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Admin Panel - Restricted Access</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users, permissions, and access control
            </p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by email or name..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {mockUsers.length} total users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Songs</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.songsCount}</TableCell>
                    <TableCell>{user.registrationsCount}</TableCell>
                    <TableCell>{user.joinedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
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
          <Link href="/admin/registrations">
            <Button variant="outline">Registration Queue</Button>
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