'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Key,
  Settings,
  Activity,
  Link2,
  Unlink,
  Eye,
  EyeOff,
  TestTube
} from 'lucide-react'
import { toast } from 'sonner'

// Platform configurations
const platformConfigs: Record<string, any> = {
  mlc: {
    name: 'MLC (Mechanical Licensing Collective)',
    logo: '/platforms/mlc.png',
    description: 'Mechanical licensing for streaming and downloads',
    authType: 'api',
    fields: [
      { id: 'api_key', label: 'API Key', type: 'password', required: true },
      { id: 'api_secret', label: 'API Secret', type: 'password', required: true },
      { id: 'environment', label: 'Environment', type: 'select', options: ['production', 'sandbox'], required: true }
    ],
    settings: {
      auto_sync: { label: 'Auto-sync new songs', default: true },
      sync_frequency: { label: 'Sync frequency', type: 'select', options: ['hourly', 'daily', 'weekly'], default: 'daily' },
      notify_on_success: { label: 'Notify on successful registration', default: true },
      notify_on_failure: { label: 'Notify on failed registration', default: true }
    }
  },
  soundexchange: {
    name: 'SoundExchange',
    logo: '/platforms/soundexchange.png',
    description: 'Digital performance royalties',
    authType: 'oauth',
    fields: [],
    settings: {
      auto_sync: { label: 'Auto-sync new songs', default: true },
      sync_frequency: { label: 'Sync frequency', type: 'select', options: ['hourly', 'daily', 'weekly'], default: 'daily' },
      include_features: { label: 'Include featured artists', default: false },
      notify_on_success: { label: 'Notify on successful registration', default: true }
    }
  },
  ascap: {
    name: 'ASCAP',
    logo: '/platforms/ascap.png',
    description: 'Performance rights organization',
    authType: 'credentials',
    fields: [
      { id: 'username', label: 'Username', type: 'text', required: true },
      { id: 'password', label: 'Password', type: 'password', required: true },
      { id: 'member_id', label: 'Member ID', type: 'text', required: true }
    ],
    settings: {
      auto_sync: { label: 'Auto-sync new songs', default: true },
      register_as_writer: { label: 'Register as writer', default: true },
      register_as_publisher: { label: 'Register as publisher', default: false },
      territory: { label: 'Territory', type: 'select', options: ['US', 'Worldwide'], default: 'US' }
    }
  },
  bmi: {
    name: 'BMI',
    logo: '/platforms/bmi.png',
    description: 'Broadcast Music, Inc.',
    authType: 'api',
    fields: [
      { id: 'api_token', label: 'API Token', type: 'password', required: true },
      { id: 'account_number', label: 'Account Number', type: 'text', required: true }
    ],
    settings: {
      auto_sync: { label: 'Auto-sync new songs', default: true },
      sync_frequency: { label: 'Sync frequency', type: 'select', options: ['daily', 'weekly'], default: 'weekly' },
      include_co_writers: { label: 'Include co-writers', default: true }
    }
  },
  distribution: {
    name: 'Distribution Partners',
    logo: '/platforms/distribution.png',
    description: 'Digital distribution to streaming platforms',
    authType: 'api',
    fields: [
      { id: 'distributor', label: 'Distributor', type: 'select', options: ['DistroKid', 'CD Baby', 'TuneCore'], required: true },
      { id: 'api_key', label: 'API Key', type: 'password', required: true }
    ],
    settings: {
      auto_distribute: { label: 'Auto-distribute new releases', default: false },
      platforms: { label: 'Target platforms', type: 'multiselect', options: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music'], default: ['Spotify', 'Apple Music'] },
      release_date_offset: { label: 'Release date offset (days)', type: 'number', default: 14 }
    }
  },
  pro: {
    name: 'Performance Rights Organizations',
    logo: '/platforms/pro.png',
    description: 'ASCAP, BMI, SESAC - Performance royalties',
    authType: 'bulk',
    fields: [
      { id: 'organization', label: 'Organization', type: 'select', options: ['ASCAP', 'BMI', 'SESAC'], required: true },
      { id: 'member_id', label: 'Member ID', type: 'text', required: true },
      { id: 'password', label: 'Password', type: 'password', required: true }
    ],
    settings: {
      auto_sync: { label: 'Auto-sync new songs', default: true },
      sync_frequency: { label: 'Sync frequency', type: 'select', options: ['daily', 'weekly', 'monthly'], default: 'weekly' },
      register_as_publisher: { label: 'Register as publisher', default: false },
      notify_on_airplay: { label: 'Notify on new airplay detection', default: true }
    }
  }
}

// Mock current settings
const mockCurrentSettings = {
  mlc: {
    connected: true,
    credentials: {
      api_key: 'mlc_live_1234567890',
      api_secret: 'mlc_secret_abcdefghij',
      environment: 'production'
    },
    settings: {
      auto_sync: true,
      sync_frequency: 'daily',
      notify_on_success: true,
      notify_on_failure: true
    },
    lastSync: '2024-01-18T10:00:00Z',
    status: 'healthy'
  },
  pro: {
    connected: true,
    credentials: {
      organization: 'ASCAP',
      member_id: 'ASC123456',
      password: '********'
    },
    settings: {
      auto_sync: true,
      sync_frequency: 'weekly',
      register_as_publisher: false,
      notify_on_airplay: true
    },
    lastSync: '2024-01-15T10:00:00Z',
    status: 'error'
  },
  distribution: {
    connected: true,
    credentials: {
      distributor: 'DistroKid',
      api_key: 'dk_live_abcdef123456'
    },
    settings: {
      auto_distribute: false,
      platforms: ['Spotify', 'Apple Music'],
      release_date_offset: 14
    },
    lastSync: '2024-01-17T10:00:00Z',
    status: 'healthy'
  }
}

export default function PlatformSettingsPage({ params }: { params: { platform: string } }) {
  const router = useRouter()
  const platform = params.platform
  const config = platformConfigs[platform]
  const currentSettings = mockCurrentSettings[platform as keyof typeof mockCurrentSettings]
  
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [credentials, setCredentials] = useState<Record<string, string>>(currentSettings?.credentials || {})
  const [settings, setSettings] = useState<Record<string, any>>(currentSettings?.settings || {})

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Platform not found</h1>
          <p className="text-muted-foreground mb-4">The platform "{platform}" is not recognized.</p>
          <Link href="/integrations">
            <Button>Back to Integrations</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    toast.success('Settings saved successfully')
  }

  const handleTest = async () => {
    setIsTesting(true)
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsTesting(false)
    toast.success('Connection test successful')
  }

  const handleDisconnect = async () => {
    if (confirm(`Are you sure you want to disconnect from ${config.name}? This will stop all automatic registrations.`)) {
      toast.success('Platform disconnected')
      router.push('/integrations')
    }
  }

  const toggleSecretVisibility = (fieldId: string) => {
    setShowSecrets(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/integrations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{config.name} Settings</h1>
              <p className="text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <Badge className={currentSettings?.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}>
            {currentSettings?.connected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>

        {/* Connection Status */}
        {currentSettings?.connected && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Connected</AlertTitle>
            <AlertDescription>
              Last synced: {new Date(currentSettings.lastSync).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  {config.authType === 'oauth' 
                    ? 'This platform uses OAuth authentication'
                    : 'Configure your platform credentials'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.authType === 'oauth' ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This platform uses OAuth. You'll be redirected to {config.name} to authorize access.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-4">
                      <Button>
                        <Link2 className="h-4 w-4 mr-2" />
                        Reauthorize
                      </Button>
                      <Button variant="outline" onClick={handleTest} disabled={isTesting}>
                        <TestTube className="h-4 w-4 mr-2" />
                        {isTesting ? 'Testing...' : 'Test Connection'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {config.fields.map((field: any) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>
                          {field.label} {field.required && '*'}
                        </Label>
                        {field.type === 'select' ? (
                          <Select 
                            value={credentials[field.id] || ''} 
                            onValueChange={(value) => setCredentials({ ...credentials, [field.id]: value })}
                          >
                            <SelectTrigger id={field.id}>
                              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option: string) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === 'password' ? (
                          <div className="relative">
                            <Input
                              id={field.id}
                              type={showSecrets[field.id] ? 'text' : 'password'}
                              value={credentials[field.id] || ''}
                              onChange={(e) => setCredentials({ ...credentials, [field.id]: e.target.value })}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => toggleSecretVisibility(field.id)}
                            >
                              {showSecrets[field.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type}
                            value={credentials[field.id] || ''}
                            onChange={(e) => setCredentials({ ...credentials, [field.id]: e.target.value })}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                    <div className="flex gap-4 pt-4">
                      <Button onClick={handleTest} disabled={isTesting} variant="outline">
                        <TestTube className="h-4 w-4 mr-2" />
                        {isTesting ? 'Testing...' : 'Test Connection'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure how The Plug interacts with {config.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(config.settings).map(([key, setting]: [string, any]) => (
                  <div key={key} className="space-y-2">
                    {setting.type === 'select' ? (
                      <>
                        <Label htmlFor={key}>{setting.label}</Label>
                        <Select 
                          value={settings[key] || setting.default} 
                          onValueChange={(value) => setSettings({ ...settings, [key]: value })}
                        >
                          <SelectTrigger id={key}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {setting.options.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : setting.type === 'number' ? (
                      <>
                        <Label htmlFor={key}>{setting.label}</Label>
                        <Input
                          id={key}
                          type="number"
                          value={settings[key] || setting.default}
                          onChange={(e) => setSettings({ ...settings, [key]: parseInt(e.target.value) })}
                        />
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <Label htmlFor={key} className="cursor-pointer">
                          {setting.label}
                        </Label>
                        <Switch
                          id={key}
                          checked={settings[key] !== undefined ? settings[key] : setting.default}
                          onCheckedChange={(checked) => setSettings({ ...settings, [key]: checked })}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Recent registrations and sync events with {config.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'sync', message: 'Automatic sync completed', time: '2 hours ago', status: 'success' },
                    { type: 'registration', message: '5 new songs registered', time: '3 hours ago', status: 'success' },
                    { type: 'error', message: 'Connection failed - retrying', time: '1 day ago', status: 'error' },
                    { type: 'sync', message: 'Manual sync triggered', time: '2 days ago', status: 'success' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className={`mt-1 h-2 w-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">127</p>
                    <p className="text-sm text-muted-foreground">Total Registrations</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">98.5%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <Button 
            variant="destructive" 
            onClick={handleDisconnect}
            disabled={!currentSettings?.connected}
          >
            <Unlink className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/integrations')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}