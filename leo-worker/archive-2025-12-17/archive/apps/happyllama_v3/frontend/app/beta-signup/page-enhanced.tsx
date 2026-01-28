"use client"

import { useState, useEffect } from "react"
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
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon
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

interface ValidationErrors {
  [key: string]: string
}

export default function BetaSignupPageEnhanced() {
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
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [emailChecking, setEmailChecking] = useState(false)

  const progressPercentage = (step / 4) * 100

  // Field validation functions
  const validateEmail = (email: string): string => {
    if (!email) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    
    // Check for business email if enterprise
    if (formData.role === "enterprise") {
      const personalDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"]
      const emailDomain = email.split("@")[1]
      if (personalDomains.includes(emailDomain)) {
        return "Please use your company email address"
      }
    }
    return ""
  }

  const validatePhone = (phone: string): string => {
    if (!phone) return "" // Optional field
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(phone)) return "Please enter a valid phone number"
    if (phone.replace(/\D/g, "").length < 10) return "Phone number is too short"
    return ""
  }

  const validateUseCaseDescription = (description: string): string => {
    if (!description) return "Use case description is required"
    if (description.length < 50) return `Please provide more detail (${description.length}/50 min)`
    if (description.length > 500) return `Description is too long (${description.length}/500 max)`
    return ""
  }

  // Real-time validation
  const validateField = (fieldName: string, value: any) => {
    let error = ""
    
    switch (fieldName) {
      case "firstName":
        error = !value ? "First name is required" : ""
        break
      case "lastName":
        error = !value ? "Last name is required" : ""
        break
      case "email":
        error = validateEmail(value)
        break
      case "phone":
        error = validatePhone(value)
        break
      case "companyName":
        if (formData.role === "enterprise") {
          error = !value ? "Company name is required" : ""
        }
        break
      case "jobTitle":
        if (formData.role === "enterprise") {
          error = !value ? "Job title is required" : ""
        }
        break
      case "companySize":
        if (formData.role === "enterprise") {
          error = !value ? "Company size is required" : ""
        }
        break
      case "useCaseDescription":
        error = validateUseCaseDescription(value)
        break
      case "useCase":
        error = !value ? "Please select a use case" : ""
        break
      case "industry":
        error = !value ? "Please select an industry" : ""
        break
      case "timeline":
        error = !value ? "Please select a timeline" : ""
        break
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))
    
    return error === ""
  }

  // Handle field blur
  const handleBlur = (fieldName: string) => {
    setTouched(prev => new Set(prev).add(fieldName))
    validateField(fieldName, formData[fieldName as keyof typeof formData])
  }

  // Handle field change
  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
    
    // Only validate if field has been touched
    if (touched.has(fieldName)) {
      validateField(fieldName, value)
    }
  }

  // Check for duplicate email (simulated)
  const checkEmailDuplicate = async (email: string) => {
    setEmailChecking(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate some emails being taken
    const takenEmails = ["demo@example.com", "test@company.com"]
    if (takenEmails.includes(email.toLowerCase())) {
      setErrors(prev => ({
        ...prev,
        email: "This email is already registered"
      }))
    }
    setEmailChecking(false)
  }

  useEffect(() => {
    if (formData.email && touched.has("email") && !validateEmail(formData.email)) {
      const timer = setTimeout(() => {
        checkEmailDuplicate(formData.email)
      }, 1000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email])

  const validateStep = () => {
    let stepErrors: ValidationErrors = {}
    let fieldsToValidate: string[] = []
    
    switch (step) {
      case 1:
        if (!formData.role) {
          stepErrors.role = "Please select a role"
        }
        if (formData.role === "other" && !formData.otherRole) {
          stepErrors.otherRole = "Please describe your role"
        }
        break
      
      case 2:
        fieldsToValidate = ["firstName", "lastName", "email"]
        if (formData.role === "enterprise") {
          fieldsToValidate.push("companyName", "companySize", "jobTitle")
        }
        fieldsToValidate.forEach(field => {
          const error = validateField(field, formData[field as keyof typeof formData])
          if (!error) {
            stepErrors[field] = errors[field] || ""
          }
        })
        break
      
      case 3:
        fieldsToValidate = ["useCase", "useCaseDescription", "industry", "timeline"]
        fieldsToValidate.forEach(field => {
          validateField(field, formData[field as keyof typeof formData])
          if (errors[field]) {
            stepErrors[field] = errors[field]
          }
        })
        break
      
      case 4:
        if (!formData.termsAccepted) {
          stepErrors.termsAccepted = "You must accept the Terms of Service and Privacy Policy"
        }
        break
    }
    
    // Mark all fields in current step as touched
    fieldsToValidate.forEach(field => {
      setTouched(prev => new Set(prev).add(field))
    })
    
    const hasErrors = Object.values(stepErrors).some(error => error !== "")
    
    if (hasErrors) {
      toast({
        title: "Please fix the errors before continuing",
        variant: "destructive"
      })
      return false
    }
    
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast({
      title: "Success!",
      description: "You've been added to the beta waitlist.",
    })
    
    router.push("/beta-signup/thank-you")
  }

  const getFieldError = (fieldName: string) => {
    return touched.has(fieldName) ? errors[fieldName] : ""
  }

  const getFieldStatus = (fieldName: string) => {
    if (!touched.has(fieldName)) return ""
    return errors[fieldName] ? "error" : "success"
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="animate-fadeIn">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Which best describes you?"}
              {step === 2 && "Contact Information"}
              {step === 3 && "Tell us about your use case"}
              {step === 4 && "Preferences & Consent"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "This helps us tailor the experience to your needs"}
              {step === 2 && "We'll use this to keep you updated on your beta access"}
              {step === 3 && "Understanding your goals helps us prioritize features"}
              {step === 4 && "Choose how you'd like to stay connected"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <RadioGroup value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  {roleOptions.map((option) => (
                    <div key={option.id} className="relative">
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={option.id}
                        className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 ${
                          formData.role === option.id ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                      >
                        <option.icon className="h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-semibold">{option.title}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                {formData.role === "other" && (
                  <div className="animate-fadeIn">
                    <Label htmlFor="otherRole">Please describe your role</Label>
                    <Input
                      id="otherRole"
                      value={formData.otherRole}
                      onChange={(e) => handleChange("otherRole", e.target.value)}
                      onBlur={() => handleBlur("otherRole")}
                      placeholder="e.g., Product Manager, Consultant, Student"
                      className={`mt-2 ${getFieldStatus("otherRole") === "error" ? "border-destructive" : ""}`}
                    />
                    {getFieldError("otherRole") && (
                      <p className="text-sm text-destructive mt-1">{getFieldError("otherRole")}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        onBlur={() => handleBlur("firstName")}
                        className={`pr-10 ${
                          getFieldStatus("firstName") === "error" ? "border-destructive" : 
                          getFieldStatus("firstName") === "success" ? "border-green-500" : ""
                        }`}
                      />
                      {getFieldStatus("firstName") === "success" && (
                        <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                      )}
                      {getFieldStatus("firstName") === "error" && (
                        <XCircleIcon className="absolute right-3 top-3 h-5 w-5 text-destructive" />
                      )}
                    </div>
                    {getFieldError("firstName") && (
                      <p className="text-sm text-destructive mt-1">{getFieldError("firstName")}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        onBlur={() => handleBlur("lastName")}
                        className={`pr-10 ${
                          getFieldStatus("lastName") === "error" ? "border-destructive" : 
                          getFieldStatus("lastName") === "success" ? "border-green-500" : ""
                        }`}
                      />
                      {getFieldStatus("lastName") === "success" && (
                        <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                      )}
                      {getFieldStatus("lastName") === "error" && (
                        <XCircleIcon className="absolute right-3 top-3 h-5 w-5 text-destructive" />
                      )}
                    </div>
                    {getFieldError("lastName") && (
                      <p className="text-sm text-destructive mt-1">{getFieldError("lastName")}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={`pr-10 ${
                        getFieldStatus("email") === "error" ? "border-destructive" : 
                        getFieldStatus("email") === "success" ? "border-green-500" : ""
                      }`}
                    />
                    {emailChecking && (
                      <div className="absolute right-3 top-3">
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {!emailChecking && getFieldStatus("email") === "success" && (
                      <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                    {!emailChecking && getFieldStatus("email") === "error" && (
                      <XCircleIcon className="absolute right-3 top-3 h-5 w-5 text-destructive" />
                    )}
                  </div>
                  {getFieldError("email") && (
                    <p className="text-sm text-destructive mt-1">{getFieldError("email")}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder="+1 (555) 123-4567"
                      className={`pr-10 ${
                        getFieldStatus("phone") === "error" ? "border-destructive" : 
                        getFieldStatus("phone") === "success" && formData.phone ? "border-green-500" : ""
                      }`}
                    />
                    {getFieldStatus("phone") === "success" && formData.phone && (
                      <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                    {getFieldStatus("phone") === "error" && (
                      <XCircleIcon className="absolute right-3 top-3 h-5 w-5 text-destructive" />
                    )}
                  </div>
                  {getFieldError("phone") && (
                    <p className="text-sm text-destructive mt-1">{getFieldError("phone")}</p>
                  )}
                </div>
                
                {formData.role === "enterprise" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <Label htmlFor="companyName">
                        Company Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleChange("companyName", e.target.value)}
                        onBlur={() => handleBlur("companyName")}
                        className={getFieldStatus("companyName") === "error" ? "border-destructive" : ""}
                      />
                      {getFieldError("companyName") && (
                        <p className="text-sm text-destructive mt-1">{getFieldError("companyName")}</p>
                      )}
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="jobTitle">
                          Job Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) => handleChange("jobTitle", e.target.value)}
                          onBlur={() => handleBlur("jobTitle")}
                          className={getFieldStatus("jobTitle") === "error" ? "border-destructive" : ""}
                        />
                        {getFieldError("jobTitle") && (
                          <p className="text-sm text-destructive mt-1">{getFieldError("jobTitle")}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="companySize">
                        Company Size <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formData.companySize} onValueChange={(value) => handleChange("companySize", value)}>
                        <SelectTrigger className={getFieldStatus("companySize") === "error" ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getFieldError("companySize") && (
                        <p className="text-sm text-destructive mt-1">{getFieldError("companySize")}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Use Case Information */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="useCase">
                    Primary Use Case <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.useCase} onValueChange={(value) => handleChange("useCase", value)}>
                    <SelectTrigger className={getFieldStatus("useCase") === "error" ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a use case" />
                    </SelectTrigger>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem key={useCase} value={useCase}>{useCase}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError("useCase") && (
                    <p className="text-sm text-destructive mt-1">{getFieldError("useCase")}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="useCaseDescription">
                    Use Case Description <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="useCaseDescription"
                      value={formData.useCaseDescription}
                      onChange={(e) => handleChange("useCaseDescription", e.target.value)}
                      onBlur={() => handleBlur("useCaseDescription")}
                      placeholder="Describe what you want to build (50-500 characters)"
                      className={`min-h-[100px] ${
                        getFieldStatus("useCaseDescription") === "error" ? "border-destructive" : 
                        getFieldStatus("useCaseDescription") === "success" ? "border-green-500" : ""
                      }`}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                      {formData.useCaseDescription.length}/500
                    </div>
                  </div>
                  {getFieldError("useCaseDescription") && (
                    <p className="text-sm text-destructive mt-1">{getFieldError("useCaseDescription")}</p>
                  )}
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="industry">
                      Industry <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.industry} onValueChange={(value) => handleChange("industry", value)}>
                      <SelectTrigger className={getFieldStatus("industry") === "error" ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getFieldError("industry") && (
                      <p className="text-sm text-destructive mt-1">{getFieldError("industry")}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="timeline">
                      Timeline <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.timeline} onValueChange={(value) => handleChange("timeline", value)}>
                      <SelectTrigger className={getFieldStatus("timeline") === "error" ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {timelines.map((timeline) => (
                          <SelectItem key={timeline.value} value={timeline.value}>
                            {timeline.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getFieldError("timeline") && (
                      <p className="text-sm text-destructive mt-1">{getFieldError("timeline")}</p>
                    )}
                  </div>
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
                      onCheckedChange={(checked) => handleChange("updates", checked)}
                    />
                    <Label htmlFor="updates" className="font-normal cursor-pointer">
                      I&apos;d like to receive product updates and tips
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="research"
                      checked={formData.research}
                      onCheckedChange={(checked) => handleChange("research", checked)}
                    />
                    <Label htmlFor="research" className="font-normal cursor-pointer">
                      I&apos;m interested in participating in user research
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="webinars"
                      checked={formData.webinars}
                      onCheckedChange={(checked) => handleChange("webinars", checked)}
                    />
                    <Label htmlFor="webinars" className="font-normal cursor-pointer">
                      Notify me about webinars and events
                    </Label>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleChange("termsAccepted", checked)}
                      className={errors.termsAccepted ? "border-destructive" : ""}
                    />
                    <Label htmlFor="terms" className="font-normal cursor-pointer text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="underline hover:text-primary" target="_blank">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="underline hover:text-primary" target="_blank">
                        Privacy Policy
                      </Link>
                      <span className="text-destructive"> *</span>
                    </Label>
                  </div>
                  {errors.termsAccepted && touched.has("termsAccepted") && (
                    <p className="text-sm text-destructive mt-1">{errors.termsAccepted}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="hearAbout">How did you hear about us?</Label>
                  <Select value={formData.hearAbout} onValueChange={(value) => handleChange("hearAbout", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {hearAboutOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground text-center pt-2">
                  You can unsubscribe at any time
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={step === 1 ? () => router.push("/") : handleBack}
                disabled={loading}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                {step === 1 ? "Back to Home" : "Back"}
              </Button>
              
              {step < 4 ? (
                <Button type="button" onClick={handleNext} disabled={loading}>
                  Continue
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={loading}
                  variant="gradient"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Securing your spot...
                    </>
                  ) : (
                    "Join Beta Waitlist"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}