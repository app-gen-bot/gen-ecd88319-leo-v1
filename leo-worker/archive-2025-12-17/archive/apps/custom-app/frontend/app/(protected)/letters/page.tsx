"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/contexts/auth-context"
import { 
  FileText, 
  Search, 
  Plus, 
  Star, 
  Clock, 
  Mail,
  Download,
  Edit,
  Eye,
  Send
} from "lucide-react"

interface LetterTemplate {
  id: string
  title: string
  description: string
  category: 'tenant' | 'landlord'
  type: string
  popularity: number
  preview: string
  fields: string[]
}

interface SavedLetter {
  id: string
  template_id: string
  title: string
  status: 'draft' | 'sent'
  created_at: string
  sent_at?: string
  recipient?: string
}

const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'repair-request',
    title: 'Repair Request Letter',
    description: 'Formal request for necessary repairs with legal timeline',
    category: 'tenant',
    type: 'maintenance',
    popularity: 95,
    preview: 'Dear [Landlord Name], I am writing to formally request repairs...',
    fields: ['landlord_name', 'property_address', 'repair_description', 'date_noticed']
  },
  {
    id: 'security-deposit-return',
    title: 'Security Deposit Return Request',
    description: 'Demand return of security deposit with interest calculation',
    category: 'tenant',
    type: 'financial',
    popularity: 90,
    preview: 'Dear [Landlord Name], This letter serves as a formal request for the return of my security deposit...',
    fields: ['landlord_name', 'property_address', 'deposit_amount', 'move_out_date']
  },
  {
    id: 'rent-increase-objection',
    title: 'Rent Increase Objection',
    description: 'Challenge improper or illegal rent increases',
    category: 'tenant',
    type: 'financial',
    popularity: 85,
    preview: 'Dear [Landlord Name], I am writing to object to the rent increase notice...',
    fields: ['landlord_name', 'current_rent', 'proposed_rent', 'increase_date']
  },
  {
    id: 'lease-violation-notice',
    title: 'Lease Violation Response',
    description: 'Respond to false or unfounded lease violation claims',
    category: 'tenant',
    type: 'dispute',
    popularity: 80,
    preview: 'Dear [Landlord Name], I am responding to your notice dated [Date]...',
    fields: ['landlord_name', 'violation_date', 'violation_description', 'response']
  },
  {
    id: 'emergency-repair-notice',
    title: 'Emergency Repair Notice',
    description: 'Urgent notice for repairs affecting health and safety',
    category: 'tenant',
    type: 'maintenance',
    popularity: 88,
    preview: 'URGENT: This letter serves as emergency notice of conditions requiring immediate repair...',
    fields: ['landlord_name', 'emergency_issue', 'health_safety_concern', 'immediate_action_needed']
  },
  {
    id: 'move-out-notice',
    title: 'Move-Out Notice',
    description: 'Proper notice of intent to vacate with required timeline',
    category: 'tenant',
    type: 'notice',
    popularity: 92,
    preview: 'Dear [Landlord Name], This letter serves as my [30/60] day notice to vacate...',
    fields: ['landlord_name', 'property_address', 'move_out_date', 'forwarding_address']
  },
  {
    id: 'habitability-complaint',
    title: 'Habitability Complaint',
    description: 'Document violations of implied warranty of habitability',
    category: 'tenant',
    type: 'complaint',
    popularity: 75,
    preview: 'Dear [Landlord Name], This letter documents serious habitability issues...',
    fields: ['landlord_name', 'habitability_issues', 'duration', 'health_impacts']
  },
  {
    id: 'harassment-cease-desist',
    title: 'Harassment Cease & Desist',
    description: 'Stop landlord harassment and establish boundaries',
    category: 'tenant',
    type: 'complaint',
    popularity: 70,
    preview: 'Dear [Landlord Name], This letter serves as formal notice to cease and desist...',
    fields: ['landlord_name', 'harassment_incidents', 'dates', 'witnesses']
  }
]

export default function LettersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'tenant' | 'landlord'>('all')
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSavedLetters()
  }, [])

  const loadSavedLetters = async () => {
    try {
      const letters = await apiClient.getSavedLetters()
      setSavedLetters(letters as SavedLetter[])
    } catch (error) {
      console.error('Failed to load saved letters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTemplates = LETTER_TEMPLATES
    .filter(template => 
      (selectedCategory === 'all' || template.category === selectedCategory) &&
      (searchQuery === '' || 
       template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       template.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.popularity - a.popularity)

  const draftLetters = savedLetters.filter(l => l.status === 'draft')
  const sentLetters = savedLetters.filter(l => l.status === 'sent')

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Letters & Notices</h1>
        <p className="text-muted-foreground mt-1">
          Generate legally compliant letters and notices with automatic formatting
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftLetters.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentLetters.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Letter Templates</CardTitle>
              <CardDescription>
                Choose from our collection of legally vetted letter templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedCategory === 'tenant' ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory('tenant')}
                    >
                      Tenant
                    </Button>
                    <Button
                      variant={selectedCategory === 'landlord' ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory('landlord')}
                    >
                      Landlord
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        {template.popularity >= 90 && (
                          <Badge variant="secondary" className="ml-2">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {template.preview}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {template.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.fields.length} fields
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        asChild
                      >
                        <Link href={`/letters/create/${template.id}`}>
                          Use Template
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Draft Letters</CardTitle>
              <CardDescription>
                Continue working on your saved drafts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {draftLetters.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No draft letters</p>
                  <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                    Browse Templates
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {draftLetters.map((letter) => (
                    <Card key={letter.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{letter.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(letter.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sent Letters</CardTitle>
              <CardDescription>
                View and track your sent letters
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentLetters.length === 0 ? (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No sent letters yet</p>
                  <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                    Create Your First Letter
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentLetters.map((letter) => (
                    <Card key={letter.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Send className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{letter.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Sent to {letter.recipient} on {new Date(letter.sent_at!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}