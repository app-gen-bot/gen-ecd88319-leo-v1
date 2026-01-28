import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const siteMapSections = [
  {
    title: "Main Pages",
    links: [
      { href: "/", label: "Homepage" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/beta-signup", label: "Beta Signup" },
      { href: "/login", label: "Login" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/platform", label: "Platform Overview" },
      { href: "/platform/features", label: "Features" },
      { href: "/platform/security", label: "Security & Compliance" },
      { href: "/platform/documentation", label: "Technical Documentation" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { href: "/use-cases", label: "All Use Cases" },
      { href: "/use-cases/healthcare", label: "Healthcare" },
      { href: "/use-cases/finance", label: "Finance" },
      { href: "/use-cases/retail", label: "Retail" },
      { href: "/use-cases/technology", label: "Technology" },
      { href: "/use-cases/education", label: "Education" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Resources Hub" },
      { href: "/resources/documentation", label: "Documentation Viewer" },
      { href: "/resources/samples", label: "Sample Outputs" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/enterprise", label: "Enterprise" },
      { href: "https://blog.happyllama.ai", label: "Blog (External)", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookie Policy" },
    ],
  },
]

export default function SitemapPage() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sitemap</h1>
        <p className="text-muted-foreground">
          Complete directory of all pages on Happy Llama
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {siteMapSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}