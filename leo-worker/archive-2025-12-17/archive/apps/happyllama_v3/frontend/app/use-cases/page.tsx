"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"
import { useCasesData } from "@/lib/use-cases-data"

const industries = [
  "Healthcare",
  "Finance",
  "Retail",
  "Technology",
  "Education",
  "Enterprise",
  "Real Estate"
]

const complexities = ["Simple", "Medium", "Complex"]
const userTypes = ["Citizen Developer", "Startup Teams", "Enterprise"]

const industryColors: Record<string, string> = {
  Healthcare: "blue",
  Retail: "green",
  Technology: "purple",
  Enterprise: "yellow",
  Education: "pink",
  Finance: "orange",
  "Real Estate": "cyan"
}

const complexityColors: Record<string, string> = {
  Simple: "green",
  Medium: "yellow",
  Complex: "red"
}

export default function UseCasesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedComplexity, setSelectedComplexity] = useState<string>("all")
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("recent")
  const [showFilters, setShowFilters] = useState(true)
  const [displayCount, setDisplayCount] = useState(12)

  // Filter and sort use cases
  const filteredUseCases = useMemo(() => {
    let filtered = [...useCasesData]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(uc =>
        uc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Industry filter
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(uc =>
        selectedIndustries.includes(uc.industry)
      )
    }

    // Complexity filter
    if (selectedComplexity !== "all") {
      filtered = filtered.filter(uc =>
        uc.complexity === selectedComplexity
      )
    }

    // User type filter
    if (selectedUserTypes.length > 0) {
      filtered = filtered.filter(uc =>
        uc.userType.some(type => selectedUserTypes.includes(type))
      )
    }

    // Sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
        break
      case "popular":
        filtered.sort((a, b) => b.popularity - a.popularity)
        break
      case "buildTime":
        filtered.sort((a, b) => {
          const timeA = parseFloat(a.buildTime.split(" ")[0])
          const timeB = parseFloat(b.buildTime.split(" ")[0])
          return timeA - timeB
        })
        break
      case "industry":
        filtered.sort((a, b) => a.industry.localeCompare(b.industry))
        break
    }

    return filtered
  }, [searchQuery, selectedIndustries, selectedComplexity, selectedUserTypes, sortBy])

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    )
  }

  const toggleUserType = (userType: string) => {
    setSelectedUserTypes(prev =>
      prev.includes(userType)
        ? prev.filter(t => t !== userType)
        : [...prev, userType]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedIndustries([])
    setSelectedComplexity("all")
    setSelectedUserTypes([])
    setSortBy("recent")
  }

  const hasActiveFilters = searchQuery || selectedIndustries.length > 0 || 
    selectedComplexity !== "all" || selectedUserTypes.length > 0

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 sm:text-4xl md:text-5xl">
            Use Case Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore real applications built with Happy Llama in hours, not months
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search use cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="buildTime">Fastest Build</SelectItem>
                <SelectItem value="industry">Industry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Panel */}
          <aside className={`w-64 flex-shrink-0 ${showFilters ? "block" : "hidden sm:block"}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-1 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Industry Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Industry</Label>
                  <div className="space-y-2">
                    {industries.map((industry) => {
                      const count = useCasesData.filter(uc => uc.industry === industry).length
                      return (
                        <div key={industry} className="flex items-center space-x-2">
                          <Checkbox
                            id={industry}
                            checked={selectedIndustries.includes(industry)}
                            onCheckedChange={() => toggleIndustry(industry)}
                          />
                          <Label
                            htmlFor={industry}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {industry} ({count})
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Complexity Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Complexity</Label>
                  <RadioGroup value={selectedComplexity} onValueChange={setSelectedComplexity}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all-complexity" />
                      <Label htmlFor="all-complexity" className="text-sm font-normal cursor-pointer">
                        All Complexities
                      </Label>
                    </div>
                    {complexities.map((complexity) => {
                      const count = useCasesData.filter(uc => uc.complexity === complexity).length
                      return (
                        <div key={complexity} className="flex items-center space-x-2">
                          <RadioGroupItem value={complexity} id={complexity} />
                          <Label htmlFor={complexity} className="text-sm font-normal cursor-pointer">
                            {complexity} ({count})
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </div>

                <Separator />

                {/* User Type Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">User Type</Label>
                  <div className="space-y-2">
                    {userTypes.map((userType) => {
                      const count = useCasesData.filter(uc => 
                        uc.userType.includes(userType)
                      ).length
                      return (
                        <div key={userType} className="flex items-center space-x-2">
                          <Checkbox
                            id={userType}
                            checked={selectedUserTypes.includes(userType)}
                            onCheckedChange={() => toggleUserType(userType)}
                          />
                          <Label
                            htmlFor={userType}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {userType} ({count})
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredUseCases.length} of {useCasesData.length} use cases
            </div>

            {/* Use Case Grid */}
            {filteredUseCases.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredUseCases.slice(0, displayCount).map((useCase) => (
                  <Link key={useCase.id} href={`/use-cases/${useCase.id}`}>
                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                        {useCase.image.startsWith("/stock_photos/") ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl font-bold text-primary/30 mb-2">
                                {useCase.title.substring(0, 2).toUpperCase()}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {useCase.industry}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={useCase.image}
                            alt={useCase.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        
                        {/* Overlay badges */}
                        <div className="absolute top-2 left-2 flex gap-2">
                          <Badge variant={industryColors[useCase.industry] as any || "default"}>
                            {useCase.industry}
                          </Badge>
                          <Badge variant={complexityColors[useCase.complexity] as any || "default"}>
                            {useCase.complexity}
                          </Badge>
                        </div>

                        {/* View Details overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-semibold flex items-center gap-2">
                            View Details <ArrowRightIcon className="h-4 w-4" />
                          </p>
                        </div>
                      </div>

                      <CardHeader>
                        <CardTitle className="line-clamp-1">{useCase.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {useCase.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        {/* Build time */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <ClockIcon className="h-4 w-4" />
                          <span>Built in {useCase.buildTime}</span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {useCase.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  ))}
                </div>
                
                {/* Load More Button */}
                {filteredUseCases.length > displayCount && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setDisplayCount(prev => prev + 12)}
                    >
                      Load More Use Cases
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({filteredUseCases.length - displayCount} remaining)
                      </span>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  No use cases found matching your filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}