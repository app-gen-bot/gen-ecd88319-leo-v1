"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { toast } from "@/hooks/use-toast"

const samples = [
  {
    title: "Healthcare Portal PRD",
    description: "Complete product requirements document for a HIPAA-compliant patient portal",
    size: "2.3 MB",
    format: "PDF"
  },
  {
    title: "E-commerce Platform Code",
    description: "Full source code for a production-ready online store",
    size: "15.7 MB",
    format: "ZIP"
  },
  {
    title: "SaaS Dashboard Documentation",
    description: "API documentation and user guides for analytics platform",
    size: "4.1 MB",
    format: "PDF"
  },
  {
    title: "Test Suite Examples",
    description: "Comprehensive test suites with 95%+ coverage",
    size: "1.8 MB",
    format: "ZIP"
  }
]

export default function SamplesPage() {
  const handleDownload = (title: string) => {
    toast({
      title: "Download started",
      description: `Downloading ${title}...`,
    })
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container">
        <div
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 sm:text-5xl md:text-6xl">
            Sample Outputs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Download real examples of what Happy Llama generates to see the quality for yourself.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {samples.map((sample, index) => (
            <div
              key={sample.title}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{sample.title}</CardTitle>
                  <CardDescription>{sample.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span>{sample.format}</span> • <span>{sample.size}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(sample.title)}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}