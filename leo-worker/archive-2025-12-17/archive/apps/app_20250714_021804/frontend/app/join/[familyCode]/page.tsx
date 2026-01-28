'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/auth-context'
import { getInitials } from '@/lib/utils'
import { Heart, Users, Trophy, Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

// Mock family data based on code
const mockFamilies: Record<string, any> = {
  'JHN123': {
    id: '1',
    name: 'The Johnson Family',
    member_count: 4,
    max_members: 10,
    created_at: '2024-01-15',
    description: 'A loving family that believes in turning chores into expressions of care',
    members: [
      { id: '1', name: 'Mom', role: 'parent', avatar: '' },
      { id: '2', name: 'Dad', role: 'parent', avatar: '' },
      { id: '3', name: 'Sarah', role: 'child', avatar: '' },
      { id: '4', name: 'Emma', role: 'child', avatar: '' },
    ],
    stats: {
      tasks_completed: 156,
      love_score: 1250,
      active_tasks: 8,
    }
  },
  'SMT456': {
    id: '2',
    name: 'The Smith Family',
    member_count: 3,
    max_members: 10,
    created_at: '2024-02-20',
    description: 'Working together to make our home a happier place',
    members: [
      { id: '5', name: 'Jane', role: 'parent', avatar: '' },
      { id: '6', name: 'John', role: 'parent', avatar: '' },
      { id: '7', name: 'Mike', role: 'child', avatar: '' },
    ],
    stats: {
      tasks_completed: 89,
      love_score: 750,
      active_tasks: 5,
    }
  }
}

export default function JoinFamilyPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [familyData, setFamilyData] = useState<any>(null)
  const [error, setError] = useState('')

  const familyCode = params.familyCode as string

  useEffect(() => {
    // Simulate fetching family data
    const fetchFamily = async () => {
      setIsLoading(true)
      try {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const family = mockFamilies[familyCode.toUpperCase()]
        if (!family) {
          setError('Invalid family code. Please check and try again.')
        } else if (family.member_count >= family.max_members) {
          setError('This family is at maximum capacity.')
        } else {
          setFamilyData(family)
        }
      } catch (err) {
        setError('Failed to load family information')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFamily()
  }, [familyCode])

  const handleJoinFamily = async () => {
    if (!user) {
      // Redirect to signup with family code
      router.push(`/signup?familyCode=${familyCode}`)
      return
    }

    setIsJoining(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Welcome to ${familyData.name}!`)
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to join family')
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading family information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle>Unable to Join Family</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/signup">Create New Account</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full space-y-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            <span className="text-2xl font-bold">LoveyTasks</span>
          </Link>
        </div>

        {/* Family Preview Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">{familyData.name}</h1>
              <p className="text-muted-foreground">{familyData.description}</p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Badge variant="secondary">
                  <Users className="mr-1 h-3 w-3" />
                  {familyData.member_count} members
                </Badge>
                <Badge variant="secondary">
                  Family Code: {familyCode.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          
          <CardContent className="pt-6 space-y-6">
            {/* Family Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{familyData.stats.tasks_completed}</p>
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
              </div>
              <div>
                <Heart className="h-6 w-6 mx-auto mb-2 text-pink-600" />
                <p className="text-2xl font-bold">{familyData.stats.love_score}</p>
                <p className="text-xs text-muted-foreground">Love Score</p>
              </div>
              <div>
                <Sparkles className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{familyData.stats.active_tasks}</p>
                <p className="text-xs text-muted-foreground">Active Tasks</p>
              </div>
            </div>

            {/* Current Members */}
            <div>
              <h3 className="font-semibold mb-3">Current Members</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {familyData.members.map((member: any) => (
                  <div key={member.id} className="text-center">
                    <Avatar className="h-12 w-12 mx-auto mb-1">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Alert */}
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                You&apos;ve been invited to join {familyData.name}! 
                {user ? ' Click below to accept the invitation.' : ' Sign up or sign in to join.'}
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="space-y-3">
              {user ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleJoinFamily}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining Family...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Join {familyData.name}
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => router.push(`/signup?familyCode=${familyCode}`)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Sign Up & Join Family
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/signin?familyCode=${familyCode}`)}
                  >
                    Already have an account? Sign In
                  </Button>
                </>
              )}
              
              <div className="text-center pt-2">
                <Link href="/" className="text-sm text-muted-foreground hover:underline">
                  Or start your own family
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>By joining, you&apos;ll be able to:</p>
          <ul className="mt-2 space-y-1">
            <li>• Create and receive lovely task messages</li>
            <li>• Track your contributions to the family</li>
            <li>• Celebrate achievements together</li>
          </ul>
        </div>
      </div>
    </div>
  )
}