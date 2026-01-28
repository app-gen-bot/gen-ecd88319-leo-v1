"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BetaAccessModal } from '@/components/beta-access-modal'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  const [comingSoonFeature, setComingSoonFeature] = useState('')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Home', href: '/', scroll: true },
    { label: 'How It Works', href: '/#process', scroll: true },
    { label: 'Technology', href: '/#technology', scroll: true },
    { label: 'Showcase', href: '/#showcase', scroll: true },
    { label: 'About', comingSoon: true },
    { label: 'Blog', comingSoon: true },
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.comingSoon) {
      setComingSoonFeature(item.label)
      setIsComingSoonOpen(true)
    }
    setIsMobileMenuOpen(false)
  }

  const scrollToSection = (href: string) => {
    const id = href.replace('/#', '')
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/80 backdrop-blur-md border-b'
            : 'bg-transparent'
        )}
      >
        <div className="container-max section-padding">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PS</span>
              </div>
              <span className="font-bold text-xl hidden sm:inline">
                PlanetScale AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.comingSoon) {
                      handleNavClick(item)
                    } else if (item.scroll && item.href) {
                      scrollToSection(item.href)
                    }
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-lg"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}
              <Button
                variant="gradient"
                onClick={() => setIsBetaModalOpen(true)}
                className="glow-hover"
              >
                Join Limited Beta
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden fixed inset-x-0 top-20 bg-background border-b transition-all duration-300 overflow-hidden',
            isMobileMenuOpen ? 'max-h-96' : 'max-h-0'
          )}
        >
          <nav className="container-max section-padding py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.comingSoon) {
                      handleNavClick(item)
                    } else if (item.scroll && item.href) {
                      scrollToSection(item.href)
                      setIsMobileMenuOpen(false)
                    }
                  }}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center justify-between pt-4 border-t">
                {mounted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-lg"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                )}
                <Button
                  variant="gradient"
                  onClick={() => {
                    setIsBetaModalOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="glow-hover"
                >
                  Join Limited Beta
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

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
              Notify Me
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Beta Access Modal */}
      <BetaAccessModal
        isOpen={isBetaModalOpen}
        onClose={() => setIsBetaModalOpen(false)}
      />
    </>
  )
}