"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Link2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  TestTube,
  Unlink,
  RefreshCw,
  Info,
  ExternalLink,
  Shield,
  Zap,
  DollarSign,
  Users,
  FileText,
  Building
} from 'lucide-react'
import { toast } from 'sonner'

// Mock platform data
const platforms = [
  {
    id: 'mlc',
    name: 'MLC',
    fullName: 'Mechanical Licensing Collective',
    description: 'Handles mechanical royalties for streaming and downloads in the US',
    icon: Building,
    status: 'connected',
    health: 'healthy',
    lastSync: '2 minutes ago',
    registrationCount: 24,
    features: ['Mechanical royalties', 'Streaming', 'Downloads', 'Automatic matching'],
    credentials: {
      type: 'api',
      configured: true,
    },
  },
  {
    id: 'soundexchange',
    name: 'SoundExchange',
    fullName: 'SoundExchange',
    description: 'Collects and distributes digital performance royalties',
    icon: Zap,
    status: 'disconnected',
    health: 'disconnected',
    lastSync: 'Never',
    registrationCount: 0,
    features: ['Digital radio', 'Streaming royalties', 'Satellite radio', 'Webcasting'],
    credentials: {
      type: 'api',
      configured: false,
    },
  },
  {
    id: 'distribution',
    name: 'Distribution',
    fullName: 'Distribution Partners',
    description: 'Connect to DistroKid, CD Baby, TuneCore, and more',
    icon: Users,
    status: 'connected',
    health: 'healthy',
    lastSync: '1 hour ago',
    registrationCount: 18,
    features: ['Multi-platform release', 'Global distribution', 'Spotify', 'Apple Music'],
    credentials: {
      type: 'oauth',
      configured: true,
    },
  },
  {
    id: 'pro',
    name: 'PROs',
    fullName: 'Performance Rights Organizations',
    description: 'ASCAP, BMI, SESAC - Performance royalties from public performances',
    icon: FileText,
    status: 'error',
    health: 'error',
    lastSync: '3 days ago',
    registrationCount: 12,
    features: ['Live performances', 'Radio airplay', 'TV/Film', 'Public venues'],
    credentials: {
      type: 'bulk',
      configured: true,
    },
    error: 'Authentication expired. Please reconnect.',
  },
  {
    id: 'copyright',
    name: 'Copyright Office',
    fullName: 'US Copyright Office',
    description: 'Official copyright registration for your compositions',
    icon: Shield,
    status: 'not_configured',
    health: 'not_configured',
    lastSync: 'Phase 2',
    registrationCount: 0,
    features: ['Legal protection', 'Official registration', 'Statutory damages', 'Public record'],
    credentials: {
      type: 'browser',
      configured: false,
    },
    comingSoon: true,
  },
]

export default function IntegrationsPage() {
  const router = useRouter()
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'disconnected':
      case 'not_configured':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge variant="success">Healthy</Badge>
      case 'degraded':
        return <Badge variant="warning">Degraded</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>
      case 'not_configured':
        return <Badge variant="secondary">Not Set Up</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const testConnection = async (platformId: string) => {
    setTestingPlatform(platformId)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const platform = platforms.find(p => p.id === platformId)
    if (platform?.status === 'connected') {
      toast.success(`${platform.name} connection is working properly`)
    } else {
      toast.error(`Failed to connect to ${platform?.name}`)
    }
    
    setTestingPlatform(null)
  }

  const connectedCount = platforms.filter(p => p.status === 'connected').length
  const totalCount = platforms.filter(p => !p.comingSoon).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect and manage your music platform integrations
        </p>
      </div>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount} of {totalCount}</div>
            <p className="text-xs text-muted-foreground">platforms connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platforms.filter(p => p.health === 'healthy').length} Healthy
            </div>
            <p className="text-xs text-muted-foreground">
              {platforms.filter(p => p.health === 'error').length} issues detected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 min ago</div>
            <p className="text-xs text-muted-foreground">across all platforms</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {platforms.map((platform) => (
          <Card 
            key={platform.id} 
            className={`${platform.status === 'error' ? 'border-destructive' : ''} cursor-pointer hover:shadow-lg transition-shadow`}
            onClick={() => {
              const path = platform.status === 'connected' ? 'settings' : 'connect'
              router.push(`/integrations/${platform.id}/${path}`)
            }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <platform.icon className={`h-5 w-5 ${getStatusColor(platform.status)}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <CardDescription>{platform.fullName}</CardDescription>
                  </div>
                </div>
                {getHealthBadge(platform.health)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{platform.description}</p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {platform.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Status Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last sync:</span>
                  <span>{platform.lastSync}</span>
                </div>
                {platform.registrationCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registrations:</span>
                    <span>{platform.registrationCount}</span>
                  </div>
                )}
                {platform.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {platform.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {platform.status === 'connected' && (
                  <>
                    <Link href={`/integrations/${platform.id}/settings`}>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testConnection(platform.id)}
                      disabled={testingPlatform === platform.id}
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      {testingPlatform === platform.id ? 'Testing...' : 'Test'}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Unlink className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </>
                )}
                {platform.status === 'error' && (
                  <>
                    <Link href={`/integrations/${platform.id}/settings`}>
                      <Button variant="destructive" size="sm">
                        Fix Connection
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      View Error
                    </Button>
                  </>
                )}
                {platform.status === 'disconnected' && (
                  <>
                    <Link href={`/integrations/${platform.id}/connect`}>
                      <Button size="sm">
                        Connect
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Info className="h-4 w-4 mr-1" />
                      Learn More
                    </Button>
                  </>
                )}
                {platform.status === 'not_configured' && platform.comingSoon && (
                  <Button size="sm" disabled>
                    Coming in Phase 2
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security &amp; Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your platform credentials are encrypted and stored securely. We use industry-standard 
            security practices to protect your data and never share your credentials with third parties.
          </p>
          <div className="flex gap-4">
            <Link href="/api-docs">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                API Documentation
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="sm">
                Privacy Policy
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}