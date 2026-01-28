'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Toggle } from '@/components/ui/toggle';
import {
  ArrowLeft,
  Send,
  Paperclip,
  FileText,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Loader2,
  X,
  Info,
  Sparkles,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link
} from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export default function CommunicationsComposePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState<'email' | 'text'>('email');
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    template: '',
    sendLater: false,
    sendDate: '',
    sendTime: ''
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const templates = [
    { id: 'none', name: 'No template' },
    { id: 'repair-followup', name: 'Repair Follow-up' },
    { id: 'rent-receipt', name: 'Request Rent Receipt' },
    { id: 'notice-confirm', name: 'Confirm Notice Receipt' },
    { id: 'schedule-inspection', name: 'Schedule Inspection' }
  ];

  const handleTemplateChange = (templateId: string) => {
    setFormData({ ...formData, template: templateId });
    
    // Load template content
    if (templateId === 'repair-followup') {
      setFormData({
        ...formData,
        template: templateId,
        subject: 'Follow-up: Repair Request',
        message: `Dear [Landlord Name],

I am following up on my repair request dated [DATE] regarding [ISSUE].

It has been [NUMBER] days since my initial request, and the issue has not been addressed. As per California law, repairs must be completed within a reasonable time.

Please provide an update on when these repairs will be completed.

Thank you,
[Your Name]`
      });
    }
  };

  const handleAIEnhance = async () => {
    if (!formData.message) {
      toast({
        title: 'Please write a message first',
        description: 'AI needs some content to enhance',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFormData({
        ...formData,
        message: formData.message + '\n\nI am documenting this communication for my records as per my rights under California tenant law.'
      });
      
      toast({
        title: 'Message enhanced',
        description: 'AI has improved your message with legal language.',
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
    if (!formData.to || !formData.message) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Message sent',
        description: 'Your message has been sent and saved to your records.',
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map(file => ({
        id: Date.now().toString() + file.name,
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/communications')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Communications
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">New Message</h1>
          <p className="text-muted-foreground mt-1">
            Send a message to your landlord with automatic record keeping
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            All messages are automatically saved to your communication history for legal documentation.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Message Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={messageType} onValueChange={(value) => setMessageType(value as 'email' | 'text')}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="flex items-center cursor-pointer">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="flex items-center cursor-pointer">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Text Message
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                placeholder={messageType === 'email' ? 'landlord@example.com' : '(555) 123-4567'}
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              />
            </div>

            {messageType === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Re: Apartment maintenance"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="template">Use Template</Label>
              <Select value={formData.template} onValueChange={handleTemplateChange}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">Message *</Label>
                {messageType === 'email' && (
                  <div className="flex items-center gap-1">
                    <Toggle size="sm" aria-label="Toggle bold">
                      <Bold className="h-3 w-3" />
                    </Toggle>
                    <Toggle size="sm" aria-label="Toggle italic">
                      <Italic className="h-3 w-3" />
                    </Toggle>
                    <Toggle size="sm" aria-label="Toggle underline">
                      <Underline className="h-3 w-3" />
                    </Toggle>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Toggle size="sm" aria-label="Toggle bullet list">
                      <List className="h-3 w-3" />
                    </Toggle>
                    <Toggle size="sm" aria-label="Toggle numbered list">
                      <ListOrdered className="h-3 w-3" />
                    </Toggle>
                    <Toggle size="sm" aria-label="Insert link">
                      <Link className="h-3 w-3" />
                    </Toggle>
                  </div>
                )}
              </div>
              <Textarea
                id="message"
                rows={10}
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={messageType === 'email' ? 'font-sans' : 'font-mono'}
              />
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIEnhance}
                  disabled={isLoading || !formData.message}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enhance with AI
                </Button>
                <p className="text-xs text-muted-foreground">
                  {formData.message.length} characters
                </p>
              </div>
            </div>

            {messageType === 'email' && (
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to attach files
                    </span>
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{attachment.name}</span>
                          <span className="text-xs text-muted-foreground">({attachment.size})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendLater"
                checked={formData.sendLater}
                onChange={(e) => setFormData({ ...formData, sendLater: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="sendLater" className="text-sm font-normal cursor-pointer">
                Schedule for later
              </Label>
            </div>

            {formData.sendLater && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="sendDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date
                  </Label>
                  <Input
                    id="sendDate"
                    type="date"
                    value={formData.sendDate}
                    onChange={(e) => setFormData({ ...formData, sendDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sendTime">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Time
                  </Label>
                  <Input
                    id="sendTime"
                    type="time"
                    value={formData.sendTime}
                    onChange={(e) => setFormData({ ...formData, sendTime: e.target.value })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/communications')}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {formData.sendLater ? 'Schedule' : 'Send Now'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}