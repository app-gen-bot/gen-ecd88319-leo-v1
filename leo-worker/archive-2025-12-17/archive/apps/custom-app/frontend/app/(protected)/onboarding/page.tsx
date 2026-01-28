"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Heart,
  Users,
  MessageSquareHeart,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  X
} from "lucide-react"
import { MESSAGE_STYLES, PERSONALITY_TRAITS } from "@/lib/constants"

const ONBOARDING_STEPS = [
  { id: 1, title: "Family Setup", description: "Let's set up your family" },
  { id: 2, title: "Your Preferences", description: "Personalize your experience" },
  { id: 3, title: "Add Members", description: "Invite your family" },
  { id: 4, title: "First Task", description: "Create your first lovely task" }
]

interface FamilyMember {
  id: string
  name: string
  email?: string
  relationship: string
  ageGroup: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  // Step 1: Family Setup
  const [familyName, setFamilyName] = useState("")
  const [familyMotto, setFamilyMotto] = useState("")
  
  // Step 2: Personal Preferences
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  
  // Step 3: Family Members
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [newMember, setNewMember] = useState<FamilyMember>({
    id: "",
    name: "",
    email: "",
    relationship: "partner",
    ageGroup: "adult"
  })
  
  // Step 4: First Task
  const [taskTitle, setTaskTitle] = useState("Take out the trash")
  const [taskDescription, setTaskDescription] = useState("Please take the bins to the curb for collection tonight")
  const [taskAssignee, setTaskAssignee] = useState("")
  const [showTransformation, setShowTransformation] = useState(false)

  const progress = (currentStep / ONBOARDING_STEPS.length) * 100

  const handleStyleToggle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    )
  }

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    )
  }

  const addFamilyMember = () => {
    if (newMember.name) {
      setFamilyMembers([...familyMembers, {
        ...newMember,
        id: Date.now().toString()
      }])
      setNewMember({
        id: "",
        name: "",
        email: "",
        relationship: "partner",
        ageGroup: "adult"
      })
    }
  }

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id))
  }

  const handleNext = async () => {
    if (currentStep === ONBOARDING_STEPS.length) {
      // Complete onboarding
      setIsLoading(true)
      try {
        // Mock API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast({
          title: "Welcome to LoveyTasks!",
          description: "Your family is all set up. Let's spread some love!",
        })
        
        router.push("/dashboard")
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to complete setup. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep === ONBOARDING_STEPS.length) {
      router.push("/dashboard")
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return familyName.trim().length > 0
      case 2:
        return selectedStyles.length > 0
      case 3:
        return true // Optional step
      case 4:
        return taskTitle && taskAssignee
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Welcome to LoveyTasks!</h1>
          </div>
          <p className="text-muted-foreground">
            Let's set up your family in just a few steps
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            {ONBOARDING_STEPS.map((step) => (
              <span
                key={step.id}
                className={currentStep >= step.id ? "text-foreground font-medium" : ""}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <Users className="h-5 w-5" />}
              {currentStep === 2 && <MessageSquareHeart className="h-5 w-5" />}
              {currentStep === 3 && <Users className="h-5 w-5" />}
              {currentStep === 4 && <CheckCircle2 className="h-5 w-5" />}
              {ONBOARDING_STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {ONBOARDING_STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Family Setup */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName">Family Name</Label>
                  <Input
                    id="familyName"
                    placeholder="The Smith Family"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyMotto">
                    Family Motto <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Textarea
                    id="familyMotto"
                    placeholder="Our family saying or inside joke..."
                    value={familyMotto}
                    onChange={(e) => setFamilyMotto(e.target.value)}
                    rows={3}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will appear on your family dashboard
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Personal Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Choose Your Message Styles</Label>
                  <p className="text-sm text-muted-foreground">
                    Select one or more styles that match your family's vibe
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(MESSAGE_STYLES).map(([key, style]) => (
                      <Card
                        key={key}
                        className={`cursor-pointer transition-colors ${
                          selectedStyles.includes(key)
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleStyleToggle(key)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedStyles.includes(key)}
                              onCheckedChange={() => handleStyleToggle(key)}
                            />
                            <div className="space-y-1">
                              <p className="font-medium">{style.label}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Personality Traits</Label>
                  <p className="text-sm text-muted-foreground">
                    Help us understand your communication style
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_TRAITS.map((trait) => (
                      <Button
                        key={trait}
                        variant={selectedTraits.includes(trait) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTraitToggle(trait)}
                        disabled={isLoading}
                      >
                        {trait}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Add Family Members */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Quick Add Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setNewMember({
                      ...newMember,
                      relationship: "partner",
                      ageGroup: "adult"
                    })}
                    disabled={isLoading}
                  >
                    Add Partner
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNewMember({
                      ...newMember,
                      relationship: "child",
                      ageGroup: "child"
                    })}
                    disabled={isLoading}
                  >
                    Add Child
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNewMember({
                      ...newMember,
                      relationship: "teen",
                      ageGroup: "teen"
                    })}
                    disabled={isLoading}
                  >
                    Add Teen
                  </Button>
                </div>

                {/* Add Member Form */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="memberName">Name</Label>
                          <Input
                            id="memberName"
                            placeholder="Family member name"
                            value={newMember.name}
                            onChange={(e) => setNewMember({
                              ...newMember,
                              name: e.target.value
                            })}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="memberEmail">
                            Email <span className="text-muted-foreground">(Optional)</span>
                          </Label>
                          <Input
                            id="memberEmail"
                            type="email"
                            placeholder="their@email.com"
                            value={newMember.email}
                            onChange={(e) => setNewMember({
                              ...newMember,
                              email: e.target.value
                            })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={addFamilyMember}
                        disabled={!newMember.name || isLoading}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Member
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Family Members List */}
                {familyMembers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Family Members</Label>
                    {familyMembers.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {member.relationship}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFamilyMember(member.id)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {familyMembers.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No family members added yet. You can always add them later!
                  </p>
                )}
              </div>
            )}

            {/* Step 4: First Task */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm">
                    Let's create your first task! We've pre-filled an example to show you how it works.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Task Title</Label>
                  <Input
                    id="taskTitle"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taskDescription">Description</Label>
                  <Textarea
                    id="taskDescription"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                {familyMembers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <RadioGroup value={taskAssignee} onValueChange={setTaskAssignee}>
                      {familyMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={member.id} id={member.id} />
                          <Label htmlFor={member.id} className="font-normal cursor-pointer">
                            {member.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowTransformation(!showTransformation)}
                  className="w-full"
                  disabled={isLoading}
                >
                  {showTransformation ? "Hide" : "Show"} AI Transformation
                </Button>

                {showTransformation && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium mb-2">
                        This will be transformed to:
                      </p>
                      <p className="font-medium">
                        "Take out the trash with love and care, you wonderful human! 💕"
                      </p>
                      <p className="text-sm mt-2">
                        "The bins are waiting for their weekly adventure to the curb. You're the best for helping out!"
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip Tutorial
              </Button>
            )}

            <div className="flex gap-2">
              {currentStep < ONBOARDING_STEPS.length && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  Skip
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
              >
                {isLoading ? "Processing..." : (
                  <>
                    {currentStep === ONBOARDING_STEPS.length ? "Complete Setup" : "Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}