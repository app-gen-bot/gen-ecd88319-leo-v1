"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChevronDown, Play } from 'lucide-react'
import { BetaAccessModal } from '@/components/beta-access-modal'
import { cn } from '@/lib/utils'

export function HeroSection() {
  const [prompt, setPrompt] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])

  // Generate random particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
    setParticles(newParticles)
  }, [])

  const handlePromptFocus = () => {
    setIsTyping(true)
  }

  const handlePromptBlur = () => {
    if (!prompt) setIsTyping(false)
  }

  const handleTryIt = () => {
    if (prompt) {
      // Simulate app generation animation
      // In a real app, this would trigger the actual generation process
      console.log('Generating app for:', prompt)
    }
  }

  const scrollToNext = () => {
    const processSection = document.getElementById('process')
    if (processSection) {
      processSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background particles */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-500 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.id * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20" />

      {/* Content */}
      <div className="container-max section-padding relative z-10">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="inline-block animate-fade-in">From Prompt to</span>{' '}
            <span className="gradient-text inline-block animate-fade-in animation-delay-200">
              Planet Scale
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground animate-fade-up animation-delay-400 text-balance">
            Transform your ideas into production-ready applications with AI
          </p>

          {/* Interactive prompt demo */}
          <div className="max-w-2xl mx-auto animate-fade-up animation-delay-600">
            <div className="relative">
              <Input
                type="text"
                placeholder="Describe your app idea..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={handlePromptFocus}
                onBlur={handlePromptBlur}
                className={cn(
                  "h-14 px-6 pr-24 text-lg transition-all duration-300",
                  isTyping && "ring-2 ring-primary"
                )}
              />
              <Button
                onClick={handleTryIt}
                disabled={!prompt}
                className="absolute right-2 top-2 h-10"
                variant="gradient"
              >
                Try It
              </Button>
            </div>
            {isTyping && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 backdrop-blur animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  AI is analyzing your idea...
                </p>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-800">
            <Button
              size="lg"
              variant="gradient"
              onClick={() => setIsBetaModalOpen(true)}
              className="glow-hover text-lg px-8"
            >
              Join Limited Beta
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsVideoModalOpen(true)}
              className="text-lg px-8 group"
            >
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <button
              onClick={scrollToNext}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Scroll to next section"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Beta Access Modal */}
      <BetaAccessModal
        isOpen={isBetaModalOpen}
        onClose={() => setIsBetaModalOpen(false)}
      />

      {/* Video Demo Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="sm:max-w-[800px] p-0">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-white">Demo video placeholder</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}