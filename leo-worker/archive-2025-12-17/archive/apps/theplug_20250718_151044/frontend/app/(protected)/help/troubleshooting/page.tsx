'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  ArrowLeft,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Upload,
  Music,
  CreditCard,
  Shield,
  Wifi,
  Server,
  FileQuestion,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  Info
} from 'lucide-react'

const troubleshootingCategories = [
  {
    title: 'Registration Issues',
    icon: XCircle,
    color: 'text-red-500',
    issues: [
      {
        question: 'Why did my registration fail?',
        answer: 'Registration can fail for several reasons: missing metadata (ISRC, songwriter info), platform authentication issues, or temporary platform outages. Check the error message in your registration details for specific information.',
        steps: [
          'Go to the failed registration in your dashboard',
          'Click on the registration to view error details',
          'Fix any missing metadata in your song details',
          'Verify your platform connection is active',
          'Click "Retry Registration" to try again'
        ],
        relatedArticles: ['Fixing metadata issues', 'Platform connection guide']
      },
      {
        question: 'Registration stuck in pending status',
        answer: 'Some registrations can take longer than expected due to platform processing times or verification requirements.',
        steps: [
          'Check if the platform shows any specific requirements',
          'Verify all required metadata is complete',
          'Wait for the estimated processing time (shown in registration details)',
          'If stuck for over 48 hours, contact support'
        ],
        relatedArticles: ['Registration timelines', 'Platform processing times']
      },
      {
        question: 'Multiple failed registration attempts',
        answer: 'Repeated failures usually indicate a systematic issue that needs to be resolved before retrying.',
        steps: [
          'Stop automatic retries to prevent further failures',
          'Review all error messages for patterns',
          'Check platform-specific requirements',
          'Fix underlying issues before retrying',
          'Consider manual intervention if needed'
        ],
        relatedArticles: ['When to request manual help', 'Platform requirements']
      }
    ]
  },
  {
    title: 'Upload Problems',
    icon: Upload,
    color: 'text-blue-500',
    issues: [
      {
        question: 'File upload fails or times out',
        answer: 'Upload issues are often related to file size, format, or network connectivity.',
        steps: [
          'Check file size (max 500MB per file)',
          'Verify file format (WAV, MP3, FLAC supported)',
          'Test your internet connection speed',
          'Try uploading during off-peak hours',
          'Use Chrome or Firefox for best compatibility'
        ],
        relatedArticles: ['Supported file formats', 'Upload best practices']
      },
      {
        question: 'Metadata not detected from file',
        answer: 'The Plug extracts metadata from your audio files, but sometimes this information is missing or incorrectly formatted.',
        steps: [
          'Check if your file has embedded metadata',
          'Use a tool like MP3Tag to add metadata before uploading',
          'Manually enter metadata after upload',
          'Ensure metadata is in standard format'
        ],
        relatedArticles: ['Adding metadata to files', 'Metadata requirements']
      }
    ]
  },
  {
    title: 'Platform Connection',
    icon: Zap,
    color: 'text-yellow-500',
    issues: [
      {
        question: 'Cannot connect to platform',
        answer: 'Connection issues can be due to incorrect credentials, expired tokens, or platform-side problems.',
        steps: [
          'Verify your platform credentials are correct',
          'Check if you have the required permissions on the platform',
          'Try disconnecting and reconnecting',
          'Clear browser cache and cookies',
          'Check platform status page for outages'
        ],
        relatedArticles: ['Platform authentication guide', 'Permission requirements']
      },
      {
        question: 'Platform connection keeps disconnecting',
        answer: 'Frequent disconnections usually indicate authentication or permission issues.',
        steps: [
          'Check if platform requires periodic re-authentication',
          'Verify API key or OAuth token hasn\'t expired',
          'Ensure your platform account is in good standing',
          'Review platform security settings',
          'Contact support if issue persists'
        ],
        relatedArticles: ['OAuth token management', 'API key best practices']
      }
    ]
  },
  {
    title: 'Payment & Billing',
    icon: CreditCard,
    color: 'text-green-500',
    issues: [
      {
        question: 'Payment method declined',
        answer: 'Payment failures can occur due to various reasons including insufficient funds, security blocks, or expired cards.',
        steps: [
          'Verify card details are entered correctly',
          'Check with your bank for any blocks',
          'Try a different payment method',
          'Ensure billing address matches card',
          'Contact support for payment alternatives'
        ],
        relatedArticles: ['Payment methods', 'Billing FAQ']
      },
      {
        question: 'Subscription not activating after payment',
        answer: 'Sometimes there can be a delay between payment processing and subscription activation.',
        steps: [
          'Wait 5-10 minutes for processing',
          'Check your email for confirmation',
          'Refresh the page and log out/in',
          'Verify payment was successful with your bank',
          'Contact support with transaction ID'
        ],
        relatedArticles: ['Subscription activation', 'Payment processing']
      }
    ]
  }
]

const commonErrors = [
  {
    code: 'ERR_AUTH_001',
    message: 'Platform authentication failed',
    solution: 'Re-authenticate with the platform'
  },
  {
    code: 'ERR_META_002',
    message: 'Missing required metadata',
    solution: 'Add missing ISRC or songwriter information'
  },
  {
    code: 'ERR_FILE_003',
    message: 'Unsupported file format',
    solution: 'Convert to WAV, MP3, or FLAC'
  },
  {
    code: 'ERR_LIMIT_004',
    message: 'Rate limit exceeded',
    solution: 'Wait 60 minutes before retrying'
  }
]

export default function TroubleshootingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Debug logging removed for production
  }

  const filteredCategories = selectedCategory 
    ? troubleshootingCategories.filter(cat => cat.title === selectedCategory)
    : troubleshootingCategories

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/help">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">Troubleshooting</h1>
          <p className="text-xl text-muted-foreground">
            Find solutions to common issues and errors
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for issues or error codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* System Status Alert */}
        <Alert className="mb-8">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>All Systems Operational</AlertTitle>
          <AlertDescription>
            No known issues at this time. Last checked 5 minutes ago.
            <Link href="/status" className="ml-2 underline">
              View Status Page
            </Link>
          </AlertDescription>
        </Alert>

        {/* Quick Category Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {troubleshootingCategories.map((category) => (
            <Card 
              key={category.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCategory(
                selectedCategory === category.title ? null : category.title
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <category.icon className={`h-8 w-8 mb-2 ${category.color}`} />
                  <p className="font-medium text-sm">{category.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.issues.length} issues
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Troubleshooting Articles */}
          <div className="lg:col-span-2">
            {filteredCategories.map((category) => (
              <div key={category.title} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {category.issues.map((issue, index) => (
                    <AccordionItem key={index} value={`${category.title}-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="pr-4">
                          <h3 className="font-medium">{issue.question}</h3>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p className="text-muted-foreground">{issue.answer}</p>
                          
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Steps to resolve:
                            </h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                              {issue.steps.map((step, stepIndex) => (
                                <li key={stepIndex}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          
                          {issue.relatedArticles.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Related articles:</h4>
                              <div className="flex flex-wrap gap-2">
                                {issue.relatedArticles.map((article, articleIndex) => (
                                  <Link key={articleIndex} href="#">
                                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                      {article}
                                      <ChevronRight className="h-3 w-3 ml-1" />
                                    </Badge>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Common Error Codes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Common Error Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commonErrors.map((error, index) => (
                    <div key={index} className="border-l-2 border-muted pl-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-mono text-sm font-medium">{error.code}</p>
                          <p className="text-xs text-muted-foreground">{error.message}</p>
                          <p className="text-xs text-primary mt-1">{error.solution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Cache & Cookies
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wifi className="h-4 w-4 mr-2" />
                  Test Connection Speed
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Server className="h-4 w-4 mr-2" />
                  Check Platform Status
                </Button>
                <Link href="/help/contact">
                  <Button variant="outline" className="w-full justify-start">
                    <FileQuestion className="h-4 w-4 mr-2" />
                    Submit Debug Info
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Still Need Help */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <AlertTriangle className="h-8 w-8 mb-3 opacity-90" />
                <h3 className="font-semibold mb-2">Can't find a solution?</h3>
                <p className="text-sm mb-4 opacity-90">
                  Our support team is ready to help with your specific issue
                </p>
                <Link href="/help/contact">
                  <Button size="sm" variant="secondary">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Debug Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs font-mono">
                  <div>Browser: Chrome 120.0</div>
                  <div>OS: macOS 14.0</div>
                  <div>Account Type: Pro</div>
                  <div>User ID: demo_user_1</div>
                  <div>Session: {Math.random().toString(36).substring(7)}</div>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Copy Debug Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}