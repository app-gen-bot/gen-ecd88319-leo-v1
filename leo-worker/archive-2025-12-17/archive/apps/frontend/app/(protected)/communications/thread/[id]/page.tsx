'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Download,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  MoreVertical,
  CheckCheck,
  Mail,
  MessageSquare,
  FileText,
  Image,
  AlertCircle,
  Printer
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface Message {
  id: string;
  subject: string;
  content: string;
  from: string;
  to: string;
  date: Date;
  type: 'email' | 'text' | 'letter' | 'note';
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
  inReplyTo?: string;
}

interface Thread {
  id: string;
  subject: string;
  participants: string[];
  messages: Message[];
  starred: boolean;
  important: boolean;
  tags: string[];
}

// Mock thread data
const mockThread: Thread = {
  id: '1',
  subject: 'Repair Request - Kitchen Sink',
  participants: ['You', 'John Smith (Landlord)'],
  starred: false,
  important: true,
  tags: ['repairs', 'kitchen', 'plumbing'],
  messages: [
    {
      id: '1',
      subject: 'Repair Request - Kitchen Sink',
      content: `Dear Mr. Smith,

I am writing to formally request repairs to the kitchen sink in my apartment unit #4B at 123 Main Street.

The kitchen sink has been leaking from the base of the faucet for the past week, causing water damage to the cabinet below. The leak has progressively gotten worse, and I am now having to place a bucket underneath to catch the water.

This issue is affecting my ability to use the kitchen properly and I'm concerned about potential mold growth from the moisture. As per California Civil Code § 1941.1, this falls under necessary repairs to maintain habitability.

I have attached photos documenting the leak and the water damage. Please arrange for a plumber to fix this issue as soon as possible.

I am available for the repair work on weekdays after 5 PM or anytime on weekends. Please let me know when you can schedule the repairs.

Thank you for your prompt attention to this matter.

Best regards,
John Doe`,
      from: 'You',
      to: 'John Smith (Landlord)',
      date: new Date('2024-03-15T10:30:00'),
      type: 'email',
      attachments: [
        { name: 'sink-leak-photo-1.jpg', size: '2.4 MB', type: 'image/jpeg' },
        { name: 'sink-leak-photo-2.jpg', size: '1.8 MB', type: 'image/jpeg' },
        { name: 'water-damage.jpg', size: '3.1 MB', type: 'image/jpeg' }
      ]
    },
    {
      id: '2',
      subject: 'Re: Repair Request - Kitchen Sink',
      content: `Hi John,

I received your repair request and have reviewed the photos. I agree this needs immediate attention.

I've contacted our regular plumber and he can come by this Thursday (March 18) at 2 PM. Will that work for you? If not, he also has availability on Saturday morning.

Please confirm which time works best and ensure someone is home to provide access.

Thanks,
John Smith
ABC Property Management`,
      from: 'John Smith (Landlord)',
      to: 'You',
      date: new Date('2024-03-16T14:15:00'),
      type: 'email',
      inReplyTo: '1'
    },
    {
      id: '3',
      subject: 'Re: Repair Request - Kitchen Sink',
      content: `Hi Mr. Smith,

Thank you for the quick response. Thursday at 2 PM won't work as I'll be at work, but Saturday morning would be perfect.

What time on Saturday? I'll make sure to be home and can clear my morning schedule.

Also, will the plumber have the necessary parts, or should I pick anything up beforehand?

Thanks,
John Doe`,
      from: 'You',
      to: 'John Smith (Landlord)',
      date: new Date('2024-03-16T16:45:00'),
      type: 'email',
      inReplyTo: '2'
    },
    {
      id: '4',
      subject: 'Re: Repair Request - Kitchen Sink',
      content: `The plumber will be there Saturday at 9 AM. He'll bring all necessary parts - you don't need to get anything.

His name is Mike from Premier Plumbing. He'll call you 30 minutes before arrival.

- John`,
      from: 'John Smith (Landlord)',
      to: 'You',
      date: new Date('2024-03-16T17:30:00'),
      type: 'text',
      inReplyTo: '3'
    },
    {
      id: '5',
      subject: 'Repair Completed - Kitchen Sink',
      content: `Hi Mr. Smith,

I wanted to let you know that Mike from Premier Plumbing came by this morning as scheduled and successfully repaired the kitchen sink. He replaced the faucet cartridge and fixed the leak completely.

He was very professional and cleaned up after the work. The sink is now working perfectly with no leaks.

Thank you for arranging this repair so quickly. I really appreciate your responsiveness to this issue.

Best regards,
John Doe`,
      from: 'You',
      to: 'John Smith (Landlord)',
      date: new Date('2024-03-20T11:00:00'),
      type: 'email',
      attachments: [
        { name: 'repair-completed.jpg', size: '1.2 MB', type: 'image/jpeg' }
      ]
    }
  ]
};

export default function ThreadPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [thread, setThread] = useState<Thread | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // In real app, fetch thread by ID
    setThread(mockThread);
  }, [params.id]);

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;

    setIsSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Reply sent',
        description: 'Your message has been sent and saved.',
      });
      
      setReplyContent('');
      setIsReplying(false);
    } catch {
      toast({
        title: 'Failed to send',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleArchive = () => {
    toast({
      title: 'Thread archived',
      description: 'This conversation has been archived.',
    });
    router.push('/communications');
  };

  const toggleStar = () => {
    if (thread) {
      setThread({ ...thread, starred: !thread.starred });
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'text': return <MessageSquare className="h-4 w-4" />;
      case 'letter': return <Send className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  if (!thread) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading thread...</p>
        </div>
      </div>
    );
  }

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
        {/* Thread Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{thread.subject}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{thread.participants.join(', ')}</span>
                  <span>•</span>
                  <span>{thread.messages.length} messages</span>
                </div>
                <div className="flex gap-2">
                  {thread.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                  {thread.important && (
                    <Badge variant="destructive">Important</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleStar}
                >
                  <Star className={`h-4 w-4 ${thread.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Thread
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Thread
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Forward className="h-4 w-4 mr-2" />
                      Forward All
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Thread
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <div className="space-y-4">
          {thread.messages.map((message, index) => (
            <Card key={message.id} className={message.from === 'You' ? 'ml-12' : 'mr-12'}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {message.from === 'You' ? 'ME' : message.from.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{message.from}</p>
                        <Badge variant="outline" className="text-xs">
                          {getMessageIcon(message.type)}
                          <span className="ml-1">{message.type}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        To: {message.to} • {format(message.date, 'MMM d, yyyy \'at\' h:mm a')}
                      </p>
                    </div>
                  </div>
                  {message.from === 'You' && (
                    <CheckCheck className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                </div>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Attachments:</p>
                    {message.attachments.map((attachment, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          {attachment.type.startsWith('image/') ? (
                            <Image className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">{attachment.name}</span>
                          <span className="text-xs text-muted-foreground">({attachment.size})</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {index === thread.messages.length - 1 && (
                <Separator />
              )}
            </Card>
          ))}
        </div>

        {/* Reply Section */}
        {!isReplying ? (
          <div className="flex justify-center">
            <Button onClick={() => setIsReplying(true)}>
              <Reply className="h-4 w-4 mr-2" />
              Reply to Thread
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <div className="space-x-2">
                  <Button variant="outline">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                  <Button onClick={handleSendReply} disabled={isSending || !replyContent.trim()}>
                    {isSending ? 'Sending...' : 'Send Reply'}
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legal Reminder */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Documentation Tip:</strong> This thread is automatically saved for your records. Email threads with your landlord can serve as legal documentation if needed.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}