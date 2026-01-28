'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Key,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
  AlertTriangle,
  Shield,
  Webhook,
  Code
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

// Mock API keys data
const mockApiKeys = [
  {
    id: 'key_1',
    name: 'Production API Key',
    key: 'pk_live_51234567890abcdef',
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: '2024-01-18T10:30:00Z',
    status: 'active'
  },
  {
    id: 'key_2',
    name: 'Development API Key',
    key: 'pk_test_09876543210fedcba',
    createdAt: '2023-12-15T00:00:00Z',
    lastUsed: '2024-01-17T15:45:00Z',
    status: 'active'
  }
]

// Mock webhook endpoints
const mockWebhooks = [
  {
    id: 'webhook_1',
    url: 'https://example.com/webhooks/the-plug',
    events: ['registration.completed', 'registration.failed'],
    status: 'active',
    lastDelivery: '2024-01-18T09:00:00Z',
    successRate: 98.5
  }
]

export default function ApiCredentialsPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newGeneratedKey, setNewGeneratedKey] = useState('')

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const generateNewKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }

    setIsGeneratingKey(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const generatedKey = `pk_live_${Math.random().toString(36).substring(2, 15)}`
    setNewGeneratedKey(generatedKey)
    setIsGeneratingKey(false)
    setShowNewKeyDialog(false)
    
    toast.success('New API key generated successfully')
  }

  const revokeKey = async (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      toast.success('API key revoked')
    }
  }

  const testWebhook = async () => {
    toast.success('Test webhook sent successfully')
  }

  const webhookEvents = [
    { id: 'registration.completed', label: 'Registration Completed' },
    { id: 'registration.failed', label: 'Registration Failed' },
    { id: 'registration.pending', label: 'Registration Pending' },
    { id: 'platform.connected', label: 'Platform Connected' },
    { id: 'platform.disconnected', label: 'Platform Disconnected' },
    { id: 'song.uploaded', label: 'Song Uploaded' },
    { id: 'song.deleted', label: 'Song Deleted' }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">API Credentials</h1>
            <p className="text-muted-foreground">Manage your API keys and webhooks</p>
          </div>
        </div>

        {/* Security Alert */}
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertTitle>Security Notice</AlertTitle>
          <AlertDescription>
            Keep your API keys secure. Never share them publicly or commit them to version control. 
            Revoke any keys that may have been compromised.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Use API keys to authenticate requests to The Plug API
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate New Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate New API Key</DialogTitle>
                        <DialogDescription>
                          Create a new API key for accessing The Plug API
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="keyName">Key Name</Label>
                          <Input
                            id="keyName"
                            placeholder="e.g., Production Server"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={generateNewKey}
                          disabled={isGeneratingKey}
                        >
                          {isGeneratingKey ? 'Generating...' : 'Generate Key'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockApiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{apiKey.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {apiKey.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showKeys[apiKey.id] 
                              ? apiKey.key 
                              : apiKey.key.substring(0, 10) + '...' + apiKey.key.substring(apiKey.key.length - 4)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeys[apiKey.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: {new Date(apiKey.createdAt).toLocaleDateString()} • 
                          Last used: {new Date(apiKey.lastUsed).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => revokeKey(apiKey.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* New Key Display */}
            {newGeneratedKey && (
              <Alert>
                <Key className="h-4 w-4" />
                <AlertTitle>New API Key Generated</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Save this key now. You won't be able to see it again.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                      {newGeneratedKey}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => {
                        copyToClipboard(newGeneratedKey)
                        setNewGeneratedKey('')
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy & Close
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* API Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Include your API key in the Authorization header:
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Example request:
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      <code>{`curl -X POST https://api.theplug.com/v1/songs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "My Song", "artist": "Artist Name"}'`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhook Endpoints</CardTitle>
                    <CardDescription>
                      Receive real-time notifications about events in your account
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Webhook Form */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Endpoint URL</Label>
                    <Input
                      id="webhookUrl"
                      type="url"
                      placeholder="https://example.com/webhooks/the-plug"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events to Listen</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {webhookEvents.map((event) => (
                        <div key={event.id} className="flex items-center space-x-2">
                          <Switch
                            id={event.id}
                            checked={selectedEvents.includes(event.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEvents([...selectedEvents, event.id])
                              } else {
                                setSelectedEvents(selectedEvents.filter(e => e !== event.id))
                              }
                            }}
                          />
                          <Label
                            htmlFor={event.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {event.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toast.success('Webhook endpoint added')}
                      disabled={!webhookUrl || selectedEvents.length === 0}
                    >
                      Add Endpoint
                    </Button>
                    <Button variant="outline" onClick={testWebhook}>
                      <Webhook className="h-4 w-4 mr-2" />
                      Send Test Event
                    </Button>
                  </div>
                </div>

                {/* Existing Webhooks */}
                <div className="space-y-4">
                  {mockWebhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {webhook.url}
                          </code>
                          <Badge
                            variant={webhook.status === 'active' ? 'default' : 'secondary'}
                          >
                            {webhook.status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Events: {webhook.events.join(', ')}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Last delivery: {new Date(webhook.lastDelivery).toLocaleString()}</span>
                        <span>Success rate: {webhook.successRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Webhook Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Webhook Payload Example</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                  <code>{`{
  "id": "evt_1234567890",
  "type": "registration.completed",
  "created": "2024-01-18T10:30:00Z",
  "data": {
    "registration_id": "reg_abc123",
    "song_id": "song_xyz789",
    "platform": "MLC",
    "status": "completed",
    "registration_url": "https://portal.themlc.com/work/123456"
  }
}`}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}