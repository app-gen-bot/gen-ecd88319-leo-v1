'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileSearch,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  Info,
  Eye,
  FilePlus,
  X
} from 'lucide-react';

interface AnalysisResult {
  id: string;
  fileName: string;
  uploadDate: Date;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  documentType: string;
  issues: {
    critical: number;
    warning: number;
    info: number;
  };
  summary?: string;
}

// Mock data
const mockAnalysisResults: AnalysisResult[] = [
  {
    id: '1',
    fileName: 'lease_agreement_2024.pdf',
    uploadDate: new Date('2024-03-10'),
    status: 'completed',
    documentType: 'Lease Agreement',
    issues: {
      critical: 2,
      warning: 3,
      info: 5
    },
    summary: 'Found illegal late fee clause and missing required disclosures'
  },
  {
    id: '2',
    fileName: '30_day_notice.pdf',
    uploadDate: new Date('2024-03-15'),
    status: 'completed',
    documentType: 'Notice',
    issues: {
      critical: 1,
      warning: 1,
      info: 2
    },
    summary: 'Notice period does not comply with California law'
  },
  {
    id: '3',
    fileName: 'rent_increase_notice.pdf',
    uploadDate: new Date('2024-03-18'),
    status: 'analyzing',
    documentType: 'Notice',
    issues: {
      critical: 0,
      warning: 0,
      info: 0
    }
  }
];

export default function DocumentReviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>(mockAnalysisResults);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<{url: string, name: string} | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    
    // Validate all files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported file type.`,
          variant: 'destructive'
        });
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 10MB limit.`,
          variant: 'destructive'
        });
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;
    
    // Add files to pending list for preview
    setPendingFiles(prev => [...prev, ...validFiles]);
  };
  
  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Simulate file upload and analysis
      const newAnalysis: AnalysisResult = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadDate: new Date(),
        status: 'analyzing',
        documentType: 'Unknown',
        issues: {
          critical: 0,
          warning: 0,
          info: 0
        }
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      setAnalysisResults(prev => [newAnalysis, ...prev]);
      setPendingFiles(prev => prev.filter(f => f !== file));

      // Simulate analysis completion
      setTimeout(() => {
        setAnalysisResults(prev => 
          prev.map(result => 
            result.id === newAnalysis.id
              ? {
                  ...result,
                  status: 'completed',
                  documentType: file.type.includes('pdf') ? 'Lease Agreement' : 'Document Photo',
                  issues: {
                    critical: Math.floor(Math.random() * 3),
                    warning: Math.floor(Math.random() * 5),
                    info: Math.floor(Math.random() * 8)
                  },
                  summary: 'Found potentially problematic clauses and missing disclosures'
                }
              : result
          )
        );
        
        toast({
          title: 'Analysis complete',
          description: `${file.name} has been analyzed successfully.`,
        });
      }, 3000);

    } catch {
      toast({
        title: 'Upload failed',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const removePendingFile = (file: File) => {
    setPendingFiles(prev => prev.filter(f => f !== file));
  };
  
  const previewPendingFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewFile({
        url: e.target?.result as string,
        name: file.name
      });
    };
    
    if (file.type.includes('image')) {
      reader.readAsDataURL(file);
    } else {
      // For PDFs, we'll just show a placeholder
      setPreviewFile({
        url: '',
        name: file.name
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'analyzing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getIssuesBadge = (issues: AnalysisResult['issues']) => {
    if (issues.critical > 0) {
      return <Badge variant="destructive">Critical Issues: {issues.critical}</Badge>;
    }
    if (issues.warning > 0) {
      return <Badge variant="secondary">Warnings: {issues.warning}</Badge>;
    }
    if (issues.info > 0) {
      return <Badge variant="outline">Info: {issues.info}</Badge>;
    }
    return <Badge variant="outline">No Issues</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Document Review</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered analysis of your lease agreements and legal documents
          </p>
        </div>

        {/* Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            Upload your lease agreement, notices, or other rental documents. Our AI will analyze them for:
            <ul className="mt-2 list-disc list-inside text-sm">
              <li>Illegal or unenforceable clauses</li>
              <li>Missing required disclosures</li>
              <li>Compliance with California tenant law</li>
              <li>Potentially unfair terms</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload a PDF or image of your rental document for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              } ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary/50 cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,image/*';
                input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
                input.click();
              }}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {isUploading ? `Uploading... ${uploadProgress}%` : 'Drop your document here or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF and image files up to 10MB
              </p>
            </div>
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            {/* Pending Files */}
            {pendingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Ready to upload:</p>
                {pendingFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewPendingFile(file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processFile(file)}
                        disabled={isUploading}
                      >
                        <FilePlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePendingFile(file)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => setPendingFiles([])}
                    disabled={isUploading}
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={async () => {
                      for (const file of pendingFiles) {
                        await processFile(file);
                      }
                    }}
                    disabled={isUploading}
                  >
                    Upload All ({pendingFiles.length})
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* File Preview Dialog */}
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{previewFile?.name}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 mt-4">
              {previewFile?.url ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name}
                  className="w-full h-auto"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <FileText className="h-20 w-20 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">PDF Preview</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    PDF preview is not available in the browser. The document will be analyzed after upload.
                  </p>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Recent Analyses */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
          {analysisResults.length === 0 ? (
            <Card className="p-8 text-center">
              <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents analyzed yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first document to get started
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {analysisResults.map((result) => (
                <Card key={result.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 rounded-lg bg-muted">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{result.fileName}</h3>
                            {getStatusIcon(result.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{result.documentType}</span>
                            <span>•</span>
                            <span>{result.uploadDate.toLocaleDateString()}</span>
                          </div>
                          {result.status === 'completed' && (
                            <>
                              <div className="flex items-center gap-2">
                                {getIssuesBadge(result.issues)}
                                {result.issues.warning > 0 && (
                                  <Badge variant="outline">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {result.issues.warning} Warnings
                                  </Badge>
                                )}
                                {result.issues.info > 0 && (
                                  <Badge variant="outline">
                                    <Info className="h-3 w-3 mr-1" />
                                    {result.issues.info} Info
                                  </Badge>
                                )}
                              </div>
                              {result.summary && (
                                <p className="text-sm mt-2">{result.summary}</p>
                              )}
                            </>
                          )}
                          {result.status === 'analyzing' && (
                            <div className="space-y-2">
                              <p className="text-sm">Analyzing document...</p>
                              <Progress value={66} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {result.status === 'completed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/document-review/analysis/${result.id}`)}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                toast({
                                  title: 'Downloading report',
                                  description: 'Your analysis report is being prepared.',
                                });
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                toast({
                                  title: 'Share feature coming soon',
                                  description: 'You\'ll be able to share reports with your lawyer.',
                                });
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Document Review Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>Upload clear, complete copies of all pages</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>Review all identified issues with the detailed analysis</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span>Save analysis reports for your records</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 text-amber-600 mr-2 mt-0.5 shrink-0" />
                <span>For critical issues, consider consulting with a lawyer</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}