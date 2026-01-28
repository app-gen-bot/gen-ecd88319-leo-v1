'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Plus, Copy, QrCode, UserPlus, Crown, CheckSquare, Heart } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'

// Mock family members
const mockMembers = [
  {
    id: '1',
    name: 'Mom',
    email: 'mom@example.com',
    avatar: '',
    role: 'parent',
    is_admin: true,
    personality_type: 'formal',
    message_styles: ['encouraging', 'loving'],
    active_tasks: 2,
    completed_today: 1,
    love_score_contribution: 250,
    joined_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Dad',
    email: 'dad@example.com',
    avatar: '',
    role: 'parent',
    is_admin: true,
    personality_type: 'funny',
    message_styles: ['humorous', 'motivational'],
    active_tasks: 2,
    completed_today: 0,
    love_score_contribution: 180,
    joined_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Sarah',
    email: 'sarah@example.com',
    avatar: '',
    role: 'child',
    is_admin: false,
    personality_type: 'playful',
    message_styles: ['gen-z', 'humorous'],
    active_tasks: 3,
    completed_today: 2,
    love_score_contribution: 320,
    joined_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Emma',
    email: 'emma@example.com',
    avatar: '',
    role: 'child',
    is_admin: false,
    personality_type: 'romantic',
    message_styles: ['poetic', 'loving'],
    active_tasks: 1,
    completed_today: 3,
    love_score_contribution: 280,
    joined_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const ROLE_LABELS = {
  parent: 'Parent/Guardian',
  partner: 'Partner',
  child: 'Child',
  other: 'Other',
}

const PERSONALITY_LABELS = {
  formal: 'Formal & Respectful',
  playful: 'Playful & Fun',
  romantic: 'Romantic & Sweet',
  funny: 'Funny & Silly',
}

export default function FamilyMembersPage() {
  const router = useRouter()
  const { user, family } = useAuth()
  const [members] = useState(mockMembers)
  const [showQrCode, setShowQrCode] = useState(false)
  const familyCode = family?.code || 'ABC123'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyCode)
    toast.success('Family code copied to clipboard!')
  }

  const isUserAdmin = members.find(m => m.id === user?.id)?.is_admin || false

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{family?.name || 'My Family'}</h1>
          <p className="text-muted-foreground">{members.length} members spreading love together</p>
        </div>
        
        <Button onClick={() => router.push('/family/invite')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Family Code Card */}
      <Card>
        <CardHeader>
          <CardTitle>Family Code</CardTitle>
          <CardDescription>
            Share this code with family members to invite them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <code className="text-2xl font-mono bg-muted px-4 py-2 rounded">
                {familyCode}
              </code>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowQrCode(!showQrCode)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {showQrCode && (
              <div className="p-4 bg-white rounded-lg">
                <div className="w-32 h-32 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  QR Code
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card
            key={member.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/family/members/${member.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{member.name}</h3>
                      {member.is_admin && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ROLE_LABELS[member.role as keyof typeof ROLE_LABELS]}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Personality</span>
                  <span className="font-medium">
                    {PERSONALITY_LABELS[member.personality_type as keyof typeof PERSONALITY_LABELS]}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Tasks</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckSquare className="h-3 w-3" />
                    {member.active_tasks}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Love Score</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Heart className="h-3 w-3" fill="currentColor" />
                    {member.love_score_contribution}
                  </Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Completed {member.completed_today} {member.completed_today === 1 ? 'task' : 'tasks'} today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add Member Card */}
        <Card
          className="border-dashed hover:shadow-lg transition-shadow cursor-pointer bg-muted/20"
          onClick={() => router.push('/family/invite')}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Invite Family Member</h3>
            <p className="text-sm text-muted-foreground text-center">
              Add more family members to spread love together
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      {isUserAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Family Admin</CardTitle>
            <CardDescription>
              Manage your family settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" asChild>
                <Link href="/family/settings">
                  Family Settings
                </Link>
              </Button>
              <Button variant="outline">
                Transfer Ownership
              </Button>
              <Button variant="outline">
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}