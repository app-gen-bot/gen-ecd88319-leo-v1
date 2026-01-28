"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ClockIcon,
  CheckCircleIcon,
  CodeBracketSquareIcon,
  ChartBarIcon,
  RocketLaunchIcon
} from "@heroicons/react/24/outline"
import { useCasesData } from "@/lib/use-cases-data"
import { toast } from "@/hooks/use-toast"

export default function UseCaseDetailPage() {
  const params = useParams()
  const useCase = useCasesData.find(uc => uc.id === params.id)

  if (!useCase) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container text-center">
          <h1 className="text-2xl font-bold mb-4">Use Case Not Found</h1>
          <Link href="/use-cases">
            <Button variant="outline">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied!",
      description: "Share this use case with others",
    })
  }

  const handleDownload = () => {
    toast({
      title: "Downloading case study...",
      description: "Your PDF will be ready shortly",
    })
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/use-cases" className="hover:text-foreground transition-colors">
            Use Cases
          </Link>
          <span>/</span>
          <Link href={`/use-cases?industry=${useCase.industry}`} className="hover:text-foreground transition-colors">
            {useCase.industry}
          </Link>
          <span>/</span>
          <span className="text-foreground">{useCase.title}</span>
        </nav>

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="default">{useCase.industry}</Badge>
                <Badge variant={useCase.complexity === "Simple" ? "secondary" : useCase.complexity === "Medium" ? "outline" : "destructive"}>
                  {useCase.complexity}
                </Badge>
                {useCase.userType.map(type => (
                  <Badge key={type} variant="outline">{type}</Badge>
                ))}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {useCase.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6">
                {useCase.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">Build Time:</span>
                  <span className="text-green-600 font-semibold">{useCase.buildTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CodeBracketSquareIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">Lines of Code:</span>
                  <span>~50,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">Documentation Pages:</span>
                  <span>127</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/beta-signup?useCase=${useCase.id}`}>
                  <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                    <RocketLaunchIcon className="h-4 w-4 mr-2" />
                    Build Something Similar
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleDownload}>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download Case Study
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <ShareIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Hero Image/Video */}
            <div className="w-full lg:w-1/2">
              <Card className="overflow-hidden">
                <div className="relative h-64 lg:h-96 bg-gradient-to-br from-primary/20 to-primary/5">
                  {useCase.image.startsWith("/stock_photos/") ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-primary/30 mb-2">
                          {useCase.title.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {useCase.industry}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={useCase.image}
                      alt={useCase.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Content Sections */}
        <div>
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="solution">Solution</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>The Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{useCase.challenge}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traditional Approach Drawbacks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">✗</span>
                      <span>Would take 3-6 months with a full development team</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">✗</span>
                      <span>Cost $100,000+ in development resources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">✗</span>
                      <span>Require hiring specialized developers and architects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">✗</span>
                      <span>Risk of scope creep and budget overruns</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {useCase.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solution" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>The Happy Llama Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{useCase.solution}</p>
                  
                  <div className="space-y-4 mt-6">
                    <h4 className="font-semibold">Features Implemented</h4>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>User authentication & authorization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Real-time data synchronization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Responsive mobile interface</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>API integrations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Analytics dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Automated reporting</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>The Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Requirements Analysis (30 min)</h4>
                        <p className="text-sm text-muted-foreground">
                          AI agents analyzed the business requirements and generated comprehensive PRD
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Architecture Design (45 min)</h4>
                        <p className="text-sm text-muted-foreground">
                          System architecture and database schema designed automatically
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Code Generation ({useCase.buildTime})</h4>
                        <p className="text-sm text-muted-foreground">
                          Complete frontend and backend code generated with tests
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Deployment (15 min)</h4>
                        <p className="text-sm text-muted-foreground">
                          Automated deployment to production environment
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Architecture Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">
                      [Architecture Diagram Placeholder]
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Frontend</h4>
                      <div className="flex flex-wrap gap-2">
                        {useCase.techStack.filter(tech => 
                          ["Next.js", "React", "React Native", "Vimeo API", "Google Calendar API", "Google Maps API", "D3.js", "Socket.io"].includes(tech)
                        ).map(tech => (
                          <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Backend</h4>
                      <div className="flex flex-wrap gap-2">
                        {useCase.techStack.filter(tech => 
                          ["FastAPI", "Node.js", "Twilio", "Stripe", "SendGrid", "Temporal"].includes(tech)
                        ).map(tech => (
                          <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Database</h4>
                      <div className="flex flex-wrap gap-2">
                        {useCase.techStack.filter(tech => 
                          ["PostgreSQL", "DynamoDB", "MongoDB", "Redis", "S3"].includes(tech)
                        ).map(tech => (
                          <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Infrastructure</h4>
                      <div className="flex flex-wrap gap-2">
                        {useCase.techStack.filter(tech => 
                          ["AWS", "AWS Lambda", "CloudFront", "Kubernetes", "WebSockets"].includes(tech)
                        ).map(tech => (
                          <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Code Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">50,000+</p>
                      <p className="text-sm text-muted-foreground">Lines of Code</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">95%</p>
                      <p className="text-sm text-muted-foreground">Test Coverage</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">127</p>
                      <p className="text-sm text-muted-foreground">Documentation Pages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Key Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {useCase.results.map((result, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="font-medium">{result}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time & Cost Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Development Time</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm w-24">Traditional:</span>
                          <div className="flex-1 bg-destructive/20 rounded-full h-6" />
                          <span className="text-sm font-semibold">3-6 months</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm w-24">Happy Llama:</span>
                          <div className="bg-green-600/20 rounded-full h-6" style={{ width: "5%" }} />
                          <span className="text-sm font-semibold text-green-600">{useCase.buildTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Development Cost</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm w-24">Traditional:</span>
                          <div className="flex-1 bg-destructive/20 rounded-full h-6" />
                          <span className="text-sm font-semibold">$100,000+</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm w-24">Happy Llama:</span>
                          <div className="bg-green-600/20 rounded-full h-6" style={{ width: "1%" }} />
                          <span className="text-sm font-semibold text-green-600">$0 (Beta)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Ready to Build Your Own?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Join thousands of innovators who are building enterprise-grade applications 
                    without writing a single line of code.
                  </p>
                  <Link href={`/beta-signup?useCase=${useCase.id}`}>
                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      Start Building Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}