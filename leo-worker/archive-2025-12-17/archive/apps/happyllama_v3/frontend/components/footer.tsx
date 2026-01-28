import Link from "next/link"
import { Separator } from "@/components/ui/separator"

const productLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/platform/features", label: "Features" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/resources/documentation", label: "Documentation" },
]

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "https://blog.happyllama.ai", label: "Blog", external: true },
]

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
]

const socialLinks = [
  { href: "https://twitter.com/happyllama", label: "Twitter", icon: "𝕏" },
  { href: "https://linkedin.com/company/happyllama", label: "LinkedIn", icon: "in" },
  { href: "https://github.com/happyllama", label: "GitHub", icon: "GH" },
  { href: "https://discord.gg/happyllama", label: "Discord", icon: "DC" },
]

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gradient">
                HappyLlama
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Transform ideas into enterprise apps at AI speed.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Product</h3>
            <ul className="space-y-3 text-sm">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-3 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Connect</h3>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between space-y-4 text-center text-sm text-muted-foreground sm:flex-row sm:space-y-0 sm:text-left">
          <p>© 2025 Happy Llama. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Powered by</span>
            <span className="font-semibold text-foreground">
              HappyLlama
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}