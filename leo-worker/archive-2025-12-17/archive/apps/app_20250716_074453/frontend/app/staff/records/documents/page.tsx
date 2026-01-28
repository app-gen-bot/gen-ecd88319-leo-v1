'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DocumentTextIcon,
  PhotoIcon,
  DocumentDuplicateIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';

// Mock document data
const mockDocuments = [
  {
    id: '1',
    name: 'Max - Vaccination Certificate 2024',
    type: 'certificate',
    category: 'Vaccination',
    petName: 'Max',
    petId: '1',
    ownerName: 'John Smith',
    uploadedBy: 'Dr. Wilson',
    uploadedDate: '2024-01-15T10:00:00',
    size: '245 KB',
    fileType: 'PDF',
  },
  {
    id: '2',
    name: 'Luna - Chest X-Ray',
    type: 'imaging',
    category: 'X-Ray',
    petName: 'Luna',
    petId: '2',
    ownerName: 'Sarah Johnson',
    uploadedBy: 'Dr. Thompson',
    uploadedDate: '2024-01-14T14:30:00',
    size: '1.2 MB',
    fileType: 'DICOM',
  },
  {
    id: '3',
    name: 'Charlie - Lab Report CBC',
    type: 'lab',
    category: 'Lab Results',
    petName: 'Charlie',
    petId: '3',
    ownerName: 'Mike Davis',
    uploadedBy: 'Lab Tech',
    uploadedDate: '2024-01-13T09:00:00',
    size: '156 KB',
    fileType: 'PDF',
  },
  {
    id: '4',
    name: 'Bella - Surgical Consent Form',
    type: 'consent',
    category: 'Legal',
    petName: 'Bella',
    petId: '4',
    ownerName: 'Emily Brown',
    uploadedBy: 'Front Desk',
    uploadedDate: '2024-01-12T11:00:00',
    size: '89 KB',
    fileType: 'PDF',
  },
];

const documentCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'lab', label: 'Lab Results' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'legal', label: 'Legal Documents' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

export default function DocumentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dragActive, setDragActive] = useState(false);

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = searchTerm === '' ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      doc.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      const files = Array.from(e.dataTransfer.files);
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
      });
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'imaging':
        return <PhotoIcon className="h-10 w-10 text-purple-500" />;
      case 'lab':
        return <DocumentDuplicateIcon className="h-10 w-10 text-blue-500" />;
      default:
        return <DocumentTextIcon className="h-10 w-10 text-green-500" />;
    }
  };

  const getCategoryBadgeVariant = (category: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (category.toLowerCase()) {
      case 'vaccination':
        return 'default';
      case 'lab results':
        return 'secondary';
      case 'imaging':
      case 'x-ray':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Document Management</h1>
            <p className="text-muted-foreground">Upload and manage medical documents</p>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ArrowUpTrayIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Drop files here or click to upload</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats: PDF, JPEG, PNG, DICOM • Max size: 10MB
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline">
                  Choose Files
                </Button>
                <Button variant="outline">
                  Scan Document
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {getDocumentIcon(document.type)}
                  <div className="space-y-2 w-full">
                    <h3 className="font-semibold text-sm truncate px-2" title={document.name}>
                      {document.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant={getCategoryBadgeVariant(document.category)}>
                        {document.category}
                      </Badge>
                      <Badge variant="outline">{document.fileType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {document.petName} • {document.ownerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded by {document.uploadedBy} • {new Date(document.uploadedDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{document.size}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No documents found</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}