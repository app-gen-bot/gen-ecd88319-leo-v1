"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { MESSAGE_STYLES, PERSONALITY_TRAITS } from "@/lib/constants"
import { X } from "lucide-react"

export default function MessagePreferencesPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [blockedWord, setBlockedWord] = useState("")
  const [preferences, setPreferences] = useState<{
    styles: string[]
    personality_traits: string[]
    emoji_level: number
    formality: number
    blocked_words: string[]
  }>({
    styles: user?.message_preferences?.styles || ["encouraging", "funny"],
    personality_traits: user?.message_preferences?.personality_traits || ["Playful", "Sweet"],
    emoji_level: user?.message_preferences?.emoji_level || 3,
    formality: user?.message_preferences?.formality || 2,
    blocked_words: user?.message_preferences?.blocked_words || []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      // In real app, this would call the API
      // await apiClient.updateMessagePreferences(preferences)
      
      toast({
        title: "Preferences updated",
        description: "Your message preferences have been saved."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStyle = (style: string) => {
    setPreferences(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }))
  }

  const toggleTrait = (trait: string) => {
    setPreferences(prev => ({
      ...prev,
      personality_traits: prev.personality_traits.includes(trait)
        ? prev.personality_traits.filter(t => t !== trait)
        : [...prev.personality_traits, trait]
    }))
  }

  const addBlockedWord = () => {
    if (blockedWord.trim() && !preferences.blocked_words.includes(blockedWord.trim())) {
      setPreferences(prev => ({
        ...prev,
        blocked_words: [...prev.blocked_words, blockedWord.trim()]
      }))
      setBlockedWord("")
    }
  }

  const removeBlockedWord = (word: string) => {
    setPreferences(prev => ({
      ...prev,
      blocked_words: prev.blocked_words.filter(w => w !== word)
    }))
  }

  const emojiLabels = ["None", "Minimal", "Some", "Lots", "Maximum"]
  const formalityLabels = ["Very Casual", "Casual", "Balanced", "Formal", "Very Formal"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Message Preferences</h1>
        <p className="text-muted-foreground">
          Customize how LoveyTasks transforms your messages
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Message Styles</CardTitle>
            <CardDescription>
              Select your preferred transformation styles (choose multiple)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {MESSAGE_STYLES.map((style) => (
                <div
                  key={style.value}
                  className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    preferences.styles.includes(style.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => toggleStyle(style.value)}
                >
                  <Checkbox
                    checked={preferences.styles.includes(style.value)}
                    onCheckedChange={() => toggleStyle(style.value)}
                  />
                  <div className="flex-1">
                    <Label className="font-medium cursor-pointer">{style.label}</Label>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personality Traits</CardTitle>
            <CardDescription>
              Choose traits that match your communication style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TRAITS.map((trait) => (
                <Badge
                  key={trait}
                  variant={preferences.personality_traits.includes(trait) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTrait(trait)}
                >
                  {trait}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customization</CardTitle>
            <CardDescription>
              Fine-tune your message transformations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Emoji Level</Label>
                <span className="text-sm text-muted-foreground">
                  {emojiLabels[preferences.emoji_level]}
                </span>
              </div>
              <Slider
                value={[preferences.emoji_level]}
                onValueChange={([value]) => 
                  setPreferences(prev => ({ ...prev, emoji_level: value }))
                }
                min={0}
                max={4}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>😑</span>
                <span>😊😊😊😊😊</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Formality</Label>
                <span className="text-sm text-muted-foreground">
                  {formalityLabels[preferences.formality]}
                </span>
              </div>
              <Slider
                value={[preferences.formality]}
                onValueChange={([value]) => 
                  setPreferences(prev => ({ ...prev, formality: value }))
                }
                min={0}
                max={4}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Casual</span>
                <span>Formal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blocked Words</CardTitle>
            <CardDescription>
              Words to avoid in transformed messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a word to block..."
                  value={blockedWord}
                  onChange={(e) => setBlockedWord(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addBlockedWord()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBlockedWord}
                >
                  Add
                </Button>
              </div>
              {preferences.blocked_words.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {preferences.blocked_words.map((word) => (
                    <Badge
                      key={word}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeBlockedWord(word)}
                    >
                      {word}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your preferences affect message transformations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-1">Original:</p>
                <p className="text-sm">"Clean your room"</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm font-medium mb-1">Transformed:</p>
                <p className="text-sm">
                  {preferences.styles.includes("romantic") && "My darling, would you mind tidying up your lovely space? 💝"}
                  {preferences.styles.includes("funny") && !preferences.styles.includes("romantic") && "Time to play 'Where's the floor?' in your room! 🕵️‍♂️"}
                  {preferences.styles.includes("encouraging") && !preferences.styles.includes("romantic") && !preferences.styles.includes("funny") && "You've got this! Let's make your room shine ✨"}
                  {!preferences.styles.includes("romantic") && !preferences.styles.includes("funny") && !preferences.styles.includes("encouraging") && "Please clean your room when you have a chance 😊"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPreferences({
                styles: user?.message_preferences?.styles || ["encouraging", "funny"],
                personality_traits: user?.message_preferences?.personality_traits || ["Playful", "Sweet"],
                emoji_level: user?.message_preferences?.emoji_level || 3,
                formality: user?.message_preferences?.formality || 2,
                blocked_words: user?.message_preferences?.blocked_words || []
              })
            }}
          >
            Reset to Defaults
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>
    </div>
  )
}