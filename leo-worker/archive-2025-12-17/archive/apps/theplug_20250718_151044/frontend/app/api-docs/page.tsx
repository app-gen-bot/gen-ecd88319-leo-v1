"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Code2, Copy, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/v1/songs',
    description: 'List all songs in your library',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/v1/songs',
    description: 'Upload a new song',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/songs/{id}',
    description: 'Get details for a specific song',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/v1/registrations',
    description: 'Start a new registration',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/registrations/{id}',
    description: 'Get registration status',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/platforms',
    description: 'List available platforms',
    auth: false,
  },
]

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'POST':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'PUT':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'DELETE':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Code2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">API Documentation</h1>
            <p className="text-muted-foreground">
              Integrate The Plug into your workflow with our REST API
            </p>
          </div>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Everything you need to start using The Plug API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Base URL</h3>
                <code className="bg-muted px-3 py-1 rounded text-sm">
                  https://api.theplug.com/v1
                </code>
              </div>

              <div>
                <h3 className="font-medium mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  All authenticated endpoints require a Bearer token in the Authorization header:
                </p>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY`}
                  </pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                  >
                    {copiedCode === 'auth' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">
                  API requests are limited to 100 requests per minute. Rate limit information is included 
                  in the response headers:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• <code>X-RateLimit-Limit</code>: Request limit per minute</li>
                  <li>• <code>X-RateLimit-Remaining</code>: Remaining requests</li>
                  <li>• <code>X-RateLimit-Reset</code>: Time when limit resets</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Available endpoints and their descriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline" 
                        className={getMethodColor(endpoint.method)}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        {endpoint.description}
                      </p>
                      {endpoint.auth && (
                        <Badge variant="secondary">Auth Required</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>
                Example requests in different programming languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>

                <TabsContent value="curl" className="space-y-4">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`curl -X GET https://api.theplug.com/v1/songs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                    </pre>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(`curl -X GET https://api.theplug.com/v1/songs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`, 'curl')}
                    >
                      {copiedCode === 'curl' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="javascript" className="space-y-4">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`const response = await fetch('https://api.theplug.com/v1/songs', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const songs = await response.json();`}
                    </pre>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(`const response = await fetch('https://api.theplug.com/v1/songs', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const songs = await response.json();`, 'javascript')}
                    >
                      {copiedCode === 'javascript' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="python" className="space-y-4">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.theplug.com/v1/songs', headers=headers)
songs = response.json()`}
                    </pre>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.theplug.com/v1/songs', headers=headers)
songs = response.json()`, 'python')}
                    >
                      {copiedCode === 'python' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="php" className="space-y-4">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`$headers = [
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
];

$ch = curl_init('https://api.theplug.com/v1/songs');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$songs = json_decode($response, true);`}
                    </pre>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(`$headers = [
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
];

$ch = curl_init('https://api.theplug.com/v1/songs');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$songs = json_decode($response, true);`, 'php')}
                    >
                      {copiedCode === 'php' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* SDKs */}
          <Card>
            <CardHeader>
              <CardTitle>SDKs & Libraries</CardTitle>
              <CardDescription>
                Official SDKs for popular programming languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">JavaScript/TypeScript</h4>
                    <p className="text-sm text-muted-foreground">npm install @theplug/sdk</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://github.com/theplug/js-sdk" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Python</h4>
                    <p className="text-sm text-muted-foreground">pip install theplug-sdk</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://github.com/theplug/python-sdk" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">PHP</h4>
                    <p className="text-sm text-muted-foreground">composer require theplug/sdk</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://github.com/theplug/php-sdk" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Ruby</h4>
                    <p className="text-sm text-muted-foreground">gem install theplug-sdk</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="https://github.com/theplug/ruby-sdk" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have questions or need assistance with the API, we're here to help:
              </p>
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <Link href="/help">
                    Visit Help Center
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:api@theplug.com">
                    Email API Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 The Plug. All rights reserved. Powered by PlanetScale.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}