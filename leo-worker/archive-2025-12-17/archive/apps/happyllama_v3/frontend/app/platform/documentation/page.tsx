"use client"

import { DocumentationPreview } from "@/components/sections/documentation-preview"

export default function DocumentationPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container">
        <div
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 sm:text-5xl md:text-6xl">
            Complete Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every Happy Llama application comes with comprehensive documentation that rivals 
            the best enterprise development teams.
          </p>
        </div>
      </div>
      <DocumentationPreview />
    </div>
  )
}