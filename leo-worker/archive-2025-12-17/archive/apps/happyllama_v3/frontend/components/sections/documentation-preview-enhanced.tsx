"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  DocumentTextIcon,
  CodeBracketIcon,
  ServerIcon,
  BeakerIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  PrinterIcon,
  CheckIcon
} from "@heroicons/react/24/outline"
import { toast } from "@/hooks/use-toast"

const documentContent = {
  prd: `# Product Requirements Document

## Executive Summary
This document outlines the requirements for a comprehensive healthcare patient portal that enables secure communication between patients and providers.

## User Stories
1. As a patient, I want to view my medical history
2. As a patient, I want to schedule appointments online
3. As a patient, I want to receive medication reminders

## Functional Requirements
- Multi-factor authentication
- Role-based access control
- Personal health record access
- Appointment scheduling
- Prescription refill requests
- Secure messaging
- Lab result viewing

## Non-Functional Requirements
- Page load time < 2 seconds
- 99.99% uptime SLA
- HIPAA compliance
- End-to-end encryption`,
  
  technical: `# Technical Specification

## Architecture Overview
The system follows a microservices architecture with the following components:

### Frontend
- Next.js 14 with App Router
- React 18 with TypeScript
- ShadCN UI component library
- Tailwind CSS for styling

### Backend Services
- Authentication Service (FastAPI)
- Patient Service (FastAPI)
- Appointment Service (FastAPI)
- Messaging Service (FastAPI)

### Database
- DynamoDB for patient records
- PostgreSQL for appointments
- Redis for caching

### Infrastructure
- AWS Lambda for serverless compute
- CloudFront CDN
- S3 for static assets
- API Gateway`,
  
  api: `openapi: 3.0.0
info:
  title: Healthcare Portal API
  version: 1.0.0
  
paths:
  /api/auth/login:
    post:
      summary: Authenticate user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Successful authentication
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
                    
  /api/patients/{id}:
    get:
      summary: Get patient details
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Patient details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Patient'`,
  
  tests: `// Test Suite Overview

describe('Healthcare Portal Tests', () => {
  describe('Authentication', () => {
    test('should login with valid credentials', async () => {
      const response = await api.post('/auth/login', {
        email: 'test@example.com',
        password: 'SecurePass123!'
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
    });
    
    test('should reject invalid credentials', async () => {
      const response = await api.post('/auth/login', {
        email: 'test@example.com',
        password: 'wrong'
      });
      expect(response.status).toBe(401);
    });
  });
  
  describe('Patient Records', () => {
    test('should retrieve patient data', async () => {
      const response = await api.get('/patients/123');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('medicalHistory');
    });
  });
  
  describe('E2E Tests', () => {
    test('Complete appointment booking flow', async () => {
      // Login
      await page.goto('/login');
      await page.fill('[name=email]', 'patient@example.com');
      await page.fill('[name=password]', 'SecurePass123!');
      await page.click('[type=submit]');
      
      // Navigate to appointments
      await page.click('[href="/appointments"]');
      
      // Book appointment
      await page.click('[data-testid="book-appointment"]');
      await page.selectOption('[name=doctor]', 'Dr. Smith');
      await page.fill('[name=date]', '2025-02-01');
      await page.click('[type=submit]');
      
      // Verify success
      await expect(page).toHaveText('Appointment booked successfully');
    });
  });
});`
}

export function DocumentationPreviewEnhanced() {
  const [activeTab, setActiveTab] = useState("prd")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [subscribeUpdates, setSubscribeUpdates] = useState(true)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const handleCopyCode = (section: string) => {
    const content = documentContent[section as keyof typeof documentContent]
    navigator.clipboard.writeText(content)
    setCopiedSection(section)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const handleDownload = () => {
    setEmailModalOpen(true)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Success!",
      description: "Check your email for the documentation pack download link.",
    })
    setEmailModalOpen(false)
    setEmail("")
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const tabIcons = {
    prd: DocumentTextIcon,
    technical: CodeBracketIcon,
    api: ServerIcon,
    tests: BeakerIcon
  }

  const tabLabels = {
    prd: "PRD",
    technical: "Technical Spec",
    api: "API Docs",
    tests: "Test Suite"
  }

  return (
    <section className="py-24 bg-background">
      <div className={`container ${isFullScreen ? 'max-w-full' : ''}`}>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left side - Text content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Complete Documentation Trail</h3>
              <p className="text-muted-foreground mb-6">
                Happy Llama generates extensive documentation that would typically take weeks to create. 
                Every aspect of your application is documented, tested, and ready for audit.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Product Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive PRDs with user stories, acceptance criteria, and success metrics
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Technical Architecture</h4>
                  <p className="text-sm text-muted-foreground">
                    System design documents, database schemas, and infrastructure specifications
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">API Documentation</h4>
                  <p className="text-sm text-muted-foreground">
                    OpenAPI specifications with examples, schemas, and authentication details
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Test Coverage</h4>
                  <p className="text-sm text-muted-foreground">
                    Unit tests, integration tests, and E2E test suites with 95%+ coverage
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-lg font-semibold mb-3">See the Quality for Yourself</h3>
              <Button size="lg" variant="gradient" onClick={handleDownload}>
                Download Sample Documentation Pack
              </Button>
            </div>
          </div>

          {/* Right side - Document viewer */}
          <Card className={`${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
            <div className="border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    {Object.entries(tabLabels).map(([key, label]) => {
                      const Icon = tabIcons[key as keyof typeof tabIcons]
                      return (
                        <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{label}</span>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </Tabs>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopyCode(activeTab)}
                    title="Copy code"
                  >
                    {copiedSection === activeTab ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDownload}
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handlePrint}
                    title="Print"
                  >
                    <PrinterIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleFullScreen}
                    title="Full screen"
                  >
                    <ArrowsPointingOutIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  >
                    −
                  </Button>
                  <span className="text-xs px-2">{zoomLevel}%</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="p-6 max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">AI Generated</Badge>
                  <Badge variant="outline">95% Automated</Badge>
                  <Badge variant="outline">Audit Ready</Badge>
                </div>

                <Tabs value={activeTab} className="w-full">
                  {Object.entries(documentContent).map(([key, content]) => (
                    <TabsContent key={key} value={key} className="mt-0">
                      <pre 
                        className="bg-muted p-4 rounded-lg overflow-x-auto text-sm"
                        style={{ fontSize: `${zoomLevel}%` }}
                      >
                        <code className="language-markdown">{content}</code>
                      </pre>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Capture Modal */}
        <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Get Your Sample Documentation</DialogTitle>
              <DialogDescription>
                Enter your email to receive a complete documentation pack showcasing Happy Llama&apos;s output quality.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="updates"
                  checked={subscribeUpdates}
                  onCheckedChange={(checked) => setSubscribeUpdates(checked as boolean)}
                />
                <Label htmlFor="updates" className="text-sm">
                  Send me updates about Happy Llama
                </Label>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEmailModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Send Documentation
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}