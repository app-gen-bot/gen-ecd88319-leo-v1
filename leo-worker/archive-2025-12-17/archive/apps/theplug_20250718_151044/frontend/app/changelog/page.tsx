import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Sparkles, 
  Bug, 
  Wrench, 
  Zap,
  Shield,
  Megaphone
} from 'lucide-react'

interface ChangelogEntry {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  categories: {
    new?: string[]
    improved?: string[]
    fixed?: string[]
    security?: string[]
  }
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.1.0',
    date: 'January 15, 2024',
    type: 'minor',
    categories: {
      new: [
        'Bulk registration for multiple songs at once',
        'Export registration reports as PDF',
        'Dark mode support across all pages',
      ],
      improved: [
        'Registration speed improved by 40%',
        'Better error messages for failed registrations',
        'Mobile responsive design enhancements',
      ],
      fixed: [
        'Fixed duplicate registration detection',
        'Resolved timezone issues in activity feed',
      ],
    },
  },
  {
    version: '2.0.0',
    date: 'December 1, 2023',
    type: 'major',
    categories: {
      new: [
        'Complete UI redesign with modern interface',
        'Real-time registration status updates via WebSocket',
        'PRO bulk registration support',
        'Revenue analytics and projections dashboard',
      ],
      improved: [
        'Metadata extraction accuracy increased to 95%',
        'Platform connection stability improvements',
        'Faster file upload processing',
      ],
      security: [
        'Enhanced API key encryption',
        'Two-factor authentication support',
      ],
    },
  },
  {
    version: '1.5.2',
    date: 'November 15, 2023',
    type: 'patch',
    categories: {
      fixed: [
        'Fixed MLC API timeout issues',
        'Resolved memory leak in file processor',
        'Corrected validation for ISRC codes',
      ],
    },
  },
  {
    version: '1.5.0',
    date: 'October 20, 2023',
    type: 'minor',
    categories: {
      new: [
        'SoundExchange integration',
        'Automatic retry for failed registrations',
        'Email notifications for registration status',
      ],
      improved: [
        'Dashboard loading speed improved by 60%',
        'Better handling of large music libraries',
      ],
    },
  },
]

export default function ChangelogPage() {
  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'destructive'
      case 'minor':
        return 'default'
      case 'patch':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'new':
        return <Sparkles className="h-4 w-4 text-green-500" />
      case 'improved':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'fixed':
        return <Bug className="h-4 w-4 text-orange-500" />
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />
      default:
        return <Wrench className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'new':
        return 'New Features'
      case 'improved':
        return 'Improvements'
      case 'fixed':
        return 'Bug Fixes'
      case 'security':
        return 'Security Updates'
      default:
        return category
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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Megaphone className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
            <p className="text-muted-foreground">
              Track all updates, improvements, and fixes to The Plug platform
            </p>
          </div>

          {/* Subscribe Banner */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Stay in the Loop</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified about new features and important updates
                </p>
                <Button>Subscribe to Updates</Button>
              </div>
            </CardContent>
          </Card>

          {/* Changelog Entries */}
          <div className="space-y-6">
            {changelog.map((entry) => (
              <Card key={entry.version}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle>Version {entry.version}</CardTitle>
                      <Badge variant={getVersionBadgeColor(entry.type)}>
                        {entry.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.date}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(entry.categories).map(([category, items]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <h4 className="font-medium">{getCategoryTitle(category)}</h4>
                        </div>
                        <ul className="space-y-2 ml-6">
                          {items.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <span className="mr-2">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center pt-8">
            <Button variant="outline">
              Load Older Versions
            </Button>
          </div>

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