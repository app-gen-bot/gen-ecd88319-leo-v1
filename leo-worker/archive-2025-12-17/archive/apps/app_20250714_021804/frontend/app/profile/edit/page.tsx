'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { getInitials } from '@/lib/utils'
import { Camera, Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'

const personalityTypes = [
  { value: 'formal', label: 'Formal & Respectful', icon: '🎩', description: 'Professional and courteous messages' },
  { value: 'playful', label: 'Playful & Fun', icon: '🎮', description: 'Light-hearted and cheerful messages' },
  { value: 'romantic', label: 'Romantic & Sweet', icon: '💕', description: 'Warm and affectionate messages' },
  { value: 'funny', label: 'Funny & Silly', icon: '😄', description: 'Humorous and entertaining messages' },
]

const roles = [
  { value: 'parent', label: 'Parent/Guardian' },
  { value: 'partner', label: 'Partner' },
  { value: 'child', label: 'Child' },
  { value: 'other', label: 'Other' },
]

export default function EditProfilePage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    role: 'parent' | 'partner' | 'child' | 'other' | ''
    personality_type: 'formal' | 'playful' | 'romantic' | 'funny' | 'friendly' | ''
    avatar: string
  }>({
    name: '',
    role: '',
    personality_type: '',
    avatar: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/signin')
      return
    }

    setFormData({
      name: user.name,
      role: user.role,
      personality_type: user.personality_type,
      avatar: user.avatar || '',
    })
  }, [user, router])

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user in context - filter out empty strings
      updateUser({
        ...user,
        name: formData.name,
        avatar: formData.avatar,
        ...(formData.role && { role: formData.role as 'parent' | 'partner' | 'child' | 'other' }),
        ...(formData.personality_type && { personality_type: formData.personality_type as 'formal' | 'playful' | 'romantic' | 'funny' | 'friendly' }),
      })

      toast.success('Profile updated successfully!')
      router.push('/profile')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Mock upload - in real app, would upload to server
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }))
        toast.success('Avatar uploaded!')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Failed to upload avatar')
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <X className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback className="text-2xl">{getInitials(formData.name)}</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              {formData.avatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                >
                  Remove Avatar
                </Button>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                This is how your family will see you
              </p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Family Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'parent' | 'partner' | 'child' | 'other' | '' }))}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Personality Type */}
            <div className="space-y-3">
              <Label>Personality Type</Label>
              <p className="text-sm text-muted-foreground">
                This determines how your messages are transformed
              </p>
              <RadioGroup
                value={formData.personality_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, personality_type: value as 'formal' | 'playful' | 'romantic' | 'funny' | 'friendly' | '' }))}
              >
                {personalityTypes.map(type => (
                  <div
                    key={type.value}
                    className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                    <label
                      htmlFor={type.value}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/profile">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}