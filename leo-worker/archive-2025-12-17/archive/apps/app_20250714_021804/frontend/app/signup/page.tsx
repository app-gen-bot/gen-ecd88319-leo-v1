'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Loader2, ArrowLeft, ArrowRight, Upload, Check } from 'lucide-react'
import { generateFamilyCode, getInitials } from '@/lib/utils'
import { toast } from 'sonner'

const PERSONALITY_TYPES = [
  { value: 'formal', label: 'Formal & Respectful', description: 'Professional and courteous messages' },
  { value: 'playful', label: 'Playful & Fun', description: 'Light-hearted and cheerful messages' },
  { value: 'romantic', label: 'Romantic & Sweet', description: 'Loving and affectionate messages' },
  { value: 'funny', label: 'Funny & Silly', description: 'Humorous and entertaining messages' },
]

const MESSAGE_STYLES = [
  { value: 'encouraging', label: 'Encouraging', emoji: '💪' },
  { value: 'humorous', label: 'Humorous', emoji: '😄' },
  { value: 'loving', label: 'Loving', emoji: '❤️' },
  { value: 'motivational', label: 'Motivational', emoji: '🌟' },
  { value: 'gen-z', label: 'Gen-Z Slang', emoji: '🔥' },
  { value: 'poetic', label: 'Poetic', emoji: '🌹' },
]

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()

  // Step 1: Email & Password
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2: Family
  const [familyChoice, setFamilyChoice] = useState<'create' | 'join'>('create')
  const [familyName, setFamilyName] = useState('')
  const [familyCode, setFamilyCode] = useState('')
  const [generatedCode] = useState(generateFamilyCode())

  // Step 3: Profile
  const [name, setName] = useState('')
  const [role, setRole] = useState('parent')
  const [personalityType, setPersonalityType] = useState('playful')
  const [messageStyles, setMessageStyles] = useState<string[]>(['encouraging'])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleMessageStyle = (style: string) => {
    setMessageStyles(prev => {
      if (prev.includes(style)) {
        return prev.filter(s => s !== style)
      }
      if (prev.length >= 3) {
        toast.error('You can select up to 3 message styles')
        return prev
      }
      return [...prev, style]
    })
  }

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return false
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (familyChoice === 'create' && !familyName) {
      setError('Please enter a family name')
      return false
    }
    if (familyChoice === 'join' && (!familyCode || familyCode.length !== 6)) {
      setError('Please enter a valid 6-character family code')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!name) {
      setError('Please enter your name')
      return false
    }
    if (messageStyles.length === 0) {
      setError('Please select at least one message style')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError('')
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return
    
    setError('')
    setIsLoading(true)

    try {
      await signUp({
        email,
        password,
        name,
        role,
        personality_type: personalityType,
        message_styles: messageStyles,
        family_name: familyChoice === 'create' ? familyName : undefined,
        family_code: familyChoice === 'join' ? familyCode : undefined,
      })
      // Success - auth context handles navigation
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            <span className="text-2xl font-bold">LoveyTasks</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Join LoveyTasks and start spreading love in your family
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Progress value={progress} className="h-2" />
            
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {/* Step 1: Email & Password */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with 1 number and 1 special character
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Family */}
            {step === 2 && (
              <div className="space-y-4">
                <RadioGroup value={familyChoice} onValueChange={(value: any) => setFamilyChoice(value)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent"
                       onClick={() => setFamilyChoice('create')}>
                    <RadioGroupItem value="create" id="create" />
                    <Label htmlFor="create" className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium">Create New Family</p>
                        <p className="text-sm text-muted-foreground">Start fresh with your own family group</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent"
                       onClick={() => setFamilyChoice('join')}>
                    <RadioGroupItem value="join" id="join" />
                    <Label htmlFor="join" className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium">Join Existing Family</p>
                        <p className="text-sm text-muted-foreground">Enter a family code to join</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                
                {familyChoice === 'create' && (
                  <div className="space-y-2">
                    <Label htmlFor="familyName">Family name</Label>
                    <Input
                      id="familyName"
                      placeholder="The Smith Family"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your family code will be: <code className="font-mono bg-muted px-1 py-0.5 rounded">{generatedCode}</code>
                    </p>
                  </div>
                )}
                
                {familyChoice === 'join' && (
                  <div className="space-y-2">
                    <Label htmlFor="familyCode">Family code</Label>
                    <Input
                      id="familyCode"
                      placeholder="ABC123"
                      value={familyCode}
                      onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="font-mono uppercase"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-character code from your family member
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Profile */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback>{getInitials(name || 'U')}</AvatarFallback>
                  </Avatar>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-sm text-primary hover:underline">
                      <Upload className="h-4 w-4" />
                      <span>Upload avatar (optional)</span>
                    </div>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Display name</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Your role</Label>
                  <RadioGroup value={role} onValueChange={setRole}>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'parent', label: 'Parent/Guardian' },
                        { value: 'partner', label: 'Partner' },
                        { value: 'child', label: 'Child' },
                        { value: 'other', label: 'Other' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-sm">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Personality type</Label>
                  <div className="space-y-2">
                    {PERSONALITY_TYPES.map((type) => (
                      <div
                        key={type.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          personalityType === type.value ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                        }`}
                        onClick={() => setPersonalityType(type.value)}
                      >
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Message styles (select up to 3)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {MESSAGE_STYLES.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          messageStyles.includes(style.value)
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => toggleMessageStyle(style.value)}
                      >
                        <span className="text-lg mr-2">{style.emoji}</span>
                        <span className="text-sm">{style.label}</span>
                        {messageStyles.includes(style.value) && (
                          <Check className="h-4 w-4 text-primary float-right" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="ml-auto"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="ml-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}