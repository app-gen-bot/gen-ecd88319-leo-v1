'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle,
  Chrome,
  Globe,
  Smartphone,
  Download
} from 'lucide-react'

const supportedBrowsers = [
  {
    name: 'Google Chrome',
    version: '90+',
    icon: Chrome,
    url: 'https://www.google.com/chrome/',
    recommended: true
  },
  {
    name: 'Mozilla Firefox',
    version: '88+',
    icon: Globe,
    url: 'https://www.mozilla.org/firefox/',
    recommended: true
  },
  {
    name: 'Microsoft Edge',
    version: '90+',
    icon: Globe,
    url: 'https://www.microsoft.com/edge',
    recommended: false
  },
  {
    name: 'Safari',
    version: '14+',
    icon: Globe,
    url: 'https://www.apple.com/safari/',
    recommended: false
  }
]

export default function UnsupportedBrowserPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="text-center py-12 px-6">
          <div className="mx-auto w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Unsupported Browser</h1>
          
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your current browser is not supported by The Plug. 
            To ensure the best experience and security, please upgrade to a modern browser.
          </p>
          
          {/* Current Browser Info */}
          <div className="bg-muted rounded-lg p-4 mb-8 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-1">Your browser:</p>
            <p className="font-medium">Internet Explorer 11</p>
            <p className="text-xs text-red-600 mt-2">No longer supported</p>
          </div>
          
          {/* Supported Browsers */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Supported Browsers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {supportedBrowsers.map((browser) => (
                <a
                  key={browser.name}
                  href={browser.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <browser.icon className="h-8 w-8 text-primary flex-shrink-0" />
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{browser.name}</p>
                            {browser.recommended && (
                              <Badge className="text-xs" variant="secondary">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Version {browser.version}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
          
          {/* Mobile Option */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-md mx-auto">
            <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Try our mobile experience</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The Plug works great on modern mobile browsers too!
            </p>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Get Mobile App (Coming Soon)
            </Button>
          </div>
          
          {/* Why Upgrade */}
          <div className="mt-8 pt-8 border-t text-left max-w-md mx-auto">
            <h3 className="font-semibold mb-3">Why upgrade your browser?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Enhanced security protection</li>
              <li>• Faster performance and loading times</li>
              <li>• Access to modern web features</li>
              <li>• Better compatibility with web applications</li>
            </ul>
          </div>
          
          <div className="mt-8 text-xs text-muted-foreground">
            Need help? Contact our support team at support@theplug.com
          </div>
        </CardContent>
      </Card>
    </div>
  )
}