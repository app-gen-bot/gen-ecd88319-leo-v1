'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { getMockPetsByOwner } from '@/lib/mock-data';
import { Pet } from '@/types';
import { ArrowLeft, Send, Paperclip, X } from 'lucide-react';
import { toast } from '@/lib/use-toast';

export default function NewMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Form data
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [relatedPet, setRelatedPet] = useState<string>('none');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        const userPets = getMockPetsByOwner(user.id);
        setPets(userPets);
        
        // Check if pet was specified in URL
        const petId = searchParams.get('pet');
        if (petId && userPets.find(p => p.id === petId)) {
          setRelatedPet(petId);
        }
        
        setIsLoading(false);
      }, 500);
    }
  }, [user, searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 10MB limit`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !content.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both subject and message content.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Message sent!',
        description: 'Your message has been sent to the clinic.',
      });
      
      router.push('/client/messages/inbox');
    } catch (error) {
      toast({
        title: 'Failed to send',
        description: 'Unable to send your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/client/messages/inbox">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inbox
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">New Message</h1>
        <p className="text-muted-foreground">Send a message to your veterinary clinic</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>
              We typically respond within 24 hours during business days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="What is this message about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Related Pet */}
            <div className="space-y-2">
              <Label htmlFor="pet">Related Pet (Optional)</Label>
              <Select value={relatedPet} onValueChange={setRelatedPet}>
                <SelectTrigger id="pet">
                  <SelectValue placeholder="Select a pet if this message is pet-specific" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {pets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Message *</Label>
              <Textarea
                id="content"
                placeholder="Type your message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                {content.length}/2000 characters
              </p>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach Files
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Max 10MB per file
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/client/messages/inbox">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Message'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Tips */}
      <Card className="mt-6 bg-muted">
        <CardHeader>
          <CardTitle className="text-base">Message Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• For urgent matters, please call us directly at (555) 123-4567</p>
          <p>• Include as much detail as possible about your pet's symptoms</p>
          <p>• Attach photos if they help illustrate your concern</p>
          <p>• We'll respond within 24 hours during business days</p>
        </CardContent>
      </Card>
    </div>
  );
}