'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CodeBracketIcon,
  CommandLineIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  ShieldCheckIcon,
  ClockIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

export default function ApiReferencePage() {
  const [_selectedEndpoint, setSelectedEndpoint] = useState('apps');

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/v1/apps',
      description: 'List all applications',
      category: 'Apps'
    },
    {
      method: 'POST',
      endpoint: '/api/v1/apps',
      description: 'Create new application',
      category: 'Apps'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/apps/{id}',
      description: 'Get application details',
      category: 'Apps'
    },
    {
      method: 'PUT',
      endpoint: '/api/v1/apps/{id}',
      description: 'Update application',
      category: 'Apps'
    },
    {
      method: 'DELETE',
      endpoint: '/api/v1/apps/{id}',
      description: 'Delete application',
      category: 'Apps'
    },
    {
      method: 'POST',
      endpoint: '/api/v1/apps/{id}/deploy',
      description: 'Deploy application',
      category: 'Deployments'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/deployments',
      description: 'List deployments',
      category: 'Deployments'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/user/profile',
      description: 'Get user profile',
      category: 'User'
    }
  ];

  const codeExamples = {
    javascript: `// Create new application
const response = await fetch('https://api.happyllama.ai/v1/apps', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My App',
    description: 'A simple todo application',
    template: 'react-nextjs',
    config: {
      database: 'postgresql',
      authentication: 'nextauth'
    }
  })
});

const app = await response.json();
console.log('Created app:', app);`,
    
    python: `import requests

# Create new application
response = requests.post(
    'https://api.happyllama.ai/v1/apps',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'name': 'My App',
        'description': 'A simple todo application',
        'template': 'react-nextjs',
        'config': {
            'database': 'postgresql',
            'authentication': 'nextauth'
        }
    }
)

app = response.json()
print('Created app:', app)`,
    
    curl: `curl -X POST https://api.happyllama.ai/v1/apps \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My App",
    "description": "A simple todo application",
    "template": "react-nextjs",
    "config": {
      "database": "postgresql",
      "authentication": "nextauth"
    }
  }'`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <CodeBracketIcon className="h-16 w-16 text-blue-600" />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  API Reference
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Complete reference for the Happy Llama REST API
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <ShieldCheckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-bold mb-1">Authentication</h3>
                  <p className="text-sm text-gray-600">Bearer token required</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-bold mb-1">Rate Limits</h3>
                  <p className="text-sm text-gray-600">1000 requests/hour</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <CubeIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-bold mb-1">Version</h3>
                  <p className="text-sm text-gray-600">v1 (current)</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* API Overview */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar - Endpoints */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Endpoints</CardTitle>
                    <CardDescription>Browse available API endpoints</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Apps', 'Deployments', 'User'].map((category) => (
                        <div key={category}>
                          <h4 className="font-semibold text-sm text-gray-900 mb-2">{category}</h4>
                          <div className="space-y-1 mb-4">
                            {apiEndpoints
                              .filter(endpoint => endpoint.category === category)
                              .map((endpoint, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-sm"
                                  onClick={() => setSelectedEndpoint(endpoint.endpoint)}
                                >
                                  <Badge 
                                    variant={endpoint.method === 'GET' ? 'secondary' : 
                                            endpoint.method === 'POST' ? 'default' :
                                            endpoint.method === 'PUT' ? 'outline' : 'destructive'}
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    {endpoint.method}
                                  </Badge>
                                  <span className="flex-1 truncate">{endpoint.endpoint}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Authentication */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <KeyIcon className="h-5 w-5 text-blue-600" />
                      <CardTitle>Authentication</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      All API requests require authentication using a Bearer token. Include your API key in the Authorization header.
                    </p>
                    
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </div>
                    
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        <KeyIcon className="mr-2 h-4 w-4" />
                        Generate API Key
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Code Examples */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <PlayIcon className="h-5 w-5 text-green-600" />
                      <CardTitle>Quick Start Example</CardTitle>
                    </div>
                    <CardDescription>Create your first application using our API</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="javascript" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                      </TabsList>
                      
                      {Object.entries(codeExamples).map(([lang, code]) => (
                        <TabsContent key={lang} value={lang}>
                          <div className="relative">
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{code}</code>
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 text-gray-400 hover:text-white"
                              onClick={() => navigator.clipboard.writeText(code)}
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Response Format */}
                <Card>
                  <CardHeader>
                    <CardTitle>Response Format</CardTitle>
                    <CardDescription>Standard API response structure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-green-600 mb-2">Success Response (200)</h4>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "id": "app_123",
    "name": "My App",
    "status": "created",
    "created_at": "2025-01-22T10:30:00Z"
  },
  "message": "Application created successfully"
}`}
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-red-600 mb-2">Error Response (4xx/5xx)</h4>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid application name",
    "details": ["Name must be between 3-50 characters"]
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rate Limits */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-orange-600" />
                      <CardTitle>Rate Limits</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">1,000</div>
                        <div className="text-sm text-blue-700">requests/hour</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">10,000</div>
                        <div className="text-sm text-green-700">requests/day</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">50</div>
                        <div className="text-sm text-purple-700">concurrent requests</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-4">
                      Rate limit headers are included in all responses: X-RateLimit-Remaining, X-RateLimit-Reset
                    </p>
                  </CardContent>
                </Card>

                {/* SDKs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CubeIcon className="h-5 w-5 text-purple-600" />
                      <CardTitle>Official SDKs</CardTitle>
                    </div>
                    <CardDescription>Use our official SDKs for easier integration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Node.js SDK</h4>
                        <pre className="bg-gray-100 p-2 rounded text-sm mb-2">npm install @happyllama/sdk</pre>
                        <Button variant="outline" size="sm">
                          <CommandLineIcon className="mr-2 h-4 w-4" />
                          View Docs
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Python SDK</h4>
                        <pre className="bg-gray-100 p-2 rounded text-sm mb-2">pip install happyllama-sdk</pre>
                        <Button variant="outline" size="sm">
                          <CommandLineIcon className="mr-2 h-4 w-4" />
                          View Docs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}