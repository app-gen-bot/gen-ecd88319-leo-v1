"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react"

export default function DocumentReviewPage() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFile = files.find(file => file.type === 'application/pdf')
    
    if (!validFile) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    await handleFileUpload(validFile)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Simulate upload and analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would return the analysis ID
      const analysisId = 'analysis-' + Date.now()
      
      toast({
        title: "Upload successful",
        description: "Analyzing your lease agreement...",
      })
      
      router.push(`/document-review/${analysisId}`)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lease Document Review</h1>
        <p className="text-muted-foreground mt-1">
          Upload your lease agreement for AI-powered analysis and issue detection
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Lease</CardTitle>
              <CardDescription>
                Our AI will analyze your lease for illegal clauses, concerning terms, and missing disclosures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                
                <p className="text-lg font-medium mb-2">
                  Drop your lease agreement here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                
                <label htmlFor="file-upload">
                  <Button disabled={isUploading} asChild>
                    <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
                  </Button>
                </label>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Supported format: PDF (max 10MB)
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert className="mt-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your documents are encrypted and analyzed locally. We never store or share your personal information.
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What We Check For</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Illegal Clauses</p>
                  <p className="text-sm text-muted-foreground">
                    Provisions that violate California tenant protection laws
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Concerning Terms</p>
                  <p className="text-sm text-muted-foreground">
                    Unfair or one-sided terms that may disadvantage tenants
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Missing Disclosures</p>
                  <p className="text-sm text-muted-foreground">
                    Required disclosures that are absent from your lease
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Tenant Protections</p>
                  <p className="text-sm text-muted-foreground">
                    Verification of your rights and protections
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>After Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium">1.</span>
                <p className="text-sm">Get a detailed report of all issues found</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium">2.</span>
                <p className="text-sm">Receive plain English explanations</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium">3.</span>
                <p className="text-sm">See suggested alternatives for problematic clauses</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium">4.</span>
                <p className="text-sm">Get negotiation tips for your landlord</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium">5.</span>
                <p className="text-sm">Download or share your analysis report</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}