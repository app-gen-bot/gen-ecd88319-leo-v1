'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/auth-context'
import { ChevronLeft, Mail, Copy, Users, QrCode, Share2, Smartphone, MessageSquare, Check, Info } from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeDisplay } from '@/components/qr-code-display'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Mock family data
const mockFamily = {
  id: '1',
  name: 'The Johnson Family',
  code: 'JHN123',
  member_count: 4,
  max_members: 10,
  invite_link: 'https://loveytasks.com/join/JHN123',
}

// Mock pending invites
const mockPendingInvites = [
  { id: '1', email: 'aunt.mary@example.com', sent_at: '2024-12-10', status: 'pending' },
  { id: '2', email: 'cousin.joe@example.com', sent_at: '2024-12-08', status: 'pending' },
]

export default function FamilyInvitePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('email')
  const [email, setEmail] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  if (!user) return null

  const remainingSlots = mockFamily.max_members - mockFamily.member_count

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setIsLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success(`Invitation sent to ${email}!`)
      setEmail('')
      setPersonalMessage('')
    } catch (error) {
      toast.error('Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mockFamily.code)
    setCopiedCode(true)
    toast.success('Family code copied!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mockFamily.invite_link)
    setCopiedLink(true)
    toast.success('Invite link copied!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleShare = async (method: 'sms' | 'whatsapp' | 'general') => {
    const message = `Join our family on LoveyTasks! Use code ${mockFamily.code} or click: ${mockFamily.invite_link}`
    
    try {
      if (method === 'sms') {
        window.open(`sms:?body=${encodeURIComponent(message)}`)
      } else if (method === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`)
      } else if (navigator.share) {
        await navigator.share({
          title: 'Join our LoveyTasks family!',
          text: message,
          url: mockFamily.invite_link,
        })
      } else {
        // Fallback to copying link
        handleCopyLink()
      }
    } catch (error) {
      toast.error('Failed to share')
    }
  }

  const handleResendInvite = async (inviteId: string, email: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Invitation resent to ${email}`)
    } catch (error) {
      toast.error('Failed to resend invitation')
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Invitation cancelled')
    } catch (error) {
      toast.error('Failed to cancel invitation')
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
          <h1 className="text-2xl font-bold">Invite Family Members</h1>
          <p className="text-muted-foreground">Grow your family with love</p>
        </div>
        <Badge variant="secondary">
          {remainingSlots} slots available
        </Badge>
      </div>

      {/* Capacity Alert */}
      {remainingSlots <= 2 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your family is almost at capacity! You have {remainingSlots} invitation{remainingSlots !== 1 ? 's' : ''} remaining.
          </AlertDescription>
        </Alert>
      )}

      {/* Invitation Methods */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="code">Share Code</TabsTrigger>
          <TabsTrigger value="link">Share Link</TabsTrigger>
        </TabsList>

        {/* Email Invite */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Send Email Invitation</CardTitle>
              <CardDescription>
                Invite family members directly via email with a personal message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="family.member@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal touch to your invitation..."
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    This message will be included in the invitation email
                  </p>
                </div>

                <Button type="submit" disabled={isLoading || remainingSlots === 0}>
                  {isLoading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Code */}
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>Share Family Code</CardTitle>
              <CardDescription>
                Share this code with family members to join instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-8 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Your family code</p>
                  <p className="text-4xl font-mono font-bold tracking-wider">{mockFamily.code}</p>
                </div>

                <Button
                  variant={copiedCode ? 'secondary' : 'default'}
                  onClick={handleCopyCode}
                  className="w-full sm:w-auto"
                >
                  {copiedCode ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Share via:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => handleShare('sms')}>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Text Message
                  </Button>
                  <Button variant="outline" onClick={() => handleShare('whatsapp')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowQRCode(true)}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Show QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Link */}
        <TabsContent value="link">
          <Card>
            <CardHeader>
              <CardTitle>Share Invite Link</CardTitle>
              <CardDescription>
                Send this link to family members for easy joining
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Invitation Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={mockFamily.invite_link}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant={copiedLink ? 'secondary' : 'outline'}
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleShare('general')}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </Button>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This link will remain active as long as your family has available slots.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pending Invitations */}
      {mockPendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              These invitations haven&apos;t been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(invite.sent_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResendInvite(invite.id, invite.email)}
                    >
                      Resend
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share with QR Code</DialogTitle>
          </DialogHeader>
          <QRCodeDisplay
            value={mockFamily.invite_link}
            title="Family Invite QR Code"
            size={250}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}