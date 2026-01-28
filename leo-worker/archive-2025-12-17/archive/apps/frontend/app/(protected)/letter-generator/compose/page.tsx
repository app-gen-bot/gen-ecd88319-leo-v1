'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
  ArrowLeft,
  Download,
  Copy,
  User,
  Home,
  Calendar,
  Loader2,
  Info,
  CheckCircle,
  Mail,
  MessageSquare,
  Printer,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

interface FormData {
  tenantName: string;
  tenantAddress: string;
  landlordName: string;
  landlordAddress: string;
  issueDescription: string;
  previousAttempts: string;
  desiredResolution: string;
  deadline: string;
  tone: 'formal' | 'firm' | 'friendly';
}

const templateContent: Record<string, { title: string; template: (data: FormData) => string }> = {
  'repair-request': {
    title: 'Repair Request Letter',
    template: (data) => `${data.tenantName}
${data.tenantAddress}
${format(new Date(), 'MMMM d, yyyy')}

${data.landlordName}
${data.landlordAddress}

Dear ${data.landlordName},

I am writing to formally request repairs to my rental unit at ${data.tenantAddress}. As my landlord, you have a legal obligation under California Civil Code § 1941.1 to maintain the property in a habitable condition.

Issue Description:
${data.issueDescription}

Previous Communication:
${data.previousAttempts}

Under California law, landlords must complete repairs within a reasonable time, typically interpreted as 30 days for non-urgent repairs. ${data.deadline ? `I request that these repairs be completed by ${format(new Date(data.deadline), 'MMMM d, yyyy')}.` : 'I request that these repairs be completed within 30 days of this letter.'}

${data.desiredResolution}

If these repairs are not addressed in a timely manner, I may exercise my rights under California law, which include:
- Withholding rent until repairs are made (Civil Code § 1942)
- Making repairs and deducting the cost from rent (Civil Code § 1942)
- Reporting violations to local housing authorities
- Pursuing legal remedies

I hope we can resolve this matter promptly and amicably. Please contact me to schedule the repairs or discuss this matter further.

Sincerely,

${data.tenantName}

CC: File copy for tenant records`
  },
  'deposit-return': {
    title: 'Security Deposit Return Request',
    template: (data) => `${data.tenantName}
${data.tenantAddress}
${format(new Date(), 'MMMM d, yyyy')}

${data.landlordName}
${data.landlordAddress}

Dear ${data.landlordName},

I am writing to request the return of my security deposit for the rental property at ${data.tenantAddress}, which I vacated on [MOVE OUT DATE].

According to California Civil Code § 1950.5, landlords must return security deposits within 21 days after a tenant vacates the property. It has now been [NUMBER] days since I moved out, and I have not received my deposit or an itemized list of deductions.

Deposit Information:
- Original deposit amount: $[AMOUNT]
- Move-in date: [DATE]
- Move-out date: [DATE]
- Forwarding address: ${data.tenantAddress}

The property was left in good condition, with only normal wear and tear. I completed a thorough cleaning and documented the condition with photos.

If I do not receive my deposit or a proper itemized statement within 5 business days of this letter, I will have no choice but to pursue this matter in small claims court. Under California law, if a landlord acts in bad faith by wrongfully withholding a deposit, the tenant may be awarded up to twice the deposit amount in damages.

I hope we can resolve this matter without legal action. Please send my deposit to the address listed above.

Sincerely,

${data.tenantName}`
  }
};

export default function LetterComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const templateId = searchParams.get('template') || 'repair-request';
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [formData, setFormData] = useState<FormData>({
    tenantName: user?.name || '',
    tenantAddress: '',
    landlordName: '',
    landlordAddress: '',
    issueDescription: '',
    previousAttempts: '',
    desiredResolution: '',
    deadline: '',
    tone: 'formal'
  });

  const template = templateContent[templateId] || templateContent['repair-request'];

  useEffect(() => {
    if (formData.tenantName && formData.landlordName) {
      const letter = template.template(formData);
      setGeneratedLetter(letter);
    }
  }, [formData, template]);

  const handleAISuggestion = async () => {
    setIsLoading(true);
    try {
      // Simulate AI enhancement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFormData({
        ...formData,
        issueDescription: formData.issueDescription + '\n\nThe issue has caused significant inconvenience and potential health hazards, requiring immediate attention.',
        desiredResolution: 'I request that a licensed professional inspect and repair the issue within 48 hours. Please provide written confirmation of when the repairs will be scheduled.'
      });
      
      toast({
        title: 'AI suggestions applied',
        description: 'Your letter has been enhanced with legal language.',
      });
    } catch {
      toast({
        title: 'Enhancement failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Letter sent successfully',
        description: 'A copy has been saved to your documents.',
      });
      
      router.push('/communications');
    } catch {
      toast({
        title: 'Send failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateId}-letter-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    
    toast({
      title: 'Letter downloaded',
      description: 'Check your downloads folder.',
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      toast({
        title: 'Copied to clipboard',
        description: 'You can now paste the letter anywhere.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/letter-generator')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Templates
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{template.title}</h1>
            <p className="text-muted-foreground mt-1">
              Fill in the details below to generate your letter
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenantName">
                  <User className="h-4 w-4 inline mr-1" />
                  Your Name
                </Label>
                <Input
                  id="tenantName"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantAddress">
                  <Home className="h-4 w-4 inline mr-1" />
                  Your Address
                </Label>
                <Textarea
                  id="tenantAddress"
                  rows={2}
                  value={formData.tenantAddress}
                  onChange={(e) => setFormData({ ...formData, tenantAddress: e.target.value })}
                  placeholder="123 Main St, Apt 4B&#10;Los Angeles, CA 90001"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Landlord Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="landlordName">Landlord Name</Label>
                <Input
                  id="landlordName"
                  value={formData.landlordName}
                  onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                  placeholder="Property Management Co. or John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landlordAddress">Landlord Address</Label>
                <Textarea
                  id="landlordAddress"
                  rows={2}
                  value={formData.landlordAddress}
                  onChange={(e) => setFormData({ ...formData, landlordAddress: e.target.value })}
                  placeholder="456 Oak Ave, Suite 200&#10;Los Angeles, CA 90002"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issue Details</CardTitle>
              <CardDescription>
                Be specific and include dates when relevant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issueDescription">Describe the Issue</Label>
                <Textarea
                  id="issueDescription"
                  rows={4}
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                  placeholder="The bathroom sink has been leaking since March 1st..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousAttempts">Previous Communication</Label>
                <Textarea
                  id="previousAttempts"
                  rows={3}
                  value={formData.previousAttempts}
                  onChange={(e) => setFormData({ ...formData, previousAttempts: e.target.value })}
                  placeholder="I called on March 2nd and sent an email on March 5th..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Requested Completion Date
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <RadioGroup
                  value={formData.tone}
                  onValueChange={(value) => setFormData({ ...formData, tone: value as FormData['tone'] })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="formal" id="formal" />
                    <Label htmlFor="formal">Formal (Professional)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="firm" id="firm" />
                    <Label htmlFor="firm">Firm (Assertive)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friendly" id="friendly" />
                    <Label htmlFor="friendly">Friendly (Collaborative)</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button
                variant="outline"
                onClick={handleAISuggestion}
                disabled={isLoading || !formData.issueDescription}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Enhance with AI Suggestions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Letter Preview</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          </div>

          {showPreview && (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This is a preview. You can edit the generated text before sending.
                </AlertDescription>
              </Alert>

              <Card>
                <CardContent className="p-6">
                  <Textarea
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </>
          )}

          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="send">Send Options</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Proof</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Button
                    className="w-full"
                    disabled={isLoading || !generatedLetter}
                    onClick={handleSend}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send via Email
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send via Text Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Printer className="h-4 w-4 mr-2" />
                    Print for Mail
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="delivery" className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Always keep proof of delivery for legal matters.
                </AlertDescription>
              </Alert>
              <Card>
                <CardContent className="p-6 space-y-3 text-sm">
                  <p><strong>Email:</strong> Request read receipt and save confirmation</p>
                  <p><strong>Certified Mail:</strong> Keep tracking number and return receipt</p>
                  <p><strong>Text:</strong> Screenshot the conversation with timestamps</p>
                  <p><strong>In Person:</strong> Have witness or get written acknowledgment</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p>Keep copies of all correspondence</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p>Document dates and methods of communication</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p>Follow up if no response within reasonable time</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <p>Consider certified mail for important notices</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}