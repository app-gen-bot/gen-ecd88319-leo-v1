"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Upload, Plus, X, AlertTriangle, DollarSign, Wrench, FileWarning, TrendingUp, Home as HomeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const DISPUTE_TYPES = [
  {
    id: 'security_deposit',
    title: 'Security Deposit',
    description: 'Wrongful deductions or non-return',
    icon: DollarSign,
  },
  {
    id: 'repairs',
    title: 'Repairs & Maintenance',
    description: 'Maintenance issues not addressed',
    icon: Wrench,
  },
  {
    id: 'lease_violation',
    title: 'Lease Violation',
    description: 'False accusations or disputes',
    icon: FileWarning,
  },
  {
    id: 'rent_increase',
    title: 'Rent Increase',
    description: 'Illegal or improper increases',
    icon: TrendingUp,
  },
  {
    id: 'eviction',
    title: 'Eviction Notice',
    description: 'Wrongful eviction attempts',
    icon: HomeIcon,
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Other disputes',
    icon: AlertTriangle,
  },
]

const EVIDENCE_TYPES = [
  { id: 'photos', label: 'Photos/Videos', accept: 'image/*,video/*' },
  { id: 'documents', label: 'Documents', accept: '.pdf,.doc,.docx' },
  { id: 'communications', label: 'Communications', accept: '.pdf,.png,.jpg,.eml' },
  { id: 'receipts', label: 'Receipts', accept: 'image/*,.pdf' },
]

export default function NewDisputePage() {
  const router = useRouter()
  const { currentProperty } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data
  const [disputeType, setDisputeType] = useState('')
  const [basicInfo, setBasicInfo] = useState({
    property_id: currentProperty?.id || '',
    date_of_issue: new Date(),
    other_party_name: '',
    other_party_contact: '',
    description: '',
    desired_outcome: '',
    attempted_resolution: '',
    resolution_details: '',
  })
  const [evidence, setEvidence] = useState<Record<string, File[]>>({
    photos: [],
    documents: [],
    communications: [],
    receipts: [],
  })
  const [timeline, setTimeline] = useState<Array<{ date: Date; description: string }>>([
    { date: new Date(), description: '' }
  ])

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!disputeType) {
          toast({
            title: "Please select a dispute type",
            variant: "destructive",
          })
          return false
        }
        return true
      case 2:
        if (!basicInfo.other_party_name || !basicInfo.description) {
          toast({
            title: "Please fill in all required fields",
            variant: "destructive",
          })
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleFileUpload = (type: string, files: FileList) => {
    const newFiles = Array.from(files)
    setEvidence(prev => ({
      ...prev,
      [type]: [...prev[type], ...newFiles]
    }))
  }

  const removeFile = (type: string, index: number) => {
    setEvidence(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const addTimelineEvent = () => {
    setTimeline(prev => [...prev, { date: new Date(), description: '' }])
  }

  const removeTimelineEvent = (index: number) => {
    setTimeline(prev => prev.filter((_, i) => i !== index))
  }

  const updateTimelineEvent = (index: number, field: 'date' | 'description', value: any) => {
    setTimeline(prev => prev.map((event, i) => 
      i === index ? { ...event, [field]: value } : event
    ))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Create form data for file upload
      const formData = new FormData()
      formData.append('type', disputeType)
      Object.entries(basicInfo).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString())
        } else {
          formData.append(key, value.toString())
        }
      })
      
      // Add evidence files
      Object.entries(evidence).forEach(([type, files]) => {
        files.forEach(file => {
          formData.append(`evidence_${type}`, file)
        })
      })
      
      // Add timeline
      formData.append('timeline', JSON.stringify(timeline.filter(t => t.description)))
      
      const dispute = await apiClient.createDispute(formData)
      toast({
        title: "Dispute created successfully",
        description: "You can now track and manage your dispute",
      })
      router.push(`/disputes/${dispute.id}`)
    } catch (error) {
      toast({
        title: "Error creating dispute",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Start New Dispute</h1>
        <p className="text-muted-foreground mt-1">
          Document your dispute with evidence and timeline
        </p>
      </div>

      <Progress value={progress} className="mb-8" />

      {/* Step 1: Type Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Dispute Type</CardTitle>
            <CardDescription>
              Choose the category that best describes your dispute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={disputeType} onValueChange={setDisputeType}>
              <div className="grid gap-4 sm:grid-cols-2">
                {DISPUTE_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <label
                      key={type.id}
                      htmlFor={type.id}
                      className={cn(
                        "relative flex cursor-pointer rounded-lg border p-4 hover:bg-accent",
                        disputeType === type.id && "border-primary bg-accent"
                      )}
                    >
                      <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{type.title}</p>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/disputes')}>
              Cancel
            </Button>
            <Button onClick={handleNext} disabled={!disputeType}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Basic Information */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Basic Information</CardTitle>
            <CardDescription>
              Provide details about the dispute
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Select
                  value={basicInfo.property_id}
                  onValueChange={(value) => setBasicInfo(prev => ({ ...prev, property_id: value }))}
                >
                  <SelectTrigger id="property">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProperty && (
                      <SelectItem value={currentProperty.id}>
                        {currentProperty.address}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date of Issue</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !basicInfo.date_of_issue && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {basicInfo.date_of_issue ? format(basicInfo.date_of_issue, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={basicInfo.date_of_issue}
                      onSelect={(date) => date && setBasicInfo(prev => ({ ...prev, date_of_issue: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="other_party">Other Party Name *</Label>
                <Input
                  id="other_party"
                  value={basicInfo.other_party_name}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, other_party_name: e.target.value }))}
                  placeholder="e.g., John Smith (Landlord)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Information</Label>
                <Input
                  id="contact"
                  value={basicInfo.other_party_contact}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, other_party_contact: e.target.value }))}
                  placeholder="Email or phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={basicInfo.description}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what happened in detail..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 50 characters ({basicInfo.description.length}/50)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Desired Outcome *</Label>
              <Textarea
                id="outcome"
                value={basicInfo.desired_outcome}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, desired_outcome: e.target.value }))}
                placeholder="What resolution are you seeking?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Have you attempted to resolve this issue?</Label>
              <RadioGroup
                value={basicInfo.attempted_resolution}
                onValueChange={(value) => setBasicInfo(prev => ({ ...prev, attempted_resolution: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {basicInfo.attempted_resolution === 'yes' && (
              <div className="space-y-2">
                <Label htmlFor="resolution_details">Resolution Details</Label>
                <Textarea
                  id="resolution_details"
                  value={basicInfo.resolution_details}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, resolution_details: e.target.value }))}
                  placeholder="Describe your resolution attempts..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Evidence Upload */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Upload Evidence</CardTitle>
            <CardDescription>
              Add photos, documents, and other supporting evidence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Based on your dispute type, we recommend gathering: photos of issues, 
                written communications, receipts, and any relevant documents.
              </AlertDescription>
            </Alert>

            {EVIDENCE_TYPES.map((type) => (
              <div key={type.id} className="space-y-2">
                <Label>{type.label}</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <input
                    type="file"
                    id={`file-${type.id}`}
                    multiple
                    accept={type.accept}
                    onChange={(e) => e.target.files && handleFileUpload(type.id, e.target.files)}
                    className="hidden"
                  />
                  <label
                    htmlFor={`file-${type.id}`}
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                  </label>
                </div>
                
                {evidence[type.id].length > 0 && (
                  <div className="space-y-2 mt-2">
                    {evidence[type.id].map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(type.id, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Timeline Builder */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Build Timeline</CardTitle>
            <CardDescription>
              Create a chronological timeline of events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.map((event, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !event.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {event.date ? format(event.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={event.date}
                        onSelect={(date) => date && updateTimelineEvent(index, 'date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Textarea
                    value={event.description}
                    onChange={(e) => updateTimelineEvent(index, 'description', e.target.value)}
                    placeholder="Describe what happened..."
                    rows={2}
                  />
                </div>
                {timeline.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTimelineEvent(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button variant="outline" onClick={addTimelineEvent} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Review & Submit</CardTitle>
            <CardDescription>
              Review your dispute information before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Dispute Type</h3>
              <p className="text-muted-foreground">
                {DISPUTE_TYPES.find(t => t.id === disputeType)?.title}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Basic Information</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Date of Issue:</dt>
                  <dd>{format(basicInfo.date_of_issue, "PPP")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Other Party:</dt>
                  <dd>{basicInfo.other_party_name}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{basicInfo.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Evidence Summary</h3>
              <ul className="space-y-1 text-sm">
                {Object.entries(evidence).map(([type, files]) => 
                  files.length > 0 && (
                    <li key={type} className="text-muted-foreground">
                      • {EVIDENCE_TYPES.find(t => t.id === type)?.label}: {files.length} file(s)
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Timeline Events</h3>
              <p className="text-sm text-muted-foreground">
                {timeline.filter(t => t.description).length} events documented
              </p>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Legal Strength Assessment:</strong> Based on the information provided, 
                your dispute appears to have moderate to strong merit. We recommend proceeding 
                with formal documentation.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}