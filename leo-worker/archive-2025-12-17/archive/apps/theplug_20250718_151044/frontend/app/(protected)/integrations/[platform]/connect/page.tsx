"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  Key, 
  Link2, 
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Shield,
  Loader2,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

// Platform configurations
const platformConfigs: Record<string, any> = {
  mlc: {
    name: 'MLC',
    fullName: 'Mechanical Licensing Collective',
    description: 'Connect to MLC to register your mechanical rights and collect streaming royalties.',
    connectionMethods: ['api', 'bulk'],
    apiFields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
      { name: 'api_secret', label: 'API Secret', type: 'password', required: true },
      { name: 'environment', label: 'Environment', type: 'select', options: ['production', 'sandbox'], required: true },
    ],
    documentation: 'https://themlc.com/api-documentation',
    requirements: [
      'Active MLC membership',
      'API credentials from MLC portal',
      'Verified publisher information',
    ],
  },
  soundexchange: {
    name: 'SoundExchange',
    fullName: 'SoundExchange',
    description: 'Connect to SoundExchange to collect digital performance royalties.',
    connectionMethods: ['oauth', 'api'],
    apiFields: [
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
    ],
    documentation: 'https://soundexchange.com/api',
    requirements: [
      'SoundExchange account',
      'Verified artist profile',
      'Bank account on file',
    ],
  },
  pro: {
    name: 'PROs',
    fullName: 'Performance Rights Organizations',
    description: 'Connect to ASCAP, BMI, or SESAC to register performance rights.',
    connectionMethods: ['bulk'],
    bulkInstructions: [
      'Export your song catalog from The Plug',
      'Log in to your PRO portal',
      'Use their bulk upload feature',
      'Upload the exported CSV file',
      'Return here to confirm completion',
    ],
    documentation: 'https://help.theplug.com/pro-integration',
    requirements: [
      'Active PRO membership',
      'Writer/Publisher account',
      'IPI/CAE number',
    ],
  },
}

export default function PlatformConnectPage() {
  const params = useParams()
  const router = useRouter()
  const platform = params.platform as string
  const config = platformConfigs[platform] || {}
  
  const [connectionMethod, setConnectionMethod] = useState(config.connectionMethods?.[0] || 'api')
  const [isConnecting, setIsConnecting] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({
    environment: 'production'
  })

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (connectionMethod === 'api' && config.apiFields) {
      for (const field of config.apiFields) {
        if (field.required && !formData[field.name]) {
          toast.error(`Please enter ${field.label}`)
          return false
        }
      }
    }
    return true
  }

  const testConnection = async () => {
    if (!validateForm()) return
    
    setIsConnecting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate success/failure
    const success = Math.random() > 0.3
    
    if (success) {
      toast.success('Connection test successful!')
      return true
    } else {
      toast.error('Connection test failed. Please check your credentials.')
      return false
    }
  }

  const handleConnect = async () => {
    const testResult = await testConnection()
    
    if (testResult) {
      // Simulate saving connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Successfully connected to ${config.name}!`)
      router.push('/integrations')
    }
    
    setIsConnecting(false)
  }

  const handleOAuthConnect = () => {
    toast.info('Redirecting to platform for authorization...')
    // In real app, would redirect to OAuth provider
    setTimeout(() => {
      toast.success('Authorization successful!')
      router.push('/integrations')
    }, 2000)
  }

  if (!config.name) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Platform not found</AlertTitle>
          <AlertDescription>
            The platform &quot;{platform}&quot; is not recognized.
          </AlertDescription>
        </Alert>
        <Link href="/integrations">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Integrations
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button and Header */}
      <div className="flex items-center gap-4">
        <Link href="/integrations">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Connect {config.name}</h1>
          <p className="text-muted-foreground mt-1">{config.fullName}</p>
        </div>
      </div>

      {/* Platform Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>About {config.name}</AlertTitle>
        <AlertDescription>{config.description}</AlertDescription>
      </Alert>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>
            Make sure you have the following before connecting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {config.requirements?.map((req: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{req}</span>
              </li>
            ))}
          </ul>
          {config.documentation && (
            <div className="mt-4 pt-4 border-t">
              <a
                href={config.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View API Documentation
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Method Selection */}
      {config.connectionMethods?.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Method</CardTitle>
            <CardDescription>
              Choose how you want to connect to {config.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={connectionMethod} onValueChange={setConnectionMethod}>
              {config.connectionMethods.includes('api') && (
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="api" id="api" />
                  <Label htmlFor="api" className="flex items-center gap-2 cursor-pointer">
                    <Key className="h-4 w-4" />
                    API Key
                    <Badge variant="secondary">Recommended</Badge>
                  </Label>
                </div>
              )}
              {config.connectionMethods.includes('oauth') && (
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="oauth" id="oauth" />
                  <Label htmlFor="oauth" className="flex items-center gap-2 cursor-pointer">
                    <Link2 className="h-4 w-4" />
                    OAuth (Sign in with {config.name})
                  </Label>
                </div>
              )}
              {config.connectionMethods.includes('bulk') && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bulk" id="bulk" />
                  <Label htmlFor="bulk" className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Bulk Upload
                  </Label>
                </div>
              )}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Connection Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {connectionMethod === 'api' && 'API Credentials'}
            {connectionMethod === 'oauth' && 'OAuth Authorization'}
            {connectionMethod === 'bulk' && 'Bulk Upload Instructions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectionMethod === 'api' && config.apiFields && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleConnect(); }}>
              {config.apiFields.map((field: any) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === 'select' ? (
                    <select
                      id={field.name}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                    >
                      {field.options.map((option: string) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.type === 'password' ? '••••••••••••' : ''}
                    />
                  )}
                </div>
              ))}
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your credentials are encrypted and stored securely. We never share them with third parties.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
                <Button type="submit" disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Save and Connect'
                  )}
                </Button>
              </div>
            </form>
          )}

          {connectionMethod === 'oauth' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You&apos;ll be redirected to {config.name} to authorize The Plug to access your account.
              </p>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  We only request the minimum permissions needed to register your music and check registration status.
                </AlertDescription>
              </Alert>
              <Button onClick={handleOAuthConnect} className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Authorize with {config.name}
              </Button>
            </div>
          )}

          {connectionMethod === 'bulk' && config.bulkInstructions && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Follow these steps to complete the bulk upload process:
              </p>
              <ol className="space-y-3">
                {config.bulkInstructions.map((instruction: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm">{instruction}</span>
                  </li>
                ))}
              </ol>
              <div className="flex gap-2 pt-4">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Catalog
                </Button>
                <Button>Mark as Complete</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}