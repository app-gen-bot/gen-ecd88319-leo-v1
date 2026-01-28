'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Camera,
  Video,
  Image,
  FileText,
  Calendar,
  MapPin,
  Tag,
  Trash2,
  Download,
  Share2,
  Eye,
  Search,
  Plus,
  Grid,
  List,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Documentation {
  id: string;
  type: 'photo' | 'video' | 'document';
  title: string;
  description: string;
  date: Date;
  location?: string;
  tags: string[];
  thumbnail?: string;
  size?: string;
}

// Mock data
const mockDocumentation: Documentation[] = [
  {
    id: '1',
    type: 'photo',
    title: 'Broken Window in Bedroom',
    description: 'Large crack in bedroom window, reported to landlord on 03/15',
    date: new Date('2024-03-15'),
    location: 'Bedroom',
    tags: ['damage', 'repair-needed', 'safety'],
    thumbnail: '/api/placeholder/200/150',
    size: '2.4 MB'
  },
  {
    id: '2',
    type: 'video',
    title: 'Water Leak Under Kitchen Sink',
    description: 'Active water leak causing damage to cabinet',
    date: new Date('2024-03-10'),
    location: 'Kitchen',
    tags: ['plumbing', 'urgent', 'water-damage'],
    thumbnail: '/api/placeholder/200/150',
    size: '15.2 MB'
  },
  {
    id: '3',
    type: 'document',
    title: 'Repair Request Email',
    description: 'Email sent to landlord requesting window repair',
    date: new Date('2024-03-16'),
    tags: ['correspondence', 'repair-request'],
    size: '124 KB'
  },
  {
    id: '4',
    type: 'photo',
    title: 'Mold in Bathroom Corner',
    description: 'Black mold growing in bathroom ceiling corner',
    date: new Date('2024-03-05'),
    location: 'Bathroom',
    tags: ['health-hazard', 'mold', 'urgent'],
    thumbnail: '/api/placeholder/200/150',
    size: '3.1 MB'
  }
];

export default function DocumentationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [documentation, setDocumentation] = useState<Documentation[]>(mockDocumentation);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredDocs = documentation.filter(doc => {
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleDelete = (id: string) => {
    setDocumentation(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: 'Documentation deleted',
      description: 'The item has been removed from your documentation.',
    });
  };

  const handleShare = (_doc: Documentation) => {
    toast({
      title: 'Sharing options',
      description: 'Share functionality will be available soon.',
    });
  };

  const handleDownload = (doc: Documentation) => {
    toast({
      title: 'Downloading',
      description: `${doc.title} is being downloaded.`,
    });
  };

  const handlePreview = (doc: Documentation) => {
    setSelectedDoc(doc);
    setShowPreview(true);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'photo': return 'text-blue-600 bg-blue-100';
      case 'video': return 'text-purple-600 bg-purple-100';
      case 'document': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const DocumentCard = ({ doc }: { doc: Documentation }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${getTypeColor(doc.type)}`}>
            {getIcon(doc.type)}
          </div>
          <Badge variant="secondary" className="text-xs">
            {doc.size}
          </Badge>
        </div>
        <CardTitle className="text-base mt-3 line-clamp-1">{doc.title}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {doc.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {doc.thumbnail && (
          <div className="relative mb-3 overflow-hidden rounded-lg bg-muted aspect-video">
            <img
              src={doc.thumbnail}
              alt={doc.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {doc.date.toLocaleDateString()}
          </div>
          
          {doc.location && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {doc.location}
            </div>
          )}
          
          {doc.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
              {doc.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handlePreview(doc);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleShare(doc);
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(doc);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(doc.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const DocumentListItem = ({ doc }: { doc: Documentation }) => (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className={`p-2 rounded-lg ${getTypeColor(doc.type)}`}>
            {getIcon(doc.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{doc.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{doc.description}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {doc.date.toLocaleDateString()}
              </span>
              {doc.location && (
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {doc.location}
                </span>
              )}
              <Badge variant="secondary" className="text-xs">
                {doc.size}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePreview(doc)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare(doc)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(doc)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(doc.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Smart Documentation</h1>
            <p className="text-muted-foreground mt-2">
              Capture and organize evidence to protect your rights
            </p>
          </div>
          <Button onClick={() => router.push('/documentation/capture')} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Capture Evidence
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{documentation.length}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {documentation.filter(d => d.type === 'photo').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Photos</p>
                </div>
                <Image className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {documentation.filter(d => d.type === 'video').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Videos</p>
                </div>
                <Video className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {documentation.filter(d => d.tags.includes('urgent')).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Urgent Items</p>
                </div>
                <Tag className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="photo">Photos</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Documentation Grid/List */}
        {filteredDocs.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documentation found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Start capturing evidence to protect your rights'}
              </p>
              {!searchQuery && filterType === 'all' && (
                <Button onClick={() => router.push('/documentation/capture')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Capture Your First Evidence
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocs.map((doc) => (
              <DocumentListItem key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.title}</DialogTitle>
            <DialogDescription>{selectedDoc?.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedDoc?.thumbnail && (
              <img
                src={selectedDoc.thumbnail}
                alt={selectedDoc.title}
                className="w-full rounded-lg"
              />
            )}
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{selectedDoc?.date.toLocaleString()}</span>
              </div>
              {selectedDoc?.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{selectedDoc.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {selectedDoc?.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button className="flex-1" onClick={() => selectedDoc && handleDownload(selectedDoc)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => selectedDoc && handleShare(selectedDoc)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}