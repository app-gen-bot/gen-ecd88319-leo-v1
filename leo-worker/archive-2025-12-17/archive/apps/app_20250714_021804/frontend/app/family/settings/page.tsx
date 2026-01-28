'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { Copy, ChevronLeft, Settings, AlertTriangle, Users, UserX, Crown, Shield, Trash2, QrCode } from 'lucide-react'
import { toast } from 'sonner'

// Mock family data
const mockFamily = {
  id: '1',
  name: 'The Johnson Family',
  code: 'JHN123',
  created_at: '2024-01-15',
  member_count: 4,
  admin_count: 2,
  plan: 'free',
  max_members: 10,
}

// Mock members for transfer ownership
const mockMembers = [
  { id: '2', name: 'Dad', email: 'dad@example.com', role: 'parent' },
  { id: '3', name: 'Emma', email: 'emma@example.com', role: 'child' },
  { id: '4', name: 'Grandma', email: 'grandma@example.com', role: 'other' },
]

export default function FamilySettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [familyName, setFamilyName] = useState(mockFamily.name)
  const [isEditingName, setIsEditingName] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [selectedNewAdmin, setSelectedNewAdmin] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  if (!user) return null

  // Check if user is admin (in real app, this would come from user permissions)
  const isAdmin = true

  if (!isAdmin) {
    return (
      <div className="container max-w-3xl py-8 space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only family administrators can access settings. Please contact your family admin.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/family/members">Back to Family</Link>
        </Button>
      </div>
    )
  }

  const handleSaveName = async () => {
    setIsLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Family name updated!')
      setIsEditingName(false)
    } catch (error) {
      toast.error('Failed to update family name')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mockFamily.code)
    toast.success('Family code copied!')
  }

  const handleGenerateQR = () => {
    // In real app, would generate and display QR code
    toast.info('QR code generation coming soon!')
  }

  const handleTransferOwnership = async () => {
    if (!selectedNewAdmin) {
      toast.error('Please select a new administrator')
      return
    }

    setIsLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Ownership transferred successfully')
      setShowTransferDialog(false)
      // In real app, would redirect or update permissions
    } catch (error) {
      toast.error('Failed to transfer ownership')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFamily = async () => {
    if (deleteConfirmation !== mockFamily.name) {
      toast.error('Please type the family name correctly')
      return
    }

    setIsLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Family deleted. Redirecting...')
      // In real app, would redirect to signup or create new family
      setTimeout(() => router.push('/'), 2000)
    } catch (error) {
      toast.error('Failed to delete family')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/family/members">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Family Settings</h1>
          <p className="text-muted-foreground">Manage your family account</p>
        </div>
        <Shield className="h-6 w-6 text-muted-foreground" />
      </div>

      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle>Family Information</CardTitle>
          <CardDescription>Basic information about your family</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Family Name */}
          <div className="space-y-2">
            <Label>Family Name</Label>
            {isEditingName ? (
              <div className="flex gap-2">
                <Input
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Enter family name"
                  maxLength={50}
                />
                <Button onClick={handleSaveName} disabled={isLoading}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFamilyName(mockFamily.name)
                    setIsEditingName(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-lg">{familyName}</p>
                <Button variant="outline" size="sm" onClick={() => setIsEditingName(true)}>
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Family Code */}
          <div className="space-y-2">
            <Label>Family Code</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-lg">
                {mockFamily.code}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopyCode}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleGenerateQR}>
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this code with family members to invite them
            </p>
          </div>

          {/* Family Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Members</Label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{mockFamily.member_count} / {mockFamily.max_members}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Created</Label>
              <p>{new Date(mockFamily.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Management */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator Management</CardTitle>
          <CardDescription>Manage who has admin access to family settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              Administrators can manage family settings, invite/remove members, and delete the family.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Administrators</p>
              <p className="text-sm text-muted-foreground">{mockFamily.admin_count} admin(s)</p>
            </div>
            <Badge variant="secondary">
              <Crown className="h-3 w-3 mr-1" />
              You are an admin
            </Badge>
          </div>

          <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <UserX className="mr-2 h-4 w-4" />
                Transfer Ownership
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Ownership</DialogTitle>
                <DialogDescription>
                  Select a family member to become the new primary administrator. You will lose admin access.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select value={selectedNewAdmin} onValueChange={setSelectedNewAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new administrator" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTransferOwnership} disabled={isLoading || !selectedNewAdmin}>
                  Transfer Ownership
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions that affect your entire family</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Family
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Family</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All family data, tasks, and messages will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    All {mockFamily.member_count} family members will lose access to:
                    <ul className="list-disc list-inside mt-2">
                      <li>All tasks and task history</li>
                      <li>All lovely messages</li>
                      <li>Love scores and achievements</li>
                      <li>Family member data</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm">
                    Type <strong>{mockFamily.name}</strong> to confirm
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type family name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteFamily}
                  disabled={isLoading || deleteConfirmation !== mockFamily.name}
                >
                  Delete Family
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}