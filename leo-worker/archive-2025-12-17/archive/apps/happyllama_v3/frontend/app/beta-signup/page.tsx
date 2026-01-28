"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { 
  UserIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CodeBracketIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"

const roleOptions = [
  {
    id: "citizen",
    title: "Citizen Developer",
    description: "I want to build apps without coding",
    icon: UserIcon
  },
  {
    id: "startup",
    title: "Startup Founder",
    description: "I need to move fast with limited resources",
    icon: BriefcaseIcon
  },
  {
    id: "enterprise",
    title: "Enterprise Team",
    description: "We need governed, compliant development",
    icon: BuildingOfficeIcon
  },
  {
    id: "technical",
    title: "Technical Professional",
    description: "I'm a developer interested in AI augmentation",
    icon: CodeBracketIcon
  },
  {
    id: "other",
    title: "Other",
    description: "None of the above",
    icon: UserIcon
  }
]

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Education",
  "Manufacturing",
  "Government",
  "Non-profit",
  "Other"
]

const useCases = [
  "Internal Tools",
  "Customer-Facing Apps",
  "Data Dashboards",
  "Workflow Automation",
  "MVP/Prototype",
  "Other"
]

const timelines = [
  { value: "immediate", label: "Immediate (Ready to start now)" },
  { value: "1-3months", label: "1-3 months" },
  { value: "3-6months", label: "3-6 months" },
  { value: "6+months", label: "6+ months" },
  { value: "exploring", label: "Just exploring" }
]

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
]

const departments = [
  "IT/Technology",
  "Product",
  "Operations",
  "Marketing",
  "Sales",
  "Other"
]

const hearAboutOptions = [
  "Search Engine",
  "Social Media",
  "Word of Mouth",
  "Tech Blog/News",
  "Conference/Event",
  "Other"
]

export default function BetaSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1
    role: "",
    otherRole: "",
    // Step 2
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    companySize: "",
    jobTitle: "",
    department: "",
    // Step 3
    useCase: "",
    useCaseDescription: "",
    industry: "",
    timeline: "",
    // Step 4
    updates: true,
    research: false,
    webinars: false,
    termsAccepted: false,
    hearAbout: ""
  })
  const [loading, setLoading] = useState(false)

  const progressPercentage = (step / 4) * 100

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.role) {
          toast({
            title: "Please select a role",
            variant: "destructive"
          })
          return false
        }
        if (formData.role === "other" && !formData.otherRole) {
          toast({
            title: "Please describe your role",
            variant: "destructive"
          })
          return false
        }
        return true
      
      case 2:
        if (!formData.firstName || !formData.lastName || !formData.email) {
          toast({
            title: "Please fill in all required fields",
            variant: "destructive"
          })
          return false
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          toast({
            title: "Please enter a valid email address",
            variant: "destructive"
          })
          return false
        }
        // Enterprise additional validation
        if (formData.role === "enterprise") {
          if (!formData.companyName || !formData.companySize || !formData.jobTitle) {
            toast({
              title: "Please fill in all company information",
              variant: "destructive"
            })
            return false
          }
          // Check for business email
          const personalDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
          const emailDomain = formData.email.split("@")[1]
          if (personalDomains.includes(emailDomain)) {
            toast({
              title: "Please use your company email address",
              variant: "destructive"
            })
            return false
          }
        }
        return true
      
      case 3:
        if (!formData.useCase || !formData.useCaseDescription || !formData.industry || !formData.timeline) {
          toast({
            title: "Please fill in all required fields",
            variant: "destructive"
          })
          return false
        }
        if (formData.useCaseDescription.length < 50) {
          toast({
            title: "Please provide more detail about your use case (minimum 50 characters)",
            variant: "destructive"
          })
          return false
        }
        if (formData.useCaseDescription.length > 500) {
          toast({
            title: "Use case description is too long (maximum 500 characters)",
            variant: "destructive"
          })
          return false
        }
        return true
      
      case 4:
        if (!formData.termsAccepted) {
          toast({
            title: "Please accept the Terms of Service and Privacy Policy",
            variant: "destructive"
          })
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push("/")
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In production, this would submit to your API
    console.log("Form submitted:", formData)
    
    // Redirect to thank you page
    router.push("/beta-signup/thank-you")
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join the Beta Waitlist</CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "Contact information"}
              {step === 3 && "Your use case"}
              {step === 4 && "Almost done!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <Label>Which best describes you?</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => updateFormData("role", value)}
                >
                  {roleOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => updateFormData("role", option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <option.icon className="h-4 w-4" />
                            <span className="font-semibold">{option.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                
                {formData.role === "other" && (
                  <div>
                    <Label htmlFor="otherRole">Please describe your role</Label>
                    <Input
                      id="otherRole"
                      value={formData.otherRole}
                      onChange={(e) => updateFormData("otherRole", e.target.value)}
                      placeholder="e.g., Consultant, Researcher, etc."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                  />
                </div>
                
                {formData.role === "enterprise" && (
                  <>
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => updateFormData("companyName", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="companySize">Company Size *</Label>
                        <Select
                          value={formData.companySize}
                          onValueChange={(value) => updateFormData("companySize", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => updateFormData("department", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => updateFormData("jobTitle", e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Use Case Information */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="useCase">Primary Use Case *</Label>
                  <Select
                    value={formData.useCase}
                    onValueChange={(value) => updateFormData("useCase", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select use case" />
                    </SelectTrigger>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem key={useCase} value={useCase}>
                          {useCase}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="useCaseDescription">
                    Use Case Description * (50-500 characters)
                  </Label>
                  <Textarea
                    id="useCaseDescription"
                    value={formData.useCaseDescription}
                    onChange={(e) => updateFormData("useCaseDescription", e.target.value)}
                    placeholder="Describe what you want to build..."
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.useCaseDescription.length}/500 characters
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => updateFormData("industry", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Timeline *</Label>
                  <RadioGroup
                    value={formData.timeline}
                    onValueChange={(value) => updateFormData("timeline", value)}
                  >
                    {timelines.map((timeline) => (
                      <div key={timeline.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={timeline.value} id={timeline.value} />
                        <Label htmlFor={timeline.value} className="cursor-pointer">
                          {timeline.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 4: Preferences & Consent */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="updates"
                      checked={formData.updates}
                      onCheckedChange={(checked) => updateFormData("updates", checked)}
                    />
                    <Label htmlFor="updates" className="cursor-pointer">
                      I&apos;d like to receive product updates and tips
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="research"
                      checked={formData.research}
                      onCheckedChange={(checked) => updateFormData("research", checked)}
                    />
                    <Label htmlFor="research" className="cursor-pointer">
                      I&apos;m interested in participating in user research
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="webinars"
                      checked={formData.webinars}
                      onCheckedChange={(checked) => updateFormData("webinars", checked)}
                    />
                    <Label htmlFor="webinars" className="cursor-pointer">
                      Notify me about webinars and events
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => updateFormData("termsAccepted", checked)}
                      required
                    />
                    <Label htmlFor="terms" className="cursor-pointer">
                      I agree to the{" "}
                      <Link href="/terms" target="_blank" className="underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" target="_blank" className="underline">
                        Privacy Policy
                      </Link>{" "}
                      *
                    </Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="hearAbout">How did you hear about us?</Label>
                  <Select
                    value={formData.hearAbout}
                    onValueChange={(value) => updateFormData("hearAbout", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {hearAboutOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  You can unsubscribe at any time
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                {step === 1 ? "Back to Home" : "Back"}
              </Button>
              
              {step < 4 ? (
                <Button onClick={handleNext} disabled={loading}>
                  Continue
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {loading ? "Securing your spot..." : "Join Beta Waitlist"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}