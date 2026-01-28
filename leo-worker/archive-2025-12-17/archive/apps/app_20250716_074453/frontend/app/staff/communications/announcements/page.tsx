'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { format } from 'date-fns';
import { 
  Megaphone, 
  Plus, 
  AlertCircle, 
  Info, 
  CheckCircle2,
  Calendar,
  User,
  Eye,
  Pin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'info' | 'warning' | 'urgent';
  isPinned: boolean;
  createdBy: string;
  createdAt: string;
  viewedBy: string[];
  acknowledgedBy: string[];
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Staff Meeting - Thursday 2 PM',
    content: 'Monthly staff meeting has been moved to Thursday at 2 PM in the main conference room. Please review the agenda sent via email.',
    priority: 'info',
    isPinned: true,
    createdBy: 'Dr. Sarah Smith',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    viewedBy: ['1', '2', '3'],
    acknowledgedBy: ['1', '2'],
  },
  {
    id: '2',
    title: 'Emergency Protocol Update',
    content: 'New emergency protocols are now in effect. All staff must review the updated procedures document in the shared drive and acknowledge reading.',
    priority: 'urgent',
    isPinned: false,
    createdBy: 'Dr. Mike Johnson',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    viewedBy: ['1', '2', '3', '4'],
    acknowledgedBy: ['1', '3'],
  },
  {
    id: '3',
    title: 'Holiday Schedule',
    content: 'The clinic will be closed on December 25th and 26th. Emergency on-call schedule has been posted. Please confirm your availability.',
    priority: 'warning',
    isPinned: false,
    createdBy: 'Office Manager',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    viewedBy: ['1', '2', '3', '4', '5'],
    acknowledgedBy: ['1', '2', '3', '4'],
  },
];

const priorityConfig = {
  info: {
    label: 'Info',
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  warning: {
    label: 'Important',
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  urgent: {
    label: 'Urgent',
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false);
  const isManager = user?.role === 'practice_manager' || user?.role === 'veterinarian';

  // New announcement form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'info' as Announcement['priority'],
    isPinned: false,
  });

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const announcement: Announcement = {
      id: Date.now().toString(),
      ...newAnnouncement,
      createdBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      createdAt: new Date().toISOString(),
      viewedBy: [],
      acknowledgedBy: [],
    };

    setAnnouncements(prev => [announcement, ...prev]);
    setIsNewAnnouncementOpen(false);
    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'info',
      isPinned: false,
    });

    toast({
      title: 'Announcement posted',
      description: 'Your announcement has been shared with the team.',
    });
  };

  const handleAcknowledge = (announcementId: string) => {
    if (!user) return;

    setAnnouncements(prev => prev.map(ann => 
      ann.id === announcementId 
        ? {
            ...ann,
            acknowledgedBy: ann.acknowledgedBy.includes(user.id) 
              ? ann.acknowledgedBy 
              : [...ann.acknowledgedBy, user.id],
            viewedBy: ann.viewedBy.includes(user.id) 
              ? ann.viewedBy 
              : [...ann.viewedBy, user.id],
          }
        : ann
    ));

    toast({
      title: 'Acknowledged',
      description: 'You have acknowledged this announcement.',
    });
  };

  const handleTogglePin = (announcementId: string) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === announcementId 
        ? { ...ann, isPinned: !ann.isPinned }
        : ann
    ));
  };

  // Mark as viewed when component mounts
  useState(() => {
    if (user) {
      setAnnouncements(prev => prev.map(ann => ({
        ...ann,
        viewedBy: ann.viewedBy.includes(user.id) 
          ? ann.viewedBy 
          : [...ann.viewedBy, user.id],
      })));
    }
  });

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Important updates and clinic information</p>
        </div>
        {isManager && (
          <Dialog open={isNewAnnouncementOpen} onOpenChange={setIsNewAnnouncementOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Share important information with the team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter announcement title..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your announcement..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <RadioGroup
                    value={newAnnouncement.priority}
                    onValueChange={(value) => setNewAnnouncement(prev => ({ 
                      ...prev, 
                      priority: value as Announcement['priority'] 
                    }))}
                  >
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <RadioGroupItem value={key} id={key} />
                        <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                          <config.icon className={cn("h-4 w-4", config.color)} />
                          {config.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pin"
                    checked={newAnnouncement.isPinned}
                    onChange={(e) => setNewAnnouncement(prev => ({ 
                      ...prev, 
                      isPinned: e.target.checked 
                    }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="pin" className="cursor-pointer">
                    Pin announcement to top
                  </Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewAnnouncementOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAnnouncement}>
                    Post Announcement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {sortedAnnouncements.map((announcement) => {
          const config = priorityConfig[announcement.priority];
          const Icon = config.icon;
          const hasAcknowledged = user && announcement.acknowledgedBy.includes(user.id);

          return (
            <Card
              key={announcement.id}
              className={cn(
                "transition-colors",
                config.borderColor,
                announcement.priority === 'urgent' && !hasAcknowledged && "border-2"
              )}
            >
              <CardHeader className={cn("pb-3", config.bgColor)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className={cn("h-5 w-5 mt-0.5", config.color)} />
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {announcement.title}
                        </CardTitle>
                        {announcement.isPinned && (
                          <Pin className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {announcement.createdBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {announcement.viewedBy.length} viewed
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={announcement.priority === 'urgent' ? 'destructive' : 'secondary'}>
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed">{announcement.content}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    {announcement.acknowledgedBy.length} of {announcement.viewedBy.length} acknowledged
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isManager && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePin(announcement.id)}
                      >
                        <Pin className={cn(
                          "h-4 w-4",
                          announcement.isPinned && "fill-current"
                        )} />
                      </Button>
                    )}
                    
                    {!hasAcknowledged && (
                      <Button
                        size="sm"
                        variant={announcement.priority === 'urgent' ? 'default' : 'outline'}
                        onClick={() => handleAcknowledge(announcement.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Acknowledge
                      </Button>
                    )}
                    
                    {hasAcknowledged && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}