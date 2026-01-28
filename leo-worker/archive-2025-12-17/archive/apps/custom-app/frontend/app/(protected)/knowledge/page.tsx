"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import { 
  Search, 
  FileText, 
  Download, 
  BookOpen,
  Home,
  DollarSign,
  Shield,
  AlertTriangle,
  Wrench,
  Scale,
  Clock,
  TrendingUp
} from "lucide-react"

interface KnowledgeCategory {
  id: string
  title: string
  description: string
  icon: any
  articleCount: number
  popular?: boolean
}

interface Article {
  id: string
  title: string
  category: string
  description: string
  readTime: number
  updatedAt: string
  popular?: boolean
}

interface Form {
  id: string
  title: string
  description: string
  category: string
  fileSize: string
  popular?: boolean
}

const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    id: 'tenant-rights',
    title: 'Tenant Rights',
    description: 'Your fundamental rights as a tenant in California',
    icon: Shield,
    articleCount: 24,
    popular: true
  },
  {
    id: 'security-deposits',
    title: 'Security Deposits',
    description: 'Rules about deposits, deductions, and returns',
    icon: DollarSign,
    articleCount: 18
  },
  {
    id: 'repairs-maintenance',
    title: 'Repairs & Maintenance',
    description: 'Landlord obligations and tenant remedies',
    icon: Wrench,
    articleCount: 21
  },
  {
    id: 'evictions',
    title: 'Evictions',
    description: 'Eviction process, defenses, and protections',
    icon: AlertTriangle,
    articleCount: 19,
    popular: true
  },
  {
    id: 'rent-control',
    title: 'Rent Control',
    description: 'Local rent control laws and regulations',
    icon: TrendingUp,
    articleCount: 15
  },
  {
    id: 'fair-housing',
    title: 'Fair Housing',
    description: 'Discrimination laws and protected classes',
    icon: Scale,
    articleCount: 12
  },
  {
    id: 'lease-agreements',
    title: 'Lease Agreements',
    description: 'Understanding and negotiating lease terms',
    icon: FileText,
    articleCount: 22
  },
  {
    id: 'move-in-out',
    title: 'Move-In/Move-Out',
    description: 'Procedures, documentation, and checklists',
    icon: Home,
    articleCount: 16
  }
]

const POPULAR_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'California Tenant Rights: A Complete Guide',
    category: 'tenant-rights',
    description: 'Comprehensive overview of your rights as a tenant in California',
    readTime: 15,
    updatedAt: '2024-01-15',
    popular: true
  },
  {
    id: '2',
    title: 'Security Deposit Return Timeline and Requirements',
    category: 'security-deposits',
    description: 'When and how landlords must return your deposit',
    readTime: 8,
    updatedAt: '2024-01-20',
    popular: true
  },
  {
    id: '3',
    title: 'Emergency Repairs: When You Can Fix and Deduct',
    category: 'repairs-maintenance',
    description: 'Your rights to make repairs and deduct from rent',
    readTime: 10,
    updatedAt: '2024-01-18'
  },
  {
    id: '4',
    title: 'Fighting Wrongful Eviction in California',
    category: 'evictions',
    description: 'Legal defenses and tenant protections against eviction',
    readTime: 12,
    updatedAt: '2024-01-22',
    popular: true
  }
]

const FORMS_LIBRARY: Form[] = [
  {
    id: 'repair-request',
    title: 'Repair Request Form',
    description: 'Official template for requesting repairs from your landlord',
    category: 'repairs-maintenance',
    fileSize: '245 KB',
    popular: true
  },
  {
    id: 'deposit-itemization',
    title: 'Security Deposit Itemization Request',
    description: 'Request detailed breakdown of deposit deductions',
    category: 'security-deposits',
    fileSize: '189 KB'
  },
  {
    id: 'habitability-complaint',
    title: 'Habitability Complaint Form',
    description: 'Document uninhabitable living conditions',
    category: 'repairs-maintenance',
    fileSize: '312 KB'
  },
  {
    id: 'discrimination-complaint',
    title: 'Fair Housing Complaint Form',
    description: 'File a discrimination complaint with HUD',
    category: 'fair-housing',
    fileSize: '425 KB'
  }
]

export default function KnowledgeBasePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Simulate search - in real app, this would call the API
      const results = POPULAR_ARTICLES.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(results)
      router.push(`/knowledge/search?q=${encodeURIComponent(searchQuery)}`)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = KNOWLEDGE_CATEGORIES.find(c => c.id === categoryId)
    return category?.icon || FileText
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground">
          California tenant laws, rights, and resources at your fingertips
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for tenant rights, security deposits, evictions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KNOWLEDGE_CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/knowledge/category/${category.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {category.popular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <p className="text-xs text-muted-foreground">{category.articleCount} articles</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Popular Articles */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Popular Articles</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/knowledge/articles">View All</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {POPULAR_ARTICLES.map((article) => {
            const Icon = getCategoryIcon(article.category)
            return (
              <Card 
                key={article.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/knowledge/article/${article.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{article.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime} min read
                        </span>
                        <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                        {article.popular && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Forms Library */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Forms Library</CardTitle>
              <CardDescription>
                Download official forms and templates for common tenant needs
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/knowledge/forms">View All Forms</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {FORMS_LIBRARY.slice(0, 4).map((form) => (
              <div 
                key={form.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{form.title}</p>
                    <p className="text-sm text-muted-foreground">{form.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF • {form.fileSize}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Help */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Immediate Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/ai-advisor">
                <BookOpen className="mr-2 h-4 w-4" />
                Ask AI Legal Advisor
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/disputes/new">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Start a Dispute
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/letters">
                <FileText className="mr-2 h-4 w-4" />
                Generate a Letter
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}