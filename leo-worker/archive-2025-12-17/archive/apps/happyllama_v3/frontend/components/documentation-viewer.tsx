"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DocumentTextIcon,
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ArrowsPointingOutIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline"
import { toast } from "@/hooks/use-toast"

// Type definitions
type FileInfo = {
  type: string
  size: string
}

type ProjectFiles = {
  [folder: string]: {
    [file: string]: FileInfo
  }
}

type Project = {
  id: string
  files: ProjectFiles
}

// Mock project structure
const projectStructure: Record<string, Project> = {
  "Healthcare Portal": {
    id: "healthcare",
    files: {
      "requirements/": {
        "prd.md": { type: "markdown", size: "24.5 KB" },
        "user-stories.md": { type: "markdown", size: "18.2 KB" },
        "acceptance-criteria.md": { type: "markdown", size: "15.7 KB" }
      },
      "technical/": {
        "architecture.md": { type: "markdown", size: "32.1 KB" },
        "database-schema.sql": { type: "sql", size: "12.4 KB" },
        "api-spec.yaml": { type: "yaml", size: "45.8 KB" }
      },
      "tests/": {
        "unit-tests.js": { type: "javascript", size: "67.3 KB" },
        "integration-tests.js": { type: "javascript", size: "54.2 KB" },
        "e2e-tests.js": { type: "javascript", size: "48.9 KB" }
      },
      "deployment/": {
        "docker-compose.yml": { type: "yaml", size: "8.6 KB" },
        "kubernetes.yaml": { type: "yaml", size: "12.3 KB" },
        "ci-cd.yml": { type: "yaml", size: "9.8 KB" }
      }
    }
  },
  "E-Commerce Platform": {
    id: "ecommerce",
    files: {
      "requirements/": {
        "prd.md": { type: "markdown", size: "28.3 KB" },
        "feature-list.md": { type: "markdown", size: "22.1 KB" }
      },
      "technical/": {
        "system-design.md": { type: "markdown", size: "35.7 KB" },
        "database.sql": { type: "sql", size: "18.9 KB" }
      }
    }
  },
  "SaaS Dashboard": {
    id: "saas",
    files: {
      "requirements/": {
        "prd.md": { type: "markdown", size: "31.2 KB" },
        "mvp-scope.md": { type: "markdown", size: "19.4 KB" }
      },
      "technical/": {
        "architecture.md": { type: "markdown", size: "38.5 KB" },
        "api-design.md": { type: "markdown", size: "26.7 KB" }
      }
    }
  }
}

const sampleContent = {
  "prd.md": `# Product Requirements Document

## Executive Summary
This document outlines the requirements for the Healthcare Patient Portal, a comprehensive digital health platform designed to improve patient engagement and streamline healthcare delivery.

## Objectives
- Provide patients with 24/7 access to their health information
- Enable secure communication between patients and providers
- Streamline appointment scheduling and management
- Improve medication adherence through reminders
- Facilitate telemedicine consultations

## User Stories

### Patient Stories
1. As a patient, I want to view my medical history so that I can track my health over time
2. As a patient, I want to schedule appointments online so that I don't have to call during business hours
3. As a patient, I want to receive medication reminders so that I never miss a dose

### Provider Stories
1. As a provider, I want to access patient records securely so that I can make informed decisions
2. As a provider, I want to communicate with patients asynchronously so that I can manage my time efficiently

## Functional Requirements

### Authentication & Authorization
- Multi-factor authentication support
- Role-based access control (RBAC)
- SSO integration with hospital systems
- Password recovery workflow

### Patient Portal Features
- Personal health record access
- Appointment scheduling and management
- Prescription refill requests
- Secure messaging with providers
- Lab result viewing
- Bill payment integration

## Non-Functional Requirements

### Performance
- Page load time < 2 seconds
- API response time < 500ms for 95th percentile
- Support for 10,000 concurrent users

### Security
- HIPAA compliance mandatory
- End-to-end encryption for all PHI
- Regular security audits
- Data retention policies

### Scalability
- Horizontal scaling capability
- Database sharding support
- CDN integration for static assets`,
  "architecture.md": `# System Architecture Document

## Overview
The Healthcare Portal follows a microservices architecture pattern with clear separation of concerns and scalability in mind.

## Architecture Diagram
\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web App   │────▶│   API       │────▶│  Database   │
│   (React)   │     │  Gateway    │     │  (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                    ┌───────┴────────┐
                    │                 │
            ┌───────▼──────┐  ┌──────▼───────┐
            │  Auth        │  │  Patient     │
            │  Service     │  │  Service     │
            └──────────────┘  └──────────────┘
\`\`\`

## Technology Stack

### Frontend
- React 18.2.0
- Next.js 14.2.3
- TypeScript 5.0
- Tailwind CSS 3.4
- ShadCN UI Components

### Backend
- Node.js 20 LTS
- Express.js / Fastify
- GraphQL with Apollo Server
- Prisma ORM

### Database
- PostgreSQL 15 (Primary)
- Redis (Caching & Sessions)
- ElasticSearch (Search)

### Infrastructure
- AWS ECS for container orchestration
- CloudFront CDN
- S3 for static assets
- RDS for managed PostgreSQL`
}

export function DocumentationViewer() {
  const [selectedProject, setSelectedProject] = useState("Healthcare Portal")
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["requirements/"])
  const [selectedFile, setSelectedFile] = useState("prd.md")
  const [searchQuery, setSearchQuery] = useState("")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [fullScreen, setFullScreen] = useState(false)

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev =>
      prev.includes(folder)
        ? prev.filter(f => f !== folder)
        : [...prev, folder]
    )
  }

  const handleCopyCode = () => {
    const content = sampleContent[selectedFile as keyof typeof sampleContent] || ""
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Document content copied to clipboard",
    })
  }

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: `Downloading ${selectedFile}...`,
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const currentProject = projectStructure[selectedProject as keyof typeof projectStructure]

  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-50 bg-background' : ''} flex flex-col h-full`}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Documentation Viewer</h2>
            <Badge variant="outline">AI Generated</Badge>
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(projectStructure).map(project => (
                <SelectItem key={project} value={project}>{project}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={handleCopyCode} title="Copy">
              <ClipboardDocumentIcon className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDownload} title="Download">
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handlePrint} title="Print">
              <PrinterIcon className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setFullScreen(!fullScreen)} title="Full Screen">
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 border-l pl-2 ml-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-xs" 
                onClick={() => setZoomLevel(prev => Math.max(prev - 10, 50))}
              >
                −
              </Button>
              <span className="text-xs px-2">{zoomLevel}%</span>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-xs" 
                onClick={() => setZoomLevel(prev => Math.min(prev + 10, 200))}
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className="w-64 border-r overflow-y-auto p-4">
          <div className="space-y-1">
            {Object.entries(currentProject.files).map(([folder, files]) => (
              <div key={folder}>
                <button
                  onClick={() => toggleFolder(folder)}
                  className="flex items-center gap-2 w-full p-1 hover:bg-muted rounded text-sm"
                >
                  {expandedFolders.includes(folder) ? (
                    <>
                      <ChevronDownIcon className="h-3 w-3" />
                      <FolderOpenIcon className="h-4 w-4 text-blue-600" />
                    </>
                  ) : (
                    <>
                      <ChevronRightIcon className="h-3 w-3" />
                      <FolderIcon className="h-4 w-4 text-blue-600" />
                    </>
                  )}
                  <span className="font-medium">{folder}</span>
                </button>
                {expandedFolders.includes(folder) && (
                  <div className="ml-6 space-y-1 mt-1">
                    {Object.entries(files as { [key: string]: FileInfo }).map(([file, info]) => (
                      <button
                        key={file}
                        onClick={() => setSelectedFile(file)}
                        className={`flex items-center gap-2 w-full p-1 hover:bg-muted rounded text-sm ${
                          selectedFile === file ? 'bg-muted' : ''
                        }`}
                      >
                        <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        <span className="flex-1 text-left">{file}</span>
                        <span className="text-xs text-muted-foreground">{info.size}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedFile}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Auto-generated</Badge>
                <Badge variant="outline" className="text-xs">Validated</Badge>
                <Badge variant="outline" className="text-xs">HIPAA Compliant</Badge>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <pre 
                  className="whitespace-pre-wrap font-mono text-sm"
                  style={{ fontSize: `${zoomLevel}%` }}
                >
                  {sampleContent[selectedFile as keyof typeof sampleContent] || 
                   `// Content for ${selectedFile}\n// This is a sample document showing the structure and quality of Happy Llama's auto-generated documentation.`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Metadata Panel */}
        <div className="w-64 border-l p-4 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Document Info</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Generated:</span>
                <br />
                <span>2025-01-24 14:32:18</span>
              </div>
              <div>
                <span className="text-muted-foreground">AI/Human Ratio:</span>
                <br />
                <span>95% AI / 5% Human</span>
              </div>
              <div>
                <span className="text-muted-foreground">Compliance:</span>
                <br />
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">HIPAA</Badge>
                  <Badge variant="secondary" className="text-xs">SOC2</Badge>
                  <Badge variant="secondary" className="text-xs">GDPR</Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Export Options</h4>
            <div className="space-y-2">
              <Button className="w-full" variant="outline" size="sm">
                Export as PDF
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                Export as Markdown
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                Export as Word
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Quality Score</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completeness</span>
                <span className="font-semibold">98%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span className="font-semibold">99%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Clarity</span>
                <span className="font-semibold">96%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}