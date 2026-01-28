'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  Camera,
  Video,
  Upload,
  X,
  ArrowLeft,
  Info,
  MapPin,
  Calendar,
  Tag,
  Save,
  Loader2,
  FileText,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';

interface CaptureData {
  type: 'photo' | 'video' | 'document';
  file: File | null;
  title: string;
  description: string;
  location: string;
  tags: string[];
  date: Date;
}

const commonTags = [
  'damage',
  'repair-needed',
  'safety',
  'health-hazard',
  'mold',
  'water-damage',
  'electrical',
  'plumbing',
  'heating',
  'pest',
  'noise',
  'security',
  'correspondence',
  'urgent'
];

const locations = [
  'Living Room',
  'Bedroom',
  'Bathroom',
  'Kitchen',
  'Hallway',
  'Balcony',
  'Garage',
  'Basement',
  'Attic',
  'Exterior',
  'Common Area',
  'Other'
];

export default function DocumentationCapturePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captureData, setCaptureData] = useState<CaptureData>({
    type: 'photo',
    file: null,
    title: '',
    description: '',
    location: '',
    tags: [],
    date: new Date()
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = {
      photo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/quicktime', 'video/webm'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    };

    const isValidType = validTypes[captureData.type].includes(file.type);
    if (!isValidType) {
      toast({
        title: 'Invalid file type',
        description: `Please select a valid ${captureData.type} file.`,
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 50MB.',
        variant: 'destructive'
      });
      return;
    }

    setCaptureData({ ...captureData, file });

    // Generate preview for images
    if (captureData.type === 'photo' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleTagToggle = (tag: string) => {
    setCaptureData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddCustomTag = () => {
    if (customTag && !captureData.tags.includes(customTag)) {
      setCaptureData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag]
      }));
      setCustomTag('');
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!captureData.file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive'
      });
      return;
    }

    if (!captureData.title) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your documentation.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Documentation saved',
        description: 'Your evidence has been securely stored.',
      });

      router.push('/documentation');
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAcceptTypes = () => {
    switch (captureData.type) {
      case 'photo':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt';
      default:
        return '*';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/documentation')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Documentation
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Capture Evidence</h1>
          <p className="text-muted-foreground mt-2">
            Document issues to protect your tenant rights
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tips for effective documentation:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Take clear, well-lit photos from multiple angles</li>
              <li>• Include timestamps and location details</li>
              <li>• Document the issue before and after any changes</li>
              <li>• Keep all correspondence with your landlord</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Select Evidence Type</CardTitle>
            <CardDescription>Choose the type of evidence you want to capture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={captureData.type === 'photo' ? 'default' : 'outline'}
                className="h-24 flex-col"
                onClick={() => setCaptureData({ ...captureData, type: 'photo', file: null })}
              >
                <Camera className="h-8 w-8 mb-2" />
                Photo
              </Button>
              <Button
                variant={captureData.type === 'video' ? 'default' : 'outline'}
                className="h-24 flex-col"
                onClick={() => setCaptureData({ ...captureData, type: 'video', file: null })}
              >
                <Video className="h-8 w-8 mb-2" />
                Video
              </Button>
              <Button
                variant={captureData.type === 'document' ? 'default' : 'outline'}
                className="h-24 flex-col"
                onClick={() => setCaptureData({ ...captureData, type: 'document', file: null })}
              >
                <FileText className="h-8 w-8 mb-2" />
                Document
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload {captureData.type === 'photo' ? 'Photo' : captureData.type === 'video' ? 'Video' : 'Document'}</CardTitle>
            <CardDescription>
              Select or drag and drop your {captureData.type} file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {captureData.file ? (
                  <div className="space-y-4">
                    {preview && captureData.type === 'photo' ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="flex justify-center">
                        {captureData.type === 'photo' && <ImageIcon className="h-16 w-16 text-muted-foreground" />}
                        {captureData.type === 'video' && <Video className="h-16 w-16 text-muted-foreground" />}
                        {captureData.type === 'document' && <FileText className="h-16 w-16 text-muted-foreground" />}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{captureData.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(captureData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCaptureData({ ...captureData, file: null });
                        setPreview(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {captureData.type === 'photo' && 'JPG, PNG, GIF up to 50MB'}
                      {captureData.type === 'video' && 'MP4, MOV, WebM up to 50MB'}
                      {captureData.type === 'document' && 'PDF, DOC, DOCX, TXT up to 50MB'}
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptTypes()}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Provide information about this evidence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Water damage in bathroom ceiling"
                value={captureData.title}
                onChange={(e) => setCaptureData({ ...captureData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                rows={4}
                value={captureData.description}
                onChange={(e) => setCaptureData({ ...captureData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </Label>
                <Select
                  value={captureData.location}
                  onValueChange={(value) => setCaptureData({ ...captureData, location: value })}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date &amp; Time
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={captureData.date.toISOString().slice(0, 16)}
                  onChange={(e) => setCaptureData({ ...captureData, date: new Date(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                <Tag className="h-4 w-4 inline mr-1" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={captureData.tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {captureData.tags.includes(tag) && <CheckCircle className="h-3 w-3 mr-1" />}
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                />
                <Button
                  variant="outline"
                  onClick={handleAddCustomTag}
                  disabled={!customTag}
                >
                  Add
                </Button>
              </div>
              {captureData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {captureData.tags.filter(tag => !commonTags.includes(tag)).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/documentation')}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !captureData.file || !captureData.title}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Documentation
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}