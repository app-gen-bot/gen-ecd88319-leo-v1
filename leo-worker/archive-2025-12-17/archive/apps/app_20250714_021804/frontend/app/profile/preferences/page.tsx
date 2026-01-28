'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/auth-context'
import { ChevronLeft, Save, Sparkles, Heart, Smile, Zap, Music, Feather } from 'lucide-react'
import { toast } from 'sonner'

const messageStyles = [
  {
    id: 'encouraging',
    name: 'Encouraging',
    description: 'Uplifting and supportive messages',
    icon: Heart,
    example: 'You&apos;re doing amazing! Keep up the great work!',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'humorous',
    name: 'Humorous',
    description: 'Light-hearted and funny messages',
    icon: Smile,
    example: 'Time to show that trash who&apos;s boss! 🗑️💪',
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'loving',
    name: 'Loving',
    description: 'Warm and affectionate messages',
    icon: Heart,
    example: 'Thank you for being such a wonderful part of our family 💕',
    color: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'motivational',
    name: 'Motivational',
    description: 'Inspiring and energizing messages',
    icon: Zap,
    example: 'You&apos;ve got this! Nothing can stop you!',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'gen-z',
    name: 'Gen-Z Slang',
    description: 'Modern slang and trendy expressions',
    icon: Sparkles,
    example: 'No cap, you&apos;re the GOAT for doing this! 🔥',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'poetic',
    name: 'Poetic',
    description: 'Beautiful and lyrical messages',
    icon: Feather,
    example: 'Like sunshine after rain, your help brightens our day',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
]

export default function PreferencesPage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [autoTransform, setAutoTransform] = useState(true)
  const [showOriginal, setShowOriginal] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/signin')
      return
    }

    setSelectedStyles(user.message_styles || [])
  }, [user, router])

  if (!user) return null

  const handleStyleToggle = (styleId: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId)
      }
      
      // Maximum 3 styles
      if (prev.length >= 3) {
        toast.error('You can select up to 3 message styles')
        return prev
      }
      
      return [...prev, styleId]
    })
  }

  const handleSave = async () => {
    if (selectedStyles.length === 0) {
      toast.error('Please select at least one message style')
      return
    }

    setIsLoading(true)

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user preferences
      updateUser({
        ...user,
        message_styles: selectedStyles,
      })

      toast.success('Preferences saved successfully!')
      router.push('/profile')
    } catch (error) {
      toast.error('Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Message Preferences</h1>
          <p className="text-muted-foreground">Customize how your messages are transformed</p>
        </div>
      </div>

      {/* Message Styles */}
      <Card>
        <CardHeader>
          <CardTitle>Message Styles</CardTitle>
          <CardDescription>
            Select up to 3 styles that match your personality. AI will randomly choose from these when transforming your messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {messageStyles.map((style) => {
              const Icon = style.icon
              const isSelected = selectedStyles.includes(style.id)
              
              return (
                <div
                  key={style.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handleStyleToggle(style.id)}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleStyleToggle(style.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${style.color}`} />
                        <h4 className="font-medium">{style.name}</h4>
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs">Selected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{style.description}</p>
                      <div className="p-3 rounded-md bg-muted/50 border border-muted">
                        <p className="text-sm italic">&ldquo;{style.example}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {selectedStyles.length}/3 styles selected
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Transformation Settings</CardTitle>
          <CardDescription>Control how message transformation works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-transform">Auto-transform messages</Label>
              <p className="text-sm text-muted-foreground">
                Automatically transform your messages when creating tasks
              </p>
            </div>
            <Switch
              id="auto-transform"
              checked={autoTransform}
              onCheckedChange={setAutoTransform}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-original">Show original messages</Label>
              <p className="text-sm text-muted-foreground">
                Display both original and transformed messages
              </p>
            </div>
            <Switch
              id="show-original"
              checked={showOriginal}
              onCheckedChange={setShowOriginal}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            'Saving...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/profile">Cancel</Link>
        </Button>
      </div>
    </div>
  )
}