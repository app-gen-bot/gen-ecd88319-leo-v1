import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container max-w-4xl">
        <div
        >
          <h1 className="text-4xl font-bold mb-8">About Happy Llama</h1>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                Happy Llama is on a mission to democratize software development by making it possible 
                for anyone to build enterprise-grade applications without writing code. We believe that 
                great ideas shouldn&apos;t be limited by technical expertise or resources.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-muted-foreground mb-4">
                We envision a world where building software is as easy as describing what you want. 
                Where months of development are compressed into hours, and where quality and compliance 
                are guaranteed, not hoped for.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
              <p className="text-muted-foreground mb-4">
                Happy Llama uses cutting-edge AI technology, including multi-agent systems, 
                hierarchical memory, and backpropagation-inspired learning to generate complete, 
                production-ready applications from simple descriptions.
              </p>
            </CardContent>
          </Card>

          <div className="text-center mt-12">
            <h2 className="text-2xl font-semibold mb-4">Ready to Build?</h2>
            <Link href="/beta-signup">
              <Button variant="gradient" size="lg">
                Join the Beta Program
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}