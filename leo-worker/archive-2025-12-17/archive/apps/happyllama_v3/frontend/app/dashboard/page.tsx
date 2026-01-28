"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="container py-20 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || session?.user?.email}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create New App</CardTitle>
            <CardDescription>
              Start building your next application with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/beta-signup">
              <Button className="w-full">Get Started</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Documentation</CardTitle>
            <CardDescription>
              Explore our comprehensive documentation and guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/resources/documentation">
              <Button variant="outline" className="w-full">
                Browse Docs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Use Cases</CardTitle>
            <CardDescription>
              See what others have built with Happy Llama
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/use-cases">
              <Button variant="outline" className="w-full">
                Explore Use Cases
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}