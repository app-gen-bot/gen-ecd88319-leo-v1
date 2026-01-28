"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { Twitter, Linkedin, Github, Youtube } from 'lucide-react'

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const [comingSoonFeature, setComingSoonFeature] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Thanks!",
        description: "Check your email to confirm your subscription.",
      })
      
      setEmail('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComingSoon = (feature: string) => {
    setComingSoonFeature(feature)
    setIsComingSoonOpen(true)
  }

  const productLinks = [
    { label: 'How It Works', href: '/#process' },
    { label: 'Technology', href: '/#technology' },
    { label: 'Showcase', href: '/#showcase' },
    { label: 'Pricing', comingSoon: true },
    { label: 'API Docs', comingSoon: true },
  ]

  const companyLinks = [
    { label: 'About Us', comingSoon: true },
    { label: 'Careers', comingSoon: true },
    { label: 'Press Kit', comingSoon: true },
    { label: 'Contact', comingSoon: true },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', comingSoon: true },
    { label: 'GDPR', comingSoon: true },
  ]

  const socialLinks = [
    { label: 'Twitter', href: 'https://twitter.com/planetscale', icon: Twitter },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/planetscale', icon: Linkedin },
    { label: 'GitHub', href: 'https://github.com/planetscale', icon: Github },
    { label: 'YouTube', href: 'https://youtube.com/planetscale', icon: Youtube },
  ]

  return (
    <>
      <footer className="bg-muted/50 border-t">
        <div className="container-max section-padding py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">PS</span>
                </div>
                <span className="font-bold text-xl">PlanetScale AI</span>
              </Link>
              
              <p className="text-sm text-muted-foreground max-w-xs">
                Building the future of application development with AI. From prompt to planet scale.
              </p>

              {/* Newsletter */}
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <p className="text-sm font-medium">Stay updated</p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="max-w-xs"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="gradient"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    {link.comingSoon ? (
                      <button
                        onClick={() => handleComingSoon(link.label)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href!}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleComingSoon(link.label)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    {link.comingSoon ? (
                      <button
                        onClick={() => handleComingSoon(link.label)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href!}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 PlanetScale AI. All rights reserved.
            </p>

            {/* Social links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>

            {/* Powered by attribution */}
            <p className="text-sm text-muted-foreground">
              Powered by{' '}
              <a
                href="https://planetscale.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                PlanetScale
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      <Dialog open={isComingSoonOpen} onOpenChange={setIsComingSoonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{comingSoonFeature} - Coming Soon!</DialogTitle>
            <DialogDescription>
              We&apos;re working hard to bring you this feature. Sign up for our newsletter to be the first to know when it launches.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              variant="default"
              onClick={() => setIsComingSoonOpen(false)}
              className="w-full"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}