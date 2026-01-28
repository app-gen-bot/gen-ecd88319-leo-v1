"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Download, 
  Eye, 
  CheckCircle,
  Mail,
  FileText,
  DollarSign,
  AlertTriangle
} from "lucide-react"

interface LetterTemplate {
  id: string
  title: string
  content: string
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'textarea' | 'date' | 'number'
    required: boolean
    placeholder?: string
    helperText?: string
  }>
  legalCompliance: string[]
}

const LETTER_TEMPLATES: Record<string, LetterTemplate> = {
  'repair-request': {
    id: 'repair-request',
    title: 'Repair Request Letter',
    content: `[Date]

[Landlord Name]
[Landlord Address]

Re: Repair Request for [Property Address]

Dear [Landlord Name],

I am writing to formally request repairs to my rental unit at [Property Address]. The following issues require immediate attention:

[Repair Description]

I first noticed these issues on [Date Noticed]. These conditions are affecting the habitability of the unit and require prompt repair under California Civil Code Section 1941.1.

Please arrange for the necessary repairs within the legally required timeframe. California law requires landlords to make repairs within 30 days of notice, or sooner if the conditions affect health and safety.

I am available for repair appointments on the following days and times:
[Availability]

Please contact me at your earliest convenience to schedule the repairs. If I do not hear from you within 7 days, I will assume you are unwilling to make the repairs and will exercise my rights under California law, which may include:

• Repair and deduct from rent (Civil Code Section 1942)
• Withholding rent until repairs are made
• Contacting local code enforcement
• Terminating the tenancy

I look forward to your prompt response and resolution of these issues.

Sincerely,

[Your Name]
[Your Contact Information]`,
    fields: [
      { name: 'landlord_name', label: 'Landlord Name', type: 'text', required: true },
      { name: 'landlord_address', label: 'Landlord Address', type: 'textarea', required: true },
      { name: 'property_address', label: 'Property Address', type: 'text', required: true },
      { name: 'repair_description', label: 'Repair Description', type: 'textarea', required: true, placeholder: 'Describe each issue in detail...', helperText: 'Be specific about location, severity, and impact' },
      { name: 'date_noticed', label: 'Date First Noticed', type: 'date', required: true },
      { name: 'availability', label: 'Your Availability', type: 'textarea', required: false, placeholder: 'List days and times you are available for repairs' },
      { name: 'your_name', label: 'Your Name', type: 'text', required: true },
      { name: 'your_contact', label: 'Your Contact Information', type: 'textarea', required: true }
    ],
    legalCompliance: [
      'Complies with California Civil Code Section 1941.1',
      'Provides proper notice under state law',
      'Includes all legally required information',
      'Documents issues for potential legal action'
    ]
  },
  'security-deposit-return': {
    id: 'security-deposit-return',
    title: 'Security Deposit Return Request',
    content: `[Date]

[Landlord Name]
[Landlord Address]

Re: Demand for Return of Security Deposit - [Property Address]

Dear [Landlord Name],

I am writing to request the immediate return of my security deposit in the amount of $[Deposit Amount] for the rental property located at [Property Address]. I vacated the premises on [Move Out Date], which is now more than 21 days ago.

Under California Civil Code Section 1950.5, you are required to return my security deposit within 21 days of my move-out date, along with an itemized statement of any deductions. As of today's date, I have not received either my deposit or an itemized statement.

Move-in Date: [Move In Date]
Move-out Date: [Move Out Date]
Security Deposit Amount: $[Deposit Amount]
Interest Owed (if applicable): $[Interest Amount]
Total Amount Due: $[Total Amount]

The property was left in excellent condition, with only normal wear and tear. I completed all move-out requirements, including:
• Thorough cleaning of all rooms
• Removal of all personal belongings
• Return of all keys
• Final walk-through inspection (if conducted)

Please send my security deposit refund to:
[Forwarding Address]

If I do not receive my security deposit within 10 days of this letter, I will pursue all available legal remedies, including:
• Filing a claim in small claims court
• Seeking statutory damages of up to twice the deposit amount
• Recovery of court costs and attorney fees

I trust this matter can be resolved promptly without legal action.

Sincerely,

[Your Name]
[Your Contact Information]`,
    fields: [
      { name: 'landlord_name', label: 'Landlord Name', type: 'text', required: true },
      { name: 'landlord_address', label: 'Landlord Address', type: 'textarea', required: true },
      { name: 'property_address', label: 'Property Address', type: 'text', required: true },
      { name: 'deposit_amount', label: 'Deposit Amount', type: 'number', required: true },
      { name: 'move_in_date', label: 'Move-in Date', type: 'date', required: true },
      { name: 'move_out_date', label: 'Move-out Date', type: 'date', required: true },
      { name: 'interest_amount', label: 'Interest Amount (if applicable)', type: 'number', required: false, helperText: 'Some cities require interest on deposits' },
      { name: 'total_amount', label: 'Total Amount Due', type: 'number', required: true },
      { name: 'forwarding_address', label: 'Forwarding Address', type: 'textarea', required: true },
      { name: 'your_name', label: 'Your Name', type: 'text', required: true },
      { name: 'your_contact', label: 'Your Contact Information', type: 'textarea', required: true }
    ],
    legalCompliance: [
      'Cites California Civil Code Section 1950.5',
      'Includes 21-day legal deadline',
      'Mentions statutory damages provision',
      'Creates legal record of demand'
    ]
  }
}

export default function LetterBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const { user, currentProperty } = useAuth()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'download' | 'certified'>('email')
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const template = LETTER_TEMPLATES[params.template as string]

  useEffect(() => {
    if (!template) {
      toast({
        title: "Template not found",
        description: "The requested template does not exist",
        variant: "destructive",
      })
      router.push('/letters')
      return
    }

    // Pre-fill some fields
    const initialData: Record<string, string> = {
      your_name: user ? `${user.first_name} ${user.last_name}` : '',
      property_address: currentProperty?.address || '',
      date: format(new Date(), 'MMMM d, yyyy')
    }
    setFormData(initialData)
  }, [template, user, currentProperty])

  useEffect(() => {
    if (template) {
      generatePreview()
    }
  }, [formData, template])

  const generatePreview = () => {
    let content = template.content
    
    // Replace placeholders with form data
    content = content.replace('[Date]', format(new Date(), 'MMMM d, yyyy'))
    
    template.fields.forEach(field => {
      const value = formData[field.name] || `[${field.label}]`
      const placeholder = `[${field.label.replace(/\*/g, '')}]`
      content = content.replace(new RegExp(`\\[${field.name}\\]`, 'gi'), value)
      content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), value)
    })

    setPreview(content)
  }

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const validateForm = () => {
    for (const field of template.fields) {
      if (field.required && !formData[field.name]) {
        toast({
          title: "Missing required field",
          description: `Please fill in ${field.label}`,
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      await apiClient.saveLetter({
        template_id: template.id,
        title: template.title,
        content: preview,
        form_data: formData,
        status: 'draft'
      })
      toast({
        title: "Draft saved",
        description: "Your letter has been saved as a draft",
      })
      router.push('/letters')
    } catch (error) {
      toast({
        title: "Error saving draft",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async () => {
    if (!validateForm()) return

    setShowDeliveryModal(true)
  }

  const handleDeliveryConfirm = async () => {
    setIsSending(true)
    try {
      if (deliveryMethod === 'email') {
        await apiClient.sendLetter({
          template_id: template.id,
          title: template.title,
          content: preview,
          form_data: formData,
          recipient_email: formData.landlord_email || '',
          delivery_method: 'email'
        })
        toast({
          title: "Letter sent",
          description: "Your letter has been sent via email with read receipt",
        })
      } else if (deliveryMethod === 'certified') {
        await apiClient.sendLetter({
          template_id: template.id,
          title: template.title,
          content: preview,
          form_data: formData,
          delivery_method: 'certified_mail'
        })
        toast({
          title: "Letter queued for certified mail",
          description: "Your letter will be sent via USPS Certified Mail within 24 hours",
        })
      } else {
        // Download
        const blob = new Blob([preview], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template.id}-${format(new Date(), 'yyyy-MM-dd')}.txt`
        a.click()
        URL.revokeObjectURL(url)
      }
      
      setShowDeliveryModal(false)
      router.push('/letters')
    } catch (error) {
      toast({
        title: "Error sending letter",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (!template) {
    return null
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/letters')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
        <p className="text-muted-foreground">
          Fill in the required information to generate your letter
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Letter Information</CardTitle>
              <CardDescription>
                All fields marked with * are required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && '*'}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : field.type === 'date' ? (
                    <Input
                      id={field.name}
                      type="date"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'number' ? (
                    <Input
                      id={field.name}
                      type="number"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.helperText && (
                    <p className="text-xs text-muted-foreground">{field.helperText}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legal Compliance</CardTitle>
              <CardDescription>
                This letter template ensures legal compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {template.legalCompliance.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleSaveDraft} variant="outline" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={() => setShowPreview(true)} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleSend} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Send Letter
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                Your letter updates as you type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-6 rounded-lg">
                <pre className="whitespace-pre-wrap font-mono text-sm">{preview}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Letter Preview</DialogTitle>
            <DialogDescription>
              Review your letter before sending
            </DialogDescription>
          </DialogHeader>
          <div className="my-6 bg-muted p-6 rounded-lg">
            <pre className="whitespace-pre-wrap font-mono text-sm">{preview}</pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" />
              Send Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Options Modal */}
      <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Delivery Method</DialogTitle>
            <DialogDescription>
              Select how you want to send your letter
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
            <div className="space-y-4 my-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <RadioGroupItem value="email" />
                <div className="flex-1">
                  <p className="font-medium">Email with Read Receipt</p>
                  <p className="text-sm text-muted-foreground">
                    Send via email and track when it's opened
                  </p>
                </div>
                <Mail className="h-5 w-5 text-muted-foreground" />
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <RadioGroupItem value="download" />
                <div className="flex-1">
                  <p className="font-medium">Download PDF</p>
                  <p className="text-sm text-muted-foreground">
                    Download and send it yourself
                  </p>
                </div>
                <Download className="h-5 w-5 text-muted-foreground" />
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <RadioGroupItem value="certified" />
                <div className="flex-1">
                  <p className="font-medium">Certified Mail ($7.95)</p>
                  <p className="text-sm text-muted-foreground">
                    USPS Certified Mail with tracking
                  </p>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </label>
            </div>
          </RadioGroup>
          
          {deliveryMethod === 'certified' && (
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                Certified mail costs $7.95 and will be sent within 24 hours. 
                You'll receive tracking information via email.
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeliveryConfirm} disabled={isSending}>
              {isSending ? 'Processing...' : 'Confirm & Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}